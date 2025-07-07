import express from "express";
import multer from "multer";
import Produk from "../models/Product.js";

const router = express.Router();

// (async () => {
//   await Produk.sync({ alter: true }); // akan menyesuaikan tabel dengan model terbaru, menambah kolom baru jika belum ada
//   console.log("produk table updated!");
// })();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

router.post("/produk", upload.single("picture"), async (req, res) => {
  try {
    const { judul, harga, deskripsi } = req.body;
    const picture = req.file.filename;

    await Produk.create({ judul, harga, deskripsi, picture });

    res.json({ message: "Produk berhasil ditambahkan!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal menyimpan produk." });
  }
});

// Route untuk mengambil semua produk dari database
router.get("/produk", async (req, res) => {
  try {
    const produk = await Produk.findAll(); // Mengambil semua produk dari database
    res.json(produk); // Mengembalikan data produk dalam bentuk JSON
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal mengambil produk." }); // Mengirimkan error jika gagal mengambil produk
  }
});

// Tambahkan route DELETE
router.delete("/produk/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Produk.destroy({ where: { id: parseInt(id) } });

    if (!deleted) {
      return res.status(404).json({ error: "Produk tidak ditemukan." });
    }

    res.json({ message: "Produk berhasil dihapus." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal menghapus produk." });
  }
});

// Route untuk update produk
router.put("/produk/:id", upload.single("picture"), async (req, res) => {
  try {
    const { id } = req.params;
    const { judul, harga, deskripsi } = req.body;

    // Cari produk berdasarkan ID
    const produk = await Produk.findByPk(id);
    if (!produk) {
      return res.status(404).json({ error: "Produk tidak ditemukan." });
    }

    // Siapkan data yang akan diupdate
    const updateData = {
      judul,
      harga,
      deskripsi,
    };

    // Jika user mengirim file baru, update juga nama file gambar
    if (req.file) {
      updateData.picture = req.file.filename;
    }

    await produk.update(updateData);

    res.json({ message: "Produk berhasil diupdate!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal mengupdate produk." });
  }
});

export default router;
