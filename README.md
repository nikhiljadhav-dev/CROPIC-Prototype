# CROPIC Prototype

**AI-powered crop damage analytics for PMFBY**

A website-based prototype built for **Smart India Hackathon 2025** that demonstrates an end-to-end pipeline for farmer-submitted, geo-tagged crop images and AI/ML-backed damage assessment to modernize crop insurance claim processing under PMFBY.

---

## Table of Contents

* [About](#about)
* [Highlights / Key Features](#highlights--key-features)
* [Live Demo / Prototype Flow](#live-demo--prototype-flow)
* [Project Structure](#project-structure)
* [Technology Stack](#technology-stack)
* [Setup & Run (Local)](#setup--run-local)
* [Environment variables](#environment-variables)
* [How the ML integration works](#how-the-ml-integration-works)
* [API Endpoints](#api-endpoints)
* [Notes, Limitations & Next Steps](#notes-limitations--next-steps)
* [Security & Privacy considerations](#security--privacy-considerations)
* [Acknowledgements](#acknowledgements)
* [Contact](#contact)

---

## About

CROPIC Prototype is a software demonstration that solves real problems in crop insurance claim processing by enabling farmers to upload geotagged images and metadata via a simple web form. The prototype runs a local AI/ML script that simulates analysis and returns damage probability, severity, likely damage types, and visualizations (map, heatmap, donut chart, meters) to help officials make fast, unbiased decisions.

This project was developed as an entry for the Smart India Hackathon 2025 to showcase an approach for automating PMFBY claim assessments using mobile photography and AI.

---

## Highlights / Key Features

* Farmer-facing submission form with support for multiple image uploads and automatic geotag fields.
* Server-side image upload handling (Express + multer) and temporary storage in `/uploads`.
* ML integration via `ml.py` (simulated model) that reads input from `stdin` and returns JSON analysis.
* Interactive dashboard visualizations using Leaflet (map) and Chart.js (bar & doughnut charts).
* Heatmap grid, circular meters, and claim recommendation logic based on model outputs.
* Clean, self-contained prototype suitable for demos and interviews.

---

## Live Demo / Prototype Flow

1. Farmer opens the prototype and submits images + metadata.
2. Server receives images and form data at `/submit-claim`, saves files into `uploads/`.
3. Server spawns `ml.py` and sends the form JSON to its stdin.
4. `ml.py` returns a JSON object containing damage metrics and geospatial footprint.
5. Frontend receives response and renders:

   * A Leaflet map with marker and damage circle
   * Bar chart (yield loss, payout, recovery time)
   * Donut chart for damage-type confidence
   * Heatmap grid and circular progress meters

---

## Project Structure

```
CROPIC PROTOTYPE/
├── public/
|   ├── images
│   ├── index.html
│   ├── script.js
│   └── styles.css
├── uploads/                # runtime: uploaded images
├── ml.py                   # ML simulation / inference script
├── server.js               # Express server (uploads + ML spawn)
├── package.json
└── requirements.txt
```

---

## Technology Stack

* Frontend: HTML, CSS, JavaScript, Font Awesome, Leaflet, Chart.js
* Backend: Node.js (Express), multer for file uploads
* ML: Python script (`ml.py`) — demonstrates integration pattern (stdin/stdout)
* Optional: Google Drive SDK (used in `ml.py` for dataset access if configured)

---

## Setup & Run (Local)

> Tested on development environment. Assumes Node.js and Python are installed.

1. Install Node dependencies:

```bash
npm install
```

2. (Recommended) Create a Python virtual environment and install Python deps:

```bash
python -m venv venv
# on Linux/macOS
source venv/bin/activate
# on Windows
venv\Scripts\activate

pip install -r requirements.txt
```

3. Configure environment variables (see next section).

4. Start the server (runs on port 3000 by default):

```bash
npm start
# or
node server.js
```

5. Open [http://localhost:3000](http://localhost:3000) and try the interactive demo.

---

## Environment variables

The ML script (`ml.py`) includes optional Google Drive access and requires two environment variables when you want to use Google Drive datasets:

* `GOOGLE_DRIVE_FOLDER_ID` — ID of the Drive folder containing auxiliary datasets.
* `GOOGLE_APPLICATION_CREDENTIALS` — path to the service account JSON key file.

If you do not need Drive integration for local testing, leave these unset; `ml.py` will still run because the prototype simulates outputs.

Example (Linux/macOS):

```bash
export GOOGLE_DRIVE_FOLDER_ID="your_folder_id_here"
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account.json"
```

---

## How the ML integration works

* The Express server receives form data and saved image file paths.
* The server spawns the Python process (`ml.py`) and writes a JSON payload to its `stdin`.
* The Python script reads `stdin`, runs its analysis (currently simulated) and prints a JSON result to `stdout`.
* Server captures `stdout` and returns the parsed JSON to the frontend.

This simple `stdin`/`stdout` pattern demonstrates integration without requiring a complete model-serving stack and is easy to replace with a REST call to a model server or cloud inference service later.

---

## API Endpoints

* `POST /submit-claim` — Accepts multipart form (`images[]`, `farmerName`, `cropType`, `latitude`, `longitude`, `location`, `damageType`, `growthStage`) and returns ML JSON.

Example `curl` for testing:

```bash
curl -F "farmerName=Test Farmer" \
     -F "cropType=Wheat" \
     -F "latitude=20.5" \
     -F "longitude=78.9" \
     -F "location=Test Village" \
     -F "damageType=Flood_Inundation" \
     -F "growthStage=Mid" \
     -F "images=@/path/to/image1.jpg" \
     http://localhost:3000/submit-claim
```

---

## Notes, Limitations & Next Steps

* **Prototype stage**: `ml.py` currently simulates outputs with randomized numbers; replace with a trained model (TensorFlow/PyTorch) for production.
* **Uploads**: The server currently clears the `uploads/` folder before saving new files — change to an archival strategy for multi-claim workflows.
* **Model serving**: For production, serve models via an API (e.g., FastAPI/Gunicorn, TensorFlow Serving, or cloud ML endpoints) and call from Node.js instead of spawning processes.
* **Validation & UX**: Add client-side image quality checks (blurriness, exposure) and guidance overlays to help farmers capture consistent photos.
* **Mobile app**: Build a simple Android/iOS app (or PWA) for offline image capture and queued uploads.
* **Integration**: Integrate satellite, weather, and existing YESTECH yield-estimation systems for improved accuracy.

---

## Security & Privacy considerations

* Use secure storage for credential files and never commit service account keys to source control.
* Add authentication and authorization for dashboard access (role-based access for officials).
* Validate and sanitize all inputs on the server to avoid injection or file path attacks.
* Implement HTTPS for production and enforce CORS and rate-limiting.
* Consider data retention policies and farmer consent for any uploaded images.

---

## Acknowledgements

Developed for the Smart India Hackathon 2025 under the problem statement:
**AI based real-time crop image analytics for crop insurance - PMFBY**.

---

## Contact

Team CROPIC — [team@cropic.in](mailto:team@cropic.in)

If you'd like a shorter project blurb (≤ 350 characters) for README header or GitHub project description, tell me and I'll add one.

---

© 2025 CROPIC Prototype
