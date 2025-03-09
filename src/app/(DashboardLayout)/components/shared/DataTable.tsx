import React from "react";
import { Card, Paper } from "@mui/material";
import { DataGrid, GridColDef, GridRowsProp } from '@mui/x-data-grid';

type Props = {
  title?: string;
  subtitle?: string;
  action?: JSX.Element | any;
  footer?: JSX.Element;
  cardheading?: string | JSX.Element;
  headtitle?: string | JSX.Element;
  headsubtitle?: string | JSX.Element;
  children?: JSX.Element;
  middlecontent?: string | JSX.Element;
  rows: GridRowsProp;
  columns: GridColDef[];
};

const DashboardCard = ({
  title,
  subtitle,
  children,
  action,
  footer,
  cardheading,
  headtitle,
  headsubtitle,
  middlecontent,
  rows,
  columns,
}: Props) => {
  const paginationModel = { pageSize: 5, page: 0 };

  return (
    <Card sx={{ padding: 0 }} elevation={9} variant={undefined}>
      <Paper sx={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={rows} // Dữ liệu hàng
          columns={columns} // Dữ liệu cột
          initialState={{ pagination: { paginationModel } }}
          pageSizeOptions={[5, 10]}
          checkboxSelection
          sx={{ border: 0 }}
        />
      </Paper>
    </Card>
  );
};

export default DashboardCard;
