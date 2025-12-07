"use client";

import { Paper, Table, TableHead, TableRow, TableCell, TableBody, Typography } from "@mui/material";
import StatusChip from "./StatusChip";

export default function ResultsTable({ results }: any) {
  if (!results || results.length === 0)
    return <Typography>No results yet</Typography>;

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6">Validation Results</Typography>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Attribute</TableCell>
            <TableCell>Provided</TableCell>
            <TableCell>Expected</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Comment</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {results.map((r: any, i: number) => (
            <TableRow key={i}>
              <TableCell>{r.field}</TableCell>
              <TableCell>{String(r.provided)}</TableCell>
              <TableCell>{String(r.expected)}</TableCell>
              <TableCell><StatusChip status={r.status} /></TableCell>
              <TableCell>{r.comment}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
}
