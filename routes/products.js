const express = require('express');
const Product = require('../models/Product');
const { authMiddleware, requireRole } = require('../middleware/auth');

const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

const router = express.Router();

router.use(authMiddleware);

router.get('/', async (req, res) => {
  const products = await Product.find().sort({ createdAt: -1 });
  res.json(products);
});

// Only admin can add inventory; staff sells existing stock
router.post('/', requireRole('admin'), upload.single('image'), async (req, res) => {
  const { name, price, quantity, category, description } = req.body;
  let imageUrl = req.body.imageUrl || '';
  if (req.file) {
    imageUrl = '/uploads/' + req.file.filename;
  }
  const product = new Product({ name, price, quantity, category, description, imageUrl });
  await product.save();
  res.status(201).json(product);
});

router.put('/:id', requireRole('admin'), upload.single('image'), async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  if (req.file) {
    updates.imageUrl = '/uploads/' + req.file.filename;
  }
  const product = await Product.findByIdAndUpdate(id, updates, { new: true });
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json(product);
});

router.post('/:id/sell', requireRole('admin', 'staff'), async (req, res) => {
  const { id } = req.params;
  const quantity = parseInt(req.body.quantity, 10) || 1;

  if (quantity < 1) {
    return res.status(400).json({ error: 'Quantity must be at least 1' });
  }

  const product = await Product.findById(id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  if (product.quantity < quantity) {
    return res.status(400).json({ error: 'Not enough stock available' });
  }

  product.quantity -= quantity;
  await product.save();

  const price = typeof product.price === 'number' ? product.price : parseFloat(product.price) || 0;

  res.json({
    product,
    soldQuantity: quantity,
    totalAmount: price * quantity,
  });
});

router.delete('/:id', requireRole('admin'), async (req, res) => {
  const { id } = req.params;
  const product = await Product.findByIdAndDelete(id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json({ success: true });
});

module.exports = router;
