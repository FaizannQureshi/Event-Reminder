// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cron = require('node-cron');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/event-reminder', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log('MongoDB connection error:', err));

// Define Reminder Schema
const reminderSchema = new mongoose.Schema({
  eventName: {
    type: String,
    required: true,
  },
  eventDate: {
    type: Date,
    required: true,
  },
  customerEmail: {
    type: String,
    required: true,
  },
  eventType: {
    type: String,
    required: true,
  },
  otherEventType: {
    type: String,
    default: null,
  },
  isReminderSent: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create model
const Reminder = mongoose.model('Reminder', reminderSchema);

// Routes
app.post('/api/reminders', async (req, res) => {
  try {
    const { reminders } = req.body;
    
    if (!reminders || !Array.isArray(reminders) || reminders.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid reminder data' });
    }
    
    // Validate each reminder
    for (const reminder of reminders) {
      if (!reminder.eventName || !reminder.eventDate || !reminder.customerEmail || !reminder.eventType) {
        return res.status(400).json({ success: false, message: 'All required fields must be provided' });
      }
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(reminder.customerEmail)) {
        return res.status(400).json({ success: false, message: 'Invalid email format' });
      }
      
      // Validate event type
      if (reminder.eventType === 'Other' && !reminder.otherEventType) {
        return res.status(400).json({ success: false, message: 'Please specify the other event type' });
      }
    }
    
    // Save reminders to database
    const savedReminders = await Reminder.insertMany(reminders);
    
    return res.status(201).json({ 
      success: true, 
      message: 'Reminders created successfully', 
      data: savedReminders 
    });
  } catch (error) {
    console.error('Error creating reminders:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Email configuration (using environment variables in production)
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-password',
  },
});

// Email sending function
const sendReminderEmail = async (reminder) => {
  try {
    const eventTypeName = reminder.eventType === 'Other' ? reminder.otherEventType : reminder.eventType;
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'your-email@gmail.com',
      to: reminder.customerEmail,
      subject: `Reminder: ${reminder.eventName} is Today!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #4f46e5;">Event Reminder</h2>
          <p>Hello!</p>
          <p>This is a friendly reminder that your event <strong>"${reminder.eventName}"</strong> is today!</p>
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <p><strong>Event Details:</strong></p>
            <ul style="list-style-type: none; padding-left: 0;">
              <li><strong>Event:</strong> ${reminder.eventName}</li>
              <li><strong>Type:</strong> ${eventTypeName}</li>
              <li><strong>Date:</strong> ${new Date(reminder.eventDate).toLocaleDateString()}</li>
            </ul>
          </div>
          <p>We hope you have a wonderful day!</p>
          <p>Best regards,<br>Event Reminder System</p>
        </div>
      `,
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    
    // Update reminder status
    await Reminder.findByIdAndUpdate(reminder._id, { isReminderSent: true });
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

// Schedule daily check for reminders (runs at 7:00 AM every day)
cron.schedule('0 7 * * *', async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Find all reminders for today that haven't been sent yet
    const todayReminders = await Reminder.find({
      eventDate: { $gte: today, $lt: tomorrow },
      isReminderSent: false,
    });
    
    console.log(`Found ${todayReminders.length} reminders to send for today.`);
    
    // Send email for each reminder
    for (const reminder of todayReminders) {
      await sendReminderEmail(reminder);
    }
  } catch (error) {
    console.error('Error in scheduled reminder check:', error);
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});