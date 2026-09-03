import React, { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend, LabelList
} from "recharts";

const SUPABASE_URL = "https://zvqoxgugzfxbkhmqgvdk.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2cW94Z3VnemZ4YmtobXFndmRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4MjUzMDcsImV4cCI6MjA2NjQwMTMwN30.vdpTmNn2yhu1mnbmC-LamuvBvqD_Q8DGZ2GYNEZyux0";

const COLORS = {
  bg: "#1B2124", panel: "#232A2E", panelBorder: "#323B40", text: "#E8EAE6",
  muted: "#8B9499", teal: "#4FA894", amber: "#E0A458", slate: "#6B7B8C", red: "#C97064",
  blue: "#5B8FAE", orange: "#D9954D",
};

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=IBM+Plex+Sans:wght@400;500&family=IBM+Plex+Mono:wght@400;500&display=swap');`;

async function fetchDashboard(token) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/get_partner_dashboard`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ p_token: token }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Code d'accès incorrect");
  return data;
}

async function fetchEcosystemStatus(token) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/get_ecosystem_declaration_status`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ p_token: token }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Erreur de chargement");
  return data;
}

async function requestDeclaration(token, prefix, businessDate) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/request_ecosystem_declaration`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ p_token: token, p_prefix: prefix, p_business_date: businessDate }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Échec de la demande");
  return data;
}

function TokenScreen({ onUnlock }) {
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await fetchDashboard(token);
      onUnlock(token, data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: COLORS.bg, fontFamily: "'IBM Plex Sans', sans-serif", padding: 24 }}>
      <style>{FONT_IMPORT}</style>
      <form onSubmit={submit} style={{ background: COLORS.panel, border: `1px solid ${COLORS.panelBorder}`, borderRadius: 4, padding: "40px 36px", width: 340, boxShadow: "0 20px 60px rgba(0,0,0,0.4)" }}>
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, letterSpacing: 2, color: COLORS.teal, textTransform: "uppercase", marginBottom: 8 }}>
          Ligne de tri — accès partenaire
        </div>
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 24, color: COLORS.text, margin: "0 0 28px 0" }}>Tableau de bord</h1>
        <label style={{ display: "block", fontSize: 12, color: COLORS.muted, marginBottom: 6 }}>Code d'accès</label>
        <input
          type="password" required value={token} onChange={(e) => setToken(e.target.value)}
          placeholder="Collez le code fourni"
          style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", background: "#1B2124", border: `1px solid ${COLORS.panelBorder}`, borderRadius: 3, color: COLORS.text, fontSize: 14, fontFamily: "'IBM Plex Mono', monospace", outline: "none" }}
        />
        {error && <div style={{ color: COLORS.red, fontSize: 13, marginTop: 14, fontFamily: "'IBM Plex Mono', monospace" }}>{error}</div>}
        <button type="submit" disabled={loading} style={{ marginTop: 24, width: "100%", padding: "12px 0", background: COLORS.teal, color: "#0F1517", border: "none", borderRadius: 3, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 14, cursor: "pointer", opacity: loading ? 0.6 : 1 }}>
          {loading ? "Vérification..." : "Accéder"}
        </button>
      </form>
    </div>
  );
}

function KpiCard({ label, value, unit, accent, tooltip }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onMouseEnter={() => tooltip && setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ background: COLORS.panel, border: `1px solid ${COLORS.panelBorder}`, borderRadius: 4, padding: "18px 20px", flex: 1, minWidth: 140, position: "relative", overflow: "visible", cursor: tooltip ? "help" : "default" }}
    >
      <div style={{ position: "absolute", top: 0, left: 0, width: 3, height: "100%", background: accent, borderRadius: "4px 0 0 4px" }} />
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, letterSpacing: 1.5, color: COLORS.muted, textTransform: "uppercase", marginBottom: 10 }}>{label}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
        <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 28, color: COLORS.text }}>{value}</span>
        {unit && <span style={{ fontSize: 13, color: COLORS.muted }}>{unit}</span>}
      </div>
      {tooltip && hover && (
        <div style={{
          position: "absolute", bottom: "calc(100% + 8px)", left: 0, zIndex: 20,
          background: "#0F1517", border: `1px solid ${COLORS.panelBorder}`, borderRadius: 4,
          padding: "10px 12px", fontSize: 12, color: COLORS.text, lineHeight: 1.4,
          width: 260, boxShadow: "0 8px 24px rgba(0,0,0,0.5)", fontFamily: "'IBM Plex Sans', sans-serif",
        }}>
          {tooltip}
        </div>
      )}
    </div>
  );
}

function Panel({ title, children, height = 300 }) {
  return (
    <div style={{ background: COLORS.panel, border: `1px solid ${COLORS.panelBorder}`, borderRadius: 4, padding: "20px 20px 8px", flex: 1, minWidth: 320 }}>
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, letterSpacing: 1.5, color: COLORS.muted, textTransform: "uppercase", marginBottom: 16 }}>{title}</div>
      <div style={{ height }}>{children}</div>
    </div>
  );
}

const PROFIL_LABELS = {
  centre_tri: "Centre de tri",
  seconde_vie: "Opérateur de seconde vie",
  data_quality: "Data quality",
};

function ComingSoonScreen({ profil, onLock }) {
  return (
    <div style={{ minHeight: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: COLORS.bg, fontFamily: "'IBM Plex Sans', sans-serif", padding: 24 }}>
      <style>{FONT_IMPORT}</style>
      <div style={{ background: COLORS.panel, border: `1px solid ${COLORS.panelBorder}`, borderRadius: 4, padding: "48px 40px", width: 380, textAlign: "center" }}>
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, letterSpacing: 2, color: COLORS.teal, textTransform: "uppercase", marginBottom: 10 }}>
          {PROFIL_LABELS[profil] || profil}
        </div>
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 22, color: COLORS.text, margin: "0 0 12px 0" }}>
          En cours de création
        </h1>
        <p style={{ color: COLORS.muted, fontSize: 14, lineHeight: 1.5, margin: "0 0 28px 0" }}>
          Ce tableau de bord n'est pas encore prêt. Revenez un peu plus tard.
        </p>
        <button onClick={onLock} style={{ background: "transparent", border: `1px solid ${COLORS.panelBorder}`, color: COLORS.muted, padding: "8px 16px", borderRadius: 3, cursor: "pointer", fontSize: 13, fontFamily: "'IBM Plex Mono', monospace" }}>
          Verrouiller
        </button>
      </div>
    </div>
  );
}

function getRollingMonths(n) {
  const now = new Date();
  const months = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`);
  }
  return months;
}

const TARGET_MONTHS = getRollingMonths(3);

function matchSupplierBucket(name) {
  const n = (name || "").toLowerCase();
  if (n.includes("darty")) return "darty";
  if (n.includes("revolog")) return "revolog";
  return null;
}

