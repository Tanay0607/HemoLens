import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Send, Loader2, Bot, User, AlertTriangle, CheckCircle2, TrendingDown, TrendingUp, Minus, Download } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import toast from 'react-hot-toast'
import { reportsAPI } from '../services/api'
import Navbar from '../components/shared/Navbar'

const FLAG_CONFIG = {
  normal:        { label: 'Normal',   color: '#059669', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', Icon: CheckCircle2 },
  low:           { label: 'Low',      color: '#d97706', bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200',   Icon: TrendingDown },
  high:          { label: 'High',     color: '#ea580c', bg: 'bg-orange-50',  text: 'text-orange-700',  border: 'border-orange-200',  Icon: TrendingUp },
  critical_low:  { label: 'Critical', color: '#dc2626', bg: 'bg-red-50',     text: 'text-red-700',     border: 'border-red-200',     Icon: AlertTriangle },
  critical_high: { label: 'Critical', color: '#dc2626', bg: 'bg-red-50',     text: 'text-red-700',     border: 'border-red-200',     Icon: AlertTriangle },
  unknown:       { label: 'Unknown',  color: '#94a3b8', bg: 'bg-slate-50',   text: 'text-slate-500',   border: 'border-slate-200',   Icon: Minus },
}

function FlagPill({ flag }) {
  const cfg = FLAG_CONFIG[flag] || FLAG_CONFIG.unknown
  const { Icon } = cfg
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      <Icon size={10} />{cfg.label}
    </span>
  )
}

function BiomarkerCard({ b }) {
  const [open, setOpen] = useState(false)
  const cfg = FLAG_CONFIG[b.flag] || FLAG_CONFIG.unknown
  const isFlagged = b.flag !== 'normal' && b.flag !== 'unknown'
  return (
    <button onClick={() => setOpen(!open)}
      className={`card p-4 text-left w-full border transition-all ${isFlagged ? 'border-l-4' : ''}`}
      style={isFlagged ? { borderLeftColor: cfg.color } : {}}>
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-800 truncate">{b.name}</p>
          {b.category && <p className="text-xs text-slate-400 mt-0.5">{b.category}</p>}
        </div>
        <div className="flex items-center gap-3 flex-shrink-0 ml-3">
          <div className="text-right">
            <p className="text-sm font-semibold text-slate-900">
              {b.value != null ? b.value : '—'} <span className="text-xs font-normal text-slate-400">{b.unit}</span>
            </p>
            {b.referenceRange && <p className="text-xs text-slate-400">ref: {b.referenceRange}</p>}
          </div>
          <FlagPill flag={b.flag} />
        </div>
      </div>
      {open && b.explanation && (
        <div className={`mt-3 pt-3 border-t text-sm text-slate-600 leading-relaxed ${cfg.bg} -mx-4 -mb-4 px-4 pb-4 rounded-b-2xl`}>
          {b.explanation}
        </div>
      )}
    </button>
  )
}

function ChatPanel({ reportId }) {
  const [messages, setMessages] = useState([
    { role: 'bot', text: "Hi! I've analyzed this report. Ask me anything about the results — like what a low value means or what to discuss with your doctor." }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const send = async () => {
    const q = input.trim()
    if (!q || loading) return
    setInput('')
    setMessages((m) => [...m, { role: 'user', text: q }])
    setLoading(true)
    try {
      const res = await reportsAPI.chat(reportId, q)
      setMessages((m) => [...m, { role: 'bot', text: res.data.answer }])
    } catch { toast.error('Could not get a response.') }
    finally { setLoading(false) }
  }

  return (
    <div className="card flex flex-col h-[480px]">
      <div className="p-4 border-b border-slate-100 flex items-center gap-2">
        <div className="w-7 h-7 bg-[#2F3CED]/10 rounded-lg flex items-center justify-center">
          <Bot size={14} className="text-[#2F3CED]" />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-800">Ask HemoLens AI</p>
          <p className="text-xs text-slate-400">Questions about this report</p>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${msg.role === 'bot' ? 'bg-[#2F3CED]/10' : 'bg-slate-100'}`}>
              {msg.role === 'bot' ? <Bot size={12} className="text-[#2F3CED]" /> : <User size={12} className="text-slate-500" />}
            </div>
            <div className={`max-w-[80%] text-sm px-3 py-2 rounded-2xl leading-relaxed ${msg.role === 'bot' ? 'bg-slate-100 text-slate-700' : 'bg-[#2F3CED] text-white'}`}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-2">
            <div className="w-6 h-6 rounded-full bg-[#2F3CED]/10 flex items-center justify-center">
              <Bot size={12} className="text-[#2F3CED]" />
            </div>
            <div className="bg-slate-100 px-3 py-2 rounded-2xl">
              <Loader2 size={14} className="text-slate-400 animate-spin" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div className="p-3 border-t border-slate-100 flex gap-2">
        <input className="input text-sm flex-1" placeholder="What does my low hemoglobin mean?"
          value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} />
        <button onClick={send} disabled={loading || !input.trim()} className="btn-primary px-3 py-2">
          <Send size={14} />
        </button>
      </div>
    </div>
  )
}

export default function ReportPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [activeCategory, setActiveCategory] = useState('All')
  const handleExport = async () => {
  try {
    const response = await reportsAPI.exportReport(id);

    const blob = new Blob([response.data], {
      type: "text/html",
    });

    const url = window.URL.createObjectURL(blob);

    window.open(url, "_blank");

    setTimeout(() => {
      window.URL.revokeObjectURL(url);
    }, 1000);

  } catch (err) {
    console.error(err);
    toast.error("Failed to export report.");
  }
};

  const { data, isLoading } = useQuery({
    queryKey: ['report', id],
    queryFn: () => reportsAPI.getReport(id).then((r) => r.data.report),
  })

  if (isLoading) return (
    <div className="min-h-screen"><Navbar />
      <div className="flex items-center justify-center mt-24"><Loader2 size={28} className="animate-spin text-[#2F3CED]" /></div>
    </div>
  )
  if (!data) return null

  const biomarkers = data.biomarkers || []
  const categories = ['All', ...new Set(biomarkers.map((b) => b.category).filter(Boolean))]
  const filtered = activeCategory === 'All' ? biomarkers : biomarkers.filter((b) => b.category === activeCategory)

  const chartData = biomarkers
    .filter((b) => b.value != null && b.flag !== 'unknown')
    .slice(0, 12)
    .map((b) => ({ name: b.name.length > 12 ? b.name.slice(0, 12) + '…' : b.name, value: b.value, flag: b.flag }))

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8">

        {/* Top bar — back + export */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate('/dashboard')} className="btn-ghost text-sm -ml-2">
            <ArrowLeft size={15} /> Back to dashboard
          </button>
          <button
            onClick={handleExport}
            className="btn-primary text-sm"
          >
            <Download size={14} />
            Export PDF
          </button>
        </div>

        {/* Header */}
        <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">{data.originalFileName || 'Blood Report'}</h1>
            <p className="text-slate-500 text-sm mt-1">
              {new Date(data.createdAt).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              {data.patientInfo?.labName && ` • ${data.patientInfo.labName}`}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {data.flagCounts?.normal   > 0 && <span className="badge-normal   text-xs px-2.5 py-1 rounded-full border font-medium">{data.flagCounts.normal} normal</span>}
            {data.flagCounts?.abnormal > 0 && <span className="badge-low      text-xs px-2.5 py-1 rounded-full border font-medium">{data.flagCounts.abnormal} abnormal</span>}
            {data.flagCounts?.critical > 0 && <span className="badge-critical text-xs px-2.5 py-1 rounded-full border font-medium">{data.flagCounts.critical} critical</span>}
          </div>
        </div>

        {/* AI Summary */}
        {data.summary && (
          <div className="card p-5 mb-6 border-l-4 border-[#2F3CED]">
            <p className="text-xs font-medium text-[#2F3CED] uppercase tracking-wide mb-2">AI Summary</p>
            <p className="text-slate-700 leading-relaxed">{data.summary}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left — biomarkers */}
          <div className="lg:col-span-2 space-y-5">
            {categories.length > 2 && (
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button key={cat} onClick={() => setActiveCategory(cat)}
                    className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${activeCategory === cat ? 'bg-[#2F3CED] text-white border-[#2F3CED]' : 'bg-white text-slate-600 border-slate-200 hover:border-[#2F3CED]/30'}`}>
                    {cat}
                  </button>
                ))}
              </div>
            )}
            <div className="space-y-2">{filtered.map((b, i) => <BiomarkerCard key={i} b={b} />)}</div>

            {data.recommendations?.length > 0 && (
              <div className="card p-5">
                <p className="text-sm font-medium text-slate-700 mb-3">Recommendations</p>
                <ul className="space-y-2">
                  {data.recommendations.map((r, i) => (
                    <li key={i} className="flex gap-2 text-sm text-slate-600">
                      <span className="text-[#2F3CED] font-bold flex-shrink-0">→</span> {r}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Right — chart + chat */}
          <div className="space-y-5">
            {chartData.length > 0 && (
              <div className="card p-5">
                <p className="text-sm font-medium text-slate-700 mb-4">Biomarker values</p>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 10 }}>
                    <XAxis type="number" tick={{ fontSize: 10 }} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={80} />
                    <Tooltip formatter={(v) => [v, 'Value']} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {chartData.map((entry, i) => (
                        <Cell key={i} fill={FLAG_CONFIG[entry.flag]?.color || '#94a3b8'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
            <ChatPanel reportId={id} />
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-8 px-4">
          HemoLens provides educational information only. Always consult a qualified healthcare professional for medical advice, diagnosis, or treatment.
        </p>
      </main>
    </div>
  )
}
