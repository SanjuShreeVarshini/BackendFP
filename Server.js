require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5001;
const MONGO_URI = process.env.MONGO_URI; 

// Middleware
app.use(express.json()); 
app.use(cors()); 

// MongoDB Connection
mongoose
    .connect(MONGO_URI, { dbName: "issueDB" }) 
    .then(() => console.log(" MongoDB Connected Successfully"))
    .catch(err => console.error("DB Connection Error:", err));

// Define Issue Schema
const issueSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

// Create Model
const Issue = mongoose.model("Issue", issueSchema);

// Routes
app.get("/", (req, res) => {
    res.send("Welcome to the Local Issue Reporting API!");
});

// Create Issue (POST)
app.post("/Issues", async (req, res) => {
    try {
        const { title, description, location } = req.body;
        if (!title || !description || !location) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const newIssue = new Issue({ title, description, location });
        await newIssue.save();
        res.status(201).json({ message: "Issue reported successfully", data: newIssue });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// Get All Issues (GET)
app.get("/Issues", async (req, res) => {
    try {
        const issues = await Issue.find();
        res.status(200).json(issues);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// Get Single Issue by ID (GET)
app.get("/Issues/:id", async (req, res) => {
    try {
        const issue = await Issue.findById(req.params.id);
        if (!issue) return res.status(404).json({ message: "Issue not found" });
        res.status(200).json(issue);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// Update Issue (PUT)
app.put("/Issues/:id", async (req, res) => {
    try {
        const { title, description, location } = req.body;
        const updatedIssue = await Issue.findByIdAndUpdate(
            req.params.id,
            { title, description, location },
            { new: true, runValidators: true }
        );
        if (!updatedIssue) return res.status(404).json({ message: "Issue not found" });
        res.status(200).json({ message: "Issue updated successfully", data: updatedIssue });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// Delete Issue (DELETE)
app.delete("/Issues/:id", async (req, res) => {
    try {
        const deletedIssue = await Issue.findByIdAndDelete(req.params.id);
        if (!deletedIssue) return res.status(404).json({ message: "Issue not found" });
        res.status(200).json({ message: "Issue deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(` Server running on port ${PORT}`);
});
