import React, { FC, useMemo } from "react";
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

  return (
    <div>
      <AddTransactionButton />
      <h2>Transactions:</h2>
      <div className="ag-theme-alpine" style={{ height: 400, width: '100%' }}>
        <AgGridReact
          columnDefs={columnDefs}
          rowData={transactions}
        />
      </div>
    </div>
  );
};
