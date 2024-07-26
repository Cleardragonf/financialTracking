import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AddTransactionModals.css'; // Add your custom styles here

interface Debt {
  _id: string;
  title: string;
  amount: number;
  type: 'Credit Card' | 'Loan';
  notes: string;
}

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
    paymentType: '', // New state for payment type
  });

  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDebts = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/debt');
        setDebts(response.data);
      } catch (error) {
        setError('Failed to fetch debts');
        console.error('Error fetching debts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDebts();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prevFormData => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const getLastDayOfMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const adjustToLastDayOfMonth = (date: Date) => {
    const lastDay = getLastDayOfMonth(date.getFullYear(), date.getMonth());
    const adjustedDate = new Date(date);
    adjustedDate.setDate(Math.min(date.getDate(), lastDay));
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
          currentDate.setFullYear(currentDate.getFullYear() + 1);
          break;
        default:
          break;
      }
    }

    return dates;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const startDate = new Date(formData.date);
    let endDate = formData.enddate ? new Date(formData.enddate) : new Date(startDate.getFullYear() + 2, startDate.getMonth(), startDate.getDate());

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
        {loading && <p>Loading debts...</p>}
        {error && <p className="error-message">{error}</p>}
        {!loading && !error && (
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
                onChange={(e) => {
                  handleChange(e);
                  // Reset paymentType if type is not "Credit Card Payment"
                  if (e.target.value !== 'Credit Card Payment') {
                    setFormData(prevFormData => ({
                      ...prevFormData,
                      paymentType: ''
                    }));
                  }
                }}
              >
                <option value="Expense">Expense</option>
                <option value="Payday">Payday</option>
                <option value="Credit Card Payment">Credit Card Payment</option>
                <option value="Placeholder">Placeholder</option>
              </select>
            </label>
            {formData.type === 'Credit Card Payment' && (
              <label>
                Payment Type:
                <select
                  name="paymentType"
                  value={formData.paymentType}
                  onChange={handleChange}
                >
                  <option value="">Select Payment Type</option>
                  <option value="payment">Make a Payment</option>
                  <option value="purchase">Purchase</option>
                </select>
              </label>
            )}
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
            <label>
              Notes:
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
              />
            </label>
            {formData.type === 'Credit Card Payment' && (
              <label>
                Credit Transaction ID:
                <select
                  name="creditTransId"
                  value={formData.creditTransId}
                  onChange={handleChange}
                >
                  <option value="">Select Credit Transaction</option>
                  {debts.map(debt => (
                    <option key={debt._id} value={debt._id}>
                      {debt.title}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <button type="submit">Add Transaction</button>
          </form>
        )}
      </div>
    </div>
  );
};
