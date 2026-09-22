# AI Camera Tracker

> Real-time safety compliance and AI traffic surveillance radar for Kerala roads. Built to promote defensive driving, seatbelt & helmet compliance, and speed limit adherence.

Developed by **A Aditya Nair** ([@adifications](https://github.com/adifications))

[![Live Demo](https://img.shields.io/badge/status-live-brightgreen.svg?style=for-the-badge)](https://dailybuglewatch.vercel.app)
**Live App URL:** [ai-camera-detector.onrender.com](https://ai-camera-detector.onrender.com/)

[![React](https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6-646cff?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Leaflet](https://img.shields.io/badge/Leaflet-1.9-199900?logo=leaflet&logoColor=white)](https://leafletjs.com/)
[![Express](https://img.shields.io/badge/Express-4.21-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## Overview

**AI Camera Tracker** is an interactive web and mobile-friendly application designed to map and monitor traffic surveillance AI cameras deployed across all 14 districts of Kerala (under the Kerala MVD "Safe Kerala" initiative).

The project empowers drivers with proactive safety alerts—encouraging drivers to wear seatbelts, motorcyclists to wear BIS-standard helmets, avoid mobile phone distractions, and observe road-specific speed limits.

---

## Key Features

-  **Interactive Kerala Map**: Full high-performance interactive map powered by **Leaflet.js** and OpenStreetMap tiles, pinpointing AI camera coordinates across all 14 districts.
-  **Real-Time Proximity Radar**: Live geolocation tracking with distance estimation to the nearest surveillance camera, accompanied by visual and audible proximity alerts.
-  **Road Speed & Violation Specs**: Displays specific speed limits (two-wheeler vs. four-wheeler/heavy vehicles) and detection capabilities (helmet, seatbelt, triple riding, mobile phone use, signal jumping) for each camera point.
-  **KML & KMZ Bulk Import**: Import camera coordinates directly from Google Earth / Google My Maps `.kml` and zipped `.kmz` files with automated parsing.
-  **Community Camera Submissions**: Users can report or add new camera locations through a built-in modal, saved and synchronized via backend API.
-  **District & Type Filters**: Fast filtering across Thiruvananthapuram, Ernakulam, Kozhikode, Thrissur, Kannur, and all other Kerala districts.
-  **Mobile & PWA Ready**: Responsive touch-friendly layout designed for in-car dashboard mounting and mobile web browsers.

---

##  Tech Stack

### Frontend
- **Framework**: React 19 with TypeScript
- **Styling**: Tailwind CSS v4
- **Mapping**: Leaflet & React-Leaflet
- **Animations**: Motion (`motion/react`)
- **Icons**: Lucide React
- **File Processing**: JSZip (for unpacking `.kmz` map packages)

### Backend & Server
- **Server**: Express.js (Node.js runtime)
- **Bundler & Compiler**: Vite + `esbuild` for CJS production builds
- **Storage**: Persistent JSON database (`shared_cameras.json`) with RESTful endpoints

---

##  Getting Started

### Prerequisites
- **Node.js**: Version 18+ or 20+ (Node 20+ recommended)
- **npm** or **bun** / **yarn** / **pnpm**

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/adifications/ai-camera-tracker.git
   cd ai-camera-tracker
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

##  Build & Production

To build the client SPA and the backend server bundle:

```bash
npm run build
```

This generates:
- Client static assets in `dist/`
- Production Express server bundle in `dist/server.cjs`

To start the production server:

```bash
npm start
```

---

##  Deploying to Production (Render, Railway, VPS)

### Deploying on Render.com (Web Service)

1. Create a new **Web Service** and connect your GitHub repository.
2. Configure settings:
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
3. If you want user-added camera locations to persist across redeployments on Render, attach a **Persistent Disk** mounted at `/opt/render/project/src` or connect a managed database (PostgreSQL / MongoDB / Firebase).

---

## API Reference

### `GET /api/custom-cameras`
Returns all community-contributed camera coordinates.

**Response:**
```json
[
  {
    "id": "custom-1710000000000",
    "district": "Ernakulam",
    "locationName": "Edappally Toll",
    "roadName": "NH 66",
    "lat": 10.0261,
    "lng": 76.3125,
    "speedLimitTwoWheeler": 50,
    "speedLimitFourWheeler": 60,
    "violationsChecked": ["Helmet", "Seatbelt", "Speeding"],
    "description": "Reported near Edappally Metro pillar."
  }
]
```

### `POST /api/custom-cameras`
Add one or an array of new camera locations.

**Request Body:**
```json
{
  "id": "cam-unique-id",
  "district": "Kottayam",
  "locationName": "Baker Junction",
  "roadName": "MC Road",
  "lat": 9.5915,
  "lng": 76.5222,
  "speedLimitTwoWheeler": 50,
  "speedLimitFourWheeler": 50,
  "violationsChecked": ["Helmet", "Seatbelt", "Mobile Use"],
  "description": "Mounted on traffic light pole."
}
```

### `DELETE /api/custom-cameras/:id`
Deletes a specific user-submitted camera by its ID.

---

## Project Structure

```text
├── index.html              # Main HTML entry point
├── package.json            # Scripts & project dependencies
├── server.ts               # Express API & Vite production middleware
├── shared_cameras.json     # Storage file for community camera locations
├── tsconfig.json           # TypeScript compiler configuration
├── vite.config.ts          # Vite build config with Tailwind CSS plugin
└── src/
    ├── main.tsx            # React application root
    ├── App.tsx             # Main dashboard, Leaflet map & radar UI
    ├── cameras.ts          # Curated database of Kerala MVD AI cameras
    └── index.css           # Tailwind CSS imports & global styles
```

---

## Disclaimer & Safety Notice

This project is created solely for **educational, road-safety awareness, and compliance purposes**. 
- It aims to encourage motorists to maintain legal speed limits, wear helmets and seatbelts, and avoid dangerous driving practices.
- The creators do not encourage speeding, rash driving, or evading law enforcement. Always follow Motor Vehicle Department (MVD) rules and road traffic signs.

---

## Author & Credits

- **Creator**: A Aditya Nair
- **GitHub / Social**: [@adifications](https://github.com/adifications)
- Data curated from Kerala Motor Vehicles Department (MVD) public notifications and crowd-sourced road safety reports.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

