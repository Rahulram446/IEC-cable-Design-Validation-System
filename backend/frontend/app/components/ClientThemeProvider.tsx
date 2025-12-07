"use client";

import React, { ReactNode } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

type Props = { children: ReactNode };

export default function ClientThemeProvider({ children }: Props) {
  const theme = createTheme({
    palette: {
      primary: { main: "#0052cc" }
    }
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
