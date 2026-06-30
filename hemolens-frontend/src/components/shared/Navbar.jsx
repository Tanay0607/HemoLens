// src/components/shared/Navbar.jsx
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Upload, LayoutDashboard, LogOut, User } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => { logout(); navigate('/') }
  const isActive = (path) => location.pathname === path

  return (
    <nav className="sticky top-0 z-50 px-4 pt-4">
      <div className="max-w-5xl mx-auto bg-white/70 backdrop-blur-xl rounded-full border border-white/80 shadow-sm h-16 flex items-center justify-between px-5">

        <Link to="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-[#2F3CED] rounded-xl flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"/>
            </svg>
          </div>
          <span className="font-display font-semibold text-slate-900 tracking-tight">HemoLens</span>
        </Link>

        <div className="hidden sm:flex items-center gap-1 bg-slate-100/70 rounded-full p-1">
          <Link to="/dashboard"
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors
              ${isActive('/dashboard') ? 'bg-white text-[#2F3CED] shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
            <LayoutDashboard size={14} /> Dashboard
          </Link>
          <Link to="/upload"
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors
              ${isActive('/upload') ? 'bg-white text-[#2F3CED] shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
            <Upload size={14} /> Upload
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-sm text-slate-600">
            <div className="w-7 h-7 bg-[#2F3CED]/10 rounded-full flex items-center justify-center">
              <User size={13} className="text-[#2F3CED]" />
            </div>
            <span className="font-medium">{user?.name}</span>
          </div>
          <button onClick={handleLogout} className="btn-ghost text-sm text-slate-500 hover:text-red-600 !px-3">
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </nav>
  )
}
