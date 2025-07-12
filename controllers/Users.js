import Users from "../models/UserModels.js";
import admin from "../controllers/firebaseAdmin.js";
import bcrypt from "bcrypt";
import JWT from "jsonwebtoken";
import db from "../config/Database.js";
import { OAuth2Client } from "google-auth-library";
import dotenv from "dotenv";
dotenv.config();
import crypto from "crypto";
import nodemailer from "nodemailer";

const FrontendUrl = process.env.FRONTEND_URL;

// 🔹 GET all users (kecuali password/token)
export const getUsers = async (req, res) => {
  try {
    const users = await Users.findAll({
      attributes: ["id", "name", "email"],
    });
    res.json(users);
  } catch (error) {
    console.error("Error saat getUsers:", error);
    res.status(500).json({ msg: "Terjadi kesalahan saat mengambil data user" });
  }
};

// 🔹 REGISTER user
export const Register = async (req, res) => {
  const { name, email, password, confPassword } = req.body;
  if (password !== confPassword)
    return res
      .status(400)
      .json({ msg: `Password tidak cocok dengan confirm password` });

  try {
    const salt = await bcrypt.genSalt();
    const hashPassword = await bcrypt.hash(password, salt);
    await Users.create({
      name,
      email,
      password: hashPassword,
      role: "user",
    });

    res.json({ msg: "Register berhasil" });
  } catch (error) {
    console.error("Error saat register:", error);
    res.status(500).json({ msg: "Gagal melakukan registrasi" });
  }
};

// 🔹 LOGIN user
export const login = async (req, res) => {
  console.log("Login body:", req.body);
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ msg: "Email dan password wajib diisi" });

    const user = await Users.findOne({ where: { email } });
    if (!user) return res.status(404).json({ msg: "Email tidak ditemukan" });
    if (!user.password)
      return res.status(400).json({
        msg: "Akun ini tidak memiliki password, gunakan login Google",
      });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ msg: "Password salah" });

    const { id: userId, name, role } = user;

    const accessToken = JWT.sign(
      { userId, name, email, role },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "20s" }
    );

    const refreshToken = JWT.sign(
      { userId, name, email, role },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "1d" }
    );

    await Users.update(
      { refresh_token: refreshToken },
      { where: { id: userId } }
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.json({
      msg: "Login berhasil",
      accessToken,
      user: { id: userId, name, email, role },
    });
  } catch (error) {
    console.error("Error saat login:", error);
    res.status(500).json({ msg: "Gagal login" });
  }
};

// 🔹 LOGOUT user
export const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.sendStatus(204);

    const user = await Users.findOne({
      where: { refresh_token: refreshToken },
    });

    if (!user) return res.sendStatus(204);

    await Users.update({ refresh_token: null }, { where: { id: user.id } });
    res.clearCookie("refreshToken");
    return res.sendStatus(200);
  } catch (error) {
    console.error("Error saat logout:", error);
    return res.status(500).json({ msg: "Gagal logout" });
  }
};

// 🔹 LOGIN via Google (Firebase Admin SDK)
export const googleLogin = async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ msg: "Token is required" });

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    const { name, email, picture } = decodedToken;

    let user = await Users.findOne({ where: { email } });
    if (!user) {
      user = await Users.create({
        name,
        email,
        avatar: picture,
        password: "",
        role: "user",
      });
    }

    const userId = user.id;

    const accessToken = JWT.sign(
      { userId, name: user.name, email: user.email },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );

    const refreshToken = JWT.sign(
      { userId, name: user.name, email: user.email },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" }
    );

    await Users.update(
      { refresh_token: refreshToken },
      { where: { id: userId } }
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      msg: "Login Google berhasil",
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Google login gagal:", error);
    res.status(500).json({ msg: "Gagal login dengan Google" });
  }
};

// 🔹 MIDDLEWARE Verifikasi Token
export const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.sendStatus(401);

  JWT.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) return res.sendStatus(403); // Token kadaluarsa/tidak valid
    req.user = decoded;
    next(); // ⬅️ Jangan lupa ini
  });
};

// 🔹 Kirim link reset password
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  const user = await Users.findOne({ where: { email } });
  if (!user) return res.status(404).json({ msg: "Email tidak ditemukan" });

  const token = crypto.randomBytes(32).toString("hex");
  const resetToken = JWT.sign({ id: user.id }, process.env.RESET_TOKEN_SECRET, {
    expiresIn: "15m",
  });

  const resetLink = `${FrontendUrl}/reset-password/${resetToken}`;

  // Kirim email
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Reset Password" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Reset Password",
    html: `<p>Klik link berikut untuk mengatur ulang password:</p>
           <a href="${resetLink}">${resetLink}</a>`,
  });

  res.json({ msg: "Link reset password telah dikirim ke email Anda" });
};

// 🔹 Reset Password (via token)
export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password, confPassword } = req.body;

  if (!password || !confPassword)
    return res.status(400).json({ msg: "Semua field wajib diisi" });

  if (password !== confPassword)
    return res.status(400).json({ msg: "Password tidak cocok" });

  try {
    const decoded = JWT.verify(token, process.env.RESET_TOKEN_SECRET);
    const user = await Users.findOne({ where: { id: decoded.id } });

    if (!user) return res.status(404).json({ msg: "User tidak ditemukan" });

    const salt = await bcrypt.genSalt();
    const hashPassword = await bcrypt.hash(password, salt);

    await Users.update({ password: hashPassword }, { where: { id: user.id } });

    res.json({ msg: "Password berhasil diubah, silakan login" });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(403).json({ msg: "Token tidak valid atau kadaluarsa" });
  }
};
