const db = require('../config/db');

//  CRIAR PROCESSO COM TRANSAÇÃO
exports.createProcess = (req, res) => {

  const { prefix, process_number, process_year } = req.body;

  if (!prefix || !process_number || !process_year) {
    return res.status(400).json({
      error: 'Todos os campos são obrigatórios'
    });
  }

  const finaisAnalistas = {
  1: 'Adriana',
  2: 'Luísa',
  3: 'Carlos',
  5: 'Lucas',
  7: 'Carlos Eduardo',
  9: 'Kelvin'
};

  const ordemFinais = [1, 2, 3, 5, 7, 9];
  const limiteDiferenca = 2;

  const numerosProcesso = process_number
    .toString()
    .split('')
    .reverse();

  let indiceInicial = -1;

  for (let numero of numerosProcesso) {
    const digito = Number(numero);
    indiceInicial = ordemFinais.indexOf(digito);

    if (indiceInicial !== -1) {
      break;
    }
  }

  if (indiceInicial === -1) {
    return res.status(400).json({
      error: 'Não foi possível identificar um final válido para distribuição'
    });
  }

  const candidatos = [];

  for (let i = 0; i < ordemFinais.length; i++) {
    const indice = (indiceInicial + i) % ordemFinais.length;
    const final = ordemFinais[indice];
    const nome = finaisAnalistas[final];

    if (nome && !candidatos.includes(nome)) {
      candidatos.push(nome);
    }
  }

  const checkProcess = `
    SELECT 
      p.process_number,
      a.name AS analyst_name
    FROM processes p
    LEFT JOIN assignments ass
      ON p.id = ass.process_id
    LEFT JOIN analysts a
      ON a.id = ass.analyst_id
    WHERE 
      p.prefix = ?
      AND p.process_number = ?
      AND p.process_year = ?
  `;

  db.query(
    checkProcess,
    [prefix, process_number, process_year],
    (err, existingProcess) => {

      if (err) {
        return res.status(500).json({
          error: 'Erro ao verificar processo'
        });
      }

      if (existingProcess.length > 0) {
        return res.status(400).json({
          error: `O processo ${prefix} ${process_number}/${process_year} já está cadastrado e encontra-se com o analista ${existingProcess[0].analyst_name}.`
        });
      }

      const placeholders = candidatos.map(() => '?').join(',');

      const workloadQuery = `
        SELECT
          a.id,
          a.name,
          COUNT(ass.id) AS total_processes
        FROM analysts a
        LEFT JOIN assignments ass
          ON a.id = ass.analyst_id
        WHERE
          a.status = 'ACTIVE'
          AND a.name IN (${placeholders})
        GROUP BY a.id, a.name
      `;

      db.query(workloadQuery, candidatos, (err, workloads) => {

        if (err) {
          return res.status(500).json({
            error: 'Erro ao verificar carga dos analistas'
          });
        }

        if (workloads.length === 0) {
          return res.status(400).json({
            error: 'Nenhum analista disponível'
          });
        }

        const menorCarga = Math.min(
          ...workloads.map((item) => item.total_processes)
        );

        let analistaFinal = null;

        for (let nome of candidatos) {
          const analista = workloads.find((item) => item.name === nome);

          if (
            analista &&
            analista.total_processes - menorCarga <= limiteDiferenca
          ) {
            analistaFinal = analista;
            break;
          }
        }

        if (!analistaFinal) {
          analistaFinal = workloads.sort(
            (a, b) => a.total_processes - b.total_processes
          )[0];
        }

        db.beginTransaction((err) => {

          if (err) {
            return res.status(500).json({
              error: 'Erro ao iniciar transação'
            });
          }

          const insertProcess = `
            INSERT INTO processes (
              prefix,
              process_number,
              process_year
            )
            VALUES (?, ?, ?)
          `;

          db.query(
            insertProcess,
            [prefix, process_number, process_year],
            (err, processResult) => {

              if (err) {
                return db.rollback(() => {
                  return res.status(500).json({
                    error: 'Erro ao criar processo'
                  });
                });
              }

              const process_id = processResult.insertId;

              const insertAssignment = `
                INSERT INTO assignments (
                  process_id,
                  analyst_id
                )
                VALUES (?, ?)
              `;

              db.query(
                insertAssignment,
                [process_id, analistaFinal.id],
                (err) => {

                  if (err) {
                    return db.rollback(() => {
                      return res.status(500).json({
                        error: 'Erro ao atribuir processo'
                      });
                    });
                  }

                  db.commit((err) => {

                    if (err) {
                      return db.rollback(() => {
                        return res.status(500).json({
                          error: 'Erro ao finalizar transação'
                        });
                      });
                    }

                    return res.status(201).json({
                      message: `Processo criado e atribuído com sucesso. Encaminhado para ${analistaFinal.name}`,
                      process_id,
                      assigned_to: analistaFinal.name
                    });

                  });

                }
              );

            }
          );

        });

      });

    }
  );

};

