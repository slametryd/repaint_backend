import express from "express";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

router.post("/send-email", async (req, res) => {
  const {
    judul,
    tanggal,
    jenis_motor,
    warna,
    qty,
    total_harga,
    to,
    payment_info,
  } = req.body;
  let paymentText = "";
  if (payment_info?.payment_type === "bank_transfer") {
    paymentText = `
    Metode Pembayaran: ${payment_info.bank.toUpperCase()} Virtual Account
    Nomor VA: ${payment_info.va_number}
    Order ID: ${payment_info.order_id}
  `;
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // gunakan App Password, bukan password Gmail biasa
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: to,
    subject: "Detail Pesanan Anda || Repaint Body Motor",
    html: `
  <div style="font-family: sans-serif; background-color: #f3f4f6; padding: 20px; border-radius: 10px;">
    <h2 style="color: #111827;">Terima kasih atas pesanan Anda!</h2>

    <div style="margin-top: 20px;">
      <p><strong>Judul:</strong> ${judul}</p>
      <p><strong>Tanggal:</strong> ${tanggal}</p>
      <p><strong>Jenis Motor:</strong> ${jenis_motor}</p>
      <p><strong>Warna:</strong> ${warna}</p>
      <p><strong>Jumlah:</strong> ${qty}</p>
      <p><strong>Total Harga:</strong> ${total_harga}</p>
    </div>

    ${
      payment_info?.payment_type === "bank_transfer"
        ? `
        <hr style="margin: 20px 0;" />
        <h3>Informasi Pembayaran</h3>
        <p><strong>Metode Pembayaran:</strong> ${payment_info.bank.toUpperCase()} Virtual Account</p>
        <p><strong>Nomor VA:</strong> ${payment_info.va_number}</p>
        <p><strong>Order ID:</strong> ${payment_info.order_id}</p>
      `
        : ""
    }

    <p style="margin-top: 30px;">Salam hangat,<br/>Tim Booking Motor</p>
  </div>
  `,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Email berhasil dikirim" });
  } catch (error) {
    console.error("Gagal mengirim email:", error);
    res.status(500).json({ message: "Gagal mengirim email", error });
  }
});

export default router;
