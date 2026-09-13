import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "./supabaseClient";
import {
  LayoutDashboard, ArrowLeftRight, Landmark, ArrowUpCircle, ArrowDownCircle,
  FileBarChart, FileText, Building2, ChevronDown, Check, Plus, Users,
  TrendingUp, TrendingDown, AlertCircle, LogOut, QrCode
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

const T = {
  paper: "#F6F5F1", ink: "#1B231F", inkSoft: "#54615A", line: "#DAD7CC",
  panel: "#FFFFFF", teal: "#0E6B5C", tealSoft: "#E3EFEA",
  amber: "#B4802B", amberSoft: "#F5EADA", brick: "#9C4430", brickSoft: "#F2E3DE",
};

const fmt = (n) => (n || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const fmtDate = (d) => d ? new Date(d + "T00:00").toLocaleDateString("pt-BR") : "—";

function StatusPill({ children, tone = "neutral" }) {
  const tones = {
    neutral: { bg: T.line, fg: T.inkSoft }, good: { bg: T.tealSoft, fg: T.teal },
    warn: { bg: T.amberSoft, fg: T.amber }, bad: { bg: T.brickSoft, fg: T.brick },
  };
  const c = tones[tone];
  return <span style={{ background: c.bg, color: c.fg, fontSize: 12.5, padding: "3px 9px", borderRadius: 5, fontWeight: 600, whiteSpace: "nowrap" }}>{children}</span>;
}
function Panel({ children, style }) {
  return <div style={{ background: T.panel, border: `1px solid ${T.line}`, borderRadius: 10, ...style }}>{children}</div>;
}
function SectionTitle({ children, sub }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 600, color: T.ink, margin: 0 }}>{children}</h2>
      {sub && <p style={{ color: T.inkSoft, fontSize: 14, margin: "4px 0 0" }}>{sub}</p>}
    </div>
  );
}
function Field({ label, children }) {
  return <label style={{ fontSize: 12.5, color: T.inkSoft, fontWeight: 600, display: "block" }}>{label}{children}</label>;
}
const inputStyle = { width: "100%", marginTop: 5, padding: "8px 10px", border: `1px solid ${T.line}`, borderRadius: 7, fontSize: 13.5, boxSizing: "border-box" };
const btnPrimary = { display: "flex", alignItems: "center", justifyContent: "center", gap: 7, background: T.teal, color: "#fff", border: "none", borderRadius: 7, padding: "9px 12px", fontWeight: 600, fontSize: 13.5 };
const btnGhost = { border: `1px solid ${T.line}`, background: "transparent", borderRadius: 6, padding: "5px 10px", fontSize: 12.5, cursor: "pointer" };

// ---------------- AUTH SCREEN ----------------
function AuthScreen() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState("");

  async function submit(e) {
    e.preventDefault();
    setError(""); setInfo(""); setLoading(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setInfo("Conta criada! Verifique seu e-mail para confirmar o cadastro, depois faça login.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: T.paper, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', sans-serif" }}>
      <Panel style={{ padding: 30, width: 340 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 22 }}>
          <div style={{ width: 26, height: 26, borderRadius: 6, background: T.teal, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#fff", fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: 15 }}>N</span>
          </div>
          <span style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 18 }}>Fava Controller</span>
        </div>
        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Field label="E-mail">
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
          </Field>
          <Field label="Senha">
            <input type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} />
          </Field>
          {error && <div style={{ color: T.brick, fontSize: 13 }}>{error}</div>}
          {info && <div style={{ color: T.teal, fontSize: 13 }}>{info}</div>}
          <button disabled={loading} type="submit" style={{ ...btnPrimary, marginTop: 4 }}>
            {loading ? "Aguarde…" : mode === "login" ? "Entrar" : "Criar conta"}
          </button>
        </form>
        <button onClick={() => { setMode(m => m === "login" ? "signup" : "login"); setError(""); setInfo(""); }}
          style={{ background: "none", border: "none", color: T.inkSoft, fontSize: 12.5, marginTop: 14, width: "100%", textAlign: "center" }}>
          {mode === "login" ? "Não tem conta? Criar uma agora" : "Já tem conta? Entrar"}
        </button>
      </Panel>
    </div>
  );
}

