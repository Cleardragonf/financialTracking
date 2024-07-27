const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const moment = require('moment');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
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
  creditTransId: { type: mongoose.Schema.Types.ObjectId, ref: 'Debt' } // Updated to ObjectId
});

const debtSchema = new mongoose.Schema({
  title: String,
  amount: Number,
  notes: String,
  type: String
});


const Transaction = mongoose.model('Transaction', transactionSchema);
const Debt = mongoose.model('Debt', debtSchema);

// Helper function to get date range for a month
const getDateRangeForMonth = (year, month) => {
  month = month.padStart(2, '0'); // Ensure month is two digits
  const start = moment(`${year}-${month}`, 'YYYY-MM').startOf('month').toDate();
    // Create a date object for the start of the next month
    const nextMonthStart = moment(start).add(1, 'month').startOf('month').toDate();
  
    // Set the end date to one day before the start of the next month
    const end = moment(nextMonthStart).subtract(2, 'day').endOf('day').toDate();
  return { start, end };
};
// New API route for querying transactions by creditTransId
app.get('/api/transactions-by-creditTransId', async (req, res) => {
  const { creditTransId } = req.query;

  // Validate creditTransId
  if (!creditTransId || !mongoose.Types.ObjectId.isValid(creditTransId)) {
    return res.status(400).send('Invalid creditTransId');
  }

  try {
    const transactions = await Transaction.find({ creditTransId }).exec();

    if (transactions.length === 0) {
      return res.status(404).send('No transactions found for the given creditTransId');
    }

    res.json(transactions);
  } catch (err) {
    console.error('Error fetching transactions', err);
    res.status(500).send('Server error');
  }
});


// New API route for querying transactions by month and year
app.get('/api/transactions-by-month', async (req, res) => {
  const { year, month } = req.query;

  // Validate year and month
  if (!year || !month || isNaN(year) || isNaN(month) || month < 1 || month > 12) {
    return res.status(400).send('Invalid year or month');
  }

  const { start, end } = getDateRangeForMonth(year, month);

  try {
    // Fetch all transactions
    const transactions = await Transaction.find().exec();
    const filteredTransactions = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      const transactionEndDate = transaction.enddate ? new Date(transaction.enddate) : null;

      // Check if transaction date falls within the month range
      const withinMonth = (transactionDate >= start && transactionDate <= end) ||
                          (transactionEndDate && transactionEndDate >= start && transactionEndDate <= end) ||
                          (transactionDate <= end && (transactionEndDate ? transactionEndDate >= start : true));

      return withinMonth;
    });

    res.json(filteredTransactions);
  } catch (err) {
    console.error('Error fetching transactions', err);
    res.status(500).send('Server error');
  }
});app.get('/api/transactions-by-month', async (req, res) => {
  const { year, month } = req.query;

  // Validate year and month
  if (!year || !month || isNaN(year) || isNaN(month) || month < 1 || month > 12) {
    return res.status(400).send('Invalid year or month');
  }

  // Define start and end of the month
  const start = moment(`${year}-${month}`, 'YYYY-MM').startOf('month').toDate();
  const end = moment(start).endOf('month').toDate();

  try {
    // Fetch transactions that are within the month or span across the month
    console.log('Query Start Date:', start.toISOString());
    console.log('Query End Date:', end.toISOString());
    
    const transactions = await Transaction.find({
      $or: [
        {
          date: { $gte: start.toISOString(), $lte: end.toISOString() }
        },
        {
          enddate: { $gte: start.toISOString(), $lte: end.toISOString() }
        },
        {
          $and: [
            { date: { $lte: end.toISOString() } },
            { enddate: { $gte: start.toISOString() } }
          ]
        }
      ]
    }).exec();
    
    console.log('Found Transactions:', transactions);
    
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
  try {
    const { creditTransId, ...otherData } = req.body;

    if (creditTransId && !mongoose.Types.ObjectId.isValid(creditTransId)) {
      return res.status(400).json({ error: 'Invalid creditTransId' });
    }

    const transactionData = {
      ...otherData,
      ...(creditTransId ? { creditTransId } : {})
    };

    const transaction = new Transaction(transactionData);
    await transaction.save();

    res.status(201).json(transaction);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});


app.put('/api/transactions/:id', async (req, res) => {
  const { id } = req.params;
  const { type, date, reocurrance, enddate, creditTransId, notes, title, amount } = req.body;
  try {
    const updatedTransaction = await Transaction.findByIdAndUpdate(
      id,
      { type, date, reocurrance, enddate, creditTransId, notes, amount, title },
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
    const deletedTransaction = await Transaction.findByIdAndDelete(id); // Updated method
    if (!deletedTransaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    res.json({ message: 'Transaction deleted successfully', transaction: deletedTransaction });
  } catch (err) {
    console.error('MongoDB error', err);
    res.status(500).send('Server error');
  }
});



//DEBT Portion

app.get('/api/debt/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const debt = await Debt.findById(id);
    if (!debt) {
      return res.status(404).json({ message: 'Debt not found' });
    }
    res.json(debt);
  } catch (err) {
    console.error('MongoDB error', err);
    res.status(500).send('Server error');
  }
});

app.get('/api/debt', async (req, res) => {
  try {
    const debt = await Debt.find();
    res.json(debt);
  } catch (err) {
    console.error('MongoDB error', err);
    res.status(500).send('Server error');
  }
});

app.post('/api/debt', async (req, res) => {
  const { type, notes, title, amount } = req.body;
  try {
    const newDebt = new Debt({ type, notes, title, amount });
    await newDebt.save();
    res.json({ message: 'Transaction added successfully' });
  } catch (err) {
    console.error('MongoDB error', err);
    res.status(500).send('Server error');
  }
});

// Update debt by ID
app.put('/api/debt/:id', async (req, res) => {
  const { id } = req.params;
  const { amount, notes } = req.body; // Update the fields as needed

  try {
    const updatedDebt = await Debt.findByIdAndUpdate(
      id,
      { amount, notes },
      { new: true }
    );

    if (!updatedDebt) {
      return res.status(404).json({ message: 'Debt not found' });
    }

    res.json({ message: 'Debt updated successfully', debt: updatedDebt });
  } catch (err) {
    console.error('MongoDB error', err);
    res.status(500).send('Server error');
  }
});


// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
