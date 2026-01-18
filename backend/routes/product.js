const express = require("express");
const router = express.Router();
const Product = require("../models/Product");

// ✅ Add new product
router.post("/", async (req, res) => {
  try {
    const { name, price, image, category } = req.body;

    if (!name || !price || !image || !category) {
      return res.status(400).json({ msg: "All fields required" });
    }

    // Save product in MongoDB
    const product = new Product({ name, price, image, category });
    await product.save();

    res.status(201).json({ msg: "Product added successfully", product });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// ✅ Get all products
router.get("/", async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res
      .status(500)
      .json({ msg: "Error fetching products", error: err.message });
  }
});

// ✅ Update product
router.put("/:id", async (req, res) => {
  try {
    const { name, price, category } = req.body;

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { name, price, category },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ msg: "Product not found" });
    }

    res.json({ msg: "Product updated successfully", product: updatedProduct });
  } catch (err) {
    res.status(500).json({ msg: "Error updating product", error: err.message });
  }
});

// ✅ Delete product
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ msg: "Product not found" });

    res.json({ msg: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Error deleting product", error: err.message });
  }
});

module.exports = router;
