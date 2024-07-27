import React, { useEffect, useState } from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { PageWrapper } from './components/PageWrapper/PageWrapper';
import { TransactionsPage } from './components/Pages/TransactionsPage';
import { InteractiveCalendar } from './components/calander/Calander';
import { RecordsOfDebtPage } from './components/Pages/RecordsOfDebtPage';
import { DebtDetailPage } from './components/Pages/DebtDetailPage';

// Define types for transactions
export interface Transaction {
  _id: string;
  title: string;
  amount: number;
  date: string;
  type: 'Expense' | 'Payday' | 'Credit Card Payment' | 'Placeholder';
  reocurrance: 'one-time' | 'weekly' | 'bi-weekly' | 'monthly' | 'yearly';
  enddate: string;
  notes: string;
  creditTransId: string; // Updated from number to string to match MongoDB ObjectId
}


export interface Debt {
  _id: string;
  title: string;
  amount: number;
  type: 'Credit Card' | 'Loan';
  notes: string;
}

function HomePage() {
  return (
    <div>
      <header className="App-header">
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

function App(): JSX.Element {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [debt, setDebt] = useState<Debt[]>([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/transactions');
        if (!response.ok) {
          throw new Error('Failed to fetch transactions');
        }
        const data: Transaction[] = await response.json();
        setTransactions(data);
      } catch (error) {
        console.error('Error fetching transactions:', error);
        // Handle error state or retry logic here
      }
    };

    const fetchDebt = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/debt');
        if (!response.ok) {
          throw new Error('Failed to fetch debt');
        }
        const data: Debt[] = await response.json();
        setDebt(data);
      } catch (error) {
        console.error('Error fetching debt:', error);
        // Handle error state or retry logic here
      }
    };

    fetchTransactions();
    fetchDebt();
  }, []);

  return (
    <Router>
      <div className="App">
        <PageWrapper>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route path="/calander" element={<InteractiveCalendar />} />
            <Route path="/ROD" element={<RecordsOfDebtPage debts={debt} />} />
            <Route path="/ROD/:DebtId" element={<DebtDetailPage />} />
          </Routes>
        </PageWrapper>
      </div>
    </Router>
  );
}

export default App;
