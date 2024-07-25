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
        const response = await axios.get<Transaction[]>(`http://localhost:5000/api/transactions-by-month?year=${year}&month=${month}`);
        setTransactions(response.data);

        // Calculate the balances
        const startBalance = await fetchStartingBalance(year, month);
        const endBalance = calculateEndingBalance(startBalance, response.data);
        setStartingBalance(startBalance);
        setEndingBalance(endBalance);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      }
    };

    fetchTransactions();
  }, [date]);

  const fetchStartingBalance = async (year: number, month: number): Promise<number> => {
    // Implement this function to fetch the starting balance from an API or other source
    // For simplicity, we'll assume a starting balance of 1000
    return 0;
  };

  const calculateEndingBalance = (startBalance: number, transactions: Transaction[]): number => {
    return transactions.reduce((balance, transaction) => {
      return balance + (transaction.type === 'Expense' ? -transaction.amount : transaction.amount);
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
