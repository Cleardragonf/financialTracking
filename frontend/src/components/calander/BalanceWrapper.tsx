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
        const previousMonthsTransactions = await fetchPreviousMonthTransactions(year, month);

        // Calculate the balances
        const startBalance = calculateStartingBalance(previousMonthsTransactions);
        const endBalance = calculateEndingBalance(0, response.data);
        console.log("End Balance", startBalance)
        setStartingBalance(startBalance);
        setEndingBalance(endBalance);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      }
    };

    fetchTransactions();
  }, [date]);

  const fetchPreviousMonthTransactions = async (year: number, month: number): Promise<Transaction[]> => {
    // Calculate the previous month and adjust the year if necessary
    const previousMonth = month === 1 ? 12 : month - 1;
    const previousYear = month === 1 ? year - 1 : year;

    // Fetch transactions for the previous month
    const response = await axios.get<Transaction[]>(`http://localhost:5000/api/transactions-by-month?year=${previousYear}&month=${previousMonth}`);
    return response.data;
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
    </div>
  );
};
