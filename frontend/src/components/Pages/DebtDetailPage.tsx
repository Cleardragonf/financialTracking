import React, { FC, useMemo, useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, ICellRendererParams } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { Debt, Transaction } from '../../App'; // Ensure Transaction is imported correctly
import axios from 'axios';

interface DebtDetailPageProps {
  // Define any props if needed
}

const formatAmount = (amount: number) => {
  return amount.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD'
  });
};

const AmountCellRenderer: FC<{ value: number }> = ({ value }) => {
  let color = 'black'; // Default color
  if (value > 0) {
    color = 'red'; // Positive numbers
  } else if (value < 0) {
    color = 'black'; // Negative numbers
  }
  
  return <span style={{ color }}>{formatAmount(value)}</span>;
};

export const DebtDetailPage: FC<DebtDetailPageProps> = () => {
  const { DebtId } = useParams<{ DebtId: string }>();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [debt, setDebt] = useState<Debt>();
  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/transactions-by-creditTransId?creditTransId=${DebtId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch transactions');
        }
        const data: Transaction[] = await response.json();
        setTransactions(data);
      } catch (error) {
        console.error('Error fetching transactions:', error);
        // Handle error state or retry logic here
      }
    };
    const fetchDebt = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/debt/${DebtId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch debt details');
        }
        const data: Debt = await response.json();
        setDebt(data);
      } catch (error) {
        console.error('Error fetching debt details:', error);
      }
    };
    
    fetchDebt();
    fetchTransactions();
  }, [DebtId]);

  const columnDefs: ColDef<Transaction>[] = useMemo(() => [
    {
      headerName: 'Transaction Name',
      field: 'title',
      flex: 1
    },
    {
      headerName: "Amount",
      field: "amount",
      cellRenderer: (params: ICellRendererParams) => <AmountCellRenderer value={params.value} />,
      flex: 1
    },
    { headerName: "Description", field: "notes", flex: 1 },
    { headerName: "Date", field: "date", flex: 1 },
    { headerName: "Reoccurrence", field: "reocurrance", flex: 1 },
    { headerName: "Type of Transaction", field: "type", flex: 1 }
  ], []);

  const onGridReady = useCallback((params: any) => {
    params.api.sizeColumnsToFit();
  }, []);

  return (
    <div>
      <button onClick={() => navigate(-1)} style={{ marginBottom: '20px' }}>
        &larr; Back
      </button>
      <h1>Debt Details for {debt?.title}</h1>
      <h3>Balance: {debt?.amount}</h3>
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
