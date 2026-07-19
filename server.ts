import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for parsing JSON with a larger limit to accommodate bulk KMZ/KML imports
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  const dbPath = path.join(process.cwd(), "shared_cameras.json");

  // Helper to read database
  const readDb = (): any[] => {
    try {
      if (!fs.existsSync(dbPath)) {
        fs.writeFileSync(dbPath, JSON.stringify([]));
        return [];
      }
      const data = fs.readFileSync(dbPath, "utf-8");
      return JSON.parse(data || "[]");
    } catch (err) {
      console.error("Error reading shared cameras file:", err);
      return [];
    }
  };

  // Helper to write database
  const writeDb = (data: any[]) => {
    try {
      fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
    } catch (err) {
      console.error("Error writing shared cameras file:", err);
    }
  };

  // API endpoints

  // 1. Get all shared cameras
  app.get("/api/custom-cameras", (req, res) => {
    const cameras = readDb();
    res.json(cameras);
  });

  // 2. Add shared camera(s)
  app.post("/api/custom-cameras", (req, res) => {
    const input = req.body;
    if (!input) {
      res.status(400).json({ error: "Missing body content" });
      return;
    }

    const currentCams = readDb();
    const addedCams: any[] = [];

    const addSingle = (cam: any) => {
      if (!cam.id || !cam.locationName || typeof cam.lat !== "number" || typeof cam.lng !== "number") {
        return false;
      }
      // Check if duplicate exists
      if (currentCams.some((c) => c.id === cam.id)) {
        return false;
      }
      currentCams.push(cam);
      addedCams.push(cam);
      return true;
    };

    if (Array.isArray(input)) {
      input.forEach((cam) => addSingle(cam));
    } else {
      addSingle(input);
    }

    if (addedCams.length > 0) {
      writeDb(currentCams);
    }

    res.json({ success: true, count: addedCams.length, added: addedCams });
  });

  // 3. Delete a shared camera
  app.delete("/api/custom-cameras/:id", (req, res) => {
    const { id } = req.params;
    let currentCams = readDb();
    const originalLength = currentCams.length;
    currentCams = currentCams.filter((c) => c.id !== id);

    if (currentCams.length < originalLength) {
      writeDb(currentCams);
      res.json({ success: true, message: `Camera with ID ${id} deleted.` });
    } else {
      res.status(404).json({ error: `Camera with ID ${id} not found.` });
    }
  });

  // Vite middleware for asset serving / HMR in development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // Serve index.html for all non-API paths (SPA fallback)
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
