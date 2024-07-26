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
  CreditTransId: number;
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
        const debtResponse = await fetch('http://localhost:5000/api/debts');
        if (!response.ok) {
          throw new Error('Failed to fetch transactions');
        }
        if(!debtResponse.ok){
          throw new Error('failed to fetch Debts');
        }
        const data: Transaction[] = await response.json();
        const debtData: Debt[] = await response.json();
        setTransactions(data);
        setDebt(debtData);
      } catch (error) {
        console.error('Error fetching transactions:', error);
        // Handle error state or retry logic here
      }
    };

    fetchTransactions();
  }, []);

  return (
    <Router>
      <div className="App">
        <PageWrapper>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/transactions" element={<TransactionsPage transactions={transactions} />} />
            <Route path="/calander" element={<InteractiveCalendar />} />
            <Route path="/ROD" element={<RecordsOfDebtPage debts={debt}/>} />
            <Route path="/ROD/:DebtId" element={<DebtDetailPage></DebtDetailPage>} />
          </Routes>
        </PageWrapper>
      </div>
    </Router>
  );
}

export default App;
