"use client";

import { TextField, Grid, Paper, Typography, Button } from "@mui/material";

export default function InputPanel({ form, setForm, onValidate }: any) {
  const update = (key: string, value: any) =>
    setForm((prev: any) => ({ ...prev, [key]: value }));

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6">Cable Specification</Typography>

      <Grid container spacing={2} sx={{ mt: 1 }}>
        {[
          ["standard", "Standard"],
          ["voltage", "Voltage"],
          ["conductor_material", "Conductor Material"],
          ["conductor_class", "Conductor Class"],
          ["csa", "CSA"],
          ["insulation_material", "Insulation Material"],
          ["insulation_thickness", "Insulation Thickness"]
        ].map(([key, label]) => (
          <Grid item xs={6} key={key}>
            <TextField
              fullWidth
              label={label}
              value={form[key] || ""}
              onChange={(e) => update(key, e.target.value)}
            />
          </Grid>
        ))}

        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Free Text"
            value={form.free_text || ""}
            onChange={(e) => update("free_text", e.target.value)}
          />
        </Grid>

        <Grid item xs={12}>
          <Button variant="contained" fullWidth onClick={onValidate}>
            Validate
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
}
