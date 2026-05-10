const db = require('../config/db');

// 🔹 CRIAR ANALISTA
exports.createAnalyst = (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({
      error: 'Nome é obrigatório'
    });
  }

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
};

// 🔹 LISTAR ANALISTAS
exports.getAnalysts = (req, res) => {

  const query = `
    SELECT id, name, status, created_at
    FROM analysts
    ORDER BY id ASC
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

