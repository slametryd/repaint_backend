import express from "express";
import Booking from "../models/booking.js";
import Product from "../models/Product.js";
import { now } from "sequelize/lib/utils";

const router = express.Router();

// (async () => {
//   await Booking.sync({ alter: true }); // akan menyesuaikan tabel dengan model terbaru, menambah kolom baru jika belum ada
//   console.log("Booking table updated!");
// })();

router.get("/booking", async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      include: Product,
    });

    res.json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Gagal mengambil data booking." });
  }
});

router.post("/bookings", async (req, res) => {
  const {
    tanggal,
    jenis_motor,
    warna,
    qty,
    produkId,
    order_id,
    status_pembayaran,
    nama,
    noWa,
  } = req.body;

  if (
    !tanggal ||
    !jenis_motor ||
    !warna ||
    !qty ||
    !produkId ||
    !nama ||
    !noWa
  ) {
    return res.status(400).json({ error: "Semua kolom harus diisi." });
  }

  try {
    const product = await Product.findByPk(produkId);
    if (!product) {
      return res.status(404).json({ error: "Produk tidak ditemukan." });
    }

    const total_harga = product.harga * qty;

    const booking = await Booking.create({
      tanggal,
      jenis_motor,
      warna,
      qty,
      total_harga,
      produkId,
      order_id,
      status_pembayaran,
      nama,
      noWa,
      lastUpdateBy: req.user?.name || " ",
      lastUpdateDate: new Date(),
    });

    res.status(201).json({ message: "Booking berhasil", booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal menyimpan booking." });
  }
});

export const updateBookingStatus = async (req, res) => {
  const { orderId } = req.params;
  const { status_pembayaran } = req.body;

  try {
    const booking = await Booking.findOne({ where: { order_id: orderId } });

    if (!booking) {
      return res.status(404).json({ msg: "Booking tidak ditemukan" });
    }

    await Booking.update(
      { status_pembayaran },
      { where: { order_id: orderId } }
    );

    res.status(200).json({ msg: "Status pembayaran berhasil diperbarui" });
  } catch (error) {
    console.error("Update status gagal:", error);
    res.status(500).json({ msg: "Terjadi kesalahan" });
  }
};

export default router;
