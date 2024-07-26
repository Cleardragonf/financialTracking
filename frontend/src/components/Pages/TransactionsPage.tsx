import React, { FC, useMemo, useCallback } from "react";
import { AgGridReact } from 'ag-grid-react';
import { ColDef } from 'ag-grid-community';
import { Transaction } from "../../App";
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { AddTransactionButton } from "../Buttons/AddTransactionButton";

interface TransactionPageProps {
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

export const TransactionsPage: FC<TransactionPageProps> = ({ transactions }) => {
  const columnDefs: ColDef<Transaction>[] = useMemo(() => [
    { headerName: 'Transaction Name', field: 'title', flex: 1 },
    {
      headerName: "Amount",
      field: "amount",
      cellRenderer: (params: any) => <AmountCellRenderer value={params.value} type={params.data.type} />,
      flex: 1
    },
    { headerName: "Description", field: "notes", flex: 1 },
    { headerName: "Date", field: "date", flex: 1 },
    { headerName: "Type of Transaction", field: "type", flex: 1 },
    { headerName: "Reoccurrence", field: "reocurrance", flex: 1 },
    { headerName: "End Date", field: "enddate", flex: 1 },
    { headerName: "Credit Transaction Id", field: "creditTransId", flex: 1 } // Fixed field name
  ], []);

  const onGridReady = useCallback((params: any) => {
    params.api.sizeColumnsToFit();
  }, []);

  return (
    <div>
      <AddTransactionButton />
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