//  ATUALIZAR STATUS
exports.updateStatus = (req, res) => {

  const { id } = req.params;
  const { status } = req.body;

  const validStatus = ['OPEN', 'IN_PROGRESS', 'DONE'];

  if (!status || !validStatus.includes(status)) {
    return res.status(400).json({
      error: 'Status inválido. Use: OPEN, IN_PROGRESS ou DONE'
    });
  }

  const query = `
    UPDATE processes
    SET status = ?
    WHERE id = ?
  `;

  db.query(query, [status, id], (err, result) => {
    if (err) {
      console.log('ERRO UPDATE STATUS:', err);
      return res.status(500).json({
        error: 'Erro ao atualizar status'
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: 'Processo não encontrado'
      });
    }

    return res.json({
      message: 'Status atualizado com sucesso',
      process_id: id,
      new_status: status
    });
  });
};

exports.getWorkload = (req, res) => {

  const query = `
    SELECT 
      a.id,
      a.name,
      COUNT(ass.id) AS total_processes
    FROM analysts a
    LEFT JOIN assignments ass ON a.id = ass.analyst_id
    GROUP BY a.id, a.name
    ORDER BY total_processes ASC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.log('ERRO WORKLOAD:', err);
      return res.status(500).json({
        error: 'Erro ao buscar carga de trabalho'
      });
    }

const leastBusy = results[0];

return res.json({
  total_analysts: results.length,
  least_busy: leastBusy,
  workload: results
     });
  });
};

exports.deleteProcess = (req, res) => {

  const { id } = req.params;

  const query = `
    DELETE FROM processes
    WHERE id = ?
  `;

  db.query(query, [id], (err, result) => {

    if (err) {

      console.log('ERRO DELETE PROCESS:', err);

      return res.status(500).json({
        error: 'Erro ao excluir processo'
      });

    }

    return res.json({
      message: 'Processo excluído com sucesso'
    });

  });

};

exports.getProcessById = (req, res) => {

  const { id } = req.params;

  const query = `
    SELECT *
    FROM processes
    WHERE id = ?
  `;

  db.query(query, [id], (err, results) => {

    if (err) {

      console.log('ERRO GET BY ID:', err);

      return res.status(500).json({
        error: 'Erro ao buscar processo'
      });

    }

    if (results.length === 0) {

      return res.status(404).json({
        error: 'Processo não encontrado'
      });

    }

    return res.json(results[0]);

  });

};

exports.getProcesses = (req, res) => {

  const query = `
    SELECT 

      p.id,

      p.prefix,

      p.process_number,

      p.process_year,

      p.status,

      a.name AS analyst_name,

      ass.assigned_at
    FROM processes p
    JOIN assignments ass
      ON p.id = ass.process_id
    JOIN analysts a
      ON a.id = ass.analyst_id
    ORDER BY ass.assigned_at DESC
  `;

  db.query(query, (err, results) => {

    if (err) {

      console.log('ERRO GET:', err);

      return res.status(500).json({
        error: 'Erro ao buscar processos'
      });

    }

    return res.json(results);

  });

};





