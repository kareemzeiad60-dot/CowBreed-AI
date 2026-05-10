import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middlewares
  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "CowBreed AI Server is running" });
  });

  // Feedback store (Simple in-memory for now)
  const feedbacks: any[] = [];
  app.post("/api/feedback", (req, res) => {
    const { rating, comment, breed } = req.body;
    if (!rating) return res.status(400).json({ error: "Rating is required" });
    feedbacks.push({ rating, comment, breed, date: new Date() });
    res.json({ success: true });
  });

  app.get("/api/feedback", (req, res) => {
    res.json(feedbacks);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
