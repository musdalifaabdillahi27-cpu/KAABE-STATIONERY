const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Product = require('./models/Product');
const Debt = require('./models/Debt');

dotenv.config();
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/kaabe-statio';

async function run() {
  await mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  console.log('Connected to MongoDB for seed.');

  const users = [
    { username: 'admin', password: 'admin123', role: 'admin', fullName: 'System Admin' },
    { username: 'staff', password: 'staff123', role: 'staff', fullName: 'Staff Member' },
    { username: 'customer1', password: 'cust123', role: 'customer', fullName: 'Customer User' },
  ];

  await User.deleteMany({});
  for (const userData of users) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    await User.create({ ...userData, password: hashedPassword });
    console.log(`Created user ${userData.username}`);
  }

  const products = [
    {
      name: 'Executive Fountain Pen',
      price: 45,
      quantity: 120,
      category: 'Writing Instruments',
      description: 'Premium metal body for smooth writing and professional notes.',
      imageUrl: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=800&q=80'
    },
    {
      name: 'A5 Dot Grid Journal',
      price: 18.5,
      quantity: 84,
      category: 'Paper & Notebooks',
      description: '120gsm pages for smooth pen performance and clean layouts.',
      imageUrl: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&w=800&q=80'
    },
    {
      name: 'Desk Organizer Kit',
      price: 24.99,
      quantity: 42,
      category: 'Desk Accessories',
      description: 'Modular organizer kit to keep your desk tidy and productive.',
      imageUrl: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80'
    },
    {
      name: 'Premium Pastel Highlighters',
      price: 8.99,
      quantity: 150,
      category: 'Writing Instruments',
      description: 'Set of 6 aesthetic pastel colored chisel-tip highlighters.',
      imageUrl: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=800&q=80'
    },
    {
      name: 'Sticky Notes Palette',
      price: 6.50,
      quantity: 200,
      category: 'Paper & Notebooks',
      description: 'Pack of 8 color-coordinated sticky note pads for planning.',
      imageUrl: 'https://images.unsplash.com/photo-1600132806370-bf17e65e942f?auto=format&fit=crop&w=800&q=80'
    },
    {
      name: 'Vintage Brass Paper Clips',
      price: 4.99,
      quantity: 300,
      category: 'Desk Accessories',
      description: 'Premium quality solid brass clips to keep your files organized.',
      imageUrl: 'https://images.unsplash.com/photo-1616440347437-b1c73416efc2?auto=format&fit=crop&w=800&q=80'
    },
    {
      name: 'Aesthetic Gel Pens (10-pack)',
      price: 14.50,
      quantity: 110,
      category: 'Writing Instruments',
      description: 'Ultra-fine 0.5mm black ink gel pens with comfortable soft grip.',
      imageUrl: 'https://images.unsplash.com/photo-1585336139057-3c50a4b77e2a?auto=format&fit=crop&w=800&q=80'
    },
    {
      name: 'Minimalist Leather Pencil Case',
      price: 19.99,
      quantity: 55,
      category: 'Desk Accessories',
      description: 'Genuine leather pencil pouch with smooth brass zipper.',
      imageUrl: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&w=800&q=80'
    }
  ];

  await Product.deleteMany({});
  await Product.insertMany(products);
  console.log('Seeded initial products.');

  await Debt.deleteMany({});
  const debts = [
    { customerName: 'Alex Morgan', phone: '+1 (555) 012-3456', issueDate: new Date('2024-04-15'), totalAmount: 1250, amountPaid: 450, status: 'Partial', notes: 'Payment plan approved.' },
    { customerName: 'Sarah Connor', phone: '+1 (555) 987-6543', issueDate: new Date('2024-04-20'), totalAmount: 3400, amountPaid: 0, status: 'Unpaid', notes: 'Follow up in 3 days.' },
    { customerName: 'Marcus Wright', phone: '+1 (555) 234-5678', issueDate: new Date('2024-04-03'), totalAmount: 850, amountPaid: 850, status: 'Paid', notes: 'Settled in full.' },
  ];
  await Debt.insertMany(debts);
  console.log('Seeded initial debts.');

  await mongoose.disconnect();
  console.log('Seed complete.');
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
