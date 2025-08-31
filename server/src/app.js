const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helemet = require("helmet");
const ratelimit = require("express-rate-limit");
const authRoutes = require("./routes/auth");
const candidateRoutes = require("./routes/candidates");
const notesRoutes = require("./routes/notes");
const notificationsRoutes = require("./routes/notifications");

const app = express();

app.use(helemet());

const limiter = ratelimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  Message: "Too many requests from this IP, please try again later",
});

app.use(limiter);
app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());
app.use(morgan("dev"));

app.use("/api/auth", authRoutes);
app.use("/api/candidates", candidateRoutes);
app.use("/api/notes", notesRoutes);
app.use("/api/notifications", notificationsRoutes);

module.exports = app;
