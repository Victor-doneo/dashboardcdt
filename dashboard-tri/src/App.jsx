import React, { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from "recharts";

const SUPABASE_URL = "https://zvqoxgugzfxbkhmqgvdk.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2cW94Z3VnemZ4YmtobXFndmRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4MjUzMDcsImV4cCI6MjA2NjQwMTMwN30.vdpTmNn2yhu1mnbmC-LamuvBvqD_Q8DGZ2GYNEZyux0";

const COLORS = {
  bg: "#1B2124", panel: "#232A2E", panelBorder: "#323B40", text: "#E8EAE6",
  muted: "#8B9499", teal: "#4FA894", amber: "#E0A458", slate: "#6B7B8C", red: "#C97064",
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

function KpiCard({ label, value, unit, accent }) {
  return (
    <div style={{ background: COLORS.panel, border: `1px solid ${COLORS.panelBorder}`, borderRadius: 4, padding: "18px 20px", flex: 1, minWidth: 140, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, width: 3, height: "100%", background: accent }} />
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, letterSpacing: 1.5, color: COLORS.muted, textTransform: "uppercase", marginBottom: 10 }}>{label}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
        <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 28, color: COLORS.text }}>{value}</span>
        {unit && <span style={{ fontSize: 13, color: COLORS.muted }}>{unit}</span>}
      </div>
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

function Dashboard({ data, onRefresh, onLock }) {
  const { par_type = [], totaux = {}, tendance = [] } = data || {};
  const pieData = [
    { name: "Conformes", value: totaux.total_conformes ?? 0, color: COLORS.teal },
    { name: "Non conformes", value: totaux.total_non_conformes ?? 0, color: COLORS.red },
    { name: "En attente", value: totaux.total_en_attente ?? 0, color: COLORS.slate },
  ];

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
        <KpiCard label="En attente" value={totaux.total_en_attente ?? "—"} accent={COLORS.slate} />
        <KpiCard label="Poids total" value={totaux.poids_total_kg ?? "—"} unit="kg" accent={COLORS.amber} />
      </div>

      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 14 }}>
        <Panel title="Répartition par type d'appareil">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={par_type} margin={{ left: -10, right: 10 }}>
              <CartesianGrid stroke={COLORS.panelBorder} vertical={false} />
              <XAxis dataKey="device_type" tick={{ fill: COLORS.muted, fontSize: 11 }} interval={0} angle={-25} textAnchor="end" height={70} />
              <YAxis tick={{ fill: COLORS.muted, fontSize: 11 }} />
              <Tooltip contentStyle={{ background: COLORS.panel, border: `1px solid ${COLORS.panelBorder}`, borderRadius: 4 }} labelStyle={{ color: COLORS.text }} />
              <Bar dataKey="nb_devices" name="Appareils" fill={COLORS.teal} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Statut de conformité">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={2}>
                {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: COLORS.panel, border: `1px solid ${COLORS.panelBorder}`, borderRadius: 4 }} />
              <Legend wrapperStyle={{ fontSize: 12, color: COLORS.muted }} />
            </PieChart>
          </ResponsiveContainer>
        </Panel>
      </div>

      {tendance.length > 0 && (
        <Panel title="Évolution mensuelle" height={240}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={tendance} margin={{ left: -10, right: 10 }}>
              <CartesianGrid stroke={COLORS.panelBorder} vertical={false} />
              <XAxis dataKey="mois" tick={{ fill: COLORS.muted, fontSize: 11 }} />
              <YAxis tick={{ fill: COLORS.muted, fontSize: 11 }} />
              <Tooltip contentStyle={{ background: COLORS.panel, border: `1px solid ${COLORS.panelBorder}`, borderRadius: 4 }} labelStyle={{ color: COLORS.text }} />
              <Line type="monotone" dataKey="nb_devices" name="Appareils" stroke={COLORS.teal} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Panel>
      )}
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
  return <Dashboard data={data} onRefresh={handleRefresh} onLock={handleLock} />;
}