// ---------------- EMPTY STATE: create first company ----------------
function CriarEmpresa({ userId, onCreated }) {
  const [nome, setNome] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function criar(e) {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const { data: empresa, error: e1 } = await supabase.from("empresas").insert({ nome, cnpj }).select().single();
      if (e1) throw e1;
      const { error: e2 } = await supabase.from("empresa_usuarios").insert({ empresa_id: empresa.id, usuario_id: userId, papel: "admin" });
      if (e2) throw e2;
      onCreated(empresa);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: T.paper, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', sans-serif" }}>
      <Panel style={{ padding: 30, width: 360 }}>
        <SectionTitle sub="Você ainda não tem nenhuma empresa cadastrada. Comece criando a primeira — as demais você adiciona depois, uma por vez.">
          Cadastrar primeira empresa
        </SectionTitle>
        <form onSubmit={criar} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Field label="Nome da empresa"><input required value={nome} onChange={e => setNome(e.target.value)} style={inputStyle} /></Field>
          <Field label="CNPJ (opcional)"><input value={cnpj} onChange={e => setCnpj(e.target.value)} style={inputStyle} /></Field>
          {error && <div style={{ color: T.brick, fontSize: 13 }}>{error}</div>}
          <button disabled={loading} type="submit" style={btnPrimary}><Plus size={14} /> {loading ? "Criando…" : "Criar empresa"}</button>
        </form>
      </Panel>
    </div>
  );
}

// ---------------- MAIN APP ----------------
export default function App() {
  const [session, setSession] = useState(undefined); // undefined = loading
  const [empresas, setEmpresas] = useState(null); // null = loading
  const [company, setCompany] = useState(null);
  const [companyMenuOpen, setCompanyMenuOpen] = useState(false);
  const [tab, setTab] = useState("dashboard");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return;
    loadEmpresas();
  }, [session]);

  async function loadEmpresas() {
    const { data, error } = await supabase.from("empresas").select("*").order("nome");
    if (!error) {
      setEmpresas(data);
      if (data.length > 0) setCompany(c => c || data[0]);
    }
  }

  if (session === undefined) return null; // splash / loading
  if (!session) return <AuthScreen />;
  if (empresas === null) return null;
  if (empresas.length === 0) {
    return <CriarEmpresa userId={session.user.id} onCreated={(e) => { setEmpresas([e]); setCompany(e); }} />;
  }

  return (
    <Dashboard
      session={session}
      empresas={empresas}
      company={company}
      setCompany={setCompany}
      companyMenuOpen={companyMenuOpen}
      setCompanyMenuOpen={setCompanyMenuOpen}
      tab={tab}
      setTab={setTab}
      onEmpresaCriada={(e) => { setEmpresas(prev => [...prev, e]); setCompany(e); }}
    />
  );
}

