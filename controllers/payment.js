import express from "express";
import midtransClient from "midtrans-client";
import Booking from "../models/booking.js";

const router = express.Router();

const snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: "SB-Mid-server-SZqlmFjsOEBfj5YGDVrDvxyu",
});

//Snap Token
router.post("/payment-token", async (req, res) => {
  const { order_id, gross_amount, name, email } = req.body;

  const parameter = {
    transaction_details: {
      order_id,
      gross_amount,
    },
    customer_details: {
      first_name: name,
      email,
    },
  };

  try {
    const transaction = await snap.createTransaction(parameter);
    res.json({ token: transaction.token });
  } catch (error) {
    console.error("Midtrans Error:", error);
    res.status(500).json({ error: "Gagal membuat token pembayaran" });
  }
});

router.put("/api/bookings/:order_id", async (req, res) => {
  const { order_id } = req.params;
  const { status } = req.body;

  try {
    const result = await Booking.update(
      { status_pembayaran: status },
      { where: { order_id } }
    );

    if (result[0] === 0) {
      return res.status(404).json({ message: "Booking tidak ditemukan" });
    }

    res.json({ message: "Status pembayaran berhasil diperbarui" });
  } catch (error) {
    console.error("Gagal update status pembayaran:", error);
    res.status(500).json({ message: "Gagal update status pembayaran" });
  }
});

router.post("/midtrans-webhook", async (req, res) => {
  try {
    const notification = req.body;
    const orderId = notification.order_id;
    const status = notification.transaction_status;
    console.log("Notifikasi Midtrans diterima:", notification);

    // Update status_pembayaran di DB
    await Booking.update(
      { status_pembayaran: status },
      { where: { order_id: orderId } }
    );

    res.status(200).json({ msg: "Notifikasi diterima" });
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).json({ msg: "Gagal proses webhook" });
  }
});

export default router;
