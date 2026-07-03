const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true,
    },
    owners: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    tags: [{ type: String }],
    timeToComplete: {
      type: Number,
      required: true,
      min: [1, "Time to complete must be at least 1"],
    },
    status: {
      type: String,
      enum: ["To Do", "In Progress", "Completed", "Blocked"],
      default: "To Do",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Task", taskSchema);
