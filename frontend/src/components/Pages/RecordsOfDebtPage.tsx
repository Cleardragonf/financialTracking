import React, { FC, useMemo } from "react";
import { AgGridReact } from 'ag-grid-react';
import { ColDef } from 'ag-grid-community';
import { Debt } from "../../App";
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { AddDebtButton } from "../Buttons/AddDebtButton";

interface RecordsOfDebtPageProps {
    debts: Debt[];
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

export const RecordsOfDebtPage: FC<RecordsOfDebtPageProps> = ({ debts }) => {
  const columnDefs: ColDef<Debt>[] = useMemo(() => [
    {headerName: 'Transaction Name',
      field: 'title'
    },
    {
      headerName: "Amount",
      field: "amount",
      cellRenderer: (params: any) => <AmountCellRenderer value={params.value} type={params.data.type} />
    },
    { headerName: "Description", field: "notes" },
    { headerName: "Type of Transaction", field: "type" },
  ], []);

  return (
    <div>
      <AddDebtButton />
      <h2>Record Of Debts:</h2>
      <div className="ag-theme-alpine" style={{ height: 400, width: '100%' }}>
        <AgGridReact
          columnDefs={columnDefs}
          rowData={debts}
        />
      </div>
    </div>
  );
};
