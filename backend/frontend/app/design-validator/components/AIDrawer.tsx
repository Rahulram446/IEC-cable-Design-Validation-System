"use client";

import { Drawer, Box, Typography, Divider, List, ListItem, ListItemText } from "@mui/material";

export default function AIDrawer({ open, onClose, extracted }: any) {
  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: 350, p: 2 }}>
        <Typography variant="h6">AI Interpretation</Typography>
        <Divider sx={{ mb: 2 }} />

        <List>
          {Object.entries(extracted || {}).map(([k, v]: any) => (
            <ListItem key={k}>
              <ListItemText primary={k} secondary={String(v)} />
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );
}
