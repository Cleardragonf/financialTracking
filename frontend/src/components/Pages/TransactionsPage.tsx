import React, { useState, useEffect, FC, useMemo, useCallback } from 'react';
import axios from 'axios';
import { AgGridReact } from 'ag-grid-react';
import { ColDef } from 'ag-grid-community';
import { AddTransactionModal } from '../modals/AddTransactionModals';
import { Transaction } from '../../App';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

interface TransactionsPageProps {
  transactions: Transaction[];
}

const formatAmount = (amount: number, type: string) => {
  const formattedAmount = type === 'Payday' ? amount : -amount;
  return formattedAmount.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD'
  });
};

const AmountCellRenderer: FC<{ value: number, type: string }> = ({ value, type }) => {
  const style = {
    color: type === 'Payday' ? 'green' : 'red'
  };
  return <span style={style}>{formatAmount(value, type)}</span>;
};

export const TransactionsPage: FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isModalOpen, setModalOpen] = useState(false);

  // Fetch transactions from API
  const fetchTransactions = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/transactions');
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  // Fetch transactions when component mounts
  useEffect(() => {
    fetchTransactions();
  }, []);

  // Handle modal close event and refresh transactions
  const handleModalClose = () => {
    setModalOpen(false);
    fetchTransactions(); // Refresh transactions after closing modal
  };

  const columnDefs: ColDef<Transaction>[] = useMemo(() => [
    { headerName: 'Transaction Name', field: 'title' },
    {
      headerName: "Amount",
      field: "amount",
      cellRenderer: (params: any) => <AmountCellRenderer value={params.value} type={params.data.type} />
    },
    { headerName: "Description", field: "notes" },
    { headerName: "Date", field: "date" },
    { headerName: "Type of Transaction", field: "type" },
    { headerName: "Reoccurrence", field: "reocurrance" },
    { headerName: "End Date", field: "enddate" },
    { headerName: "Credit Transaction Id", field: "creditTransId" } // Fixed field name
  ], []);

  const onGridReady = useCallback((params: any) => {
    params.api.sizeColumnsToFit();
  }, [])

  return (
    <div>
      <button onClick={() => setModalOpen(true)}>Add Transaction</button>
      <AddTransactionModal isOpen={isModalOpen} onClose={handleModalClose} />
      <h2>Transactions:</h2>
      <div className="ag-theme-alpine" style={{ height: 400, width: '100%' }}>
        <AgGridReact
          columnDefs={columnDefs}
          rowData={transactions}
          onGridReady={onGridReady}
        />
      </div>
    </div>
  );
};
