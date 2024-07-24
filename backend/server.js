const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors'); // Import cors
const moment = require('moment'); // Import moment

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Use cors middleware
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect('mongodb://127.0.0.1:27017/Trial', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Define a schema and model for transactions
const transactionSchema = new mongoose.Schema({
  title: String,
  amount: Number,
  date: String,
  reocurrance: String,
  enddate: String,
  notes: String,
  type: String,
  CreditTransId: Number
});

const Transaction = mongoose.model('Transaction', transactionSchema);

// Helper function to get date range for a month
const getDateRangeForMonth = (year, month) => {
  const start = moment(`${year}-${month}`, 'YYYY-MM').startOf('month').toDate();
  const end = moment(start).endOf('month').toDate();
  return {
    start,
    end
  };
};

// New API route for querying transactions by month and year
app.get('/api/transactions-by-month', async (req, res) => {
  const { year, month } = req.query;
  const { start, end } = getDateRangeForMonth(year, month);

  try {
    const transactions = await Transaction.find({
      $or: [
        // Transactions within the month
        {
          date: { $gte: start.toISOString(), $lte: end.toISOString() }
        },
        // Transactions ending within the month
        {
          enddate: { $gte: start.toISOString(), $lte: end.toISOString() }
        },
        // Transactions spanning the month
        {
          date: { $lte: end.toISOString() },
          enddate: { $gte: start.toISOString() }
        }
      ]
    });
    res.json(transactions);
  } catch (err) {
    console.error('Error fetching transactions', err);
    res.status(500).send('Server error');
  }
});

// Existing API routes
app.get('/api/transactions', async (req, res) => {
  try {
    const transactions = await Transaction.find();
    res.json(transactions);
  } catch (err) {
    console.error('MongoDB error', err);
    res.status(500).send('Server error');
  }
});

app.post('/api/transactions', async (req, res) => {
  const { type, date, reocurrance, enddate, CreditTransId, notes, title, amount } = req.body;
  try {
    const newTransaction = new Transaction({ type, date, reocurrance, enddate, CreditTransId, notes, title, amount });
    await newTransaction.save();
    res.json({ message: 'Transaction added successfully' });
  } catch (err) {
    console.error('MongoDB error', err);
    res.status(500).send('Server error');
  }
});

app.put('/api/transactions/:id', async (req, res) => {
  const { id } = req.params;
  const { type, date, reocurrance, enddate, CreditTransId, notes, title, amount } = req.body;
  try {
    const updatedTransaction = await Transaction.findByIdAndUpdate(
      id,
      { type, date, reocurrance, enddate, CreditTransId, notes, amount, title },
      { new: true }
    );
    if (!updatedTransaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    res.json({ message: 'Transaction updated successfully', transaction: updatedTransaction });
  } catch (err) {
    console.error('MongoDB error', err);
    res.status(500).send('Server error');
  }
});

app.delete('/api/transactions/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const deletedTransaction = await Transaction.findByIdAndRemove(id);
    if (!deletedTransaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    res.json({ message: 'Transaction deleted successfully', transaction: deletedTransaction });
  } catch (err) {
    console.error('MongoDB error', err);
    res.status(500).send('Server error');
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
