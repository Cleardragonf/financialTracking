import React, { FC, useMemo, useCallback } from "react";
import { AgGridReact } from 'ag-grid-react';
import { ColDef, ICellRendererParams } from 'ag-grid-community';
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

const CreditTransIdCellRenderer: FC<ICellRendererParams> = ({ value }) => {
  return (
    <div>
      <a 
        href={`/ROD/${value}`} 
        target="_self"
        title="Click here to see all transactions related to this debt"
      >
        {value}
      </a>
    </div>
  );
};

export const TransactionsPage: FC<TransactionPageProps> = ({ transactions }) => {
  const columnDefs: ColDef<Transaction>[] = useMemo(() => [
    { headerName: 'Transaction Name', field: 'title', flex: 1 },
    {
      headerName: "Amount",
      field: "amount",
      cellRenderer: (params: ICellRendererParams) => <AmountCellRenderer value={params.value} type={params.data.type} />,
      flex: 1
    },
    { headerName: "Description", field: "notes", flex: 1 },
    { headerName: "Date", field: "date", flex: 1 },
    { headerName: "Type of Transaction", field: "type", flex: 1 },
    { headerName: "Reoccurrence", field: "reocurrance", flex: 1 },
    { headerName: "End Date", field: "enddate", flex: 1 },
    {
      headerName: "Credit Transaction Id",
      field: "creditTransId",
      flex: 1,
      cellRenderer: CreditTransIdCellRenderer
    }
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
