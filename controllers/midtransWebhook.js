// import express from "express";
// import Booking from "../models/booking.js";
// const router = express.Router();

// router.post("/midtrans-webhook", async (req, res) => {
//   try {
//     const notification = req.body;
//     const orderId = notification.order_id;
//     const transactionStatus = notification.transaction_status;

//     console.log("Webhook received:", JSON.stringify(notification, null, 2));

//     const [updatedRows] = await Booking.update(
//       { status_pembayaran: transactionStatus },
//       { where: { order_id: orderId } }
//     );

//     console.log(`Rows updated: ${updatedRows}`);

//     res.status(200).send("OK");
//   } catch (err) {
//     console.error("Webhook error:", err);
//     res.status(500).send("Webhook processing failed");
//   }
// });

// export default router;
