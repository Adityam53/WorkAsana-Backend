const { initializeDatabase } = require("./db/db.connect");
require("dotenv").config();
const Task = require("./models/task.models");
const Team = require("./models/team.models");
const Tag = require("./models/tag.models");
const User = require("./models/user.models");
const Project = require("./models/project.models");
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const corsOptions = {
  origin: "*",
  credentials: true,
  optionSuccessStatus: 200,
};

const app = express();
app.use(express.json());
app.use(cors(corsOptions));

initializeDatabase();

const JWT_Secret = process.env.JWT_Secret;

const createUser = async (newUser) => {
  try {
    const existingUser = await User.findOne({ email: newUser.email });
    if (existingUser) {
      return null;
    }

    const hashedPassword = await bcrypt.hash(newUser.password, 10);

    const user = new User({
      name: newUser.name,
      email: newUser.email,
      password: hashedPassword,
    });

    const saveUser = await user.save();
    return saveUser;
  } catch (error) {
    throw error;
  }
};

app.post("/auth/signup", async (req, res) => {
  try {
    const savedUser = await createUser(req.body);
    if (!savedUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error in signup", error);
    res.status(500).json({ error: "Failed to register user" });
  }
});

const loginUser = async (email, password) => {
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return null;

    const token = jwt.sign({ userId: user._id }, JWT_Secret, {
      expiresIn: "1d",
    });

    return token;
  } catch (error) {
    throw error;
  }
};

app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const token = await loginUser(email, password);

    if (!token) {
      res.status(401).json({ error: "Invalid Credentials" });
    }

    res.status(200).json({ token });
  } catch (error) {
    console.error("Error in login", error);
    res.status(500).json({ error: "Login failed" });
  }
});

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "token missing" });
  }
  const token = authHeader.split(" ")[1];

  try {
    const decodedToken = jwt.verify(token, JWT_Secret);
    req.user = decodedToken;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

const readUserById = async (userId) => {
  try {
    const user = await User.findById(userId).select("-password");
    return user;
  } catch (error) {
    throw error;
  }
};

app.get("/auth/me", authenticateToken, async (req, res) => {
  try {
    const user = await readUserById(req.user.userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user details", error);
    res.status(500).json({ error: "Failed to fetch user details" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server is running on port", PORT);
});
