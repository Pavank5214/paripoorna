// routes/paymentRoutes.js
const express = require("express");
const router = express.Router();
const Payment = require("../models/payment"); // adjust path if needed

router.get("/totalActual", async (req, res) => {
  try {
    // Aggregate total amount paid
    const result = await Payment.aggregate([
      {
        $group: {
          _id: null,
          totalPaid: { $sum: "$amount" } // sum of all payment amounts
        }
      }
    ]);

    const totalPaid = result[0]?.totalPaid || 0;

    res.json({ totalPaid });
  } catch (error) {
    console.error("Error calculating total actual payments:", error);
    res.status(500).json({ error: "Failed to calculate total actual payments" });
  }
});


// ✅ Create a new payment
router.post("/:projectId", async (req, res) => {
  try {
    const {projectId} = req.params;
    const payment = new Payment({...req.body,projectId});
    await payment.save();
    res.status(201).json(payment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ✅ Get all payments
router.get("/:projectId", async (req, res) => {
  try {
    const payments = await Payment.find({projectId:req.params.projectId}).populate("projectId");
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/actual/:projectId", async (req, res) => {
  try {
    const payments = await Payment.find({ projectId: req.params.projectId });
    
    const totalBudget = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    
    res.json({ totalBudget });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ✅ Get single payment by ID
// router.get("/:id", async (req, res) => {
//   try {
//     const payment = await Payment.findById(req.params.id);
//     if (!payment) return res.status(404).json({ message: "Payment not found" });
//     res.json(payment);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// ✅ Update payment
router.put("/:id", async (req, res) => {
  try {
    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!payment) return res.status(404).json({ message: "Payment not found" });
    res.json(payment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ✅ Delete payment
router.delete("/:id", async (req, res) => {
  try {
    const payment = await Payment.findByIdAndDelete(req.params.id);
    if (!payment) return res.status(404).json({ message: "Payment not found" });
    res.json({ message: "Payment deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