// ---------------- DASHBOARD SHELL + DATA ----------------
function Dashboard({ session, empresas, company, setCompany, companyMenuOpen, setCompanyMenuOpen, tab, setTab, onEmpresaCriada }) {
  const [lancamentos, setLancamentos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [pagar, setPagar] = useState([]);
  const [receber, setReceber] = useState([]);
  const [emissoes, setEmissoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNovaEmpresa, setShowNovaEmpresa] = useState(false);

  useEffect(() => { if (company) loadAll(company.id); }, [company]);

  async function loadAll(empresaId) {
    setLoading(true);
    const [l, c, p, r, e] = await Promise.all([
      supabase.from("lancamentos").select("*").eq("empresa_id", empresaId).order("data", { ascending: false }),
      supabase.from("clientes").select("*").eq("empresa_id", empresaId).order("nome"),
      supabase.from("contas_pagar").select("*").eq("empresa_id", empresaId).order("vencimento"),
      supabase.from("contas_receber").select("*, clientes(nome)").eq("empresa_id", empresaId).order("vencimento"),
      supabase.from("emissoes").select("*, clientes(nome)").eq("empresa_id", empresaId).order("criado_em", { ascending: false }),
    ]);
    setLancamentos(l.data || []);
    setClientes(c.data || []);
    setPagar(p.data || []);
    setReceber(r.data || []);
    setEmissoes(e.data || []);
    setLoading(false);
  }

  const totals = useMemo(() => {
    const entradas = lancamentos.filter(l => l.tipo === "entrada").reduce((s, l) => s + Number(l.valor), 0);
    const saidas = lancamentos.filter(l => l.tipo === "saida").reduce((s, l) => s + Number(l.valor), 0);
    const aPagar = pagar.filter(p => p.status !== "pago").reduce((s, p) => s + Number(p.valor), 0);
    const aReceber = receber.filter(r => r.status !== "recebido").reduce((s, r) => s + Number(r.valor), 0);
    const pendConcil = lancamentos.filter(l => !l.conciliado).length;
    return { entradas, saidas, aPagar, aReceber, pendConcil };
  }, [lancamentos, pagar, receber]);

  const NAV = [
    { id: "dashboard", label: "Painel", icon: LayoutDashboard },
    { id: "lancamentos", label: "Lançamentos", icon: ArrowLeftRight },
    { id: "clientes", label: "Clientes", icon: Users },
    { id: "pagar", label: "Contas a Pagar", icon: ArrowDownCircle },
    { id: "receber", label: "Contas a Receber", icon: ArrowUpCircle },
    { id: "relatorios", label: "Relatórios", icon: FileBarChart },
    { id: "emissao", label: "Notas & Boletos", icon: FileText },
  ];

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: T.paper, minHeight: "100vh", color: T.ink, display: "flex" }}>
      <style>{`
        * { box-sizing: border-box; } button { font-family: inherit; cursor: pointer; }
        table { border-collapse: collapse; width: 100%; }
        th { text-align: left; font-size: 12.5px; color: ${T.inkSoft}; font-weight: 600; padding: 8px 14px; border-bottom: 1px solid ${T.line}; }
        td { padding: 12px 14px; border-bottom: 1px solid ${T.line}; font-size: 14px; }
        tr:last-child td { border-bottom: none; }
      `}</style>

      <div style={{ width: 232, borderRight: `1px solid ${T.line}`, padding: "22px 14px", display: "flex", flexDirection: "column", gap: 22, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "0 8px" }}>
          <div style={{ width: 26, height: 26, borderRadius: 6, background: T.teal, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#fff", fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: 15 }}>N</span>
          </div>
          <span style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 17 }}>Fava Controller</span>
        </div>

        <div style={{ position: "relative" }}>
          <button onClick={() => setCompanyMenuOpen(o => !o)} style={{ width: "100%", background: T.panel, border: `1px solid ${T.line}`, borderRadius: 8, padding: "9px 10px", display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, textAlign: "left" }}>
            <Building2 size={15} color={T.inkSoft} />
            <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 500 }}>{company.nome}</span>
            <ChevronDown size={14} color={T.inkSoft} />
          </button>
          {companyMenuOpen && (
            <div style={{ position: "absolute", top: "108%", left: 0, right: 0, background: T.panel, border: `1px solid ${T.line}`, borderRadius: 8, zIndex: 10, overflow: "hidden", boxShadow: "0 6px 20px rgba(0,0,0,0.08)" }}>
              {empresas.map(c => (
                <button key={c.id} onClick={() => { setCompany(c); setCompanyMenuOpen(false); }} style={{ width: "100%", background: c.id === company.id ? T.tealSoft : "transparent", border: "none", padding: "10px 12px", textAlign: "left", fontSize: 13 }}>
                  <div style={{ fontWeight: 500 }}>{c.nome}</div>
                  {c.cnpj && <div style={{ color: T.inkSoft, fontSize: 11.5 }}>{c.cnpj}</div>}
                </button>
              ))}
              <button onClick={() => { setShowNovaEmpresa(true); setCompanyMenuOpen(false); }} style={{ width: "100%", background: "transparent", border: "none", borderTop: `1px solid ${T.line}`, padding: "10px 12px", textAlign: "left", fontSize: 13, color: T.teal, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                <Plus size={14} /> Nova empresa
              </button>
            </div>
          )}
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {NAV.map(n => {
            const Icon = n.icon; const active = tab === n.id;
            return (
              <button key={n.id} onClick={() => setTab(n.id)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 7, border: "none", background: active ? T.tealSoft : "transparent", color: active ? T.teal : T.ink, fontWeight: active ? 600 : 500, fontSize: 13.8, textAlign: "left" }}>
                <Icon size={16} />{n.label}
                {n.id === "lancamentos" && totals.pendConcil > 0 && (
                  <span style={{ marginLeft: "auto", background: T.amber, color: "#fff", fontSize: 11, borderRadius: 10, padding: "1px 6px", fontWeight: 700 }}>{totals.pendConcil}</span>
                )}
              </button>
            );
          })}
        </nav>

        <button onClick={() => supabase.auth.signOut()} style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: 8, background: "transparent", border: "none", color: T.inkSoft, fontSize: 13, padding: "8px 10px" }}>
          <LogOut size={15} /> Sair ({session.user.email})
        </button>
      </div>

      <div style={{ flex: 1, padding: "26px 32px", minWidth: 0, overflowX: "auto" }}>
        {showNovaEmpresa && (
          <NovaEmpresaModal userId={session.user.id} onClose={() => setShowNovaEmpresa(false)} onCreated={(e) => { onEmpresaCriada(e); setShowNovaEmpresa(false); }} />
        )}
        {loading ? (
          <div style={{ color: T.inkSoft }}>Carregando…</div>
        ) : (
          <>
            {tab === "dashboard" && <PainelTab company={company} totals={totals} lancamentos={lancamentos} pagar={pagar} receber={receber} />}
            {tab === "lancamentos" && <LancamentosTab company={company} lancamentos={lancamentos} reload={() => loadAll(company.id)} />}
            {tab === "clientes" && <ClientesTab company={company} clientes={clientes} reload={() => loadAll(company.id)} />}
            {tab === "pagar" && <PagarTab company={company} pagar={pagar} reload={() => loadAll(company.id)} />}
            {tab === "receber" && <ReceberTab company={company} receber={receber} clientes={clientes} reload={() => loadAll(company.id)} />}
            {tab === "relatorios" && <RelatoriosTab company={company} lancamentos={lancamentos} pagar={pagar} receber={receber} />}
            {tab === "emissao" && <EmissaoTab company={company} emissoes={emissoes} clientes={clientes} reload={() => loadAll(company.id)} />}
          </>
        )}
      </div>
    </div>
  );
}

