import React from 'react';
import moment from 'moment';
import Modal from 'react-modal';
import { Transaction } from '../../App';

interface TransactionModalProps {
  transactions: Transaction[];
  date: Date;
  onClose: () => void;
}

const TransactionModal: React.FC<TransactionModalProps> = ({ transactions, date, onClose }) => {
  return (
    <Modal
      isOpen={true}
      onRequestClose={onClose}
      style={{ 
        content: {
          top: '50%',
          left: '50%',
          right: 'auto',
          bottom: 'auto',
          transform: 'translate(-50%, -50%)',
          padding: '20px',
          zIndex: 2000, // Adjust the zIndex to a higher value
        },
        overlay: {
          zIndex: 1000, // Make sure the overlay is below the content
        }
      }}
    >
      <h2>Transactions for {moment(date).format('MMMM D, YYYY')}</h2>
      <button onClick={onClose} style={{ float: 'right' }}>Close</button>
      <ul>
        {transactions.map((transaction, index) => (
          <li key={index}>
            <div>Amount: {transaction.amount}</div>
            <div>Notes: {transaction.notes}</div>
            <div>Type: {transaction.type}</div>
            <hr />
          </li>
        ))}
      </ul>
    </Modal>
  );
};

export default TransactionModal;
