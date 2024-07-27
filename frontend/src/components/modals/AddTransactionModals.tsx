import React, { useState, useEffect, FC } from 'react';
import axios from 'axios';
import './AddTransactionModals.css'; // Add your custom styles here

interface Debt {
  _id: string;
  title: string;
  amount: number;
  type: 'Credit Card' | 'Loan';
  notes: string;
}

interface Transaction {
  _id: string;
  type: string;
  title: string;
  amount: number;
  date: string;
  reocurrance: string;
  enddate?: string;
  creditTransId?: string;
  notes: string;
  paymentType?: string;
}

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction?: Transaction | null; // Allow null as well
}

export const AddTransactionModal: FC<AddTransactionModalProps> = ({ isOpen, onClose, transaction }) => {
  const [formData, setFormData] = useState({
    type: 'Expense',
    title: '',
    amount: '',
    date: '',
    reocurrance: 'one-time',
    enddate: '',
    creditTransId: '',
    notes: '',
    paymentType: '',
  });

  const [debts, setDebts] = useState<Debt[]>([]);
  const [currentDebtAmount, setCurrentDebtAmount] = useState<number | null>(null);
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

  useEffect(() => {
    if (transaction) {
      setFormData({
        type: transaction.type,
        title: transaction.title,
        amount: transaction.amount.toString(),
        date: transaction.date,
        reocurrance: transaction.reocurrance,
        enddate: transaction.enddate || '',
        creditTransId: transaction.creditTransId || '',
        notes: transaction.notes,
        paymentType: transaction.paymentType || '',
      });
    } else {
      setFormData({
        type: 'Expense',
        title: '',
        amount: '',
        date: '',
        reocurrance: 'one-time',
        enddate: '',
        creditTransId: '',
        notes: '',
        paymentType: '',
      });
    }
  }, [transaction]);

  useEffect(() => {
    const fetchCurrentDebtAmount = async () => {
      if (formData.type === 'Credit Card Payment' && formData.creditTransId) {
        try {
          const response = await axios.get(`http://localhost:5000/api/debt/${formData.creditTransId}`);
          setCurrentDebtAmount(response.data.amount);
        } catch (error) {
          setError('Failed to fetch debt details');
          console.error('Error fetching debt details:', error);
        }
      } else {
        setCurrentDebtAmount(null);
      }
    };

    fetchCurrentDebtAmount();
  }, [formData.creditTransId, formData.type]);

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
      const transactionRequests = recurrenceDates.map(date => {
        const transactionData = {
          ...formData,
          date: date.toISOString().split('T')[0],
        };
        return transaction && transaction._id
          ? axios.put(`http://localhost:5000/api/transactions/${transaction._id}`, transactionData, {
              headers: { 'Content-Type': 'application/json' },
            })
          : axios.post('http://localhost:5000/api/transactions', transactionData, {
              headers: { 'Content-Type': 'application/json' },
            });
      });
  
      if (formData.type === 'Credit Card Payment' && formData.paymentType) {
        if (currentDebtAmount !== null) {
          let updatedAmount: number;
          const paymentAmount = Number(formData.amount);
  
          if (formData.paymentType === 'payment') {
            updatedAmount = currentDebtAmount - paymentAmount;
          } else if (formData.paymentType === 'purchase') {
            updatedAmount = currentDebtAmount + paymentAmount;
          } else {
            throw new Error('Invalid payment type');
          }
  
          const debtData = {
            amount: updatedAmount,
            notes: formData.notes || `Transaction made on ${new Date().toISOString().split('T')[0]}`,
          };
  
          const debtRequest = axios.put(`http://localhost:5000/api/debt/${formData.creditTransId}`, debtData, {
            headers: { 'Content-Type': 'application/json' },
          });
  
          await Promise.all([...transactionRequests, debtRequest]);
        } else {
          throw new Error('Current debt amount is not available');
        }
      } else {
        await Promise.all(transactionRequests);
      }
  
      console.log('Transaction successfully processed');
      onClose();
    } catch (error) {
      console.error('Error processing transaction:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>
          &times;
        </button>
        <h2>{transaction ? 'Edit Transaction' : 'Add Transaction'}</h2>
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
                  if (e.target.value !== 'Credit Card Payment') {
                    setFormData(prevFormData => ({
                      ...prevFormData,
                      paymentType: '',
                      creditTransId: '',
                    }));
                    setCurrentDebtAmount(null); // Reset debt amount when changing type
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
              <>
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
                <label>
                  Credit Transaction ID:
                  <select
                    name="creditTransId"
                    value={formData.creditTransId}
                    onChange={(e) => {
                      handleChange(e);
                      // Trigger amount fetch when Credit Transaction ID changes
                      setCurrentDebtAmount(null); // Clear amount while loading
                    }}
                  >
                    <option value="">Select Credit Transaction</option>
                    {debts.map(debt => (
                      <option key={debt._id} value={debt._id}>
                        {debt.title}
                      </option>
                    ))}
                  </select>
                </label>
                {currentDebtAmount !== null && (
                  <p>Current Amount: ${currentDebtAmount.toFixed(2)}</p>
                )}
              </>
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
                <option value="one-time">One-time</option>
                <option value="weekly">Weekly</option>
                <option value="bi-weekly">Bi-weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </label>
            {formData.reocurrance !== 'one-time' && (
              <label>
                End Date:
                <input
                  type="date"
                  name="enddate"
                  value={formData.enddate || ''}
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
            <button type="submit">{transaction ? 'Save Changes' : 'Add Transaction'}</button>
          </form>
        )}
      </div>
    </div>
  );
};
