import React, { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend, LabelList
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

const TARGET_MONTHS = ["2026-06-01", "2026-07-01", "2026-08-01"];

function matchSupplierBucket(name) {
  const n = (name || "").toLowerCase();
  if (n.includes("darty")) return "darty";
  if (n.includes("revoloop")) return "revoloop";
  return null;
}

function pivotTendanceFournisseur(rows) {
  const byMonth = new Map();
  for (const m of TARGET_MONTHS) {
    byMonth.set(m, {
      mois: m,
      darty_conforme: 0, darty_non_conforme: 0, darty_taux: null,
      revoloop_conforme: 0, revoloop_non_conforme: 0, revoloop_taux: null,
    });
  }
  for (const r of rows || []) {
    const bucket = matchSupplierBucket(r.supplier_name);
    if (!bucket || !byMonth.has(r.mois)) continue;
    const row = byMonth.get(r.mois);
    const poidsConformeT = (r.poids_conforme_kg || 0) / 1000;
    const poidsNonConformeT = (r.poids_non_conforme_kg || 0) / 1000;
    const total = r.nb_devices || 0;
    const taux = total > 0 ? Math.round(((r.nb_conformes || 0) / total) * 100) : null;
    row[`${bucket}_conforme`] = Math.round(poidsConformeT * 100) / 100;
    row[`${bucket}_non_conforme`] = Math.round(poidsNonConformeT * 100) / 100;
    row[`${bucket}_taux`] = taux;
  }
  return [...byMonth.values()].sort((a, b) => a.mois.localeCompare(b.mois));
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
        <KpiCard label="Poids total" value={poidsTotalTonnes} unit="t" accent={COLORS.amber} />
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

      {tendanceFournisseurData.length > 0 && (
        <Panel title="Évolution mensuelle par fournisseur (tonnes)" height={300}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={tendanceFournisseurData} margin={{ top: 24, left: -10, right: 10 }}>
              <CartesianGrid stroke={COLORS.panelBorder} vertical={false} />
              <XAxis dataKey="mois" tick={{ fill: COLORS.muted, fontSize: 11 }} tickFormatter={(m) => new Date(m).toLocaleDateString("fr-FR", { month: "short", year: "numeric" })} />
              <YAxis tick={{ fill: COLORS.muted, fontSize: 11 }} unit=" t" />
              <Tooltip contentStyle={{ background: COLORS.panel, border: `1px solid ${COLORS.panelBorder}`, borderRadius: 4 }} labelStyle={{ color: COLORS.text }} />
              <Legend wrapperStyle={{ fontSize: 12, color: COLORS.muted }} />
              <Bar dataKey="darty_conforme" name="Darty — conforme" stackId="darty" fill={COLORS.teal} />
              <Bar dataKey="darty_non_conforme" name="Darty — non conforme" stackId="darty" fill={COLORS.red}>
                <LabelList dataKey="darty_taux" content={TauxLabel} />
              </Bar>
              <Bar dataKey="revoloop_conforme" name="Revoloop — conforme" stackId="revoloop" fill={COLORS.teal} fillOpacity={0.55} />
              <Bar dataKey="revoloop_non_conforme" name="Revoloop — non conforme" stackId="revoloop" fill={COLORS.red} fillOpacity={0.55}>
                <LabelList dataKey="revoloop_taux" content={TauxLabel} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Panel>
      )}
    </div>
  );
}

function AdminDashboard({ data, onRefresh, onLock }) {
  const [tab, setTab] = useState("centre_tri");
  const tabs = [
    { key: "centre_tri", label: "Centre de tri" },
    { key: "seconde_vie", label: "Opérateur de seconde vie" },
    { key: "data_quality", label: "Data quality" },
  ];

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
      {tab === "centre_tri" ? (
        <Dashboard data={data} onRefresh={onRefresh} onLock={onLock} />
      ) : (
        <ComingSoonScreen profil={tab} onLock={onLock} />
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
  if (data?.profil === "admin") {
    return <AdminDashboard data={data} onRefresh={handleRefresh} onLock={handleLock} />;
  }
  if (data?.profil === "centre_tri") {
    return <Dashboard data={data} onRefresh={handleRefresh} onLock={handleLock} />;
  }
  return <ComingSoonScreen profil={data?.profil} onLock={handleLock} />;
}
