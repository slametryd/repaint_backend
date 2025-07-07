import JWT from "jsonwebtoken";

export const googleLogin = async (req, res) => {
  const { token } = req.body; // Ambil token dari body request

  if (!token) {
    return res.status(400).json({ msg: "Token is required" }); // Pastikan token ada
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);

    const { name, email, picture } = decodedToken;

    // Cari atau buat user di database kamu
    let user = await Users.findOne({ where: { email } });

    if (!user) {
      user = await Users.create({
        name,
        email,
        avatar: picture,
        password: "", // Kosongkan password karena pakai Google login
      });
    }

    // Buat accessToken dan refreshToken
    const userId = user.id;

    const accessToken = JWT.sign(
      { userId, name: user.name, email: user.email },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );

    const refreshToken = JWT.sign(
      { userId, name: user.name, email: user.email },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "1d" }
    );

    // Simpan refreshToken di database
    await Users.update(
      { refresh_token: refreshToken },
      { where: { id: userId } }
    );

    // Kirim refreshToken di cookie httpOnly
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false, // ubah ke true kalau pakai HTTPS
      maxAge: 24 * 60 * 60 * 1000, // 1 hari
    });

    // Kirim accessToken dan info user ke frontend
    res.status(200).json({
      msg: "Login Google berhasil",
      accessToken,
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
