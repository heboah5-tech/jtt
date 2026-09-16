import { Router } from "express";

const router = Router();

router.get("/bin/:bin", async (req, res) => {
  try {
    const bin = req.params.bin.replace(/\D/g, '').slice(0, 8);

    if (bin.length < 6) {
      return res.status(400).json({
        error: 'Invalid BIN',
      });
    }

    const response = await fetch(
      `https://lookup.binlist.net/${bin}`,
      {
        headers: {
          Accept: 'application/json',
        },
      }
    );

    if (!response.ok) {
      return res.status(response.status).json({
        error: 'BIN not found',
      });
    }

    const data = await response.json();

    res.json(data);
  } catch (error) {
    console.error('BINlist error:', error);

    res.status(500).json({
      error: 'BIN lookup failed',
    });
  }
});

export default router;
