const express = require('express');
const router = express.Router();
const controller = require('../controllers/processController');

router.post('/', controller.createProcess);

router.get('/workload', controller.getWorkload);

router.get('/:id', controller.getProcessById);

router.patch('/:id/status', controller.updateStatus);

router.get('/', controller.getProcesses);

module.exports = router;



