const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { create, list } = require('../controllers/candidateController');

router.use(auth);
router.post('/', create);
router.get('/', list);

module.exports = router;
