const db = require('../config/db');

// 🔹 CRIAR ANALISTA
exports.createAnalyst = (req, res) => {

  const { name, process_final } = req.body;

  if (!name || process_final === undefined || process_final === null) {

    return res.status(400).json({
      error: 'Nome e final do processo são obrigatórios'
    });

  }

  if (
  !Number.isInteger(Number(process_final)) ||
  Number(process_final) < 0 ||
  Number(process_final) > 9
) {
  return res.status(400).json({
    error: 'O final do processo deve ser um número inteiro entre 0 e 9'
  });
}

  // VERIFICA DUPLICIDADE
  const checkQuery = `
    SELECT * FROM analysts
    WHERE name = ?
  `;

  db.query(checkQuery, [name], (err, results) => {

    if (err) {

      console.log('ERRO CHECK ANALYST:', err);

      return res.status(500).json({
        error: 'Erro ao verificar analista'
      });

    }

    // SE JÁ EXISTIR
    if (results.length > 0) {

      return res.status(400).json({
        error: 'Analista já cadastrado'
      });

    }

    // INSERIR ANALISTA
    const query = `
      INSERT INTO analysts (name, process_final)
      VALUES (?, ?)
    `;

    db.query(query, [name, process_final], (err, result) => {

      if (err) {

        console.log('ERRO CREATE ANALYST:', err);

        return res.status(500).json({
          error: 'Erro ao criar analista'
        });

      }

      return res.json({
        message: 'Analista criado com sucesso',
        analyst_id: result.insertId,
        process_final: process_final

      });

    });

  });

};

// 🔹 LISTAR ANALISTAS
exports.getAnalysts = (req, res) => {

  const query = `
  SELECT
  a.id,
  a.name,
  a.process_final,
  a.status,
  CASE
    WHEN a.status = 'INACTIVE' AND a.inactive_since IS NOT NULL
      THEN DATEDIFF(CURDATE(), a.inactive_since)
    ELSE 0
  END AS inactive_days,
  COUNT(ass.id) AS total_processes
FROM analysts a
  LEFT JOIN assignments ass
    ON a.id = ass.analyst_id
  GROUP BY a.id
  ORDER BY total_processes ASC
`;

  db.query(query, (err, results) => {
    if (err) {
      console.log('ERRO GET ANALYSTS:', err);
      return res.status(500).json({
        error: 'Erro ao buscar analistas'
      });
    }

    return res.json(results);
  });
};

exports.updateStatus = (req, res) => {

  const { id } = req.params;

  const { status } = req.body;

  const validStatus = ['ACTIVE', 'INACTIVE'];

  if (!validStatus.includes(status)) {

    return res.status(400).json({
      error: 'Status inválido'
    });

  }

  const query = `
    UPDATE analysts
    SET
      status = ?,
      inactive_since = CASE
        WHEN ? = 'INACTIVE' THEN COALESCE(inactive_since, CURDATE())
        ELSE NULL
      END
    WHERE id = ?
  `;

  db.query(query, [status, status, id], (err, result) => {

    if (err) {

      console.log('ERRO UPDATE STATUS:', err);

      return res.status(500).json({
        error: 'Erro ao atualizar status'
      });

    }

    return res.json({
      message: 'Status atualizado com sucesso'
    });

  });

};

exports.deleteAnalyst = (req, res) => {

  const { id } = req.params;

  // VERIFICA SE EXISTEM PROCESSOS
  const checkQuery = `
    SELECT * FROM assignments
    WHERE analyst_id = ?
  `;

  db.query(checkQuery, [id], (err, results) => {

    if (err) {

      console.log('ERRO CHECK ASSIGNMENTS:', err);

      return res.status(500).json({
        error: 'Erro ao verificar processos'
      });

    }

    // NÃO PERMITIR EXCLUIR
    if (results.length > 0) {

      return res.status(400).json({
        error: 'Analista possui processos vinculados'
      });

    }

    // EXCLUIR ANALISTA
    const deleteQuery = `
      DELETE FROM analysts
      WHERE id = ?
    `;

    db.query(deleteQuery, [id], (err, result) => {

      if (err) {

        console.log('ERRO DELETE ANALYST:', err);

        return res.status(500).json({
          error: 'Erro ao excluir analista'
        });

      }

      return res.json({
        message: 'Analista excluído com sucesso'
      });

    });

  });

};

// Alterar nome do analista
exports.updateAnalyst = (req, res) => {

  const { id } = req.params;

  const { name } = req.body;

  if (!name) {

    return res.status(400).json({
      error: 'Nome é obrigatório'
    });

  }

  const query = `
    UPDATE analysts
    SET name = ?
    WHERE id = ?
  `;

  db.query(query, [name, id], (err, result) => {

    if (err) {

      console.log('ERRO UPDATE:', err);

      return res.status(500).json({
        error: 'Erro ao atualizar analista'
      });

    }

    return res.json({
      message: 'Analista atualizado com sucesso'
    });

  });

};