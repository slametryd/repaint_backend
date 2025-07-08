import express from "express";
import db from "./config/Database.js";
import router from "./routes/index.js";
import dotEnv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import productRoutes from "./controllers/product_rout.js";
import bookingRoutes, {
  updateBookingStatus,
} from "./controllers/booking_routes.js";
import motorOptions from "./controllers/motorOptions.js";
import paymentRoutes from "./controllers/payment.js";
import emailRoutes from "./controllers/nodemailer.js";

// import midtransWebhookRoutes from "./controllers/midtransWebhook.js";

dotEnv.config();
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    credentials: true,
    origin: [`http://localhost:5173`, "https://repaint-frontend.vercel.app"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(cookieParser());

app.use("/api/auth", router);
app.use("/api", productRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/api", bookingRoutes);
app.use("/api", motorOptions);
app.use("/api", paymentRoutes);
app.use("/api", emailRoutes);
app.put("/api/booking-status/:orderId", updateBookingStatus);

// app.use("/api", midtransWebhookRoutes);

try {
  await db.authenticate();
  await db.sync();
  console.log(`Database connected...`);
} catch (error) {
  console.log("Database connection failed:", error);
}

app.listen(5000, () => console.log(`Server running at port 5000`));
