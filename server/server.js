const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
const PORT = 3000;

// middleware
app.use(cors());
app.use(express.json());

// Database connection
mongoose
  .connect("mongodb://localhost:27017/ToDoList")
  .then(() => console.log("MongoDB connected"))
  .catch(err => {
    console.error("DB connection failed:", err.message);
  });

// Schema
const todoSchema = new mongoose.Schema(
  {
    title: { 
      type: String, required: true, trim: true 
    },
    description: {
       type: String, required: true, trim: true 
      }
  },
  { timestamps: true }
);

// Model
const model = mongoose.model("Todo", todoSchema);

// Routes

// Post api
app.post("/todos", async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: "Title and description required" });
    }

    const todo = await model.create({ title, description });
    res.status(201).json(todo);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get  api
app.get("/todos", async (req, res) => {
  try {
    const todos = await model.find().sort({ createdAt: -1 });
    res.status(200).json(todos);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update api
app.put("/todos/:id", async (req, res) => {
  try {
    const { title, description } = req.body;

    const updatedTodo = await model.findByIdAndUpdate(
      req.params.id,
      { title, description },
      { new: true, runValidators: true }
    );

    if (!updatedTodo) {
      return res.status(404).json({ message: "Todo not found" });
    }

    res.status(200).json(updatedTodo);

  } catch (error) {
    res.status(400).json({ message: "Invalid ID format" });
  }
});

// Delete api
app.delete("/todos/:id", async (req, res) => {
  try {
    const deletedTodo = await model.findByIdAndDelete(req.params.id);

    if (!deletedTodo) {
      return res.status(404).json({ message: "Todo not found" });
    }

    res.status(200).json({ message: "Todo deleted successfully" });

  } catch (error) {
    res.status(400).json({ message: "Invalid ID format" });
  }
});

// server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
