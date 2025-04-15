const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const contactRoutes = require('./routes/contactRoutes');
const menuRoutes = require('./routes/menu');
const orderRoutes = require('./routes/order');

const app = express();
app.use(cors({
  origin: 'https://www.mozris.com',  // ✅ Only allow your website
  methods: ['GET', 'POST'],          // or ['*'] if needed
  credentials: true
}));
app.use(express.json());

// API Routes
app.use('/api', contactRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/order', orderRoutes);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected'))
.catch((err) => console.error('❌ MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});


// ==============================================
// ✅ Cron Job for Daily Sales Summary Email at 11:30 PM
// ==============================================

const cron = require('node-cron');
const nodemailer = require('nodemailer');
const { MongoClient } = require('mongodb');

// Schedule the task for every day at 11:30 PM
cron.schedule('30 23 * * *', async () => {
  console.log('📤 Running daily sales summary task...');

  const mongoClient = new MongoClient(process.env.MONGO_URI);
  const dbName = 'mozris';

  try {
    await mongoClient.connect();
    const db = mongoClient.db(dbName);
    const orders = db.collection('orders');
    const menus = db.collection('menus');

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const startOfToday = new Date(today.setHours(0, 0, 0, 0));
    const endOfToday = new Date(today.setHours(23, 59, 59, 999));
    const deliveryDateStr = tomorrow.toISOString().split('T')[0];

    const todaysOrders = await orders.find({
      createdAt: { $gte: startOfToday, $lte: endOfToday },
      deliveryDate: deliveryDateStr,
      paymentStatus: "paid"
    }).toArray();

    const totalSales = todaysOrders.reduce((sum, order) => sum + order.totalAmount, 0);

    const tomorrowsMenus = await menus.find({ date: deliveryDateStr }).toArray();

    const groupedMenus = {};
    tomorrowsMenus.forEach(menu => {
      const meal = menu.mealType;
      if (!groupedMenus[meal]) groupedMenus[meal] = [];
      groupedMenus[meal].push(...menu.items);
    });

    const menuDetails = Object.entries(groupedMenus).map(([meal, items]) => {
      const itemList = items.map(i => i.name).join(', ');
      return `🍽️ ${meal}: ${itemList}`;
    }).join('\n');

    const formattedDate = new Date(tomorrow).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'long', year: 'numeric'
    });

    const message = `
Mozris Daily Sales Summary – Pre-Orders for ${formattedDate}

Menu for ${formattedDate}:
${menuDetails}

Total Pre-Order Sales Placed Today: ₹${totalSales}

These orders will be served on ${formattedDate}.
`;

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT),
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

const contactSubmissions = db.collection('contactsubmissions');
const allContacts = await contactSubmissions.find({}).toArray();

// Prepare Excel rows
const rows = allContacts.map(sub => ({
  Name: sub.name,
  Email: sub.email,
  Phone: sub.phone,
  Service: sub.service,
  Message: sub.message,
  SubmittedAt: new Date(sub.createdAt).toLocaleString('en-IN'),
}));

// Create or update Excel workbook
const excelFilePath = path.join(__dirname, 'mozris_contact_submissions.xlsx');
let workbook;

if (fs.existsSync(excelFilePath)) {
  workbook = XLSX.readFile(excelFilePath);
  const sheet = XLSX.utils.json_to_sheet(rows, { skipHeader: false });
  workbook.Sheets["Submissions"] = sheet;
} else {
  const sheet = XLSX.utils.json_to_sheet(rows);
  workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, "Submissions");
}

XLSX.writeFile(workbook, excelFilePath);

await transporter.sendMail({
  from: `"Mozris Hospitality" <${process.env.EMAIL_USER}>`,
  to: process.env.EMAIL_TO,
  subject: `Mozris Daily Sales Summary – Pre-Orders for ${formattedDate}`,
  text: message,
  attachments: [
    {
      filename: 'mozris_contact_submissions.xlsx',
      path: excelFilePath,
    },
  ],
});

    console.log("✅ Daily summary email sent successfully");
  } catch (error) {
    console.error("❌ Error sending summary email:", error.message);
  } finally {
    await mongoClient.close();
  }
});
