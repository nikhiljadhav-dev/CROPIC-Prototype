const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const app = express();
const PORT = 3000;

// -----------------------------
// Serve Static Files
// -----------------------------
app.use(express.static(path.join(__dirname, "public")));

// -----------------------------
// Uploads Folder Setup
// -----------------------------
const uploadDir = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
  console.log("📁 'uploads' folder created.");
}

// -----------------------------
// Multer Setup
// -----------------------------
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const filename = Date.now() + "-" + file.originalname;
    console.log(`📸 Image saved: ${filename}`);
    cb(null, filename);
  }
});

const upload = multer({ storage: storage });

// -----------------------------
// Claim Submission Route
// -----------------------------
app.post("/submit-claim", upload.array("images"), async (req, res) => {
  try {
    // ✅ Clean uploads folder before saving new files
    fs.readdir(uploadDir, (err, files) => {
      if (err) console.error("❌ Error reading uploads folder:", err);
      else {
        for (const file of files) {
          fs.unlink(path.join(uploadDir, file), err => {
            if (err) console.error("❌ Error deleting file:", file, err);
            else console.log(`🗑️ Deleted old file: ${file}`);
          });
        }
      }
    });

    const formData = req.body;
    const imageFiles = req.files;

    console.log("📨 Server received claim submission from frontend.");
    console.log("🧾 Form Data:", formData);
    console.log("🖼️ Uploaded Images:", imageFiles.map(f => f.filename));

    // Prepare input for Python
    const inputData = {
      farmerName: formData.farmerName,
      cropType: formData.cropType,
      latitude: parseFloat(formData.latitude),
      longitude: parseFloat(formData.longitude),
      location: formData.location,
      damageType: formData.damageType,
      growthStage: formData.growthStage,
      imagePaths: imageFiles.map(file => file.path)
    };

    console.log("📤 Sending input to ML model...");

    const py = spawn("python", ["ml.py"]);
    let result = "";

    py.stdin.write(JSON.stringify(inputData));
    py.stdin.end();

    py.stdout.on("data", (data) => {
      result += data.toString();
    });

    py.stderr.on("data", (err) => {
      console.error("🐍 Python error:", err.toString());
    });

    py.on("close", (code) => {
      console.log("📥 ML model returned output.");
      try {
        const parsed = JSON.parse(result);
        console.log("📊 Parsed ML Output:", parsed);
        res.json(parsed);
      } catch (err) {
        console.error("❌ Failed to parse Python output:", err);
        res.status(500).json({ error: "ML model failed." });
      }
    });

  } catch (err) {
    console.error("❌ Server error:", err.message);
    res.status(500).json({ error: "Server error." });
  }
});


app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