function NovaEmpresaModal({ userId, onClose, onCreated }) {
  const [nome, setNome] = useState(""); const [cnpj, setCnpj] = useState("");
  const [loading, setLoading] = useState(false); const [error, setError] = useState("");
  async function criar(e) {
    e.preventDefault(); setLoading(true); setError("");
    try {
      const { data: empresa, error: e1 } = await supabase.from("empresas").insert({ nome, cnpj }).select().single();
      if (e1) throw e1;
      const { error: e2 } = await supabase.from("empresa_usuarios").insert({ empresa_id: empresa.id, usuario_id: userId, papel: "admin" });
      if (e2) throw e2;
      onCreated(empresa);
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  }
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(27,35,31,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
      <Panel style={{ padding: 24, width: 320 }}>
        <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 14 }}>Nova empresa</div>
        <form onSubmit={criar} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Field label="Nome"><input required value={nome} onChange={e => setNome(e.target.value)} style={inputStyle} /></Field>
          <Field label="CNPJ (opcional)"><input value={cnpj} onChange={e => setCnpj(e.target.value)} style={inputStyle} /></Field>
          {error && <div style={{ color: T.brick, fontSize: 13 }}>{error}</div>}
          <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
            <button type="button" onClick={onClose} style={{ ...btnGhost, flex: 1 }}>Cancelar</button>
            <button disabled={loading} type="submit" style={{ ...btnPrimary, flex: 1 }}>{loading ? "Criando…" : "Criar"}</button>
          </div>
        </form>
      </Panel>
    </div>
  );
}

// ---------------- TABS ----------------
function PainelTab({ company, totals, lancamentos, pagar, receber }) {
  const chartData = useMemo(() => {
    const byDay = {};
    lancamentos.forEach(l => {
      byDay[l.data] = byDay[l.data] || { data: l.data, entradas: 0, saidas: 0 };
      byDay[l.data][l.tipo === "entrada" ? "entradas" : "saidas"] += Number(l.valor);
    });
    return Object.values(byDay).sort((a, b) => a.data.localeCompare(b.data));
  }, [lancamentos]);

  return (
    <div>
      <SectionTitle sub={`Visão consolidada — ${company.nome}`}>Painel financeiro</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 22 }}>
        {[
          { label: "Entradas", value: totals.entradas, Icon: TrendingUp },
          { label: "Saídas", value: totals.saidas, Icon: TrendingDown },
          { label: "A pagar", value: totals.aPagar, Icon: ArrowDownCircle },
          { label: "A receber", value: totals.aReceber, Icon: ArrowUpCircle },
        ].map((k, i) => (
          <Panel key={i} style={{ padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 13, color: T.inkSoft, fontWeight: 500 }}>{k.label}</span>
              <k.Icon size={16} color={T.inkSoft} />
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, marginTop: 8, fontFamily: "'Fraunces', serif" }}>{fmt(k.value)}</div>
          </Panel>
        ))}
      </div>

      {chartData.length > 0 && (
        <Panel style={{ padding: "18px 20px", marginBottom: 22 }}>
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 14 }}>Movimentação por dia</div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="ent" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={T.teal} stopOpacity={0.3} /><stop offset="100%" stopColor={T.teal} stopOpacity={0} /></linearGradient>
              </defs>
              <CartesianGrid stroke={T.line} vertical={false} />
              <XAxis dataKey="data" tick={{ fontSize: 11, fill: T.inkSoft }} tickFormatter={fmtDate} axisLine={{ stroke: T.line }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: T.inkSoft }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v) => fmt(v)} labelFormatter={fmtDate} contentStyle={{ borderRadius: 8, border: `1px solid ${T.line}`, fontSize: 13 }} />
              <Area type="monotone" dataKey="entradas" stroke={T.teal} fill="url(#ent)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </Panel>
      )}

      <Panel style={{ padding: "18px 20px" }}>
        <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 10 }}>Pendências</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {pagar.filter(p => p.status === "atrasado").map(p => (
            <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13.5 }}>
              <AlertCircle size={15} color={T.brick} /><span>Pagamento atrasado: <strong>{p.fornecedor}</strong> — {fmt(p.valor)}</span>
            </div>
          ))}
          {receber.filter(r => r.status === "atrasado").map(r => (
            <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13.5 }}>
              <AlertCircle size={15} color={T.amber} /><span>Recebimento em atraso: <strong>{r.clientes?.nome || "Cliente"}</strong> — {fmt(r.valor)}</span>
            </div>
          ))}
          {totals.pendConcil > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13.5 }}>
              <AlertCircle size={15} color={T.inkSoft} /><span><strong>{totals.pendConcil}</strong> lançamento(s) não conciliado(s)</span>
            </div>
          )}
          {pagar.filter(p => p.status === "atrasado").length === 0 && receber.filter(r => r.status === "atrasado").length === 0 && totals.pendConcil === 0 && (
            <span style={{ fontSize: 13.5, color: T.inkSoft }}>Nenhuma pendência no momento.</span>
          )}
        </div>
      </Panel>
    </div>
  );
}