function pivotTendanceFournisseur(rows) {
  const byMonth = new Map();
  for (const m of TARGET_MONTHS) {
    byMonth.set(m, {
      mois: m,
      darty_conforme: 0, darty_non_conforme: 0, darty_non_eligible: 0, darty_taux: null,
      darty_nb_conforme: 0, darty_nb_non_conforme: 0, darty_nb_non_eligible: 0,
      revolog_conforme: 0, revolog_non_conforme: 0, revolog_non_eligible: 0, revolog_taux: null,
      revolog_nb_conforme: 0, revolog_nb_non_conforme: 0, revolog_nb_non_eligible: 0,
    });
  }
  for (const r of rows || []) {
    const bucket = matchSupplierBucket(r.supplier_name);
    if (!bucket || !byMonth.has(r.mois)) continue;
    const row = byMonth.get(r.mois);
    const poidsConformeT = (r.poids_conforme_kg || 0) / 1000;
    const poidsNonConformeT = (r.poids_non_conforme_kg || 0) / 1000;
    const poidsNonEligibleT = (r.poids_non_eligible_kg || 0) / 1000;
    const total = r.nb_devices || 0;
    const taux = total > 0 ? Math.round(((r.nb_conformes || 0) / total) * 100) : null;
    row[`${bucket}_conforme`] = Math.round(poidsConformeT * 100) / 100;
    row[`${bucket}_non_conforme`] = Math.round(poidsNonConformeT * 100) / 100;
    row[`${bucket}_non_eligible`] = Math.round(poidsNonEligibleT * 100) / 100;
    row[`${bucket}_taux`] = taux;
    row[`${bucket}_nb_conforme`] = r.nb_conformes || 0;
    row[`${bucket}_nb_non_conforme`] = r.nb_non_conformes || 0;
    row[`${bucket}_nb_non_eligible`] = r.nb_non_eligibles || 0;
  }
  return [...byMonth.values()].sort((a, b) => a.mois.localeCompare(b.mois));
}

function formatDateFr(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("fr-FR");
}

function pivotLotsByCateg(lots, palettes) {
  const byLot = new Map();
  for (const r of lots || []) {
    const key = `${r.client_name || ""}|${r.sale_lot_name || ""}`;
    if (!byLot.has(key)) {
      byLot.set(key, { client_name: r.client_name, sale_lot_name: r.sale_lot_name, gemf: 0, gemhf: 0, nb_palettes: 0, poids_kg: 0, date_depart: r.date_depart || null });
    }
    const row = byLot.get(key);
    if (!row.date_depart && r.date_depart) row.date_depart = r.date_depart;
    const categ = (r.categ_code || "").toUpperCase();
    if (categ === "GEMF") row.gemf += r.nb_devices || 0;
    else if (categ === "GEMHF") row.gemhf += r.nb_devices || 0;
    row.poids_kg += r.poids_kg || 0;
  }
  for (const p of palettes || []) {
    const key = `${p.client_name || ""}|${p.sale_lot_name || ""}`;
    if (byLot.has(key)) byLot.get(key).nb_palettes = p.nb_palettes || 0;
  }
  return [...byLot.values()]
    .map((r) => ({ ...r, total: r.gemf + r.gemhf, poids_kg: Math.round(r.poids_kg * 100) / 100 }))
    .sort((a, b) => (a.client_name || "").localeCompare(b.client_name || "") || (a.sale_lot_name || "").localeCompare(b.sale_lot_name || ""));
}

async function saveLotPalettes(token, clientName, saleLotName, nbPalettes) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/set_osv_lot_palettes`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ p_token: token, p_client_name: clientName, p_sale_lot_name: saleLotName, p_nb_palettes: nbPalettes }),
  });
  if (!res.ok) throw new Error((await res.json()).message || "Échec de l'enregistrement");
}

async function addOsvLotPlanning(token, entry) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/add_osv_lot_planning`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      p_token: token,
      p_client_name: entry.client_name,
      p_sale_lot_name: entry.sale_lot_name,
      p_date_prevue: entry.date_prevue || null,
      p_prevu_gem_hf: Number(entry.prevu_gem_hf) || 0,
      p_prevu_gem_f: Number(entry.prevu_gem_f) || 0,
      p_comment: entry.comment || null,
    }),
  });
  if (!res.ok) throw new Error((await res.json()).message || "Échec de l'enregistrement");
}

