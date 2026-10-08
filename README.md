# 🏥 Rural Health Guardian (ग्रामीण स्वास्थ्य रक्षक)

> **Smart Healthcare Support, Emergency SOS, and Nearest PHC Locator for Rural & Semi-Urban Communities**  
> *Ayushman Bharat Digital Health & National Health Mission (NHM) Prototype*

---

## 📁 Project Architecture & Directory Structure

```text
rural-health-guardian/
│
├── frontend/
│   ├── index.html       # Semantic HTML5 layout with Responsive UI, Modals & Print Sheet
│   ├── style.css        # Tailwind CSS customizations, glassmorphism, and A4 print styles
│   └── script.js        # Geolocation Navigator, Haversine Engine, SOS Dispatch & AI Triage
│
├── backend/
│   ├── app.py           # FastAPI REST API Server, Geolocation Routing & Clinical Triage Engine
│   └── requirements.txt # Python dependencies (fastapi, uvicorn, pydantic, etc.)
│
├── assets/
│   ├── images/          # Clinical diagrams, hospital banners & badges
│   └── icons/           # SVG icons (heart.svg, sos.svg, hospital.svg, ambulance.svg)
│
└── README.md            # Comprehensive documentation & setup instructions
```

---

## 🚀 Key Features

1. **📍 Live GPS Geolocation & Auto-Detection**:
   - Prompts for browser GPS location permissions (`navigator.geolocation.getCurrentPosition`).
   - Automatically tracks real-time satellite coordinates (`latitude`, `longitude`, accuracy) with reverse geocoding to village/district.
   - Falls back gracefully to village coordinates (Rampur, Belur, Shivamogga, Mandya, etc.) when GPS is denied or offline.

2. **🏥 Nearest Healthcare Facilities & PHC Locator**:
   - Real-time Haversine distance and driving ETA calculation to 24/7 Primary Health Centres (PHCs), Community Health Centres (CHCs), District Govt Hospitals, and 108 Ambulance bases.
   - 1-tap **`[Call Facility]`** and **`[Get Directions]`** opening Google Maps with turn-by-turn navigation from the user's live position.

3. **🚨 Stress-Optimized Emergency Mode (SOS)**:
   - Priority triage recommendations based on medical crisis:
     - *🫀 Chest Pain / Cardiac*: Govt Trauma Hospital & 108 Ambulance.
     - *💨 Severe Breathing*: 24/7 PHC with Oxygen Beds & 108 Ambulance.
     - *🩹 Fall / Injury*: District Trauma Center.
     - *🔥 High Fever / Convulsion*: Closest 24/7 PHC & ASHA post.
   - 3 Large accessible emergency buttons:
     1. **`Call 108`**: National emergency ambulance dispatch.
     2. **`Call Family`**: Direct call to emergency contact (`Sunita Kumar - +91 98765 43211`).
     3. **`Share Location`**: 1-tap WhatsApp/SMS live GPS coordinate share.

4. **🤖 AI Clinical Stability Scoring & Triage (0-100)**:
   - Evaluates multi-parameter vitals (SpO2, Blood Pressure, Heart Rate, Glycemia, Body Temperature).
   - Generates an instant clinical stability score (0-100) with plain-language guidance.

5. **📄 1-Page Official Diagnostic Report Certificate**:
   - Single-page clinical summary sheet with Overall Health Stability Score, 2x2 physiological organ breakdown, and 1-tap printable official card.

6. **🌐 Trilingual Engine**:
   - 100% native translations across **English**, **हिंदी (Hindi)**, and **ಕನ್ನಡ (Kannada)**.

---

## 🛠️ Quick Start Guide

### 1. Running the Frontend (Static Web Application)
Open `frontend/index.html` in any web browser (Google Chrome recommended):
```bash
# Windows
start chrome frontend/index.html
```

Or run via any local HTTP server (Live Server / Vite / Python http.server):
```bash
cd frontend
python -m http.server 5173
```
Visit: **`http://localhost:5173/`**

---

### 2. Running the Python Backend API Server
```bash
# 1. Navigate to backend directory
cd backend

# 2. Install dependencies
pip install -r requirements.txt

# 3. Start FastAPI server with Uvicorn
python app.py
```
* **API Root**: `http://localhost:8000/`
* **Interactive Swagger UI Documentation**: `http://localhost:8000/docs`
* **ReDoc Documentation**: `http://localhost:8000/redoc`

---

## 📡 Backend API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/` | System health check and database statistics |
| `POST` | `/api/facilities/nearby` | Returns sorted nearby PHCs/Hospitals with Haversine distance and ETAs |
| `POST` | `/api/emergency/sos` | Transmits an emergency SOS alert with satellite GPS coordinates |
| `POST` | `/api/vitals` | Records patient vitals and runs automated clinical AI triage scoring |

---

## 📜 Regulatory & Clinical Disclaimer
*Rural Health Guardian is designed as an informational health monitoring and emergency triage prototype for rural communities. It supports and connects citizens with qualified Primary Health Centres and emergency services (108/104).*
