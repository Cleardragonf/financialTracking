import React, { useState } from 'react';
import axios from 'axios';
import './AddDebtModals.css'; // Add your custom styles here

interface AddDebtModalsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddDebtModals: React.FC<AddDebtModalsProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    type: 'Expense',
    title: '',
    amount: '',
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

    try {
      const debtData = {
        ...formData,
      };
        return axios.post('http://localhost:5000/api/debt', debtData, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }catch (error) {
      console.error('Error adding transaction:', error);
    }
    
    console.log('Transactions added successfully');
    onClose(); // Close the modal after submission
  };
  

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>
          &times;
        </button>
        <h2>Add Debt</h2>
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
              <option value="Credit Card Payment">Credit Card</option>
              <option value="Placeholder">Loan</option>
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
            Notes:
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
            />
          </label>
          <button type="submit">Add Debt</button>
        </form>
      </div>
    </div>
  );
};
