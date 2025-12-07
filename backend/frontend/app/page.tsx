// app/page.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import LinearProgress from "@mui/material/LinearProgress";
import Avatar from "@mui/material/Avatar";

import DownloadIcon from "@mui/icons-material/Download";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import HistoryIcon from "@mui/icons-material/History";
import BoltIcon from "@mui/icons-material/Bolt";
import DeviceHubIcon from "@mui/icons-material/DeviceHub";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

import InputPanel from "./design-validator/components/InputPanel";
import ResultsTable from "./design-validator/components/ResultsTable";
import AIDrawer from "./design-validator/components/AIDrawer";

import { validateDesign } from "./design-validator/utils/api";

type HistoryEntry = {
  id: string;
  timestamp: number;
  form: any;
  results: any[];
  extracted: any;
  mock?: boolean;
};

const HISTORY_KEY = "dv_history_v3";

export default function HomePage() {
  // client mount guard to avoid hydration issues
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // main app state (unchanged)
  const [form, setForm] = useState<any>({});
  const [results, setResults] = useState<any[]>([]);
  const [extracted, setExtracted] = useState<any>({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{ text: string; severity?: "info" | "success" | "error" } | null>(null);

  // local history (client-only)
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      if (raw) setHistory(JSON.parse(raw));
    } catch {}
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 100)));
    } catch {}
  }, [history]);

  // small presets (no change to fields)
  const presets = useMemo(
    () => [
      {
        id: "xlpe_cu_25",
        name: "1.1 kV XLPE Cu 25 mm²",
        data: { voltage: "1100", conductor_material: "Copper", conductor_class: "2", csa: "25", insulation_material: "XLPE", free_text: "1.1 kV XLPE insulated copper conductor Class 2, 25 sqmm" }
      },
      {
        id: "0.6kv_al_35",
        name: "0.6 kV Al 35 mm²",
        data: { voltage: "600", conductor_material: "Aluminium", conductor_class: "1", csa: "35", insulation_material: "PVC", free_text: "0.6 kV PVC insulated aluminium conductor Class 1, 35 sqmm" }
      }
    ],
    []
  );

  const normalize = (resp: any) => {
    if (!resp) return { rows: [], extracted: {} };
    const extracted = resp.extracted ?? resp.extractions ?? resp.data?.extracted ?? {};
    let rows: any[] = Array.isArray(resp.results) ? resp.results : Array.isArray(resp.validation) ? resp.validation : resp.rows ?? [];

    if (!Array.isArray(rows)) {
      const maybeObj = resp.results ?? resp.validation ?? resp;
      if (typeof maybeObj === "object") {
        rows = Object.entries(maybeObj)
          .filter(([k]) => k !== "extracted" && k !== "extractions")
          .map(([k, v]: any) => {
            if (v && typeof v === "object" && ("status" in v || "expected" in v)) {
              return { field: k, provided: v.provided ?? v.value ?? "", expected: v.expected ?? "", status: (v.status || "WARN").toString().toUpperCase(), comment: v.comment ?? "" };
            }
            return { field: k, provided: String(v ?? ""), expected: "-", status: "WARN", comment: "" };
          });
      } else rows = [];
    }

    rows = rows.map((r: any) => ({
      field: r.field ?? r.name ?? "-",
      provided: r.provided ?? r.value ?? "",
      expected: r.expected ?? r.expect ?? "",
      status: (r.status || "WARN").toString().toUpperCase(),
      comment: r.comment ?? r.notes ?? ""
    }));

    return { rows, extracted };
  };

  const pushHistory = (entry: HistoryEntry) => setHistory((p) => [entry, ...p].slice(0, 100));

  const handleValidate = async () => {
    setLoading(true);
    setSnackbar(null);
    try {
      const resp = await validateDesign(form);
      const { rows, extracted } = normalize(resp);
      setResults(rows);
      setExtracted(extracted);
      setDrawerOpen(true);
      pushHistory({ id: String(Date.now()), timestamp: Date.now(), form, results: rows, extracted, mock: !!resp?._mock });
      if (resp?._mock) setSnackbar({ text: "Backend unreachable — showing mock results.", severity: "info" });
      else setSnackbar({ text: "Validation complete", severity: "success" });
    } catch (err) {
      console.error(err);
      setSnackbar({ text: "Validation failed.", severity: "error" });
      try {
        const fallback = await validateDesign(form);
        const { rows, extracted } = normalize(fallback);
        setResults(rows);
        setExtracted(extracted);
        setDrawerOpen(true);
        pushHistory({ id: String(Date.now()), timestamp: Date.now(), form, results: rows, extracted, mock: true });
        setSnackbar({ text: "Validation failed — showing fallback", severity: "info" });
      } catch {}
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = () => {
    if (!results || results.length === 0) {
      setSnackbar({ text: "No results to download", severity: "info" });
      return;
    }
    const headers = ["Attribute", "Provided", "Expected", "Status", "Comment"];
    const rowsCsv = results.map((r) => [r.field ?? "", r.provided ?? "", r.expected ?? "", r.status ?? "", r.comment ?? ""]);
    const csv = [headers, ...rowsCsv].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `validation_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setSnackbar({ text: "CSV downloaded", severity: "success" });
  };

  const copyJSON = async () => {
    const payload = { form, results, extracted };
    try {
      await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
      setSnackbar({ text: "Results copied", severity: "success" });
    } catch {
      setSnackbar({ text: "Copy failed", severity: "error" });
    }
  };

  const clearHistory = () => {
    setHistory([]);
    setSnackbar({ text: "History cleared", severity: "info" });
  };

  const loadHistory = (h: HistoryEntry) => {
    setForm(h.form);
    setResults(h.results);
    setExtracted(h.extracted);
    setDrawerOpen(true);
    setSnackbar({ text: "Loaded from history", severity: "info" });
  };

  const stats = useMemo(() => {
    const total = history.length;
    const mocks = history.filter((h) => h.mock).length;
    const last = history[0]?.timestamp ? new Date(history[0].timestamp).toLocaleString() : "-";
    return { total, mocks, last };
  }, [history]);

  // If not mounted yet render a small SSR-safe header to avoid hydration mismatch
  if (!mounted) {
    return (
      <Box sx={{ py: 8 }}>
        <Box sx={{ maxWidth: 1200, mx: "auto", px: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            IEC Cable Design Validator
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            Loading interface...
          </Typography>
        </Box>
      </Box>
    );
  }

  // MAIN UI (client-only, more attractive visuals)
  return (
    <Box sx={{ width: "100%", pb: 8 }}>
      {/* HERO */}
      <Box
        className="glass-hero"
        sx={{
          borderRadius: 3,
          p: { xs: 3, md: 6 },
          mb: 3,
          mx: "auto",
          maxWidth: 1200,
          overflow: "hidden",
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <Stack spacing={1}>
              <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: -1.2, color: "#0b2746" }}>
                IEC Cable Design Validator
              </Typography>
              <Typography variant="subtitle1" sx={{ color: "text.secondary", maxWidth: 720 }}>
                Validate cable specs quickly — get clear results, AI-extracted attributes and a local history of validations. Clean, modern visuals for easier review.
              </Typography>

              <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                <Chip icon={<BoltIcon />} label="Instant checks" color="primary" sx={{ fontWeight: 700 }} />
                <Chip icon={<DeviceHubIcon />} label="AI extraction" sx={{ fontWeight: 700, bgcolor: "rgba(0,0,0,0.03)" }} />
                <Chip label={`History: ${stats.total}`} variant="outlined" />
              </Stack>
            </Stack>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card elevation={0} sx={{ bgcolor: "transparent" }}>
              <CardContent sx={{ px: 0 }}>
                <Stack spacing={1} alignItems="flex-end">
                  <Typography variant="caption" color="text.secondary">
                    Last validation
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {stats.last}
                  </Typography>

                  <Box sx={{ width: "100%", mt: 2 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        Mock results
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {stats.mocks}
                      </Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={Math.min(100, (stats.mocks / Math.max(1, stats.total)) * 100)} />
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* MAIN */}
      <Box sx={{ maxWidth: 1200, mx: "auto" }}>
        <Grid container spacing={3}>
          {/* LEFT */}
          <Grid item xs={12} md={4}>
            <Card className="glass-card" sx={{ borderRadius: 3 }}>
              <CardHeader
                title={<Typography variant="h6" sx={{ fontWeight: 800 }}>Cable Specification</Typography>}
                subheader={<Typography variant="body2" color="text.secondary">Enter attributes or use a preset</Typography>}
                action={
                  <Tooltip title="History info">
                    <IconButton onClick={() => setSnackbar({ text: "Click a history item to load it into the form", severity: "info" })}>
                      <HistoryIcon />
                    </IconButton>
                  </Tooltip>
                }
              />
              <Divider />
              <CardContent>
                <InputPanel
                  form={form}
                  setForm={setForm}
                  onValidate={handleValidate}
                  presets={presets}
                  onPreset={(p: any) => {
                    setForm(p);
                    setSnackbar({ text: "Preset applied", severity: "info" });
                  }}
                />

                <Stack direction="row" spacing={1} sx={{ mt: 2 }} justifyContent="space-between">
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleValidate}
                    startIcon={loading ? <CircularProgress size={18} /> : undefined}
                    sx={{ px: 3, py: 1.25, fontWeight: 800 }}
                  >
                    {loading ? "Validating..." : "Validate"}
                  </Button>

                  <Button
                    variant="outlined"
                    onClick={() => { setForm({}); setResults([]); setExtracted({}); setSnackbar({ text: "Form cleared", severity: "info" }); }}
                  >
                    Clear
                  </Button>
                </Stack>
              </CardContent>
            </Card>

            <Card className="glass-card" sx={{ mt: 2, borderRadius: 3 }}>
              <CardHeader title={<Typography sx={{ fontWeight: 800 }}>Validation History</Typography>} subheader="Recent local validations" />
              <Divider />
              <CardContent>
                {history.length === 0 ? (
                  <Typography color="text.secondary">No history yet — run a validation to populate.</Typography>
                ) : (
                  <Stack spacing={1}>
                    {history.slice(0, 8).map((h) => (
                      <Box key={h.id} onClick={() => loadHistory(h)} sx={{ p: 1, borderRadius: 1, bgcolor: "rgba(255,255,255,0.7)", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", transition: "all .12s ease", "&:hover": { transform: "translateY(-4px)" } }}>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>{new Date(h.timestamp).toLocaleString()}</Typography>
                          <Typography variant="caption" color="text.secondary">{h.form.free_text ? h.form.free_text.slice(0, 60) : `${h.form.csa ?? "-"} mm² • ${h.form.conductor_material ?? "-"}`}</Typography>
                        </Box>
                        <Chip label={h.mock ? "Mock" : "Live"} size="small" />
                      </Box>
                    ))}

                    <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 1 }}>
                      <Button size="small" startIcon={<DownloadIcon />} onClick={() => {
                        const blob = new Blob([JSON.stringify(history, null, 2)], { type: "application/json" });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `history_${Date.now()}.json`;
                        a.click();
                        URL.revokeObjectURL(url);
                        setSnackbar({ text: "History exported", severity: "success" });
                      }}>Export</Button>

                      <Button size="small" color="error" onClick={clearHistory}>Clear</Button>
                    </Stack>
                  </Stack>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* RIGHT */}
          <Grid item xs={12} md={8}>
            <Card className="glass-card" sx={{ borderRadius: 3 }}>
              <CardHeader
                title={<Typography variant="h6" sx={{ fontWeight: 800 }}>Validation Results</Typography>}
                subheader={<Typography variant="body2" color="text.secondary">Statuses and comments</Typography>}
                action={
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Tooltip title="Download CSV"><IconButton onClick={downloadCSV}><DownloadIcon /></IconButton></Tooltip>
                    <Tooltip title="Copy JSON"><IconButton onClick={copyJSON}><ContentCopyIcon /></IconButton></Tooltip>
                    <Tooltip title="Open AI Drawer"><IconButton onClick={() => setDrawerOpen(true)}><InfoOutlinedIcon /></IconButton></Tooltip>
                  </Stack>
                }
              />
              <Divider />
              <CardContent>
                <ResultsTable results={results} />
              </CardContent>
            </Card>

            <Card className="glass-card" sx={{ mt: 2, borderRadius: 3 }}>
              <CardHeader title={<Typography variant="h6" sx={{ fontWeight: 800 }}>AI Interpretation</Typography>} subheader="Extracted attributes & notes" />
              <Divider />
              <CardContent>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Button variant="outlined" onClick={() => setDrawerOpen(true)}>Open Drawer</Button>
                  <Button variant="text" onClick={downloadCSV} startIcon={<DownloadIcon />}>Download CSV</Button>
                  <Button variant="text" onClick={copyJSON} startIcon={<ContentCopyIcon />}>Copy JSON</Button>
                </Stack>

                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
                  The AI drawer shows fields extracted from free-text and structured inputs.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      <AIDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} extracted={extracted} />

      <Snackbar open={!!snackbar} autoHideDuration={4500} onClose={() => setSnackbar(null)} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        {snackbar ? <Alert severity={snackbar.severity ?? "info"}>{snackbar.text}</Alert> : null}
      </Snackbar>
    </Box>
  );
}
