import express from "express";
import JenisMotor from "../models/JenisMotor.js"; // import model
import WarnaMotor from "../models/WarnaMotor.js"; // import model

const router = express.Router();

// (async () => {
//   await JenisMotor.sync({ alter: true }); // akan menyesuaikan tabel dengan model terbaru, menambah kolom baru jika belum ada
//   console.log("produk table updated!");
// })();

// GET: ambil data jenis_motor dan warna_motor dari MySQL
router.get("/motor-options", async (req, res) => {
  try {
    // Mengambil semua data jenis motor dari database
    const jenisMotorData = await JenisMotor.findAll();
    // Mengambil semua data warna motor dari database
    const warnaMotorData = await WarnaMotor.findAll();

    // Memetakan hasil query ke array yang berisi nama jenis motor dan warna motor
    const jenisMotor = jenisMotorData.map((row) => row.nama);
    const warnaMotor = warnaMotorData.map((row) => row.nama);

    // Mengirimkan response JSON
    res.json({ jenisMotor, warnaMotor });
  } catch (err) {
    console.error("Gagal mengambil data opsi:", err);
    res.status(500).json({ message: "Gagal mengambil data" });
  }
});
// Tambah warna baru

router.post("/warna_motor", async (req, res) => {
  try {
    const { warna } = req.body;

    if (!warna) {
      return res.status(400).json({ message: "Warna tidak boleh kosong" });
    }

    await WarnaMotor.create({
      nama: warna,
      lastUpdateBy: "admin",
      lastUpdateDate: new Date(),
      status: "aktif",
    });
    res.status(201).json({ message: "Warna berhasil ditambahkan" });
  } catch (err) {
    console.error("Gagal menyimpan warna:", err);
    res.status(500).json({ message: "Gagal menyimpan warna" });
  }
});
// Tambah jenis baru
router.post("/jenis_motor", async (req, res) => {
  try {
    const { jenis } = req.body;

    if (!jenis) {
      return res.status(400).json({ message: "jenis tidak boleh kosong" });
    }

    await JenisMotor.create({
      nama: jenis,
      lastUpdateBy: "admin", // atau user login
      lastUpdateDate: new Date(),
      status: "aktif",
    });
    res.status(201).json({ message: "jenis berhasil ditambahkan" });
  } catch (err) {
    console.error("Gagal menyimpan jenis:", err);
    res.status(500).json({ message: "Gagal menyimpan jenis" });
  }
});

// GET semua warna motor (dengan ID dan nama)
router.get("/warna_motor", async (req, res) => {
  try {
    const warnaMotor = await WarnaMotor.findAll(); // Ambil semua data dari tabel
    res.json(warnaMotor); // Kirim data lengkap, termasuk ID
  } catch (err) {
    console.error("Gagal mengambil data warna:", err);
    res.status(500).json({ message: "Gagal mengambil data warna" });
  }
});

// GET semua jenis motor (dengan ID dan nama)
router.get("/jenis_motor", async (req, res) => {
  try {
    const jenisMotor = await JenisMotor.findAll(); // Ambil semua data dari tabel
    res.json(jenisMotor); // Kirim data lengkap, termasuk ID
  } catch (err) {
    console.error("Gagal mengambil data jenis:", err);
    res.status(500).json({ message: "Gagal mengambil data jenis" });
  }
});

// PUT: Update warna motor
router.put("/warna_motor/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { warna } = req.body;

    if (!warna) {
      return res.status(400).json({ message: "Warna tidak boleh kosong" });
    }

    const updated = await WarnaMotor.update(
      { nama: warna }, // sesuaikan ke field nama
      { where: { id } }
    );

    if (updated[0] === 0) {
      return res.status(404).json({ message: "Warna tidak ditemukan" });
    }

    res.json({ message: "Warna berhasil diupdate" });
  } catch (err) {
    console.error("Gagal update warna:", err);
    res.status(500).json({ message: "Gagal update warna" });
  }
});

// DELETE: Hapus warna motor
router.delete("/warna_motor/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await WarnaMotor.destroy({ where: { id } });

    if (!deleted) {
      return res.status(404).json({ message: "Warna tidak ditemukan" });
    }

    res.json({ message: "Warna berhasil dihapus" });
  } catch (err) {
    console.error("Gagal menghapus warna:", err);
    res.status(500).json({ message: "Gagal menghapus warna" });
  }
});

// PUT: Update jenis motor
router.put("/jenis_motor/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { jenis } = req.body;

    if (!jenis) {
      return res.status(400).json({ message: "Jenis tidak boleh kosong" });
    }

    const updated = await JenisMotor.update(
      { nama: jenis }, // sesuaikan ke field nama
      { where: { id } }
    );

    if (updated[0] === 0) {
      return res.status(404).json({ message: "Jenis tidak ditemukan" });
    }

    res.json({ message: "Jenis berhasil diupdate" });
  } catch (err) {
    console.error("Gagal update jenis:", err);
    res.status(500).json({ message: "Gagal update jenis" });
  }
});

// DELETE: Hapus jenis motor
router.delete("/jenis_motor/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await JenisMotor.destroy({ where: { id } });

    if (!deleted) {
      return res.status(404).json({ message: "Jenis tidak ditemukan" });
    }

    res.json({ message: "Jenis berhasil dihapus" });
  } catch (err) {
    console.error("Gagal menghapus jenis:", err);
    res.status(500).json({ message: "Gagal menghapus jenis" });
  }
});

export default router;
