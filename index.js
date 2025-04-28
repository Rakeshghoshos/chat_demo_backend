const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { User } = require("./userModel");
const bcrypt = require("bcrypt");
const { sequelize } = require("./db");
const { Sequelize } = require("sequelize");
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:5173"],
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

sequelize
  .sync({ force: false })
  .then(() => {
    console.log("Database synced");
  })
  .catch((error) => {
    console.error("Database sync error:", error);
  });

const socketMap = {};

// Register endpoint
app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Username and password are required" });
  }

  try {
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ error: "Username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({ username, password: hashedPassword, socketId: "" });
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Registration failed" });
  }
});

// Login endpoint
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Username and password are required" });
  }

  try {
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    res.status(200).json({ message: "Login successful", username });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

// Search users endpoint
app.get("/users", async (req, res) => {
  const { search } = req.query;
  try {
    const users = await User.findAll({
      where: {
        username: {
          [Sequelize.Op.like]: `%${search || ""}%`,
        },
      },
      attributes: ["username"],
    });
    res.status(200).json(users);
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ error: "Search failed" });
  }
});

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Register socket with username
  socket.on("register-socket", async (username) => {
    try {
      await User.update({ socketId: socket.id }, { where: { username } });
      socketMap[username] = socket.id;
      console.log(`Socket registered: ${username} -> ${socket.id}`);
    } catch (error) {
      console.error("Error updating socketId:", error);
    }
  });

  // Handle disconnection
  socket.on("disconnect", async () => {
    try {
      const user = await User.findOne({ where: { socketId: socket.id } });
      if (user) {
        await User.update(
          { socketId: "" },
          { where: { username: user.username } }
        );
        delete socketMap[user.username];
        console.log(`Socket cleared: ${user.username}`);
      }
    } catch (error) {
      console.error("Error clearing socketId:", error);
    }
    console.log("User disconnected:", socket.id);
  });

  // Handle sending messages using socketMap
  socket.on("send-message", ({ sender, recipient, message, timestamp }) => {
    const recipientSocketId = socketMap[recipient];
    console.log(timestamp);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit("receive-message", {
        sender,
        message,
        timestamp,
      });
      console.log(`Message sent from ${sender} to ${recipient}`);
    } else {
      console.log(`Recipient not connected: ${recipient}`);
    }
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
