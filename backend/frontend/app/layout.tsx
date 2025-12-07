import "./global.css";
import { ReactNode } from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import ClientThemeProvider from "./components/ClientThemeProvider";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ClientThemeProvider>
          <AppBar position="static" elevation={1}>
            <Toolbar>
              <Typography variant="h6">IEC Cable Design Validator</Typography>
            </Toolbar>
          </AppBar>

          <main className="main-container">{children}</main>
        </ClientThemeProvider>
      </body>
    </html>
  );
}