function LancamentosTab({ company, lancamentos, reload }) {
  const [form, setForm] = useState({ descricao: "", tipo: "entrada", valor: "", data: new Date().toISOString().slice(0, 10) });

  async function add(e) {
    e.preventDefault();
    if (!form.descricao || !form.valor) return;
    await supabase.from("lancamentos").insert({ empresa_id: company.id, descricao: form.descricao, tipo: form.tipo, valor: parseFloat(form.valor), data: form.data });
    setForm({ descricao: "", tipo: "entrada", valor: "", data: new Date().toISOString().slice(0, 10) });
    reload();
  }
  async function toggle(l) {
    await supabase.from("lancamentos").update({ conciliado: !l.conciliado }).eq("id", l.id);
    reload();
  }

  return (
    <div>
      <SectionTitle sub="Todos os lançamentos financeiros da empresa">Lançamentos</SectionTitle>
      <Panel style={{ padding: 16, marginBottom: 18 }}>
        <form onSubmit={add} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr auto", gap: 10, alignItems: "end" }}>
          <Field label="Descrição"><input required value={form.descricao} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))} style={inputStyle} /></Field>
          <Field label="Tipo">
            <select value={form.tipo} onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))} style={inputStyle}>
              <option value="entrada">Entrada</option><option value="saida">Saída</option>
            </select>
          </Field>
          <Field label="Valor (R$)"><input required type="number" step="0.01" value={form.valor} onChange={e => setForm(f => ({ ...f, valor: e.target.value }))} style={inputStyle} /></Field>
          <Field label="Data"><input type="date" value={form.data} onChange={e => setForm(f => ({ ...f, data: e.target.value }))} style={inputStyle} /></Field>
          <button type="submit" style={btnPrimary}><Plus size={14} /> Adicionar</button>
        </form>
      </Panel>
      <Panel>
        <table>
          <thead><tr><th>Data</th><th>Descrição</th><th>Tipo</th><th style={{ textAlign: "right" }}>Valor</th><th>Conciliação</th></tr></thead>
          <tbody>
            {lancamentos.map(l => (
              <tr key={l.id}>
                <td style={{ color: T.inkSoft }}>{fmtDate(l.data)}</td>
                <td>{l.descricao}</td>
                <td>{l.tipo === "entrada" ? <span style={{ color: T.teal, display: "flex", alignItems: "center", gap: 5 }}><ArrowUpCircle size={13} /> Entrada</span> : <span style={{ color: T.brick, display: "flex", alignItems: "center", gap: 5 }}><ArrowDownCircle size={13} /> Saída</span>}</td>
                <td style={{ textAlign: "right", fontWeight: 600 }}>{fmt(l.valor)}</td>
                <td><button onClick={() => toggle(l)}>{l.conciliado ? <StatusPill tone="good">Conciliado</StatusPill> : <StatusPill tone="warn">Pendente</StatusPill>}</button></td>
              </tr>
            ))}
            {lancamentos.length === 0 && <tr><td colSpan={5} style={{ color: T.inkSoft, textAlign: "center", padding: 24 }}>Nenhum lançamento ainda. Adicione o primeiro acima.</td></tr>}
          </tbody>
        </table>
      </Panel>
    </div>
  );
}

function ClientesTab({ company, clientes, reload }) {
  const [form, setForm] = useState({ nome: "", documento: "", email: "" });
  async function add(e) {
    e.preventDefault(); if (!form.nome) return;
    await supabase.from("clientes").insert({ empresa_id: company.id, ...form });
    setForm({ nome: "", documento: "", email: "" });
    reload();
  }
  return (
    <div>
      <SectionTitle sub="Clientes finais desta empresa — cadastre um de cada vez, quando precisar">Clientes</SectionTitle>
      <Panel style={{ padding: 16, marginBottom: 18 }}>
        <form onSubmit={add} style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1.5fr auto", gap: 10, alignItems: "end" }}>
          <Field label="Nome"><input required value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} style={inputStyle} /></Field>
          <Field label="CPF/CNPJ"><input value={form.documento} onChange={e => setForm(f => ({ ...f, documento: e.target.value }))} style={inputStyle} /></Field>
          <Field label="E-mail"><input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} style={inputStyle} /></Field>
          <button type="submit" style={btnPrimary}><Plus size={14} /> Adicionar</button>
        </form>
      </Panel>
      <Panel>
        <table>
          <thead><tr><th>Nome</th><th>Documento</th><th>E-mail</th></tr></thead>
          <tbody>
            {clientes.map(c => (<tr key={c.id}><td>{c.nome}</td><td style={{ color: T.inkSoft }}>{c.documento || "—"}</td><td style={{ color: T.inkSoft }}>{c.email || "—"}</td></tr>))}
            {clientes.length === 0 && <tr><td colSpan={3} style={{ color: T.inkSoft, textAlign: "center", padding: 24 }}>Nenhum cliente cadastrado ainda.</td></tr>}
          </tbody>
        </table>
      </Panel>
    </div>
  );
}

