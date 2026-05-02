import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock, ArrowLeft, Eye, EyeOff } from 'lucide-react'
import { config } from '@/data/config'

export default function Admin() {
  const navigate = useNavigate()
  const [password, setPassword]   = useState('')
  const [shaking, setShaking]     = useState(false)
  const [errorMsg, setErrorMsg]   = useState('')
  const [showPw, setShowPw]       = useState(false)
  const inputRef = useRef(null)

  // Nếu đã đăng nhập → redirect thẳng vào dashboard
  useEffect(() => {
    if (localStorage.getItem('adminUnlocked') === 'true') {
      navigate('/admin/dashboard', { replace: true })
    }
  }, [navigate])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (password === config.adminPassword) {
      localStorage.setItem('adminUnlocked', 'true')
      navigate('/admin/dashboard', { replace: true })
    } else {
      setShaking(true)
      setPassword('')
      setErrorMsg('Sai mật khẩu rồi!')
      inputRef.current?.focus()
      setTimeout(() => setShaking(false), 600)
      setTimeout(() => setErrorMsg(''), 1500)
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: 'var(--background)' }}
    >
      {/* Back link */}
      <Link
        to="/"
        className="absolute top-6 left-6 flex items-center gap-2 text-sm transition-opacity hover:opacity-70"
        style={{ color: 'var(--text-sub)' }}
      >
        <ArrowLeft size={16} />
        Về trang chính
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm"
      >
        {/* Lock icon */}
        <div className="flex justify-center mb-6">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ background: 'var(--surface-alt)', boxShadow: '0 4px 20px var(--shadow)' }}
          >
            <Lock size={28} style={{ color: 'var(--primary)' }} />
          </div>
        </div>

        {/* Heading */}
        <h1
          className="text-center font-heading text-3xl font-bold mb-1"
          style={{ color: 'var(--text-main)' }}
        >
          Admin Panel
        </h1>
        <p
          className="text-center font-body text-sm mb-8"
          style={{ color: 'var(--text-sub)' }}
        >
          Quản lý nội dung website
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <motion.div
            animate={shaking ? { x: [0, -10, 10, -8, 8, -4, 4, 0] } : { x: 0 }}
            transition={{ duration: 0.5 }}
            className="relative mb-3"
          >
            <input
              ref={inputRef}
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu admin..."
              autoFocus
              className="w-full rounded-xl px-4 py-3 pr-12 font-body text-base outline-none transition-all"
              style={{
                background: 'var(--surface)',
                border: `1.5px solid ${errorMsg ? '#ef4444' : 'var(--border)'}`,
                color: 'var(--text-main)',
              }}
            />
            <button
              type="button"
              onClick={() => setShowPw(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-80 transition-opacity"
              style={{ color: 'var(--text-sub)' }}
            >
              {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </motion.div>

          {/* Error message */}
          <AnimatePresence>
            {errorMsg && (
              <motion.p
                key="err"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-sm text-center mb-3"
                style={{ color: '#ef4444' }}
              >
                {errorMsg}
              </motion.p>
            )}
          </AnimatePresence>

          <button
            type="submit"
            className="btn-primary w-full py-3 rounded-xl font-body font-semibold text-base"
          >
            Đăng nhập
          </button>
        </form>
      </motion.div>
    </div>
  )
}
