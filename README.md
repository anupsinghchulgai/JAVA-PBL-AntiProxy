# Anti-Proxy Attendance System

GPS-verified, dynamic QR attendance — Pure Java backend + React frontend.

---

## Folder Structure

```
attendance-final/
├── backend/
│   ├── build.sh
│   └── src/main/java/com/attendance/
│       ├── server/Main.java
│       ├── model/  (DataStore, Session, TokenRecord, AttendanceRecord)
│       ├── api/    (CorsUtil, SessionCreate/Active, TokenGenerate/Validate,
│       │            MarkAttendance, AttendanceList handlers)
│       └── util/GeoUtil.java   ← Haversine formula
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── src/main.jsx             ← Entire React app (single file)
```

---

## How to Run

### Step 1 — Start the Java Backend

> Requires: **Java 11+** installed

```bash
cd backend
chmod +x build.sh
./build.sh
```

You should see:
```
╔══════════════════════════════════════════╗
║  Anti-Proxy Attendance System  v1.0      ║
║  Backend running on http://localhost:8080 ║
╚══════════════════════════════════════════╝
```

**Windows users** (run these in CMD or PowerShell):
```cmd
cd backend
mkdir out
dir /s /b src\main\java\*.java > sources.txt
javac --add-exports java.base/sun.net.httpserver=ALL-UNNAMED -d out @sources.txt
java --add-exports java.base/sun.net.httpserver=ALL-UNNAMED -cp out com.attendance.server.Main
```

---

### Step 2 — Start the React Frontend

> Requires: **Node.js 18+** installed

```bash
cd frontend
npm install
npm run dev
```

Open: **http://localhost:5173**

---

## Usage

1. **Teacher** → clicks "Teacher" → enters name + subject → clicks "Start Session"
   - Browser asks for location permission → **Allow**
   - QR code appears, refreshes every 10 seconds automatically
   - Live attendance list updates as students scan

2. **Student** (on phone, same WiFi network) → opens `http://<teacher-PC-IP>:5173`
   - Clicks "Student" → "Open Camera"
   - Scans the QR → enters Roll Number + Name
   - Browser captures GPS → submits to backend
   - Backend validates: token alive? within 10m? not duplicate?
   - On success → name pops up on teacher's dashboard instantly

---

## Anti-Proxy Mechanisms

| Mechanism | How it works |
|---|---|
| Dynamic QR | New cryptographic token every 10s; old token rejected instantly |
| Geofencing | Haversine formula; must be ≤10m from teacher's GPS anchor |
| One-time entry | Backend rejects duplicate studentId per session |
| Live GPS | `maximumAge: 0` forces fresh position, no cached/replayed coords |

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| POST | `/api/session/create` | Create session with teacher GPS |
| GET  | `/api/session/active` | Get current active session |
| POST | `/api/token/generate` | Generate new QR token (10s TTL) |
| POST | `/api/token/validate` | Validate a scanned token |
| POST | `/api/attendance/mark` | Mark attendance (full validation) |
| GET  | `/api/attendance/list?sessionId=` | Live attendance list |
