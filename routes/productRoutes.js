const express = require('express');
const Product = require('../models/Product');
const router = express.Router();

// Add a product (Admin Panel)
router.post('/add', async (req, res) => {
  const { name, price, imageUrl } = req.body;
  try {
    const newProduct = new Product({ name, price, imageUrl });
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get all products (For frontend shop page)
router.get('/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
