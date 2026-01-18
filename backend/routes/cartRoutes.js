const express = require("express");
const router = express.Router();
const Cart = require("../models/Cart");
const Product = require("../models/Product");

// 🛒 Add to cart
router.post("/add", async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      // Create new cart
      cart = new Cart({
        userId,
        items: [{ productId, quantity }],
        totalAmount: product.price * quantity,
      });
    } else {
      // Check if product exists in cart
      const existingItem = cart.items.find(
        (item) => item.productId.toString() === productId
      );

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.items.push({ productId, quantity });
      }

      // Recalculate total
      const productDetails = await Product.find({
        _id: { $in: cart.items.map((i) => i.productId) },
      });

      cart.totalAmount = cart.items.reduce((sum, item) => {
        const p = productDetails.find(
          (pd) => pd._id.toString() === item.productId.toString()
        );
        return sum + (p ? p.price * item.quantity : 0);
      }, 0);
    }

    await cart.save();
    res.status(200).json({ message: "Item added to cart successfully", cart });
  } catch (error) {
    res.status(500).json({ message: "Error adding to cart", error });
  }
});

// 📦 Get user cart
router.get("/:userId", async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.params.userId }).populate(
      "items.productId",
      "name price"
    );

    if (!cart) return res.status(404).json({ message: "Cart is empty" });

    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: "Error fetching cart", error });
  }
});

// 🗑️ Remove a product from cart
router.delete("/remove", async (req, res) => {
  try {
    const { userId, productId } = req.body;

    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.filter(
      (item) => item.productId.toString() !== productId
    );

    // Recalculate total
    const productDetails = await Product.find({
      _id: { $in: cart.items.map((i) => i.productId) },
    });

    cart.totalAmount = cart.items.reduce((sum, item) => {
      const p = productDetails.find(
        (pd) => pd._id.toString() === item.productId.toString()
      );
      return sum + (p ? p.price * item.quantity : 0);
    }, 0);

    await cart.save();
    res.json({ message: "Item removed successfully", cart });
  } catch (error) {
    res.status(500).json({ message: "Error removing item", error });
  }
});

// 🧹 Clear entire cart
router.delete("/clear/:userId", async (req, res) => {
  try {
    await Cart.findOneAndDelete({ userId: req.params.userId });
    res.json({ message: "Cart cleared successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error clearing cart", error });
  }
});

module.exports = router;
