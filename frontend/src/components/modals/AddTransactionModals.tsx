import React, { useState } from 'react';
import axios from 'axios';
import './AddTransactionModals.css'; // Add your custom styles here

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    type: 'Expense',
    title: '',
    amount: '',
    date: '',
    reocurrance: 'one-time',
    enddate: '',
    creditTransId: '',
    notes: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const getLastDayOfMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const adjustToLastDayOfMonth = (date: Date) => {
    const lastDay = getLastDayOfMonth(date.getFullYear(), date.getMonth());
    console.log(date.getMonth())
    const adjustedDate = new Date(date);
    adjustedDate.setDate(Math.min(date.getDate(), lastDay -1));
    return adjustedDate;
  };

  const calculateRecurringDates = (startDate: Date, recurrence: string, endDate: Date) => {
    const dates: Date[] = [];
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      let adjustedDate = adjustToLastDayOfMonth(currentDate);
      if (adjustedDate > endDate) break;

      dates.push(new Date(adjustedDate));

      switch (recurrence) {
        case 'weekly':
          currentDate.setDate(currentDate.getDate() + 7);
          break;
        case 'bi-weekly':
          currentDate.setDate(currentDate.getDate() + 14);
          break;
          case 'monthly':
            currentDate.setDate(currentDate.getDate() + getLastDayOfMonth(currentDate.getFullYear(), currentDate.getMonth() + 1));
            break;
        case 'yearly':
          // Increment year and adjust day
          currentDate.setFullYear(currentDate.getFullYear() + 1);
          currentDate.setDate(startDate.getDate());
          break;
        default:
          break;
      }
    }

    return dates;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const endOfYear = new Date(new Date().getFullYear(), 11, 31); // End of current year
    let endDate = formData.enddate ? new Date(formData.enddate) : endOfYear;

    const startDate = new Date(formData.date);
    const recurrenceDates = formData.reocurrance !== 'one-time'
      ? calculateRecurringDates(startDate, formData.reocurrance, endDate)
      : [startDate];

    try {
      const requests = recurrenceDates.map(date => {
        const transactionData = {
          ...formData,
          date: date.toISOString().split('T')[0], // Format as YYYY-MM-DD
        };
        return axios.post('http://localhost:5000/api/transactions', transactionData, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
      });

      await Promise.all(requests);

      console.log('Transactions added successfully');
      onClose(); // Close the modal after submission
    } catch (error) {
      console.error('Error adding transaction:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>
          &times;
        </button>
        <h2>Add Transaction</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Title:
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Type:
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
            >
              <option value="Expense">Expense</option>
              <option value="Payday">Payday</option>
              <option value="Credit Card Payment">Credit Card Payment</option>
              <option value="Placeholder">Placeholder</option>
            </select>
          </label>
          <label>
            Amount:
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Date:
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Recurrence:
            <select
              name="reocurrance"
              value={formData.reocurrance}
              onChange={handleChange}
            >
              <option value="one-time">one-time</option>
              <option value="weekly">weekly</option>
              <option value="bi-weekly">bi-weekly</option>
              <option value="monthly">monthly</option>
              <option value="yearly">yearly</option>
            </select>
          </label>
          {formData.reocurrance !== 'one-time' && (
            <label>
              End Date:
              <input
                type="date"
                name="enddate"
                value={formData.enddate}
                onChange={handleChange}
              />
            </label>
          )}
          {formData.reocurrance === 'one-time' && (
            <label>
              End Date:
              <input
                type="date"
                name="enddate"
                value={formData.enddate}
                disabled
              />
            </label>
          )}
          <label>
            Notes:
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
            />
          </label>
          <label>
            Credit Transaction ID:
            <input
              type="number"
              name="creditTransId"
              value={formData.creditTransId}
              onChange={handleChange}
            />
          </label>
          <button type="submit">Add Transaction</button>
        </form>
      </div>
    </div>
  );
};