function PagarTab({ company, pagar, reload }) {
  const [form, setForm] = useState({ fornecedor: "", vencimento: "", valor: "" });
  async function add(e) {
    e.preventDefault(); if (!form.fornecedor || !form.vencimento || !form.valor) return;
    await supabase.from("contas_pagar").insert({ empresa_id: company.id, fornecedor: form.fornecedor, vencimento: form.vencimento, valor: parseFloat(form.valor) });
    setForm({ fornecedor: "", vencimento: "", valor: "" }); reload();
  }
  async function marcarPago(p) { await supabase.from("contas_pagar").update({ status: "pago" }).eq("id", p.id); reload(); }
  return (
    <div>
      <SectionTitle sub="Obrigações da empresa com fornecedores e prestadores">Contas a pagar</SectionTitle>
      <Panel style={{ padding: 16, marginBottom: 18 }}>
        <form onSubmit={add} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr auto", gap: 10, alignItems: "end" }}>
          <Field label="Fornecedor"><input required value={form.fornecedor} onChange={e => setForm(f => ({ ...f, fornecedor: e.target.value }))} style={inputStyle} /></Field>
          <Field label="Vencimento"><input required type="date" value={form.vencimento} onChange={e => setForm(f => ({ ...f, vencimento: e.target.value }))} style={inputStyle} /></Field>
          <Field label="Valor (R$)"><input required type="number" step="0.01" value={form.valor} onChange={e => setForm(f => ({ ...f, valor: e.target.value }))} style={inputStyle} /></Field>
          <button type="submit" style={btnPrimary}><Plus size={14} /> Adicionar</button>
        </form>
      </Panel>
      <Panel>
        <table>
          <thead><tr><th>Fornecedor</th><th>Vencimento</th><th style={{ textAlign: "right" }}>Valor</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {pagar.map(p => (
              <tr key={p.id}>
                <td>{p.fornecedor}</td><td style={{ color: T.inkSoft }}>{fmtDate(p.vencimento)}</td>
                <td style={{ textAlign: "right", fontWeight: 600 }}>{fmt(p.valor)}</td>
                <td>{p.status === "pago" ? <StatusPill tone="good">Pago</StatusPill> : p.status === "atrasado" ? <StatusPill tone="bad">Atrasado</StatusPill> : <StatusPill tone="neutral">Pendente</StatusPill>}</td>
                <td>{p.status !== "pago" && <button onClick={() => marcarPago(p)} style={btnGhost}>Marcar como pago</button>}</td>
              </tr>
            ))}
            {pagar.length === 0 && <tr><td colSpan={5} style={{ color: T.inkSoft, textAlign: "center", padding: 24 }}>Nenhuma conta a pagar cadastrada.</td></tr>}
          </tbody>
        </table>
      </Panel>
    </div>
  );
}

