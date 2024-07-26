import React, { FC, useMemo, useCallback } from "react";
import { AgGridReact } from 'ag-grid-react';
import { ColDef, GridApi } from 'ag-grid-community';
import { Debt } from "../../App";
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { AddDebtButton } from "../Buttons/AddDebtButton";

interface RecordsOfDebtPageProps {
    debts: Debt[];
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

export const RecordsOfDebtPage: FC<RecordsOfDebtPageProps> = ({ debts }) => {
  const columnDefs: ColDef<Debt>[] = useMemo(() => [
    { headerName: 'Transaction Name', field: 'title', flex: 1 },
    { headerName: "Amount", field: "amount", cellRenderer: (params: any) => <AmountCellRenderer value={params.value} />, flex: 1 },
    { headerName: "Description", field: "notes", flex: 1 },
    { headerName: "Type of Transaction", field: "type", flex: 1 },
  ], []);

  const onGridReady = useCallback((params: any) => {
    params.api.sizeColumnsToFit();
  }, []);

  return (
    <div>
      <AddDebtButton />
      <h2>Record Of Debts:</h2>
      <div className="ag-theme-alpine" style={{ height: 400, width: '100%' }}>
        <AgGridReact
          columnDefs={columnDefs}
          rowData={debts}
          onGridReady={onGridReady}
        />
      </div>
    </div>
  );
};
