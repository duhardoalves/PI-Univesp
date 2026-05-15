const db = require('../config/db');

// 🔹 CRIAR ANALISTA
exports.createAnalyst = (req, res) => {

  const { name } = req.body;

  if (!name) {

    return res.status(400).json({
      error: 'Nome é obrigatório'
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
      INSERT INTO analysts (name)
      VALUES (?)
    `;

    db.query(query, [name], (err, result) => {

      if (err) {

        console.log('ERRO CREATE ANALYST:', err);

        return res.status(500).json({
          error: 'Erro ao criar analista'
        });

      }

      return res.json({
        message: 'Analista criado com sucesso',
        analyst_id: result.insertId
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
    a.status,
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