function ReceberTab({ company, receber, clientes, reload }) {
  const [form, setForm] = useState({ cliente_id: "", vencimento: "", valor: "" });
  async function add(e) {
    e.preventDefault(); if (!form.cliente_id || !form.vencimento || !form.valor) return;
    await supabase.from("contas_receber").insert({ empresa_id: company.id, cliente_id: form.cliente_id, vencimento: form.vencimento, valor: parseFloat(form.valor) });
    setForm({ cliente_id: "", vencimento: "", valor: "" }); reload();
  }
  async function marcarRecebido(r) { await supabase.from("contas_receber").update({ status: "recebido" }).eq("id", r.id); reload(); }
  return (
    <div>
      <SectionTitle sub="Valores que os clientes devem à empresa">Contas a receber</SectionTitle>
      <Panel style={{ padding: 16, marginBottom: 18 }}>
        {clientes.length === 0 ? (
          <p style={{ fontSize: 13.5, color: T.inkSoft, margin: 0 }}>Cadastre um cliente na aba "Clientes" antes de lançar uma conta a receber.</p>
        ) : (
          <form onSubmit={add} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr auto", gap: 10, alignItems: "end" }}>
            <Field label="Cliente">
              <select required value={form.cliente_id} onChange={e => setForm(f => ({ ...f, cliente_id: e.target.value }))} style={inputStyle}>
                <option value="">Selecione…</option>
                {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            </Field>
            <Field label="Vencimento"><input required type="date" value={form.vencimento} onChange={e => setForm(f => ({ ...f, vencimento: e.target.value }))} style={inputStyle} /></Field>
            <Field label="Valor (R$)"><input required type="number" step="0.01" value={form.valor} onChange={e => setForm(f => ({ ...f, valor: e.target.value }))} style={inputStyle} /></Field>
            <button type="submit" style={btnPrimary}><Plus size={14} /> Adicionar</button>
          </form>
        )}
      </Panel>
      <Panel>
        <table>
          <thead><tr><th>Cliente</th><th>Vencimento</th><th style={{ textAlign: "right" }}>Valor</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {receber.map(r => (
              <tr key={r.id}>
                <td>{r.clientes?.nome || "—"}</td><td style={{ color: T.inkSoft }}>{fmtDate(r.vencimento)}</td>
                <td style={{ textAlign: "right", fontWeight: 600 }}>{fmt(r.valor)}</td>
                <td>{r.status === "recebido" ? <StatusPill tone="good">Recebido</StatusPill> : r.status === "atrasado" ? <StatusPill tone="bad">Atrasado</StatusPill> : <StatusPill tone="neutral">Pendente</StatusPill>}</td>
                <td>{r.status !== "recebido" && <button onClick={() => marcarRecebido(r)} style={btnGhost}>Marcar como recebido</button>}</td>
              </tr>
            ))}
            {receber.length === 0 && <tr><td colSpan={5} style={{ color: T.inkSoft, textAlign: "center", padding: 24 }}>Nenhuma conta a receber cadastrada.</td></tr>}
          </tbody>
        </table>
      </Panel>
    </div>
  );
}

function downloadCsv(filename, rows, headers) {
  const csv = [headers.join(";"), ...rows.map(r => headers.map(h => `"${(r[h] ?? "")}"`).join(";"))].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

function RelatoriosTab({ company, lancamentos, pagar, receber }) {
  const porMes = useMemo(() => {
    const map = {};
    lancamentos.forEach(l => {
      const mes = l.data?.slice(0, 7); // YYYY-MM
      if (!mes) return;
      map[mes] = map[mes] || { mes, entradas: 0, saidas: 0 };
      map[mes][l.tipo === "entrada" ? "entradas" : "saidas"] += Number(l.valor);
    });
    return Object.values(map).sort((a, b) => a.mes.localeCompare(b.mes));
  }, [lancamentos]);

  const totalEntradas = lancamentos.filter(l => l.tipo === "entrada").reduce((s, l) => s + Number(l.valor), 0);
  const totalSaidas = lancamentos.filter(l => l.tipo === "saida").reduce((s, l) => s + Number(l.valor), 0);

  return (
    <div>
      <SectionTitle sub={`Resumo gerencial — ${company.nome}`}>Relatórios</SectionTitle>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 22 }}>
        <Panel style={{ padding: 16 }}>
          <div style={{ fontSize: 13, color: T.inkSoft, fontWeight: 500 }}>Total de entradas</div>
          <div style={{ fontSize: 22, fontWeight: 700, marginTop: 8, fontFamily: "'Fraunces', serif", color: T.teal }}>{fmt(totalEntradas)}</div>
        </Panel>
        <Panel style={{ padding: 16 }}>
          <div style={{ fontSize: 13, color: T.inkSoft, fontWeight: 500 }}>Total de saídas</div>
          <div style={{ fontSize: 22, fontWeight: 700, marginTop: 8, fontFamily: "'Fraunces', serif", color: T.brick }}>{fmt(totalSaidas)}</div>
        </Panel>
        <Panel style={{ padding: 16 }}>
          <div style={{ fontSize: 13, color: T.inkSoft, fontWeight: 500 }}>Resultado</div>
          <div style={{ fontSize: 22, fontWeight: 700, marginTop: 8, fontFamily: "'Fraunces', serif" }}>{fmt(totalEntradas - totalSaidas)}</div>
        </Panel>
      </div>

      {porMes.length > 0 && (
        <Panel style={{ padding: "18px 20px", marginBottom: 22 }}>
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 14 }}>Entradas x Saídas por mês</div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={porMes}>
              <defs>
                <linearGradient id="ent2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={T.teal} stopOpacity={0.3} /><stop offset="100%" stopColor={T.teal} stopOpacity={0} /></linearGradient>
                <linearGradient id="sai2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={T.brick} stopOpacity={0.25} /><stop offset="100%" stopColor={T.brick} stopOpacity={0} /></linearGradient>
              </defs>
              <CartesianGrid stroke={T.line} vertical={false} />
              <XAxis dataKey="mes" tick={{ fontSize: 12, fill: T.inkSoft }} axisLine={{ stroke: T.line }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: T.inkSoft }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v) => fmt(v)} contentStyle={{ borderRadius: 8, border: `1px solid ${T.line}`, fontSize: 13 }} />
              <Area type="monotone" dataKey="entradas" stroke={T.teal} fill="url(#ent2)" strokeWidth={2} />
              <Area type="monotone" dataKey="saidas" stroke={T.brick} fill="url(#sai2)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </Panel>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
        <Panel style={{ padding: 16 }}>
          <FileBarChart size={18} color={T.teal} />
          <div style={{ fontWeight: 600, fontSize: 14, marginTop: 10 }}>Lançamentos</div>
          <div style={{ fontSize: 12.5, color: T.inkSoft, marginTop: 3, marginBottom: 12 }}>Exportar tudo em CSV (Excel)</div>
          <button onClick={() => downloadCsv("lancamentos.csv", lancamentos, ["data", "descricao", "tipo", "valor", "conciliado"])} style={btnGhost}>Baixar CSV</button>
        </Panel>
        <Panel style={{ padding: 16 }}>
          <FileBarChart size={18} color={T.amber} />
          <div style={{ fontWeight: 600, fontSize: 14, marginTop: 10 }}>Contas a pagar</div>
          <div style={{ fontSize: 12.5, color: T.inkSoft, marginTop: 3, marginBottom: 12 }}>Exportar tudo em CSV (Excel)</div>
          <button onClick={() => downloadCsv("contas_pagar.csv", pagar, ["fornecedor", "vencimento", "valor", "status"])} style={btnGhost}>Baixar CSV</button>
        </Panel>
        <Panel style={{ padding: 16 }}>
          <FileBarChart size={18} color={T.teal} />
          <div style={{ fontWeight: 600, fontSize: 14, marginTop: 10 }}>Contas a receber</div>
          <div style={{ fontSize: 12.5, color: T.inkSoft, marginTop: 3, marginBottom: 12 }}>Exportar tudo em CSV (Excel)</div>
          <button onClick={() => downloadCsv("contas_receber.csv", receber.map(r => ({ ...r, cliente: r.clientes?.nome })), ["cliente", "vencimento", "valor", "status"])} style={btnGhost}>Baixar CSV</button>
        </Panel>
      </div>
    </div>
  );
}

