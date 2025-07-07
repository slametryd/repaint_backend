import Users from "../models/UserModels.js";
import JWT from "jsonwebtoken";

export const refreshToken = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) return res.sendStatus(401); // Tidak ada token

    console.log("Refresh token dari cookie:", token);

    const user = await Users.findOne({
      where: { refresh_token: token },
    });

    if (!user) {
      console.log("Refresh token tidak cocok dengan user manapun");
      return res.sendStatus(403); // Token tidak valid
    }

    JWT.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        console.log("Gagal verifikasi refresh token:", err.message);
        return res.sendStatus(403);
      }

      const userId = user.id;
      const name = user.name;
      const email = user.email;

      const accessToken = JWT.sign(
        { userId, name, email },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "15s" }
      );

      res.json({ accessToken }); // Penamaan konsisten
    });
  } catch (error) {
    console.error("Terjadi error di refreshToken:", error.message);
    res.sendStatus(500);
  }
};
