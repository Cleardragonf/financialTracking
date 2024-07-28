import React, { useState, useEffect, FC } from 'react';
import axios from 'axios';
import './AddDebtModals.css'; // Add your custom styles here

interface Debt {
  _id: string;
  title: string;
  amount: number;
  type: 'Credit Card' | 'Loan';
  notes: string;
}

interface AddDebtModalsProps {
  isOpen: boolean;
  onClose: () => void;
  debt?: Debt | null;
}

export const AddDebtModals: FC<AddDebtModalsProps> = ({ isOpen, onClose, debt }) => {
  const [formData, setFormData] = useState({
    type: 'Credit Card',
    title: '',
    amount: '',
    notes: '',
  });

  useEffect(() => {
    if (debt) {
      setFormData({
        type: debt.type,
        title: debt.title,
        amount: debt.amount.toString(),
        notes: debt.notes,
      });
    } else {
      setFormData({
        type: 'Credit Card',
        title: '',
        amount: '',
        notes: '',
      });
    }
  }, [debt]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    console.log("", name, value);
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const debtData = {
        ...formData,
        title: formData.title,
        notes: formData.notes,
        type: formData.type,
        amount: parseFloat(formData.amount),
      };
      console.log('Submitting form data:', debtData); // Debugging: log form data before submission

      if (debt && debt._id) {
        await axios.put(`http://localhost:5000/api/debt/${debt._id}`, debtData, {
          headers: { 'Content-Type': 'application/json' },
        });
      } else {
        await axios.post('http://localhost:5000/api/debt', debtData, {
          headers: { 'Content-Type': 'application/json' },
        });
      }
      onClose();
    } catch (error) {
      console.error('Error adding/editing debt:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>
          &times;
        </button>
        <h2>{debt ? 'Edit Debt' : 'Add Debt'}</h2>
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
              <option value="Credit Card">Credit Card</option>
              <option value="Loan">Loan</option>
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
          <button type="submit">{debt ? 'Save Changes' : 'Add Debt'}</button>
        </form>
      </div>
    </div>
  );
};
