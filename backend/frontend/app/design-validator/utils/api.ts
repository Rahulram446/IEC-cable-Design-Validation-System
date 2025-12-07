// app/design-validator/utils/api.ts
import axios from "axios";

const ENV_BASE = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
const DEFAULT_BASE = "http://localhost:4000";
const BASE = ENV_BASE || DEFAULT_BASE;

const buildMock = (data: any) => {
  const _csa = data?.csa ?? (data?.free_text?.match(/\b(\d{1,3})\b/) ? Number(data.free_text.match(/\b(\d{1,3})\b/)[1]) : 25);
  return {
    results: [
      { field: "summary", provided: "-", expected: "-", status: "WARN", comment: "Fallback summary (mock)" },
      { field: "voltage", provided: data?.voltage ?? data?.free_text ?? "", expected: "1100", status: "PASS", comment: "Mock fallback" },
      { field: "conductor_material", provided: data?.conductor_material ?? "Unknown", expected: "Copper", status: (data?.conductor_material || "").toString().toLowerCase().includes("cu") ? "PASS" : "WARN", comment: "Mock fallback" },
      { field: "csa", provided: _csa, expected: 25, status: _csa >= 1 ? "PASS" : "WARN", comment: "Mock fallback" }
    ],
    extracted: { voltage: data?.voltage ?? 1100, conductor: data?.conductor_material ?? "Copper", csa: _csa, raw_free_text: data?.free_text ?? "" },
    _mock: true
  };
};

export const validateDesign = async (data: any) => {
  const url = `${BASE}/design/validate`;
  console.info("[validateDesign] POST ->", url, "payload:", data);

  try {
    const res = await axios.post(url, data, { timeout: 9000 });
    if (res && res.data && (Array.isArray(res.data.results) || typeof res.data.extracted === "object")) {
      return res.data;
    } else {
      console.warn("[validateDesign] Backend returned unexpected shape — using fallback mock.", res?.data);
      return buildMock(data);
    }
  } catch (err: any) {
    console.warn("[validateDesign] Request failed:", err?.message ?? err);
    if (err?.response) console.warn("[validateDesign] response data:", err.response.data, "status:", err.response.status);
    else if (err?.request) console.warn("[validateDesign] no response received; request:", err.request);
    return buildMock(data);
  }
};

export default validateDesign;
