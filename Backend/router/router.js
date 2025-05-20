const express = require("express");
const bcrypt = require("bcrypt");
const multer = require("multer");
const axios = require("axios");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const { User, Patient, Diagnostic } = require("../models/model");
const router = express.Router();
const dotenv = require("dotenv");

dotenv.config();


const upload = multer({
    dest: "uploads/",
    fileFilter: (req, file, cb) => {
        const allowedTypes = ["image/jpeg", "image/png"];
        if (!allowedTypes.includes(file.mimetype)) {
            return cb(new Error("Only JPEG and PNG files are allowed."));
        }
        cb(null, true);
    },
    limits: { fileSize: 10 * 1024 * 1024 },
});

const FASTAPI_URL = process.env.FASTAPI_URL;


function isAuthenticated(req, res, next) {
    if (req.session && req.session.user) {
        return next();
    }
    return res.status(401).json({ error: "Not authenticated" });
}


router.post("/login", async (req, res) => {
    const { username, password } = req.body;

    try {
        if (!username || !password) {
            return res.status(400).json({ error: "Username and password are required" });
        }

        const lowerCaseUsername = username.toLowerCase();
        const user = await User.findOne({ username: lowerCaseUsername });

        if (!user) return res.status(401).json({ error: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

        req.session.user = { id: user._id, username: user.username };
        res.status(200).json({ message: "Login successful", user: req.session.user });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

router.post("/logout", (req, res) => {
    req.session.destroy();
    res.clearCookie("connect.sid");
    res.status(200).json({ message: "Logged out" });
});

router.get("/me", (req, res) => {
    if (req.session && req.session.user) {
        return res.status(200).json({ user: req.session.user });
    }
    res.status(401).json({ error: "Not authenticated" });
});


router.post("/upload", isAuthenticated, upload.single("retinal-image"), async (req, res) => {
    const { patientID } = req.body;

    try {
        if (!req.file) {
            return res.status(400).json({ error: "Please upload a retinal image for classification." });
        }

        const patient = await Patient.findOne({ patientID });
        if (!patient) {
            return res.status(400).json({ error: "Patient not found. Please check the ID and try again." });
        }

        const imagePath = path.join(__dirname, "../", req.file.path);
        console.log("Image path:", imagePath);  
        const imageBuffer = fs.readFileSync(imagePath);
        const base64Image = imageBuffer.toString("base64");

        const response = await axios.post(
            process.env.FASTAPI_URL,
            { image: base64Image },
            { headers: { "Content-Type": "application/json" } }
        );

        const { predicted_class, confidence_score, heatmap } = response.data;

        const diagnostic = new Diagnostic({
            imageID: req.file.filename,
            confidenceScore: confidence_score,
            result: predicted_class,
            doctorName: req.session.user.username,
            patientName: patient.name,
            patientID: patient.patientID,
            imagePath: heatmap,
            diagnosisID: `diag-${Date.now()}`,
            dateDiagnosed: new Date(),
        });

        await diagnostic.save();
        fs.unlinkSync(imagePath);

        res.status(200).json({
            prediction: predicted_class,
            confidence: (confidence_score * 100).toFixed(2),
            heatmap: heatmap,
            patient: {
                name: patient.name,
                id: patient.patientID
            }
        });
    } catch (error) {
        console.error("Classification error:", error.message);
        if (error.response?.data) {
            console.error("FastAPI error:", error.response.data);
        }

        res.status(500).json({
            error: "An error occurred during the classification process. Please try again later."
        });
    }
});

router.post("/patients/search", isAuthenticated, async (req, res) => {
    const { searchPatient } = req.body;

    try {
        const patient = await Patient.findOne({
            $or: [{ patientID: searchPatient }, { name: searchPatient }]
        });

        if (!patient) {
            return res.status(404).json({ error: "Patient not found. Please check the ID or name." });
        }

        res.status(200).json({ patient });
    } catch (error) {
        console.error("Error searching patient:", error.message);
        res.status(500).json({ error: "An error occurred during the patient search. Please try again." });
    }
});
router.post("/patients/new", isAuthenticated, async (req, res) => {
    const { patientID, name, age, gender, medicalHistory, dateOfBirth } = req.body;
  
    try {
      const existingPatient = await Patient.findOne({ patientID });
  
      if (existingPatient) {
        return res.status(400).json({ error: "Patient with this ID already exists!" });
      }
  
      const newPatient = new Patient({
        patientID,
        name,
        age,
        gender,
        medicalHistory,
        dateOfBirth
      });
  
      await newPatient.save();
  
      res.status(201).json({
        message: "New patient created successfully!",
        patient: newPatient
      });
    } catch (error) {
      console.error("Error creating patient:", error.message);
      res.status(500).json({
        error: "An error occurred while creating the patient. Please try again."
      });
    }
  });
  
router.get("/api/diagnostics", isAuthenticated, async (req, res) => {
    try {
        const diagnostics = await Diagnostic.find();
        res.status(200).json(diagnostics);
    } catch (err) {
        console.error("Diagnostics fetch error:", err.message);
        res.status(500).json({ error: "Failed to fetch diagnostics" });
    }
});
router.post("/register", async (req, res) => {
    const { username, password } = req.body;
    const adminKey = req.headers["admin-key"];
    try {
        if (!username || !password) {
            return res.status(400).json({ error: "Username and password are required" });
        }
        const lowerCaseUsername = username.toLowerCase();

        if (adminKey !== process.env.ADMIN_SECRET) {
            return res.status(403).json({ error: "Forbidden: Invalid admin key" });
        }

        const existingUser = await User.findOne({ username: lowerCaseUsername });
        if (existingUser) return res.status(400).json({ error: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username: lowerCaseUsername, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ error: "An error occurred during registration" });
    }
});

module.exports = router;