function EmissaoTab({ company, emissoes, clientes, reload }) {
  const [form, setForm] = useState({ tipo: "NF-e", cliente_id: "", valor: "" });
  async function emitir(e) {
    e.preventDefault(); if (!form.cliente_id || !form.valor) return;
    await supabase.from("emissoes").insert({ empresa_id: company.id, cliente_id: form.cliente_id, tipo: form.tipo, valor: parseFloat(form.valor), status: "processando" });
    setForm({ tipo: "NF-e", cliente_id: "", valor: "" }); reload();
  }
  return (
    <div>
      <SectionTitle sub="Emissão de notas fiscais e boletos para clientes">Notas & Boletos</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 18 }}>
        <Panel style={{ padding: 18 }}>
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 14 }}>Nova emissão</div>
          {clientes.length === 0 ? (
            <p style={{ fontSize: 13, color: T.inkSoft }}>Cadastre um cliente antes de emitir.</p>
          ) : (
            <form onSubmit={emitir} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <Field label="Tipo">
                <select value={form.tipo} onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))} style={inputStyle}>
                  <option>NF-e</option><option>Boleto</option>
                </select>
              </Field>
              <Field label="Cliente">
                <select required value={form.cliente_id} onChange={e => setForm(f => ({ ...f, cliente_id: e.target.value }))} style={inputStyle}>
                  <option value="">Selecione…</option>
                  {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
              </Field>
              <Field label="Valor (R$)"><input required type="number" step="0.01" value={form.valor} onChange={e => setForm(f => ({ ...f, valor: e.target.value }))} style={inputStyle} /></Field>
              <button type="submit" style={{ ...btnPrimary, marginTop: 6 }}><Plus size={14} /> Gerar emissão</button>
              <p style={{ fontSize: 11.5, color: T.inkSoft, lineHeight: 1.5, marginTop: 4 }}>
                Emissão real exige certificado digital (NF-e) ou convênio bancário/gateway (boleto). Por enquanto fica registrada como "aguardando integração".
              </p>
            </form>
          )}
        </Panel>
        <Panel>
          <table>
            <thead><tr><th>Tipo</th><th>Cliente</th><th>Data</th><th style={{ textAlign: "right" }}>Valor</th><th>Status</th></tr></thead>
            <tbody>
              {emissoes.map(e => (
                <tr key={e.id}>
                  <td style={{ display: "flex", alignItems: "center", gap: 6 }}>{e.tipo === "NF-e" ? <FileText size={14} color={T.inkSoft} /> : <QrCode size={14} color={T.inkSoft} />}{e.tipo}</td>
                  <td>{e.clientes?.nome || "—"}</td>
                  <td style={{ color: T.inkSoft }}>{fmtDate(e.criado_em?.slice(0, 10))}</td>
                  <td style={{ textAlign: "right", fontWeight: 600 }}>{fmt(e.valor)}</td>
                  <td><StatusPill tone="warn">Aguardando integração</StatusPill></td>
                </tr>
              ))}
              {emissoes.length === 0 && <tr><td colSpan={5} style={{ color: T.inkSoft, textAlign: "center", padding: 24 }}>Nenhuma emissão ainda.</td></tr>}
            </tbody>
          </table>
        </Panel>
      </div>
    </div>
  );
}
