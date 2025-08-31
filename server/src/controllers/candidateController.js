const Candidate = require('../models/Candidate');

exports.create = async (req, res) => {
  const { name, email } = req.body;
  const candidate = await Candidate.create({ name, email, createdBy: req.user._id });
  res.status(201).json(candidate);
};

exports.list = async (req, res) => {
  const items = await Candidate.find().sort('-createdAt');
  res.json(items);
};
