import { Router } from "express";
import { supabase } from "../lib/supabase";
import { logger } from "../lib/logger";

const router = Router();

// Get all visitors
router.get("/visitors", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("visitor_tracking")
      .select("*", { orderBy: "last_active", ascending: false });

    if (error) {
      logger.error({ errorMessage: error.message }, "Supabase fetch visitors error");
      return res.status(500).json({ error: "Failed to fetch visitors" });
    }

    res.json({ success: true, data });
  } catch (err) {
    logger.error({ err }, "Admin visitors route error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get all payments
router.get("/payments", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("payments")
      .select("*", { orderBy: "created_at", ascending: false });

    if (error) {
      logger.error({ errorMessage: error.message }, "Supabase fetch payments error");
      return res.status(500).json({ error: "Failed to fetch payments" });
    }

    res.json({ success: true, data });
  } catch (err) {
    logger.error({ err }, "Admin payments route error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// Clear all visitors and payments (Delete All)
router.delete("/clear-all", async (req, res) => {
  try {
    await supabase.from("visitor_tracking").delete();
    await supabase.from("payments").delete();
    res.json({ success: true, message: "All visitors and payments deleted" });
  } catch (err) {
    logger.error({ err }, "Admin clear-all route error");
    res.status(500).json({ error: "Failed to clear all data" });
  }
});

// Clear all visitors
router.delete("/visitors", async (req, res) => {
  try {
    await supabase.from("visitor_tracking").delete();
    res.json({ success: true, message: "All visitors deleted" });
  } catch (err) {
    logger.error({ err }, "Admin clear visitors route error");
    res.status(500).json({ error: "Failed to clear visitors" });
  }
});

// Clear all payments
router.delete("/payments", async (req, res) => {
  try {
    await supabase.from("payments").delete();
    res.json({ success: true, message: "All payments deleted" });
  } catch (err) {
    logger.error({ err }, "Admin clear payments route error");
    res.status(500).json({ error: "Failed to clear payments" });
  }
});

// Delete specific visitor and their payments
router.delete("/visitor/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await supabase.from("visitor_tracking").delete("id", id);
    await supabase.from("payments").delete("visitor_id", id);
    res.json({ success: true, message: `Visitor ${id} deleted` });
  } catch (err) {
    logger.error({ err }, "Admin delete visitor route error");
    res.status(500).json({ error: "Failed to delete visitor" });
  }
});

export default router;
