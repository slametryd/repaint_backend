import JWT from "jsonwebtoken";
import Users from "../models/UserModels.js";
import admin from "firebase-admin"; // pastikan sudah setup Firebase Admin SDK

// Login dengan Google: verify token, create user, buat access+refresh token
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
      });
    }
    console.log("Access Token Secret:", process.env.ACCESS_TOKEN_SECRET);

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
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 hari
    });
    console.log("Access Token:", accessToken);
    res.status(200).json({
      msg: "Login Google berhasil",
      accessToken,
      // <- ini harus ada
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error("Google login gagal:", error);
    res.status(500).json({ msg: "Gagal login dengan Google" });
  }
};

// Middleware verifikasi access token untuk proteksi route
export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ msg: "Token tidak ditemukan atau format salah" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = JWT.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ msg: "Token tidak valid atau kadaluarsa" });
  }
};
