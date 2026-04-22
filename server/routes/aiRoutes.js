const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

router.post('/parse-transaction', aiController.parseTransaction);
router.post('/financial-insights', aiController.getFinancialInsights);

module.exports = router;
