const Message = require("./models/Message");
const Notification = require("./models/Notification");
const User = require("./models/User");

module.exports = (io) => {
  io.on("connection", (socket) => {
    const { userId } = socket.handshake.query || {};
    if (!userId) return;

    socket.join(`user_${userId}`);
    // console.log(`✅ User ${userId} joined personal room`);

    socket.on("joinCandidate", (candidateId) => {
      socket.join(`candidate_${candidateId}`);
      // console.log(`👥 User ${userId} joined candidate_${candidateId}`);
    });

    socket.on("leaveCandidate", (candidateId) => {
      socket.leave(`candidate_${candidateId}`);
      // console.log(`🚪 User ${userId} left candidate_${candidateId}`);
    });

    // 🔥 New: send_message handling
    socket.on("send_message", async ({ candidateId, content }) => {
      try {
        // create message in DB
        const message = await Message.create({
          candidate: candidateId,
          sender: userId,
          body: content,
          tags: [],
        });

        // detect mentions
        const mentionMatches = content.match(/@(\w+)/g) || [];
        for (let mention of mentionMatches) {
          const username = mention.substring(1);
          const user = await User.findOne({ username });
          if (user) {
            message.tags.push(user._id);
            await Notification.create({
              user: user._id,
              message: message._id,
              candidate: candidateId,
            });

            // send notification to mentioned user
            io.to(`user_${user._id}`).emit("tagged", {
              message,
              candidateId,
            });
          }
        }

        await message.save();

        // emit message to candidate room
        io.to(`candidate_${candidateId}`).emit("newMessage", message);
      } catch (err) {
        console.error("Error sending message:", err);
      }
    });

    socket.on("disconnect", (reason) => {
      console.log(`❌ User ${userId} disconnected:`, reason);
    });
  });
};
