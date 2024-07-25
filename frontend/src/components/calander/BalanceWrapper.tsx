import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Transaction } from '../../App';

interface BalanceWrapperProps {
  date: Date;
}

export const BalanceWrapper: React.FC<BalanceWrapperProps> = ({ date }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      const year = date.getFullYear();
      const month = date.getMonth() + 1; // months are zero-based

      try {
        const response = await axios.get<Transaction[]>(`http://localhost:5000/api/transactions-by-month?year=${year}&month=${month}`);
        setTransactions(response.data);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      }
    };

    fetchTransactions();
  }, [date]);

  return (
    <div>
      {/* Render transactions or any other relevant data */}
      {transactions.map(transaction => (
        <div key={transaction._id}>
          {transaction.title} - ${transaction.amount}
        </div>
      ))}
    </div>
  );
};
