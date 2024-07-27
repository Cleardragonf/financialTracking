import React, { useState, useEffect, FC, useMemo, useCallback } from 'react';
import axios from 'axios';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, ICellRendererParams } from 'ag-grid-community';
import { AddTransactionModal } from '../modals/AddTransactionModals';
import { Transaction } from '../../App';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import Icon from '../Icon';

const formatAmount = (amount: number, type: string) => {
  const formattedAmount = type === 'Payday' ? amount : -amount;
  return formattedAmount.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD'
  });
};

export const TransactionsPage = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isModalOpen, setModalOpen] = useState(false);

  const fetchTransactions = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/transactions');
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleModalClose = () => {
    setModalOpen(false);
    fetchTransactions();
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`http://localhost:5000/api/transactions/${id}`);
      fetchTransactions();
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  const handleEdit = async (id: string) => {
    console.log('Edit transaction with ID:', id);
  };

  const ActionsCellRenderer: FC<ICellRendererParams> = ({ data }) => {
    return (
      <div style={{display: '-webkit-inline-flex', gap: "5px"}}>
        <button onClick={() => handleEdit(data._id)}>
          <Icon type="edit" />
        </button>
        <button onClick={() => handleDelete(data._id)}>
          <Icon type="trash-can" />
        </button>
      </div>
    );
  };

  const AmountCellRenderer: FC<{ value: number, type: string }> = ({ value, type }) => {
    const style = {
      color: type === 'Payday' ? 'green' : 'red'
    };
    return <span style={style}>{formatAmount(value, type)}</span>;
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
    { headerName: "Credit Transaction Id", field: "creditTransId" },
    {
      headerName: "Actions",
      field: "actions",
      cellRenderer: ActionsCellRenderer
    }
  ], []);

  const onGridReady = useCallback((params: any) => {
    params.api.sizeColumnsToFit();
  }, []);

  const onGridSizeChanged = useCallback((params: any) => {
    params.api.sizeColumnsToFit();
  }, []);

  return (
    <div>
      <button onClick={() => setModalOpen(true)}>Add Transaction</button>
      <AddTransactionModal isOpen={isModalOpen} onClose={handleModalClose} />
      <h2>Transactions:</h2>
      <div className="ag-theme-alpine" style={{ height: '80vh', width: '100%' }}>
        <AgGridReact
          columnDefs={columnDefs}
          rowData={transactions}
          onGridReady={onGridReady}
          onGridSizeChanged={onGridSizeChanged}
        />
      </div>
    </div>
  );
};
