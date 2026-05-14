const express = require('express');
const router = express.Router();
const controller = require('../controllers/analystController');

// 🔹 Criar analista
router.post('/', controller.createAnalyst);

// 🔹 Listar analistas
router.get('/', controller.getAnalysts);

router.patch('/:id/status', controller.updateStatus);

router.delete('/:id', controller.deleteAnalyst);

// 🔹 TESTE
router.get('/teste', (req, res) => {
  res.send('rota analyst ok');
});

module.exports = router;

