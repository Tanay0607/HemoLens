// src/pages/DashboardPage.jsx
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Upload, FileText, Clock, CheckCircle2, XCircle, Loader2, ChevronRight, ArrowUpRight, Heart } from 'lucide-react'
import { reportsAPI } from '../services/api'
import { useAuth } from '../hooks/useAuth'
import Navbar from '../components/shared/Navbar'

function FlagBadge({ flag, count }) {
  const styles = {
    normal:   'bg-emerald-50 text-emerald-700',
    abnormal: 'bg-amber-50 text-amber-700',
    critical: 'bg-red-50 text-red-700',
  }
  return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${styles[flag]}`}>{count} {flag}</span>
}

function StatusBadge({ status }) {
  if (status === 'completed') return <span className="flex items-center gap-1 text-xs text-emerald-600"><CheckCircle2 size={12} /> Done</span>
  if (status === 'processing') return <span className="flex items-center gap-1 text-xs text-[#2F3CED]"><Loader2 size={12} className="animate-spin" /> Processing</span>
  return <span className="flex items-center gap-1 text-xs text-red-500"><XCircle size={12} /> Failed</span>
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const { data, isLoading } = useQuery({
    queryKey: ['reports-history'],
    queryFn: () => reportsAPI.getHistory().then((r) => r.data),
    refetchInterval: (data) => (data?.reports?.some((r) => r.status === 'processing') ? 5000 : false),
  })

  const reports = data?.reports || []
  const completed = reports.filter((r) => r.status === 'completed')
  const totalNormal   = completed.reduce((s, r) => s + (r.flagCounts?.normal   || 0), 0)
  const totalFlagged  = completed.reduce((s, r) => s + (r.flagCounts?.abnormal || 0) + (r.flagCounts?.critical || 0), 0)

  return (
    <div className="min-h-screen pb-16">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 pt-8">

        {/* ── Hero card ──────────────────────────────────────────── */}
        <div className="relative rounded-[2rem] overflow-hidden p-8 sm:p-10 mb-8"
          style={{ background: 'linear-gradient(135deg, #1A1D29 0%, #2F3CED 130%)' }}>

          {/* Decorative blobs */}
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-10 w-64 h-64 bg-[#7C8AFF]/30 rounded-full blur-3xl" />

          <div className="relative flex items-center justify-between flex-wrap gap-6">
            <div className="max-w-md">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur rounded-full px-3 py-1 text-xs text-white/80 font-medium mb-4">
                <Heart size={11} className="text-rose-300" /> Hi {user?.name?.split(' ')[0]}, welcome back
              </div>
              <h1 className="font-display text-4xl sm:text-5xl font-semibold text-white leading-[1.05] tracking-tight mb-4">
                Your blood,<br/>fully understood.
              </h1>
              <p className="text-white/60 text-sm leading-relaxed mb-6 max-w-sm">
                {reports.length === 0
                  ? 'Upload your first report and get an instant AI-powered breakdown of every biomarker.'
                  : `${reports.length} report${reports.length !== 1 ? 's' : ''} analyzed so far. Upload another anytime.`}
              </p>
              <button onClick={() => navigate('/upload')}
                className="bg-white text-[#1A1D29] font-medium px-6 py-3 rounded-full flex items-center gap-2 hover:bg-slate-100 transition-all active:scale-95 text-sm">
                Upload report <ArrowUpRight size={15} />
              </button>
            </div>

            {/* Glass stat card */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 w-full sm:w-64 flex-shrink-0">
              <p className="text-white/50 text-xs uppercase tracking-wide mb-4 font-medium">Overview</p>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-white/70 text-sm">Reports</span>
                  <span className="text-white font-display text-xl font-semibold">{completed.length}</span>
                </div>
                <div className="h-px bg-white/10" />
                <div className="flex items-center justify-between">
                  <span className="text-white/70 text-sm">Normal values</span>
                  <span className="text-emerald-300 font-display text-xl font-semibold">{totalNormal}</span>
                </div>
                <div className="h-px bg-white/10" />
                <div className="flex items-center justify-between">
                  <span className="text-white/70 text-sm">Flagged</span>
                  <span className="text-amber-300 font-display text-xl font-semibold">{totalFlagged}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Reports list ──────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-xl font-semibold text-slate-900">Recent reports</h2>
          {reports.length > 0 && (
            <button onClick={() => navigate('/upload')} className="btn-primary text-sm">
              <Upload size={14} /> New upload
            </button>
          )}
        </div>

        {isLoading && (
          <div className="card p-12 text-center">
            <Loader2 size={24} className="animate-spin text-slate-300 mx-auto" />
          </div>
        )}

        {!isLoading && reports.length === 0 && (
          <div className="card p-12 text-center">
            <div className="w-14 h-14 bg-[#2F3CED]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileText size={24} className="text-[#2F3CED]" />
            </div>
            <h3 className="text-slate-700 font-medium mb-1">No reports yet</h3>
            <p className="text-slate-400 text-sm mb-5">Upload your first blood report to see an AI-powered analysis.</p>
            <button onClick={() => navigate('/upload')} className="btn-primary mx-auto">
              <Upload size={15} /> Upload now
            </button>
          </div>
        )}

        {!isLoading && reports.length > 0 && (
          <div className="grid sm:grid-cols-2 gap-3">
            {reports.map((report) => (
              <button
                key={report._id}
                onClick={() => report.status === 'completed' && navigate(`/report/${report._id}`)}
                disabled={report.status !== 'completed'}
                className="card p-4 text-left flex items-center gap-4 hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:cursor-default disabled:hover:translate-y-0"
              >
                <div className="w-11 h-11 bg-[#2F3CED]/8 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <FileText size={18} className="text-[#2F3CED]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{report.originalFileName || 'Blood Report'}</p>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <span className="flex items-center gap-1 text-xs text-slate-400"><Clock size={11} /> {formatDate(report.createdAt)}</span>
                    <StatusBadge status={report.status} />
                  </div>
                  {report.status === 'completed' && report.flagCounts && (
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                      {report.flagCounts.normal   > 0 && <FlagBadge flag="normal"   count={report.flagCounts.normal} />}
                      {report.flagCounts.abnormal > 0 && <FlagBadge flag="abnormal" count={report.flagCounts.abnormal} />}
                      {report.flagCounts.critical > 0 && <FlagBadge flag="critical" count={report.flagCounts.critical} />}
                    </div>
                  )}
                </div>
                {report.status === 'completed' && <ChevronRight size={16} className="text-slate-300 flex-shrink-0" />}
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
