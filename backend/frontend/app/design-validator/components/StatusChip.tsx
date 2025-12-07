"use client";

import { Chip } from "@mui/material";

export default function StatusChip({ status }: { status: string }) {
  const colors: any = {
    PASS: "success",
    WARN: "warning",
    FAIL: "error"
  };

  return (
    <Chip
      label={status}
      color={colors[status] || "default"}
      size="small"
      sx={{ fontWeight: "bold" }}
    />
  );
}
