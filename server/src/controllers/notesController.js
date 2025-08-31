const Message = require("../models/Message");
const Notification = require("../models/Notification");
const User = require("../models/User");
const xss = require("xss");

exports.getMessages = async (req, res) => {
  const { candidateId } = req.params;
  const msgs = await Message.find({ candidate: candidateId })
    .populate("sender", "name email username")
    .sort("createdAt");
  res.json(msgs);
};

exports.postMessage = async (req, res) => {
  const { candidateId } = req.params;
  let { body } = req.body;
  body = xss(body);

  // 🔍 Parse @username mentions
  const mentionMatches = body.match(/@(\w+)/g) || [];
  const tags = [];

  for (let mention of mentionMatches) {
    const username = mention.substring(1); // remove @
    const user = await User.findOne({ username });
    if (user) {
      tags.push(user._id);
    }
  }

  // 📝 Create message with parsed tags
  const message = await Message.create({
    candidate: candidateId,
    sender: req.user._id,
    body,
    tags,
  });

  // 🔔 Create notifications for tagged users
  for (const userId of tags) {
    await Notification.create({
      user: userId,
      message: message._id,
      candidate: candidateId,
    });
  }

  const populated = await message.populate("sender", "name email username");

  // 🌐 Emit new message to candidate room
  req.app.get("io") &&
    req.app
      .get("io")
      .to(`candidate_${candidateId}`)
      .emit("newMessage", populated);

  // 🌐 Emit tagged notifications to each tagged user
  for (const userId of tags) {
    req.app.get("io") &&
      req.app
        .get("io")
        .to(`user_${userId}`)
        .emit("tagged", { message: populated, candidateId });
  }

  res.status(201).json(populated);
};
