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
      return res.status(401).json({ error: "Invalid Credentials" });
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

const createTask = async (newTask) => {
  try {
    const task = new Task(newTask);
    const saveTask = await task.save();
    return saveTask;
  } catch (error) {
    throw error;
  }
};

app.post("/tasks", authenticateToken, async (req, res) => {
  try {
    const savedTask = await createTask(req.body);
    if (!savedTask)
      return res.status(400).json({ error: "Failed to create Task" });

    res.status(201).json({ message: "Task created successfully", savedTask });
  } catch (error) {
    console.error("Error creating task", error);
    res.status(500).json({ error: "Internal Server error." });
  }
});

const readAllTasks = async (filters = {}) => {
  try {
    const query = {};

    if (filters.team) query.team = filters.team;
    if (filters.owner) query.owners = { $in: filters.owner.split(",") };
    if (filters.project) query.project = filters.project;
    if (filters.status) query.status = filters.status;
    if (filters.tags) query.tags = { $in: filters.tags.split(",") };

    const tasks = await Task.find(query);
    return tasks;
  } catch (error) {
    throw error;
  }
};

app.get("/tasks", async (req, res) => {
  try {
    const filters = {
      team: req.query.team,
      owner: req.query.owner,
      project: req.query.project,
      status: req.query.status,
      tags: req.query.tags,
    };

    const tasks = await readAllTasks(filters);

    if (tasks.length === 0) {
      return res.status(404).json({ error: "No tasks found." });
    }

    res.status(200).json(tasks);
  } catch (error) {
    console.error("Error fetching tasks", error);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

const updateTask = async (taskId, updatedData) => {
  try {
    const taskUpdate = await Task.findByIdAndUpdate(taskId, updatedData, {
      new: true,
    });
    return taskUpdate;
  } catch (error) {
    throw error;
  }
};

app.put("/tasks/:id", async (req, res) => {
  try {
    const updatedTask = await updateTask(req.params.id, req.body);

    if (!updatedTask) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.status(200).json({ message: "Task updated successfully", updateTask });
  } catch (error) {
    console.error("Error in updating task", error);
    res.status(500).json({ error: "Failed to update task" });
  }
});

const deleteTask = async (taskId) => {
  try {
    const deletedTask = await Task.findByIdAndDelete(taskId);
    return deletedTask;
  } catch (error) {
    throw error;
  }
};

app.delete("/tasks/:id", async (req, res) => {
  try {
    const deletedTask = await deleteTask(req.params.id);

    if (!deletedTask) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.status(200).json({ message: "Task deleted successfully", deletedTask });
  } catch (error) {
    console.error("Error in deleting task.");
    res.status(500).json({ error: "Failed to delete task." });
  }
});

const createTeam = async (newTeam) => {
  try {
    const team = new Team(newTeam);
    const saveTeam = await team.save();
    return saveTeam;
  } catch (error) {
    throw error;
  }
};

app.post("/teams", async (req, res) => {
  try {
    const savedTeam = await createTeam(req.body);

    if (!savedTeam) {
      return res.status(400).json({ error: "Failed to create new Team." });
    }

    res.status(201).json(savedTeam);
  } catch (error) {
    console.error("Error in creating new Team.");
    res.status(500).json({ error: "Internal server error" });
  }
});

const readAllTeams = async () => {
  try {
    const teams = await Team.find();
    return teams;
  } catch (error) {
    throw error;
  }
};

app.get("/teams", async (req, res) => {
  try {
    const teams = await readAllTeams();

    if (teams.length === 0) {
      return res.status(404).json({ error: "No teams found." });
    }

    res.status(200).json(teams);
  } catch (error) {
    console.error("Error in fetching teams");
    res.status(500).json({ error: "Failed to fetch teams" });
  }
});

const createProject = async (newProject) => {
  try {
    const project = new Project(newProject);
    const saveProject = await project.save();
    return saveProject;
  } catch (error) {
    throw error;
  }
};

app.post("/projects", async (req, res) => {
  try {
    const savedProject = await createProject(req.body);

    if (!savedProject) {
      return res.status(400).json({ error: "Failed to create project." });
    }

    res
      .status(201)
      .json({ message: "Project created successfully.", savedProject });
  } catch (error) {
    console.error("Error in creating project.");
    res.status(500).json({ error: "Internal Server Error." });
  }
});

const readAllProjects = async () => {
  try {
    const projects = await Project.find();
    return projects;
  } catch (error) {
    throw error;
  }
};

app.get("/projects", async (req, res) => {
  try {
    const projects = await readAllProjects();

    if (projects.length === 0) {
      return res.status(404).json({ error: "Projects not found." });
    }

    res.status(200).json(projects);
  } catch (error) {
    console.error("Error in fetching projects");
    res.status(500).json({ error: "Failed to fetch projects." });
  }
});

const createTag = async (newTag) => {
  try {
    const tag = new Tag(newTag);
    const saveTag = await tag.save();
    return saveTag;
  } catch (error) {
    throw error;
  }
};

app.post("/tags", async (req, res) => {
  try {
    const savedTag = await createTag(req.body);

    if (!savedTag) {
      return res.status(400).json({ error: "Failed to create tag." });
    }

    res.status(201).json({ message: "Tag created successfully.", savedTag });
  } catch (error) {
    console.error("Error in creating tag.");
    res.status(500).json({ error: "Internal server error." });
  }
});

const readAllTags = async () => {
  try {
    const tags = await Tag.find();
    return tags;
  } catch (error) {
    throw error;
  }
};

app.get("/tags", async (req, res) => {
  try {
    const tags = await readAllTags();

    if (tags.length === 0) {
      return res.status(404).json({ error: "Tags Not found." });
    }

    res.status(200).json({ tags });
  } catch (error) {
    console.error("Error in fetching tags.");
    res.status(500).json({ error: "Failed to fetch tags" });
  }
});

const readCompletedTasksLastWeek = async () => {
  try {
    const sevenDayAgo = new Date();
    sevenDayAgo.setDate(sevenDayAgo.getDate() - 7);

    const tasks = await Task.find({
      status: "Completed",
      updatedAt: { $gte: sevenDayAgo },
    });

    return tasks;
  } catch (error) {
    throw error;
  }
};

app.get("/report/last-week", async (req, res) => {
  try {
    const tasks = await readCompletedTasksLastWeek();
    res.status(200).json({ count: tasks.length, tasks });
  } catch (error) {
    console.error("Error generating last week report", error);
    res.status(500).json({ error: "Failed to generate report." });
  }
});

const calculatePendingWorkDays = async () => {
  try {
    const pendingTasks = await Task.find({
      status: { $ne: "Completed" },
    });

    const totalPendingDays = pendingTasks.reduce(
      (sum, task) => sum + (task.timeToComplete || 0),
      0
    );

    return {
      totalPendingDays,
      totalTasks: pendingTasks.length,
    };
  } catch (error) {
    throw error;
  }
};

app.get("/report/pending", async (req, res) => {
  try {
    const report = await calculatePendingWorkDays();
    res.status(200).json(report);
  } catch (error) {
    console.error("Error generating pending report", error);
    res.status(500).json({ error: "Failed to generate report" });
  }
});

const getClosedTasksReport = async (groupBy) => {
  try {
    const completedTasks = await Task.find({ status: "Completed" });

    const report = completedTasks.reduce((acc, task) => {
      let keys = [];

      if (groupBy === "team") keys = [task.team];
      if (groupBy === "project") keys = [task.project];
      if (groupBy === "owner") keys = task.owners || [];

      keys.forEach((key) => {
        if (!key) return;
        acc[key] = (acc[key] || 0) + 1;
      });

      return acc;
    }, {});

    return report;
  } catch (error) {
    throw error;
  }
};

app.get("/report/closed-tasks", async (req, res) => {
  try {
    const { groupBy } = req.query;

    if (!["team", "owner", "project"].includes(groupBy)) {
      return res.status(400).json({
        error: "groupBy must be team, owner, or project",
      });
    }

    const report = await getClosedTasksReport(groupBy);

    res.status(200).json(report);
  } catch (error) {
    console.error("Error generating closed tasks report", error);
    res.status(500).json({ error: "Failed to generate report" });
  }
});

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log("Server is running on port", PORT);
// });
