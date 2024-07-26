import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Transaction } from '../../App';

interface BalanceWrapperProps {
  date: Date;
}

export const BalanceWrapper: React.FC<BalanceWrapperProps> = ({ date }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [startingBalance, setStartingBalance] = useState<number>(0);
  const [endingBalance, setEndingBalance] = useState<number>(0);

  useEffect(() => {
    const fetchTransactions = async () => {
      const year = date.getFullYear();
      const month = date.getMonth() + 1; // months are zero-based

      try {
        // Fetch transactions for the current month
        const response = await axios.get<Transaction[]>(`http://localhost:5000/api/transactions-by-month?year=${year}&month=${month}`);
        setTransactions(response.data);

        // Fetch transactions for all previous months up to the current month
        const previousMonthsTransactions = await fetchPreviousMonthsTransactions(year, month);

        // Calculate the balances
        const startBalance = calculateStartingBalance(previousMonthsTransactions);
        const endBalance = calculateEndingBalance(startBalance, response.data);
        setStartingBalance(startBalance);
        setEndingBalance(endBalance);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      }
    };

    fetchTransactions();
  }, [date]);

  const fetchPreviousMonthsTransactions = async (year: number, month: number): Promise<Transaction[]> => {
    const transactions: Transaction[] = [];
    for (let y = 2024; y <= year; y++) {
      const startMonth = y === 2024 ? 7 : 1;
      const endMonth = y === year ? month - 1 : 12;

      for (let m = startMonth; m <= endMonth; m++) {
        const response = await axios.get<Transaction[]>(`http://localhost:5000/api/transactions-by-month?year=${y}&month=${m}`);
        transactions.push(...response.data);
      }
    }
    return transactions;
  };

  const calculateStartingBalance = (transactions: Transaction[]): number => {
    return transactions.reduce((balance, transaction) => {
      return balance + (transaction.type === 'Expense' || transaction.type === 'Credit Card Payment' || transaction.type === 'Placeholder' ? -transaction.amount : transaction.amount);
    }, 0); // Initial starting balance can be set here if needed
  };

  const calculateEndingBalance = (startBalance: number, transactions: Transaction[]): number => {
    return transactions.reduce((balance, transaction) => {
      return balance + (transaction.type === 'Expense' || transaction.type === 'Credit Card Payment' || transaction.type === 'Placeholder' ? -transaction.amount : transaction.amount);
    }, startBalance);
  };

  return (
    <div>
      <h1>Balance</h1>
      <p>Monthly Starting Balance: ${startingBalance.toFixed(2)}</p>
      <p>Monthly Ending Balance: ${endingBalance.toFixed(2)}</p>
      {transactions.map(transaction => (
        <div key={transaction._id}>
          {transaction.title} - ${transaction.amount}
        </div>
      ))}
    </div>
  );
};