async function deleteOsvLotPlanning(token, id) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/delete_osv_lot_planning`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ p_token: token, p_id: id }),
  });
  if (!res.ok) throw new Error((await res.json()).message || "Échec de la suppression");
}

function OSVDashboard({ data, onLock, token, onRefresh }) {
  const rows = data?.osv_par_type || [];
  const lots = pivotLotsByCateg(data?.osv_lots, data?.osv_lot_palettes);
  const clientTotals = [...lots.reduce((map, r) => {
    const key = r.client_name || "—";
    const cur = map.get(key) || { total: 0, poids_kg: 0 };
    map.set(key, { total: cur.total + r.total, poids_kg: cur.poids_kg + r.poids_kg });
    return map;
  }, new Map())]
    .map(([client_name, v]) => ({ client_name, total: v.total, poids_kg: Math.round(v.poids_kg * 100) / 100 }))
    .sort((a, b) => b.total - a.total);

  const total = rows.reduce((acc, r) => acc + (r.nb_devices || 0), 0);
  const isAdmin = data?.editable === true;
  const [pending, setPending] = useState({});
  const [saving, setSaving] = useState(null);
  const [error, setError] = useState("");

  const planning = [...(data?.osv_lot_planning || [])].sort((a, b) =>
    (a.date_prevue || "9999-99-99").localeCompare(b.date_prevue || "9999-99-99")
  );
  const [planningForm, setPlanningForm] = useState({ client_name: "", sale_lot_name: "", date_prevue: "", prevu_gem_hf: "", prevu_gem_f: "", comment: "" });
  const [planningSaving, setPlanningSaving] = useState(false);
  const [planningDeletingId, setPlanningDeletingId] = useState(null);
  const [planningError, setPlanningError] = useState("");

  const handleSavePalette = async (row) => {
    const lotKey = `${row.client_name || ""}|${row.sale_lot_name || ""}`;
    const value = pending[lotKey] !== undefined ? pending[lotKey] : row.nb_palettes;
    setSaving(lotKey);
    setError("");
    try {
      await saveLotPalettes(token, row.client_name, row.sale_lot_name, Number(value) || 0);
      if (onRefresh) onRefresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(null);
    }
  };

  const handleAddPlanning = async () => {
    if (!planningForm.client_name || !planningForm.sale_lot_name) {
      setPlanningError("Client et nom du lot sont obligatoires.");
      return;
    }
    setPlanningSaving(true);
    setPlanningError("");
    try {
      await addOsvLotPlanning(token, planningForm);
      setPlanningForm({ client_name: "", sale_lot_name: "", date_prevue: "", prevu_gem_hf: "", prevu_gem_f: "", comment: "" });
      if (onRefresh) onRefresh();
    } catch (err) {
      setPlanningError(err.message);
    } finally {
      setPlanningSaving(false);
    }
  };

  const handleDeletePlanning = async (id) => {
    setPlanningDeletingId(id);
    setPlanningError("");
    try {
      await deleteOsvLotPlanning(token, id);
      if (onRefresh) onRefresh();
    } catch (err) {
      setPlanningError(err.message);
    } finally {
      setPlanningDeletingId(null);
    }
  };

  return (
    <div style={{ minHeight: "100%", background: COLORS.bg, fontFamily: "'IBM Plex Sans', sans-serif", padding: 28 }}>
      <style>{FONT_IMPORT}</style>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24 }}>
        <div>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, letterSpacing: 2, color: COLORS.teal, textTransform: "uppercase", marginBottom: 6 }}>
            Ligne de tri — opérateur de seconde vie
          </div>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 26, color: COLORS.text, margin: 0 }}>
            Stock appareils pour réemploi
          </h1>
        </div>
        {onLock && (
          <button onClick={onLock} style={{ background: "transparent", border: `1px solid ${COLORS.panelBorder}`, color: COLORS.muted, padding: "8px 16px", borderRadius: 3, cursor: "pointer", fontSize: 13, fontFamily: "'IBM Plex Mono', monospace" }}>
            Verrouiller
          </button>
        )}
      </div>

      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 20 }}>
        <KpiCard label="Total appareils" value={total} accent={COLORS.teal} />
      </div>

      <Panel title="Répartition par catégorie et type" height={rows.length * 40 + 60}>
        <div style={{ height: "100%", overflowY: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${COLORS.panelBorder}` }}>
                <th style={{ textAlign: "left", padding: "8px 6px", color: COLORS.muted, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 400, fontSize: 11, textTransform: "uppercase" }}>Catégorie</th>
                <th style={{ textAlign: "left", padding: "8px 6px", color: COLORS.muted, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 400, fontSize: 11, textTransform: "uppercase" }}>Type</th>
                <th style={{ textAlign: "right", padding: "8px 6px", color: COLORS.muted, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 400, fontSize: 11, textTransform: "uppercase" }}>Appareils</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${COLORS.panelBorder}` }}>
                  <td style={{ padding: "8px 6px", color: COLORS.text }}>{r.categorie ?? "—"}</td>
                  <td style={{ padding: "8px 6px", color: COLORS.text }}>{r.type ?? "—"}</td>
                  <td style={{ padding: "8px 6px", color: COLORS.text, textAlign: "right", fontFamily: "'IBM Plex Mono', monospace" }}>{r.nb_devices}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 26, color: COLORS.text, margin: "28px 0 16px 0" }}>
        Flux transmis aux opérateurs de seconde vie
      </h1>

      <Panel title="Total appareils transmis par client" height={clientTotals.length * 40 + 60}>
        <div style={{ height: "100%", overflowY: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${COLORS.panelBorder}` }}>
                <th style={{ textAlign: "left", padding: "8px 6px", color: COLORS.muted, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 400, fontSize: 11, textTransform: "uppercase" }}>Client</th>
                <th style={{ textAlign: "right", padding: "8px 6px", color: COLORS.muted, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 400, fontSize: 11, textTransform: "uppercase" }}>Total appareils</th>
                <th style={{ textAlign: "right", padding: "8px 6px", color: COLORS.muted, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 400, fontSize: 11, textTransform: "uppercase" }}>Poids (kg)</th>
              </tr>
            </thead>
            <tbody>
              {clientTotals.map((r, i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${COLORS.panelBorder}` }}>
                  <td style={{ padding: "8px 6px", color: COLORS.text }}>{r.client_name}</td>
                  <td style={{ padding: "8px 6px", color: COLORS.text, textAlign: "right", fontFamily: "'IBM Plex Mono', monospace", fontWeight: 700 }}>{r.total}</td>
                  <td style={{ padding: "8px 6px", color: COLORS.text, textAlign: "right", fontFamily: "'IBM Plex Mono', monospace" }}>{r.poids_kg}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel title="Lots par client" height={lots.length * 40 + 60}>
        <div style={{ height: "100%", overflowY: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${COLORS.panelBorder}` }}>
                <th style={{ textAlign: "left", padding: "8px 6px", color: COLORS.muted, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 400, fontSize: 11, textTransform: "uppercase" }}>Client</th>
                <th style={{ textAlign: "left", padding: "8px 6px", color: COLORS.muted, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 400, fontSize: 11, textTransform: "uppercase" }}>Lot</th>
                <th style={{ textAlign: "right", padding: "8px 6px", color: COLORS.muted, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 400, fontSize: 11, textTransform: "uppercase" }}>GEMF</th>
                <th style={{ textAlign: "right", padding: "8px 6px", color: COLORS.muted, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 400, fontSize: 11, textTransform: "uppercase" }}>GEMHF</th>
                <th style={{ textAlign: "right", padding: "8px 6px", color: COLORS.muted, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 400, fontSize: 11, textTransform: "uppercase" }}>Total</th>
                <th style={{ textAlign: "right", padding: "8px 6px", color: COLORS.muted, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 400, fontSize: 11, textTransform: "uppercase" }}>Palettes</th>
                <th style={{ textAlign: "right", padding: "8px 6px", color: COLORS.muted, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 400, fontSize: 11, textTransform: "uppercase" }}>Date de départ</th>
              </tr>
            </thead>
            <tbody>
              {lots.map((r, i) => {
                const lotKey = `${r.client_name || ""}|${r.sale_lot_name || ""}`;
                return (
                  <tr key={i} style={{ borderBottom: `1px solid ${COLORS.panelBorder}` }}>
                    <td style={{ padding: "8px 6px", color: COLORS.text }}>{r.client_name ?? "—"}</td>
                    <td style={{ padding: "8px 6px", color: COLORS.text }}>{r.sale_lot_name ?? "—"}</td>
                    <td style={{ padding: "8px 6px", color: COLORS.text, textAlign: "right", fontFamily: "'IBM Plex Mono', monospace" }}>{r.gemf}</td>
                    <td style={{ padding: "8px 6px", color: COLORS.text, textAlign: "right", fontFamily: "'IBM Plex Mono', monospace" }}>{r.gemhf}</td>
                    <td style={{ padding: "8px 6px", color: COLORS.text, textAlign: "right", fontFamily: "'IBM Plex Mono', monospace", fontWeight: 700 }}>{r.total}</td>
                    <td style={{ padding: "8px 6px", textAlign: "right" }}>
                      {isAdmin ? (
                        <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                          <input
                            type="number"
                            min="0"
                            defaultValue={r.nb_palettes}
                            onChange={(e) => setPending((p) => ({ ...p, [lotKey]: e.target.value }))}
                            style={{ width: 64, boxSizing: "border-box", padding: "4px 6px", background: "#1B2124", border: `1px solid ${COLORS.panelBorder}`, borderRadius: 3, color: COLORS.text, fontSize: 13, fontFamily: "'IBM Plex Mono', monospace", outline: "none", textAlign: "right" }}
                          />
                          <button
                            onClick={() => handleSavePalette(r)}
                            disabled={saving === lotKey}
                            style={{ background: COLORS.teal, color: "#0F1517", border: "none", borderRadius: 3, padding: "0 10px", cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 12, opacity: saving === lotKey ? 0.6 : 1 }}
                          >
                            {saving === lotKey ? "..." : "OK"}
                          </button>
                        </div>
                      ) : (
                        <span style={{ color: COLORS.text, fontFamily: "'IBM Plex Mono', monospace" }}>{r.nb_palettes}</span>
                      )}
                    </td>
                    <td style={{ padding: "8px 6px", color: COLORS.text, textAlign: "right", fontFamily: "'IBM Plex Mono', monospace" }}>{formatDateFr(r.date_depart)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {error && (
            <div style={{ background: "rgba(201,112,100,0.1)", border: `1px solid ${COLORS.red}`, color: COLORS.red, padding: "10px 14px", borderRadius: 4, marginTop: 12, fontSize: 13, fontFamily: "'IBM Plex Mono', monospace" }}>
              {error}
            </div>
          )}
        </div>
      </Panel>

      <Panel title="Planning — lots à venir" height={Math.max((planning.length + (isAdmin ? 2 : 0)) * 44 + 60, 220)}>
        <div style={{ height: "100%", overflowY: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${COLORS.panelBorder}` }}>
                <th style={{ textAlign: "left", padding: "8px 6px", color: COLORS.muted, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 400, fontSize: 11, textTransform: "uppercase" }}>Client</th>
                <th style={{ textAlign: "left", padding: "8px 6px", color: COLORS.muted, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 400, fontSize: 11, textTransform: "uppercase" }}>Lot</th>
                <th style={{ textAlign: "right", padding: "8px 6px", color: COLORS.muted, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 400, fontSize: 11, textTransform: "uppercase" }}>Date prévue</th>
                <th style={{ textAlign: "right", padding: "8px 6px", color: COLORS.muted, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 400, fontSize: 11, textTransform: "uppercase" }}>GEM HF prévu</th>
                <th style={{ textAlign: "right", padding: "8px 6px", color: COLORS.muted, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 400, fontSize: 11, textTransform: "uppercase" }}>GEM F prévu</th>
                <th style={{ textAlign: "left", padding: "8px 6px", color: COLORS.muted, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 400, fontSize: 11, textTransform: "uppercase" }}>Commentaire</th>
                {isAdmin && <th style={{ padding: "8px 6px" }}></th>}
              </tr>
            </thead>
            <tbody>
              {planning.map((r) => (
                <tr key={r.id} style={{ borderBottom: `1px solid ${COLORS.panelBorder}` }}>
                  <td style={{ padding: "8px 6px", color: COLORS.text }}>{r.client_name ?? "—"}</td>
                  <td style={{ padding: "8px 6px", color: COLORS.text }}>{r.sale_lot_name ?? "—"}</td>
                  <td style={{ padding: "8px 6px", color: COLORS.text, textAlign: "right", fontFamily: "'IBM Plex Mono', monospace" }}>{formatDateFr(r.date_prevue)}</td>
                  <td style={{ padding: "8px 6px", color: COLORS.text, textAlign: "right", fontFamily: "'IBM Plex Mono', monospace" }}>{r.prevu_gem_hf ?? 0}</td>
                  <td style={{ padding: "8px 6px", color: COLORS.text, textAlign: "right", fontFamily: "'IBM Plex Mono', monospace" }}>{r.prevu_gem_f ?? 0}</td>
                  <td style={{ padding: "8px 6px", color: COLORS.muted }}>{r.comment ?? ""}</td>
                  {isAdmin && (
                    <td style={{ padding: "8px 6px", textAlign: "right" }}>
                      <button
                        onClick={() => handleDeletePlanning(r.id)}
                        disabled={planningDeletingId === r.id}
                        style={{ background: "transparent", border: `1px solid ${COLORS.red}`, color: COLORS.red, borderRadius: 3, padding: "3px 8px", cursor: "pointer", fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, opacity: planningDeletingId === r.id ? 0.5 : 1 }}
                      >
                        {planningDeletingId === r.id ? "..." : "Suppr."}
                      </button>
                    </td>
                  )}
                </tr>
              ))}
              {planning.length === 0 && (
                <tr>
                  <td colSpan={isAdmin ? 7 : 6} style={{ padding: "12px 6px", color: COLORS.muted, fontStyle: "italic" }}>
                    Aucun lot à venir planifié.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {isAdmin && (
            <div style={{ marginTop: 16, paddingTop: 14, borderTop: `1px solid ${COLORS.panelBorder}` }}>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, letterSpacing: 1, color: COLORS.muted, textTransform: "uppercase", marginBottom: 10 }}>
                Ajouter un lot à venir
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                <input
                  type="text"
                  placeholder="Client"
                  value={planningForm.client_name}
                  onChange={(e) => setPlanningForm((f) => ({ ...f, client_name: e.target.value }))}
                  style={{ width: 140, boxSizing: "border-box", padding: "6px 8px", background: "#1B2124", border: `1px solid ${COLORS.panelBorder}`, borderRadius: 3, color: COLORS.text, fontSize: 13, outline: "none" }}
                />
                <input
                  type="text"
                  placeholder="Nom du lot"
                  value={planningForm.sale_lot_name}
                  onChange={(e) => setPlanningForm((f) => ({ ...f, sale_lot_name: e.target.value }))}
                  style={{ width: 160, boxSizing: "border-box", padding: "6px 8px", background: "#1B2124", border: `1px solid ${COLORS.panelBorder}`, borderRadius: 3, color: COLORS.text, fontSize: 13, outline: "none" }}
                />
                <input
                  type="date"
                  value={planningForm.date_prevue}
                  onChange={(e) => setPlanningForm((f) => ({ ...f, date_prevue: e.target.value }))}
                  style={{ padding: "6px 8px", background: "#1B2124", border: `1px solid ${COLORS.panelBorder}`, borderRadius: 3, color: COLORS.text, fontSize: 13, outline: "none", fontFamily: "'IBM Plex Mono', monospace" }}
                />
                <input
                  type="number"
                  min="0"
                  placeholder="GEM HF prévu"
                  value={planningForm.prevu_gem_hf}
                  onChange={(e) => setPlanningForm((f) => ({ ...f, prevu_gem_hf: e.target.value }))}
                  style={{ width: 110, boxSizing: "border-box", padding: "6px 8px", background: "#1B2124", border: `1px solid ${COLORS.panelBorder}`, borderRadius: 3, color: COLORS.text, fontSize: 13, outline: "none", fontFamily: "'IBM Plex Mono', monospace", textAlign: "right" }}
                />
                <input
                  type="number"
                  min="0"
                  placeholder="GEM F prévu"
                  value={planningForm.prevu_gem_f}
                  onChange={(e) => setPlanningForm((f) => ({ ...f, prevu_gem_f: e.target.value }))}
                  style={{ width: 110, boxSizing: "border-box", padding: "6px 8px", background: "#1B2124", border: `1px solid ${COLORS.panelBorder}`, borderRadius: 3, color: COLORS.text, fontSize: 13, outline: "none", fontFamily: "'IBM Plex Mono', monospace", textAlign: "right" }}
                />
                <input
                  type="text"
                  placeholder="Commentaire (optionnel)"
                  value={planningForm.comment}
                  onChange={(e) => setPlanningForm((f) => ({ ...f, comment: e.target.value }))}
                  style={{ flex: 1, minWidth: 160, boxSizing: "border-box", padding: "6px 8px", background: "#1B2124", border: `1px solid ${COLORS.panelBorder}`, borderRadius: 3, color: COLORS.text, fontSize: 13, outline: "none" }}
                />
                <button
                  onClick={handleAddPlanning}
                  disabled={planningSaving}
                  style={{ background: COLORS.teal, color: "#0F1517", border: "none", borderRadius: 3, padding: "7px 14px", cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 12, opacity: planningSaving ? 0.6 : 1 }}
                >
                  {planningSaving ? "..." : "Ajouter"}
                </button>
              </div>
              {planningError && (
                <div style={{ background: "rgba(201,112,100,0.1)", border: `1px solid ${COLORS.red}`, color: COLORS.red, padding: "10px 14px", borderRadius: 4, marginTop: 12, fontSize: 13, fontFamily: "'IBM Plex Mono', monospace" }}>
                  {planningError}
                </div>
              )}
            </div>
          )}
        </div>
      </Panel>
    </div>
  );
}

function TauxLabel({ x, y, width, value }) {
  if (value === null || value === undefined) return null;
  return (
    <text x={x + width / 2} y={y - 6} textAnchor="middle" fill={COLORS.text} fontSize={11} fontFamily="'IBM Plex Mono', monospace">
      {value}%
    </text>
  );
}

function Dashboard({ data, onRefresh, onLock }) {
  const { par_type = [], totaux = {}, tendance_fournisseur = [] } = data || {};
  const poidsTotalTonnes = totaux.poids_total_kg != null ? Math.round((totaux.poids_total_kg / 1000) * 100) / 100 : "—";
  const tendanceFournisseurData = pivotTendanceFournisseur(tendance_fournisseur);

  const pieTotal = (totaux.total_conformes ?? 0) + (totaux.total_non_conformes ?? 0) + (totaux.total_non_eligible ?? 0);
  const pieData = [
    { name: "Conformes", value: totaux.total_conformes ?? 0, color: COLORS.teal },
    { name: "Non conformes", value: totaux.total_non_conformes ?? 0, color: COLORS.red },
    { name: "Non éligible au tri", value: totaux.total_non_eligible ?? 0, color: COLORS.slate },
  ];

  const pieTooltipFormatter = (value, name) => {
    const pct = pieTotal > 0 ? Math.round((value / pieTotal) * 1000) / 10 : 0;
    return [`${value} (${pct}%)`, name];
  };

  const PieTooltipContent = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;
    return (
      <div style={{ background: COLORS.panel, border: `1px solid ${COLORS.panelBorder}`, borderRadius: 4, padding: "10px 12px" }}>
        {payload.map((entry, i) => {
          const pct = pieTotal > 0 ? Math.round((entry.value / pieTotal) * 1000) / 10 : 0;
          return (
            <div key={i} style={{ color: entry.payload.color, fontSize: 13, fontFamily: "'IBM Plex Mono', monospace" }}>
              {entry.name} : {entry.value} ({pct}%)
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div style={{ minHeight: "100%", background: COLORS.bg, fontFamily: "'IBM Plex Sans', sans-serif", padding: 28 }}>
      <style>{FONT_IMPORT}</style>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24 }}>
        <div>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, letterSpacing: 2, color: COLORS.teal, textTransform: "uppercase", marginBottom: 6 }}>
            Ligne de tri — vue partenaire
          </div>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 26, color: COLORS.text, margin: 0 }}>Activité de tri des équipements</h1>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onRefresh} style={{ background: "transparent", border: `1px solid ${COLORS.panelBorder}`, color: COLORS.muted, padding: "8px 16px", borderRadius: 3, cursor: "pointer", fontSize: 13, fontFamily: "'IBM Plex Mono', monospace" }}>
            Rafraîchir
          </button>
          <button onClick={onLock} style={{ background: "transparent", border: `1px solid ${COLORS.panelBorder}`, color: COLORS.muted, padding: "8px 16px", borderRadius: 3, cursor: "pointer", fontSize: 13, fontFamily: "'IBM Plex Mono', monospace" }}>
            Verrouiller
          </button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 20 }}>
        <KpiCard label="Appareils traités" value={totaux.total_devices ?? "—"} accent={COLORS.teal} />
        <KpiCard label="Conformes" value={totaux.total_conformes ?? "—"} accent={COLORS.teal} />
        <KpiCard label="Non conformes" value={totaux.total_non_conformes ?? "—"} accent={COLORS.red} />
        <KpiCard label="Non éligible au tri" value={totaux.total_non_eligible ?? "—"} accent={COLORS.slate} />
        <KpiCard label="Poids total" value={poidsTotalTonnes} unit="t" accent={COLORS.amber} />
      </div>

      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 14 }}>
        <Panel title="Répartition par catégorie">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={par_type} margin={{ left: -10, right: 10 }}>
              <CartesianGrid stroke={COLORS.panelBorder} vertical={false} />
              <XAxis dataKey="categorie" tick={{ fill: COLORS.muted, fontSize: 11 }} interval={0} angle={-25} textAnchor="end" height={70} />
              <YAxis tick={{ fill: COLORS.muted, fontSize: 11 }} />
              <Tooltip contentStyle={{ background: COLORS.panel, border: `1px solid ${COLORS.panelBorder}`, borderRadius: 4 }} labelStyle={{ color: COLORS.text }} />
              <Legend wrapperStyle={{ fontSize: 12, color: COLORS.muted }} />
              <Bar dataKey="nb_conformes" name="Conformes" fill={COLORS.teal} radius={[3, 3, 0, 0]} />
              <Bar dataKey="nb_non_conformes" name="Non conformes" fill={COLORS.red} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Statut de conformité">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={2}>
                {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip content={<PieTooltipContent />} />
              <Legend wrapperStyle={{ fontSize: 12, color: COLORS.muted }} />
            </PieChart>
          </ResponsiveContainer>
        </Panel>
      </div>

      {tendanceFournisseurData.length > 0 && (
        <Panel title="Évolution mensuelle par source (tonnes)" height={300}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={tendanceFournisseurData} margin={{ top: 24, left: -10, right: 10 }}>
              <CartesianGrid stroke={COLORS.panelBorder} vertical={false} />
              <XAxis dataKey="mois" tick={{ fill: COLORS.muted, fontSize: 11 }} tickFormatter={(m) => new Date(m).toLocaleDateString("fr-FR", { month: "short", year: "numeric" })} />
              <YAxis tick={{ fill: COLORS.muted, fontSize: 11 }} unit=" t" />
              <Tooltip contentStyle={{ background: COLORS.panel, border: `1px solid ${COLORS.panelBorder}`, borderRadius: 4 }} labelStyle={{ color: COLORS.text }} />
              <Legend wrapperStyle={{ fontSize: 12, color: COLORS.muted }} />
              <Bar dataKey="darty_conforme" name="Darty — conforme" stackId="darty" fill={COLORS.teal} />
              <Bar dataKey="darty_non_conforme" name="Darty — non conforme" stackId="darty" fill={COLORS.red} />
              <Bar dataKey="darty_non_eligible" name="Darty — non éligible au tri" stackId="darty" fill={COLORS.slate}>
                <LabelList dataKey="darty_taux" content={TauxLabel} />
              </Bar>
              <Bar dataKey="revolog_conforme" name="Revolog — conforme" stackId="revolog" fill={COLORS.blue} />
              <Bar dataKey="revolog_non_conforme" name="Revolog — non conforme" stackId="revolog" fill={COLORS.orange} />
              <Bar dataKey="revolog_non_eligible" name="Revolog — non éligible au tri" stackId="revolog" fill={COLORS.slate}>
                <LabelList dataKey="revolog_taux" content={TauxLabel} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Panel>
      )}

      {tendanceFournisseurData.length > 0 && (
        <Panel title="Évolution mensuelle par source (unités)" height={tendanceFournisseurData.length * 44 + 100}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr>
                <th></th>
                <th colSpan={3} style={{ textAlign: "center", padding: "6px", color: COLORS.teal, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 400, fontSize: 11, textTransform: "uppercase", borderBottom: `1px solid ${COLORS.panelBorder}` }}>Darty</th>
                <th colSpan={3} style={{ textAlign: "center", padding: "6px", color: COLORS.blue, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 400, fontSize: 11, textTransform: "uppercase", borderBottom: `1px solid ${COLORS.panelBorder}` }}>Revolog</th>
              </tr>
              <tr style={{ borderBottom: `1px solid ${COLORS.panelBorder}` }}>
                <th style={{ textAlign: "left", padding: "8px 6px", color: COLORS.muted, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 400, fontSize: 11, textTransform: "uppercase" }}>Mois</th>
                <th style={{ textAlign: "right", padding: "8px 6px", color: COLORS.muted, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 400, fontSize: 11, textTransform: "uppercase" }}>Conforme</th>
                <th style={{ textAlign: "right", padding: "8px 6px", color: COLORS.muted, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 400, fontSize: 11, textTransform: "uppercase" }}>Non conforme</th>
                <th style={{ textAlign: "right", padding: "8px 6px", color: COLORS.muted, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 400, fontSize: 11, textTransform: "uppercase" }}>Non éligible</th>
                <th style={{ textAlign: "right", padding: "8px 6px", color: COLORS.muted, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 400, fontSize: 11, textTransform: "uppercase" }}>Conforme</th>
                <th style={{ textAlign: "right", padding: "8px 6px", color: COLORS.muted, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 400, fontSize: 11, textTransform: "uppercase" }}>Non conforme</th>
                <th style={{ textAlign: "right", padding: "8px 6px", color: COLORS.muted, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 400, fontSize: 11, textTransform: "uppercase" }}>Non éligible</th>
              </tr>
            </thead>
            <tbody>
              {tendanceFournisseurData.map((r, i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${COLORS.panelBorder}` }}>
                  <td style={{ padding: "8px 6px", color: COLORS.text, fontFamily: "'IBM Plex Mono', monospace" }}>
                    {new Date(r.mois).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
                  </td>
                  <td style={{ padding: "8px 6px", color: COLORS.text, textAlign: "right", fontFamily: "'IBM Plex Mono', monospace" }}>{r.darty_nb_conforme}</td>
                  <td style={{ padding: "8px 6px", color: COLORS.text, textAlign: "right", fontFamily: "'IBM Plex Mono', monospace" }}>{r.darty_nb_non_conforme}</td>
                  <td style={{ padding: "8px 6px", color: COLORS.text, textAlign: "right", fontFamily: "'IBM Plex Mono', monospace" }}>{r.darty_nb_non_eligible}</td>
                  <td style={{ padding: "8px 6px", color: COLORS.text, textAlign: "right", fontFamily: "'IBM Plex Mono', monospace" }}>{r.revolog_nb_conforme}</td>
                  <td style={{ padding: "8px 6px", color: COLORS.text, textAlign: "right", fontFamily: "'IBM Plex Mono', monospace" }}>{r.revolog_nb_non_conforme}</td>
                  <td style={{ padding: "8px 6px", color: COLORS.text, textAlign: "right", fontFamily: "'IBM Plex Mono', monospace" }}>{r.revolog_nb_non_eligible}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      )}
    </div>
  );
}

function pivotFacturation(rows) {
  const byMonth = new Map();
  for (const m of TARGET_MONTHS) {
    byMonth.set(m, { mois: m, tonnes: 0, nb_eligible_tri: 0, nb_palettes: 0 });
  }
  for (const r of rows || []) {
    if (!byMonth.has(r.mois)) continue;
    byMonth.set(r.mois, {
      mois: r.mois,
      tonnes: r.tonnes || 0,
      nb_eligible_tri: r.nb_eligible_tri || 0,
      nb_palettes: r.nb_palettes || 0,
    });
  }
  return [...byMonth.values()].sort((a, b) => a.mois.localeCompare(b.mois));
}

function pivotFacturationFournisseur(rows) {
  const byMonth = new Map();
  for (const m of TARGET_MONTHS) {
    byMonth.set(m, { mois: m, darty_tonnage: 0, darty_eligible: 0, revolog_tonnage: 0, revolog_eligible: 0 });
  }
  for (const r of rows || []) {
    if (!byMonth.has(r.mois)) continue;
    const bucket = matchSupplierBucket(r.supplier_name);
    if (!bucket) continue;
    const row = byMonth.get(r.mois);
    row[`${bucket}_tonnage`] += (r.tonnes || 0) * 98;
    row[`${bucket}_eligible`] += (r.nb_eligible_tri || 0) * 2;
  }
  return [...byMonth.values()].sort((a, b) => a.mois.localeCompare(b.mois));
}

function FacturationDashboard({ data }) {
  const months = pivotFacturation(data?.facturation);
  const rows = months.map((r) => ({
    mois: r.mois,
    montant_tonnage: Math.round(r.tonnes * 98 * 100) / 100,
    montant_eligible: Math.round(r.nb_eligible_tri * 2 * 100) / 100,
    montant_palettes: Math.round(r.nb_palettes * 8 * 100) / 100,
  }));
  const total = rows.reduce((acc, r) => acc + r.montant_tonnage + r.montant_eligible + r.montant_palettes, 0);

  const fournisseurRows = pivotFacturationFournisseur(data?.facturation_fournisseur).map((r) => {
    const palettesRow = rows.find((x) => x.mois === r.mois);
    const palettes = palettesRow ? palettesRow.montant_palettes : 0;
    const round2 = (n) => Math.round(n * 100) / 100;
    return {
      mois: r.mois,
      darty_tonnage: round2(r.darty_tonnage),
      darty_eligible: round2(r.darty_eligible),
      revolog_tonnage: round2(r.revolog_tonnage),
      revolog_eligible: round2(r.revolog_eligible),
      palettes,
      total: round2(r.darty_tonnage + r.darty_eligible + r.revolog_tonnage + r.revolog_eligible + palettes),
    };
  });

  return (
    <div style={{ minHeight: "100%", background: COLORS.bg, fontFamily: "'IBM Plex Sans', sans-serif", padding: 28 }}>
      <style>{FONT_IMPORT}</style>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, letterSpacing: 2, color: COLORS.teal, textTransform: "uppercase", marginBottom: 6 }}>
          Ligne de tri — admin
        </div>
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 26, color: COLORS.text, margin: 0 }}>Facturation</h1>
      </div>

      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 20 }}>
        <KpiCard label="Total sur la période" value={Math.round(total * 100) / 100} unit="€" accent={COLORS.amber} />
      </div>

      <Panel title="Montants mensuels (€)" height={340}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rows} margin={{ left: -10, right: 10 }}>
            <CartesianGrid stroke={COLORS.panelBorder} vertical={false} />
            <XAxis dataKey="mois" tick={{ fill: COLORS.muted, fontSize: 11 }} tickFormatter={(m) => new Date(m).toLocaleDateString("fr-FR", { month: "short", year: "numeric" })} />
            <YAxis tick={{ fill: COLORS.muted, fontSize: 11 }} unit=" €" />
            <Tooltip contentStyle={{ background: COLORS.panel, border: `1px solid ${COLORS.panelBorder}`, borderRadius: 4 }} labelStyle={{ color: COLORS.text }} />
            <Legend wrapperStyle={{ fontSize: 12, color: COLORS.muted }} />
            <Bar dataKey="montant_tonnage" name="98 € × tonnes" fill={COLORS.teal} radius={[3, 3, 0, 0]} />
            <Bar dataKey="montant_eligible" name="2 € × unités éligibles au tri" fill={COLORS.amber} radius={[3, 3, 0, 0]} />
            <Bar dataKey="montant_palettes" name="8 € × palettes" fill={COLORS.blue} radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Panel>

      <Panel title="Détail par fournisseur (3 derniers mois)" height={rows.length * 44 + 100}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr>
              <th></th>
              <th colSpan={2} style={{ textAlign: "center", padding: "6px", color: COLORS.teal, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 400, fontSize: 11, textTransform: "uppercase", borderBottom: `1px solid ${COLORS.panelBorder}` }}>Darty</th>
              <th colSpan={2} style={{ textAlign: "center", padding: "6px", color: COLORS.blue, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 400, fontSize: 11, textTransform: "uppercase", borderBottom: `1px solid ${COLORS.panelBorder}` }}>Revolog</th>
              <th></th>
              <th></th>
            </tr>
            <tr style={{ borderBottom: `1px solid ${COLORS.panelBorder}` }}>
              <th style={{ textAlign: "left", padding: "8px 6px", color: COLORS.muted, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 400, fontSize: 11, textTransform: "uppercase" }}>Mois</th>
              <th style={{ textAlign: "right", padding: "8px 6px", color: COLORS.muted, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 400, fontSize: 11, textTransform: "uppercase" }}>Tonnage (€)</th>
              <th style={{ textAlign: "right", padding: "8px 6px", color: COLORS.muted, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 400, fontSize: 11, textTransform: "uppercase" }}>Unités éligibles au tri (€)</th>
              <th style={{ textAlign: "right", padding: "8px 6px", color: COLORS.muted, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 400, fontSize: 11, textTransform: "uppercase" }}>Tonnage (€)</th>
              <th style={{ textAlign: "right", padding: "8px 6px", color: COLORS.muted, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 400, fontSize: 11, textTransform: "uppercase" }}>Unités éligibles au tri (€)</th>
              <th style={{ textAlign: "right", padding: "8px 6px", color: COLORS.muted, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 400, fontSize: 11, textTransform: "uppercase" }}>Palettes (€)</th>
              <th style={{ textAlign: "right", padding: "8px 6px", color: COLORS.muted, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 400, fontSize: 11, textTransform: "uppercase" }}>Total (€)</th>
            </tr>
          </thead>
          <tbody>
            {fournisseurRows.map((r, i) => (
              <tr key={i} style={{ borderBottom: `1px solid ${COLORS.panelBorder}` }}>
                <td style={{ padding: "8px 6px", color: COLORS.text, fontFamily: "'IBM Plex Mono', monospace" }}>
                  {new Date(r.mois).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
                </td>
                <td style={{ padding: "8px 6px", color: COLORS.text, textAlign: "right", fontFamily: "'IBM Plex Mono', monospace" }}>{r.darty_tonnage}</td>
                <td style={{ padding: "8px 6px", color: COLORS.text, textAlign: "right", fontFamily: "'IBM Plex Mono', monospace" }}>{r.darty_eligible}</td>
                <td style={{ padding: "8px 6px", color: COLORS.text, textAlign: "right", fontFamily: "'IBM Plex Mono', monospace" }}>{r.revolog_tonnage}</td>
                <td style={{ padding: "8px 6px", color: COLORS.text, textAlign: "right", fontFamily: "'IBM Plex Mono', monospace" }}>{r.revolog_eligible}</td>
                <td style={{ padding: "8px 6px", color: COLORS.text, textAlign: "right", fontFamily: "'IBM Plex Mono', monospace" }}>{r.palettes}</td>
                <td style={{ padding: "8px 6px", color: COLORS.text, textAlign: "right", fontFamily: "'IBM Plex Mono', monospace", fontWeight: 700 }}>{r.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </div>
  );
}

function DataQualityKpi({ data }) {
  const dq = data?.data_quality;
  return (
    <div style={{ minHeight: "100%", background: COLORS.bg, fontFamily: "'IBM Plex Sans', sans-serif", padding: 28 }}>
      <style>{FONT_IMPORT}</style>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, letterSpacing: 2, color: COLORS.teal, textTransform: "uppercase", marginBottom: 6 }}>
          Ligne de tri — data quality
        </div>
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 26, color: COLORS.text, margin: 0 }}>Qualité des données de pesée</h1>
      </div>

      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, letterSpacing: 2, color: COLORS.teal, textTransform: "uppercase", marginBottom: 10 }}>
        Cohérence de poids
      </div>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 28 }}>
        <KpiCard
          label="Écart moyen (pesée réelle − référence)"
          value={dq?.ecart_moyen_kg ?? "—"}
          unit="kg"
          accent={COLORS.amber}
        />
        <KpiCard
          label="Écart moyen (% du poids)"
          value={dq?.ecart_moyen_pct ?? "—"}
          unit="%"
          accent={COLORS.orange}
        />
        <KpiCard
          label="Écart type"
          value={dq?.ecart_type_kg ?? "—"}
          unit="kg"
          accent={COLORS.blue}
        />
        <KpiCard label="Lignes comparées" value={dq?.nb_lignes_poids ?? "—"} accent={COLORS.slate} />
      </div>

      {["GEMF", "GEMHF", "PAM"].map((categ) => {
        const row = (data?.data_quality_categorie || []).find((r) => r.categ_code === categ);
        return (
          <div key={categ} style={{ marginBottom: 28 }}>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, letterSpacing: 2, color: COLORS.muted, textTransform: "uppercase", marginBottom: 10 }}>
              Cohérence de poids — {categ}
            </div>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              <KpiCard
                label="Écart moyen (pesée réelle − référence)"
                value={row?.ecart_moyen_kg ?? "—"}
                unit="kg"
                accent={COLORS.amber}
              />
              <KpiCard
                label="Écart moyen (% du poids)"
                value={row?.ecart_moyen_pct ?? "—"}
                unit="%"
                accent={COLORS.orange}
              />
              <KpiCard
                label="Écart type"
                value={row?.ecart_type_kg ?? "—"}
                unit="kg"
                accent={COLORS.blue}
              />
              <KpiCard label="Lignes comparées" value={row?.nb_lignes ?? "—"} accent={COLORS.slate} />
            </div>
          </div>
        );
      })}

      <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 26, color: COLORS.text, margin: "0 0 16px 0" }}>
        Qualité des données de tri
      </h1>
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, letterSpacing: 2, color: COLORS.teal, textTransform: "uppercase", marginBottom: 10 }}>
        Cohérence de données
      </div>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
        <KpiCard
          label="% de lignes avec serial_number vide"
          value={dq?.pct_serial_vide ?? "—"}
          unit="%"
          accent={COLORS.red}
        />
        <KpiCard
          label="Non-respect du cahier des charges"
          value={dq?.pct_non_respect_cdc ?? "—"}
          unit="%"
          accent={COLORS.red}
          tooltip="Nombre d'appareils conformes bien que non éligibles au tri (âge) / nombre d'appareils total"
        />
        <KpiCard
          label="Référence JDME incohérente"
          value={dq?.pct_ref_jdme_incoherente ?? "—"}
          unit="%"
          accent={COLORS.orange}
          tooltip="Nombre d'appareils avec une référence JDME ne respectant pas les REGEX / nombre d'appareils total"
        />
        <KpiCard
          label="À régulariser"
          value={dq?.pct_a_regulariser ?? "—"}
          unit="%"
          accent={COLORS.amber}
          tooltip="Nombre d'appareils créés depuis plus de 7 jours qui ne sont pas validés en sortie / nombre d'appareils total"
        />
        <KpiCard label="Lignes totales" value={dq?.nb_lignes_total ?? "—"} accent={COLORS.slate} />
      </div>
    </div>
  );
}

