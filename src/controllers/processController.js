const db = require('../config/db');

//  CRIAR PROCESSO COM TRANSAÇÃO
exports.createProcess = (req, res) => {

  const { process_number } = req.body;

  if (!process_number) {

    return res.status(400).json({
      error: 'process_number é obrigatório'
    });

  }

  // 🔹 Verificar duplicidade
  const checkProcess = `
    SELECT 
      p.process_number,
      a.name AS analyst_name
    FROM processes p
    LEFT JOIN assignments ass
      ON p.id = ass.process_id
    LEFT JOIN analysts a
      ON a.id = ass.analyst_id
    WHERE p.process_number = ?
  `;

  db.query(
    checkProcess,
    [process_number],
    (err, existingProcess) => {

      if (err) {

        console.log(
          'ERRO CHECK PROCESS:',
          err
        );

        return res.status(500).json({
          error: 'Erro ao verificar processo'
        });

      }

      // 🔹 Processo já existe
      if (existingProcess.length > 0) {

        return res.status(400).json({

          error:
            `O processo ${process_number} já está cadastrado e encontra-se com o analista ${existingProcess[0].analyst_name}.`

        });

      }

      // 🔹 Buscar analista menos ocupado
      const selectAnalyst = `
        SELECT a.id, a.name
        FROM analysts a
        LEFT JOIN assignments ass
          ON a.id = ass.analyst_id
        WHERE a.status = 'ACTIVE'
        GROUP BY a.id
        ORDER BY COUNT(ass.id) ASC, a.id ASC
        LIMIT 1
      `;

      db.beginTransaction((err) => {

        if (err) {

          console.log(
            'ERRO TRANSACTION:',
            err
          );

          return res.status(500).json({
            error: 'Erro ao iniciar transação'
          });

        }

        db.query(
          selectAnalyst,
          (err, result) => {

            if (err) {

              console.log(
                'ERRO SELECT:',
                err
              );

              return db.rollback(() => {

                return res.status(500).json({
                  error: 'Erro ao buscar analista'
                });

              });

            }

            if (result.length === 0) {

              return db.rollback(() => {

                return res.status(400).json({
                  error: 'Nenhum analista disponível'
                });

              });

            }

            const analyst_id = result[0].id;

            const analyst_name = result[0].name;

            // 🔹 Criar processo
            const insertProcess = `
              INSERT INTO processes (process_number)
              VALUES (?)
            `;

            db.query(
              insertProcess,
              [process_number],
              (err, processResult) => {

                if (err) {

                  console.log(
                    'ERRO PROCESS:',
                    err
                  );

                  return db.rollback(() => {

                    return res.status(500).json({
                      error: 'Erro ao criar processo'
                    });

                  });

                }

                const process_id =
                  processResult.insertId;

                // 🔹 Criar assignment
                const insertAssignment = `
                  INSERT INTO assignments (
                    process_id,
                    analyst_id
                  )
                  VALUES (?, ?)
                `;

                db.query(
                  insertAssignment,
                  [process_id, analyst_id],
                  (err) => {

                    if (err) {

                      console.log(
                        'ERRO ASSIGNMENT:',
                        err
                      );

                      return db.rollback(() => {

                        return res.status(500).json({
                          error:
                            'Erro ao atribuir processo'
                        });

                      });

                    }

                    db.commit((err) => {

                      if (err) {

                        return db.rollback(() => {

                          return res.status(500).json({
                            error:
                              'Erro ao finalizar transação'
                          });

                        });

                      }

                      return res.json({

                        message:
                          `Processo criado e atribuído com sucesso. Encaminhado para ${analyst_name}`,

                        process_id,

                        assigned_to: analyst_name

                      });

                    });

                  }
                );

              }
            );

          }
        );

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
      p.process_number,
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





