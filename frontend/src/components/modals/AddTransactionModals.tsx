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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Set default end date if recurrence is not 'one-time' and enddate is empty
    if (formData.reocurrance !== 'one-time' && !formData.enddate) {
      const defaultEndDate = new Date();
      defaultEndDate.setFullYear(defaultEndDate.getFullYear() + 1);
      formData.enddate = defaultEndDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    }

    try {
      const response = await axios.post('http://localhost:5000/api/transactions', formData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log('Transaction added successfully', response.data);
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
              <option value="bi-monthly">bi-monthly</option>
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
