import { Router } from "express";

const router = Router();

router.post("/test", async (req, res) => {
  try {
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed" });
  }
});

export default router;