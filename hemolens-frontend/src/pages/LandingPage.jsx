// src/pages/LandingPage.jsx
// Public homepage shown before login

import { Link } from 'react-router-dom'
import {
  ArrowRight, Sparkles, ShieldCheck, MessageCircle,
  TrendingUp, FlaskConical, CheckCircle2, Upload, Brain, FileBarChart, Eye,
} from 'lucide-react'

function NavBar() {
  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-[#2F3CED] rounded-xl flex items-center justify-center">
            <Eye size={16} className="text-white" />
          </div>
          <span className="font-display font-semibold text-slate-900 text-lg tracking-tight">HemoLens</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 px-3 py-2">
            Log in
          </Link>
          <Link to="/register" className="bg-[#2F3CED] hover:bg-[#2530c4] text-white text-sm font-medium px-5 py-2.5 rounded-full transition-colors">
            Get started
          </Link>
        </div>
      </div>
    </nav>
  )
}

function HeroMockup() {
  return (
    <div className="relative max-w-4xl mx-auto mt-16">
      <div className="absolute -top-10 -left-6 w-64 h-64 bg-[#2F3CED]/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-10 -right-6 w-64 h-64 bg-emerald-200/30 rounded-full blur-3xl" />

      <div className="relative bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
        {/* Window chrome */}
        <div className="flex items-center gap-1.5 px-5 py-3.5 border-b border-slate-100 bg-slate-50/50">
          <span className="w-2.5 h-2.5 rounded-full bg-red-300" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-300" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-300" />
          <span className="ml-3 text-xs text-slate-400 font-medium">HemoLens — Report Analysis</span>
        </div>

        <div className="p-6 sm:p-8">
          <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
            <div>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-1.5">AI Summary</p>
              <p className="text-sm text-slate-700 max-w-md leading-relaxed">
                Mild anemia and low Vitamin D detected. Most values are within healthy range — see flagged items below.
              </p>
            </div>
            <span className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-medium flex-shrink-0">
              3 flagged
            </span>
          </div>

          <div className="grid sm:grid-cols-3 gap-3">
            {[
              { name: 'Hemoglobin', value: '10.8 g/dL', flag: 'Low', color: 'amber' },
              { name: 'Vitamin D3', value: '14.2 ng/mL', flag: 'Low', color: 'amber' },
              { name: 'WBC Count', value: '7,200 /uL', flag: 'Normal', color: 'emerald' },
            ].map((b) => (
              <div key={b.name} className={`rounded-2xl p-4 border ${b.color === 'amber' ? 'bg-amber-50/60 border-amber-100' : 'bg-emerald-50/60 border-emerald-100'}`}>
                <p className="text-xs text-slate-500 mb-1">{b.name}</p>
                <p className="text-sm font-semibold text-slate-800 mb-2">{b.value}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${b.color === 'amber' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                  {b.flag}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-5 pt-5 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-400">
            <MessageCircle size={13} className="flex-shrink-0" />
            <span>"What does my low hemoglobin mean?" — ask HemoLens AI anything about your results</span>
          </div>
        </div>
      </div>
    </div>
  )
}

const STEPS = [
  { n: '1', title: 'Upload', desc: 'Drop in a PDF or photo of your blood test report — any lab format works.', Icon: Upload },
  { n: '2', title: 'Analyze', desc: 'AI extracts every biomarker and flags what falls outside the normal range.', Icon: Brain },
  { n: '3', title: 'Understand', desc: 'Get a plain-English summary, ask follow-up questions, and export a PDF.', Icon: FileBarChart },
]

const FEATURES = [
  { Icon: Sparkles,       title: 'AI-powered analysis',   desc: 'Every biomarker explained in plain language, not just a printed range.' },
  { Icon: FlaskConical,   title: 'Any lab report',         desc: 'Works with CBC, lipid panels, thyroid, liver, kidney function, and more.' },
  { Icon: TrendingUp,     title: 'Track trends',           desc: 'See how your values change across multiple reports over time.' },
  { Icon: MessageCircle,  title: 'Ask follow-up questions',desc: 'Chat with HemoLens AI about any result, right inside the report.' },
  { Icon: Eye,            title: 'Doctor-ready export',    desc: 'Download a clean PDF summary to bring to your next appointment.' },
  { Icon: ShieldCheck,    title: 'Private by design',      desc: 'Your reports are encrypted and visible only to you, always.' },
]

const CHECKLIST = [
  'Understand results in minutes, not Google searches',
  'Flags abnormal values automatically',
  'No medical jargon, just plain English',
  'Free to start, no credit card required',
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <NavBar />

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-10 text-center">
        <div className="inline-flex items-center gap-2 bg-white border border-slate-200 text-slate-600 text-sm font-medium px-4 py-2 rounded-full mb-8 shadow-sm">
          <Sparkles size={13} className="text-[#2F3CED]" /> Welcome to HemoLens
        </div>
        <h1 className="font-display text-5xl sm:text-6xl font-bold text-slate-900 tracking-tight leading-[1.08] mb-6">
          Your Blood,<br/>
          <span className="text-[#2F3CED]">Fully Understood.</span>
        </h1>
        <p className="text-slate-500 text-lg max-w-xl mx-auto mb-9 leading-relaxed">
          Upload your blood report and get an instant AI-powered breakdown of every biomarker.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link to="/register" className="bg-[#2F3CED] hover:bg-[#2530c4] text-white font-medium px-6 py-3.5 rounded-full flex items-center gap-2 transition-colors">
            Start for free <ArrowRight size={16} />
          </Link>
          <Link to="/login" className="text-slate-700 hover:text-slate-900 font-medium px-6 py-3.5 rounded-full border border-slate-200 hover:border-slate-300 bg-white transition-colors">
            Log in
          </Link>
        </div>

        <HeroMockup />
      </section>

      {/* Trusted strip */}
      <section className="max-w-6xl mx-auto px-6 py-14 border-t border-slate-100 mt-16">
        <p className="text-center text-sm text-slate-400">Built for anyone who's ever stared at a lab report and felt lost</p>
      </section>

      {/* Steps */}
      <section className="max-w-5xl mx-auto px-6 py-16 border-t border-slate-100">
        <div className="text-center mb-14">
          <h2 className="font-display text-4xl font-bold text-slate-900 tracking-tight mb-3">Three steps to clarity</h2>
          <p className="text-slate-500">HemoLens turns a confusing PDF into answers you can actually use.</p>
        </div>
        <div className="grid sm:grid-cols-3 gap-10">
          {STEPS.map((s) => (
            <div key={s.n} className="text-center">
              <div className="w-16 h-16 bg-[#2F3CED] rounded-full flex items-center justify-center mx-auto mb-5">
                <span className="text-white font-display font-bold text-lg">{s.n}</span>
              </div>
              <h3 className="font-display text-lg font-semibold text-slate-900 mb-2">{s.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed max-w-xs mx-auto">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features grid */}
      <section className="max-w-6xl mx-auto px-6 py-16 border-t border-slate-100">
        <div className="text-center mb-12">
          <h2 className="font-display text-4xl font-bold text-slate-900 tracking-tight mb-3">Everything you need.</h2>
          <p className="text-slate-500">From analysing to suggestions, HemoLens handles every step of the workflow.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f) => (
            <div key={f.title} className="border border-slate-200 rounded-2xl p-6 hover:border-[#2F3CED]/30 hover:shadow-sm transition-all">
              <div className="w-10 h-10 bg-[#2F3CED]/8 rounded-xl flex items-center justify-center mb-4">
                <f.Icon size={18} className="text-[#2F3CED]" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-1.5">{f.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Checklist */}
      <section className="max-w-4xl mx-auto px-6 py-16 border-t border-slate-100">
        <div className="text-center mb-10">
          <h2 className="font-display text-4xl font-bold text-slate-900 tracking-tight">Why people switch to HemoLens</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-x-12 gap-y-4">
          {CHECKLIST.map((item) => (
            <div key={item} className="flex items-center gap-3">
              <CheckCircle2 size={18} className="text-[#2F3CED] flex-shrink-0" />
              <span className="text-slate-700 text-sm">{item}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA banner */}
      <section className="bg-gradient-to-br from-[#1A1D29] to-[#2F3CED] mt-8">
        <div className="max-w-3xl mx-auto px-6 py-20 text-center">
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-white tracking-tight mb-4">
            Ready to understand<br/>your blood report?
          </h2>
          <p className="text-white/60 mb-8 max-w-md mx-auto">
            Join people already using HemoLens to make sense of their lab results.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link to="/register" className="bg-white text-[#1A1D29] font-medium px-6 py-3.5 rounded-full flex items-center gap-2 hover:bg-slate-100 transition-colors">
              Get started — it's free <ArrowRight size={16} />
            </Link>
            <Link to="/login" className="text-white font-medium px-6 py-3.5 rounded-full border border-white/20 hover:bg-white/10 transition-colors">
              Log in
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-6 py-8 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-[#2F3CED] rounded-lg flex items-center justify-center">
            <Eye size={12} className="text-white" />
          </div>
          <span className="font-medium text-slate-700 text-sm">HemoLens</span>
        </div>
        <p className="text-xs text-slate-400">© 2026 HemoLens. Educational use only — not a substitute for medical advice.</p>
      </footer>
    </div>
  )
}