const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Notification = require('../models/Notification');

router.use(auth);

router.get('/', async (req, res) => {
  const notes = await Notification.find({ user: req.user._id }).populate('candidate', 'name').populate('message');
  // create a preview
  const mapped = notes.map(n => ({ _id: n._id, candidate: n.candidate, messagePreview: n.message.body ? n.message.body.slice(0,100) : '', candidateId: n.candidate._id }));
  res.json(mapped);
});

module.exports = router;
