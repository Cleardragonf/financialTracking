import React, { useState, useMemo, useCallback, FC, useEffect } from "react";
import { AgGridReact } from 'ag-grid-react';
import { ColDef, ICellRendererParams } from 'ag-grid-community';
import axios from 'axios';
import { Debt } from "../../App";
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { AddDebtButton } from "../Buttons/AddDebtButton";
import { AddDebtModals } from '../modals/AddDebtModals'; // Assuming you have a modal component for adding/editing debts
import Icon from '../Icon';

interface RecordsOfDebtPageProps {
  debts: Debt[];
}

const formatAmount = (amount: number) => {
  return amount.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD'
  });
};

const TransactionCellRendering: FC<ICellRendererParams> = ({ data }) => {
  return (
    <div>
      <a href={`/ROD/${data._id}`} target="_self"> 
        {data.title}
      </a>
    </div>
  );
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

export const RecordsOfDebtPage= () => {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [editDebt, setEditDebt] = useState<Debt | null>(null);

  const fetchDebts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/debt');
      setDebts(response.data);
    } catch (error) {
      console.error('Error fetching debts:', error);
    }
  };

  useEffect(() => {
    fetchDebts();
  }, []);


  const handleModalClose = () => {
    setModalOpen(false);
    setEditDebt(null); // Clear the debt being edited
    fetchDebts(); // Refresh the debts list
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`http://localhost:5000/api/debt/${id}`);
      fetchDebts();
    } catch (error) {
      console.error('Error deleting debt:', error);
    }
  };

  const handleEdit = (debt: Debt) => {
    setEditDebt(debt); // Set the debt data for editing
    setModalOpen(true); // Open the modal
  };

  const ActionsCellRenderer: FC<ICellRendererParams> = ({ data }) => {
    return (
      <div style={{ display: '-webkit-inline-flex', gap: "5px" }}>
        <button onClick={() => handleEdit(data)}>
          <Icon type="edit" />
        </button>
        <button onClick={() => handleDelete(data._id)}>
          <Icon type="trash-can" />
        </button>
      </div>
    );
  };

  const columnDefs: ColDef<Debt>[] = useMemo(() => [
    {
      headerName: 'Transaction Name',
      field: 'title',
      flex: 1,
      cellRenderer: TransactionCellRendering
    },
    {
      headerName: "Amount",
      field: "amount",
      cellRenderer: (params: ICellRendererParams) => <AmountCellRenderer value={params.value} />,
      flex: 1
    },
    { headerName: "Description", field: "notes", flex: 1 },
    { headerName: "Type of Transaction", field: "type", flex: 1 },
    {
      headerName: "Actions",
      field: "actions",
      cellRenderer: ActionsCellRenderer,
      flex: 1
    }
  ], []);

  const onGridReady = useCallback((params: any) => {
    params.api.sizeColumnsToFit();
  }, []);

  return (
    <div>
      <button onClick={() => setModalOpen(true)}>Add Debt</button>
      <AddDebtModals 
        isOpen={isModalOpen} 
        onClose={handleModalClose} 
        debt={editDebt} 
      />
      <h2>Record Of Debts:</h2>
      <div className="ag-theme-alpine" style={{ height: '80vh', width: '100%' }}>
        <AgGridReact
          columnDefs={columnDefs}
          rowData={debts}
          onGridReady={onGridReady}
        />
      </div>
    </div>
  );
};