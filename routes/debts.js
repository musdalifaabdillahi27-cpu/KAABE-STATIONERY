const express = require('express');
const Debt = require('../models/Debt');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

router.get('/', async (req, res) => {
  const debts = await Debt.find().sort({ issueDate: -1 });
  const totalAmount = debts.reduce((sum, debt) => sum + debt.totalAmount, 0);
  const totalPaid = debts.reduce((sum, debt) => sum + debt.amountPaid, 0);
  const outstanding = Math.max(0, totalAmount - totalPaid);
  const unpaidCount = debts.filter((debt) => debt.status !== 'Paid').length;
  const debtorCount = new Set(
    debts.map((debt) => (debt.phone ? debt.phone.trim() : debt.customerName?.trim() || debt._id))
  ).size;

  res.json({
    debts,
    summary: {
      debtCount: debts.length,
      debtorCount,
      totalAmount,
      totalPaid,
      outstanding,
      unpaidCount,
    },
  });
});

router.post('/', requireRole('admin', 'staff'), async (req, res) => {
  const { customerName, phone, issueDate, totalAmount, amountPaid, status, notes } = req.body;
  if (!customerName || !phone || !issueDate || totalAmount === undefined) {
    return res.status(400).json({ error: 'Missing required debt fields' });
  }

  const debt = new Debt({
    customerName,
    phone,
    issueDate: new Date(issueDate),
    totalAmount: Number(totalAmount),
    amountPaid: Number(amountPaid || 0),
    status: status || 'Unpaid',
    notes: notes || '',
    createdBy: req.user.id,
  });

  await debt.save();
  res.status(201).json(debt);
});

router.put('/:id', requireRole('staff', 'admin'), async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  if (updates.issueDate) {
    updates.issueDate = new Date(updates.issueDate);
  }

  const debt = await Debt.findByIdAndUpdate(id, updates, { new: true });
  if (!debt) {
    return res.status(404).json({ error: 'Debt record not found' });
  }

  res.json(debt);
});

router.delete('/:id', requireRole('staff', 'admin'), async (req, res) => {
  const { id } = req.params;
  const debt = await Debt.findByIdAndDelete(id);
  if (!debt) {
    return res.status(404).json({ error: 'Debt record not found' });
  }

  res.json({ success: true });
});

module.exports = router;
