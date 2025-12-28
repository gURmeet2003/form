const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcryptjs = require("bcryptjs");

const PORT = 5000;
const app = express();
const MONGO_URI =
  "mongodb+srv://gurmeetrajsnm_db_user:nLFbO9MkbdAX8TMz@cluster0.rkdf1gq.mongodb.net/?appName=Cluster0";

// deployment specific
const path = require("path");

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(MONGO_URI);

const db = mongoose.connection;
db.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});
db.once("open", () => {
  console.log("MongoDB is connected");
});

// Student Schema & Model
const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  age: { type: Number, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  course: { type: String, required: true },
  gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
});

const Student = mongoose.model("Student", studentSchema);

// Register Endpoint
app.post("/register", async (req, res) => {
  try {
    const { name, email, password, age, phone, address, course, gender } =
      req.body;

    // Validate required fields
    if (
      !name ||
      !email ||
      !password ||
      !age ||
      !phone ||
      !address ||
      !course ||
      !gender
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if email already exists
    const existingStudent = await Student.findOne({ email });
    if (existingStudent) {
      return res.status(409).json({ message: "Email already registered" });
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(password, 10);

    const newStudent = new Student({
      name,
      email,
      password: hashedPassword,
      age,
      phone,
      address,
      course,
      gender,
    });

    await newStudent.save();
    res.status(201).json({ message: "Registered Successfully" });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//deployment specific
app.use(express.static(path.join(__dirname, "build")));
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
