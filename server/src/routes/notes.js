const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getMessages, postMessage } = require('../controllers/notesController');

router.use(auth);
router.get('/:candidateId', getMessages);
router.post('/:candidateId', postMessage);

module.exports = router;
