import { useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, Image, CheckCircle2, XCircle, Loader2, ArrowUpRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { reportsAPI } from '../services/api'
import Navbar from '../components/shared/Navbar'

const STAGES = [
  { key: 'uploading',  label: 'Uploading file...' },
  { key: 'extracting', label: 'Extracting text...' },
  { key: 'analyzing',  label: 'AI analyzing biomarkers...' },
  { key: 'saving',     label: 'Saving results...' },
]

export default function UploadPage() {
  const navigate = useNavigate()
  const [file, setFile] = useState(null)
  const [status, setStatus] = useState('idle')
  const [reportId, setReportId] = useState(null)
  const [stageIdx, setStageIdx] = useState(0)
  const [errorMsg, setErrorMsg] = useState('')

  const onDrop = useCallback((accepted, rejected) => {
    if (rejected.length > 0) { toast.error('PDF or image only, max 10MB'); return }
    setFile(accepted[0])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'], 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    maxSize: 10 * 1024 * 1024,
    multiple: false,
  })

  useEffect(() => {
    if (!reportId || status !== 'processing') return
    const stageTimer = setInterval(() => setStageIdx((i) => Math.min(i + 1, STAGES.length - 1)), 4000)
    const pollTimer = setInterval(async () => {
      try {
        const res = await reportsAPI.getStatus(reportId)
        const { status: s, errorMessage } = res.data
        if (s === 'completed') { clearInterval(pollTimer); clearInterval(stageTimer); setStatus('done') }
        else if (s === 'failed') { clearInterval(pollTimer); clearInterval(stageTimer); setStatus('error'); setErrorMsg(errorMessage || 'Analysis failed.') }
      } catch {}
    }, 2500)
    return () => { clearInterval(pollTimer); clearInterval(stageTimer) }
  }, [reportId, status])

  const handleUpload = async () => {
    if (!file) return
    setStatus('uploading'); setStageIdx(0)
    try {
      const res = await reportsAPI.upload(file)
      setReportId(res.data.reportId); setStatus('processing')
    } catch (err) {
      setStatus('error'); setErrorMsg(err.response?.data?.error || 'Upload failed.')
    }
  }

  const reset = () => { setFile(null); setStatus('idle'); setReportId(null); setStageIdx(0); setErrorMsg('') }

  return (
    <div className="min-h-screen pb-16">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 pt-10">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-semibold text-slate-900 tracking-tight">Upload blood report</h1>
          <p className="text-slate-500 mt-1.5">PDF or image • Max 10MB • Results in ~30 seconds</p>
        </div>

        {status === 'idle' && (
          <div className="space-y-4">
            <div {...getRootProps()} className={`card p-10 text-center cursor-pointer transition-all border-2 border-dashed ${isDragActive ? 'border-[#2F3CED] bg-[#2F3CED]/5' : 'border-slate-200 hover:border-[#2F3CED]/40'}`}>
              <input {...getInputProps()} />
              <div className="w-14 h-14 bg-[#2F3CED]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Upload size={24} className="text-[#2F3CED]" />
              </div>
              {isDragActive ? <p className="text-[#2F3CED] font-medium">Drop it here</p> : (
                <>
                  <p className="text-slate-700 font-medium">Drag your blood report here</p>
                  <p className="text-slate-400 text-sm mt-1">or click to browse</p>
                  <div className="flex items-center justify-center gap-2 mt-4">
                    {['PDF', 'JPG', 'PNG', 'WEBP'].map((f) => (
                      <span key={f} className="text-xs bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full">{f}</span>
                    ))}
                  </div>
                </>
              )}
            </div>

            {file && (
              <div className="card p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {file.type === 'application/pdf' ? <FileText size={28} className="text-red-500" /> : <Image size={28} className="text-[#2F3CED]" />}
                  <div>
                    <p className="text-sm font-medium text-slate-800 truncate max-w-xs">{file.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={reset} className="btn-ghost text-sm">Remove</button>
                  <button onClick={handleUpload} className="btn-primary text-sm">Analyze <ArrowUpRight size={14} /></button>
                </div>
              </div>
            )}

            <div className="card p-5">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-3">Tips for best results</p>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex gap-2"><span className="text-emerald-500">✓</span> Use clear, high-resolution scans or photos</li>
                <li className="flex gap-2"><span className="text-emerald-500">✓</span> Ensure all values and units are visible</li>
                <li className="flex gap-2"><span className="text-emerald-500">✓</span> Digital PDFs from labs work best</li>
                <li className="flex gap-2"><span className="text-amber-500">!</span> HemoLens is not a substitute for medical advice</li>
              </ul>
            </div>
          </div>
        )}

        {(status === 'uploading' || status === 'processing') && (
          <div className="card p-10 text-center">
            <div className="w-16 h-16 bg-[#2F3CED]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Loader2 size={28} className="text-[#2F3CED] animate-spin" />
            </div>
            <h2 className="font-display text-lg font-semibold text-slate-800 mb-1">{STAGES[stageIdx].label}</h2>
            <p className="text-slate-400 text-sm mb-6">This usually takes 20–40 seconds</p>
            <div className="space-y-2 text-left max-w-xs mx-auto">
              {STAGES.map((stage, i) => (
                <div key={stage.key} className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${i < stageIdx ? 'bg-emerald-500' : i === stageIdx ? 'bg-[#2F3CED]' : 'bg-slate-200'}`}>
                    {i < stageIdx ? <CheckCircle2 size={12} className="text-white" /> : i === stageIdx ? <Loader2 size={10} className="text-white animate-spin" /> : null}
                  </div>
                  <span className={`text-sm ${i <= stageIdx ? 'text-slate-700' : 'text-slate-400'}`}>{stage.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {status === 'done' && (
          <div className="card p-10 text-center">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={32} className="text-emerald-500" />
            </div>
            <h2 className="font-display text-lg font-semibold text-slate-800 mb-1">Analysis complete!</h2>
            <p className="text-slate-400 text-sm mb-6">Your blood report has been fully analyzed.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => navigate(`/report/${reportId}`)} className="btn-primary">View results <ArrowUpRight size={14} /></button>
              <button onClick={reset} className="btn-ghost">Upload another</button>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="card p-10 text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle size={32} className="text-red-500" />
            </div>
            <h2 className="font-display text-lg font-semibold text-slate-800 mb-1">Analysis failed</h2>
            <p className="text-slate-500 text-sm mb-6">{errorMsg}</p>
            <button onClick={reset} className="btn-primary">Try again</button>
          </div>
        )}
      </main>
    </div>
  )
}