const PREFIX_LABELS = {
  "DAR-DEEE-PHU-": "Darty",
  "REV-JDME-PHU-": "JDME",
};

function StatutBadge({ label, color }) {
  return (
    <span style={{
      display: "inline-block", padding: "3px 10px", borderRadius: 12,
      fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 500,
      color, border: `1px solid ${color}`, background: `${color}1A`,
    }}>
      {label}
    </span>
  );
}

function EcosystemDashboard({ token, isAdmin }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pendingIds, setPendingIds] = useState({});

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchEcosystemStatus(token);
      setRows(data.lots || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const ids = Object.keys(pendingIds);
    if (ids.length === 0) return;
    const interval = setInterval(async () => {
      try {
        const data = await fetchEcosystemStatus(token);
        setRows(data.lots || []);
        const stillPending = {};
        (data.lots || []).forEach((r) => {
          const key = `${r.prefix}|${r.business_date}`;
          if (pendingIds[key] && r.request_status === "pending") stillPending[key] = true;
        });
        setPendingIds(stillPending);
      } catch (err) {
        // silencieux, on retentera au prochain intervalle
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [pendingIds, token]);

  const handleDeclare = async (row) => {
    const key = `${row.prefix}|${row.business_date}`;
    setPendingIds((p) => ({ ...p, [key]: true }));
    try {
      await requestDeclaration(token, row.prefix, row.business_date);
    } catch (err) {
      setError(err.message);
      setPendingIds((p) => {
        const next = { ...p };
        delete next[key];
        return next;
      });
    }
  };

  const renderStatut = (row) => {
    const key = `${row.prefix}|${row.business_date}`;
    if (pendingIds[key] || row.request_status === "pending" || row.request_status === "processing") {
      return <StatutBadge label="En cours..." color={COLORS.amber} />;
    }
    if (row.declared) {
      return <StatutBadge label="Déclaré" color={COLORS.teal} />;
    }
    if (!row.weights_complete) {
      return <StatutBadge label="Pesée incomplète" color={COLORS.slate} />;
    }
    if (!row.archived) {
      return <StatutBadge label="Non archivé" color={COLORS.slate} />;
    }
    if (row.request_status === "failed") {
      return <StatutBadge label="Échec" color={COLORS.red} />;
    }
    return <StatutBadge label="Prêt" color={COLORS.blue} />;
  };

  const canDeclare = (row) => {
    const key = `${row.prefix}|${row.business_date}`;
    return isAdmin && !row.declared && row.weights_complete && row.archived && !pendingIds[key] && row.request_status !== "processing";
  };

  const GROUP_CENTRE_TRI_ID = "212e6d67-6165-42c3-a2c4-6b21335caf7b";
  const GROUP_OSV_ID = "9a0b4aac-53d1-413c-8cc8-1f48e4ced9b2";
  const centreTriRows = rows.filter((r) => r.group_id === GROUP_CENTRE_TRI_ID);
  const osvRows = rows.filter((r) => r.group_id === GROUP_OSV_ID);

  const renderTable = (tableRows, useSupplierName = false) => (
    <div style={{ height: "100%", overflowY: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: `1px solid ${COLORS.panelBorder}` }}>
            <th style={{ textAlign: "left", padding: "8px 6px", color: COLORS.muted, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 400, fontSize: 11, textTransform: "uppercase" }}>Date</th>
            <th style={{ textAlign: "left", padding: "8px 6px", color: COLORS.muted, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 400, fontSize: 11, textTransform: "uppercase" }}>Source</th>
            <th style={{ textAlign: "left", padding: "8px 6px", color: COLORS.muted, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 400, fontSize: 11, textTransform: "uppercase" }}>Lots</th>
            <th style={{ textAlign: "left", padding: "8px 6px", color: COLORS.muted, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 400, fontSize: 11, textTransform: "uppercase" }}>Statut</th>
            <th style={{ textAlign: "left", padding: "8px 6px", color: COLORS.muted, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 400, fontSize: 11, textTransform: "uppercase" }}>Détail</th>
            {isAdmin && <th style={{ textAlign: "right", padding: "8px 6px", color: COLORS.muted, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 400, fontSize: 11, textTransform: "uppercase" }}>Action</th>}
          </tr>
        </thead>
        <tbody>
          {tableRows.map((row, i) => (
            <tr key={i} style={{ borderBottom: `1px solid ${COLORS.panelBorder}` }}>
              <td style={{ padding: "8px 6px", color: COLORS.text, fontFamily: "'IBM Plex Mono', monospace" }}>
                {new Date(row.business_date).toLocaleDateString("fr-FR")}
              </td>
              <td style={{ padding: "8px 6px", color: COLORS.text }}>{useSupplierName ? (row.supplier_name || "—") : (PREFIX_LABELS[row.prefix] || row.prefix)}</td>
              <td style={{ padding: "8px 6px", color: COLORS.muted, fontSize: 12 }}>{(row.lot_names || []).join(", ")}</td>
              <td style={{ padding: "8px 6px" }}>{renderStatut(row)}</td>
              <td style={{ padding: "8px 6px", color: COLORS.muted, fontSize: 12 }}>
                {row.last_error ? row.last_error.slice(0, 80) : (row.request_message ? row.request_message.slice(0, 80) : "—")}
              </td>
              {isAdmin && (
                <td style={{ padding: "8px 6px", textAlign: "right" }}>
                  <button
                    onClick={() => handleDeclare(row)}
                    disabled={!canDeclare(row)}
                    style={{
                      background: canDeclare(row) ? COLORS.teal : "transparent",
                      color: canDeclare(row) ? "#0F1517" : COLORS.muted,
                      border: canDeclare(row) ? "none" : `1px solid ${COLORS.panelBorder}`,
                      borderRadius: 3, padding: "6px 14px", cursor: canDeclare(row) ? "pointer" : "not-allowed",
                      fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 12,
                      opacity: canDeclare(row) ? 1 : 0.6,
                    }}
                  >
                    Déclarer
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div style={{ minHeight: "100%", background: COLORS.bg, fontFamily: "'IBM Plex Sans', sans-serif", padding: 28 }}>
      <style>{FONT_IMPORT}</style>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24 }}>
        <div>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, letterSpacing: 2, color: COLORS.teal, textTransform: "uppercase", marginBottom: 6 }}>
            Centre de tri - Ecosystem
          </div>
        </div>
        <button onClick={load} style={{ background: "transparent", border: `1px solid ${COLORS.panelBorder}`, color: COLORS.muted, padding: "8px 16px", borderRadius: 3, cursor: "pointer", fontSize: 13, fontFamily: "'IBM Plex Mono', monospace" }}>
          Rafraîchir
        </button>
      </div>

      {error && (
        <div style={{ background: "rgba(201,112,100,0.1)", border: `1px solid ${COLORS.red}`, color: COLORS.red, padding: "10px 14px", borderRadius: 4, marginBottom: 16, fontSize: 13, fontFamily: "'IBM Plex Mono', monospace" }}>
          {error}
        </div>
      )}

      <Panel title={`Centre de tri - Ecosystem (${centreTriRows.length})`} height={Math.max(centreTriRows.length * 44 + 60, 200)}>
        {loading ? (
          <div style={{ color: COLORS.muted, padding: 20 }}>Chargement...</div>
        ) : (
          renderTable(centreTriRows)
        )}
      </Panel>

      <div style={{ height: 20 }} />

      <Panel title={`Opérateur de seconde vie - Doneo ESS (${osvRows.length})`} height={Math.max(osvRows.length * 44 + 60, 200)}>
        {loading ? (
          <div style={{ color: COLORS.muted, padding: 20 }}>Chargement...</div>
        ) : (
          renderTable(osvRows, true)
        )}
      </Panel>
    </div>
  );
}

const ALL_TABS = [
  { key: "centre_tri", label: "Centre de tri" },
  { key: "seconde_vie", label: "Opérateur de seconde vie" },
  { key: "data_quality", label: "Data quality" },
  { key: "ecosystem", label: "Déclaration" },
  { key: "facturation", label: "Facturation" },
];

function TabbedDashboard({ token, data, onRefresh, onLock }) {
  const tabs = data?.profil === "operationnel" ? ALL_TABS.filter((t) => t.key !== "facturation") : ALL_TABS;
  const [tab, setTab] = useState(tabs[0].key);

  return (
    <div style={{ minHeight: "100%", background: COLORS.bg }}>
      <div style={{ display: "flex", gap: 4, padding: "16px 28px 0", borderBottom: `1px solid ${COLORS.panelBorder}` }}>
        <style>{FONT_IMPORT}</style>
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              background: "transparent",
              border: "none",
              borderBottom: tab === t.key ? `2px solid ${COLORS.teal}` : "2px solid transparent",
              color: tab === t.key ? COLORS.text : COLORS.muted,
              padding: "10px 16px",
              cursor: "pointer",
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 12,
              letterSpacing: 0.5,
              textTransform: "uppercase",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === "centre_tri" && <Dashboard data={data} onRefresh={onRefresh} onLock={onLock} />}
      {tab === "facturation" && <FacturationDashboard data={data} />}
      {tab === "seconde_vie" && <OSVDashboard data={data} token={token} onRefresh={onRefresh} />}
      {tab === "data_quality" && <DataQualityKpi data={data} />}
      {tab === "ecosystem" && <EcosystemDashboard token={token} isAdmin={data?.editable === true} />}
    </div>
  );
}

export default function App() {
  const [token, setToken] = useState(null);
  const [data, setData] = useState(null);

  const handleUnlock = (t, d) => { setToken(t); setData(d); };
  const handleRefresh = async () => {
    try { setData(await fetchDashboard(token)); } catch (e) { setToken(null); setData(null); }
  };
  const handleLock = () => { setToken(null); setData(null); };

  if (!token) return <TokenScreen onUnlock={handleUnlock} />;
  return <TabbedDashboard token={token} data={data} onRefresh={handleRefresh} onLock={handleLock} />;
}
