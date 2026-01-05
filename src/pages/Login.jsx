import React, { useState } from 'react'
import { useAuthStore } from '../stores/authStore'
import { Loader2 } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [loading, setLoading] = useState(false)

  const signIn = useAuthStore(state => state.signIn)

  const validateEmail = (email) => {
    if (!email) {
      setEmailError('Email is required')
      return false
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Email is invalid')
      return false
    }
    setEmailError('')
    return true
  }

  const validatePassword = (password) => {
    if (!password) {
      setPasswordError('Password is required')
      return false
    }
    setPasswordError('')
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setEmailError('')
    setPasswordError('')

    // Validate
    const isEmailValid = validateEmail(email)
    const isPasswordValid = validatePassword(password)

    if (!isEmailValid || !isPasswordValid) {
      return
    }

    setLoading(true)

    const { error } = await signIn(email, password)

    if (error) {
      setError('Invalid email or password')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-67-black">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-67-dark rounded-2xl mb-4">
            <span className="text-4xl font-black text-67-gold">67</span>
          </div>
          <h1 className="text-2xl font-bold text-white">67 Hub</h1>
          <p className="text-gray-500 text-sm mt-1">Artist Management Portal</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4" data-testid="login-form">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={(e) => validateEmail(e.target.value)}
              className="w-full px-4 py-3 bg-67-dark border border-67-gray rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-67-gold transition-colors"
              placeholder="your@email.com"
              data-testid="email-input"
            />
            {emailError && (
              <p className="mt-1 text-sm text-red-400" data-testid={
                emailError.includes('required') ? 'error-email-required' : 'error-email-invalid'
              }>
                {emailError}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={(e) => validatePassword(e.target.value)}
              className="w-full px-4 py-3 bg-67-dark border border-67-gray rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-67-gold transition-colors"
              placeholder="••••••••"
              data-testid="password-input"
            />
            {passwordError && (
              <p className="mt-1 text-sm text-red-400" data-testid="error-password-required">
                {passwordError}
              </p>
            )}
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm" data-testid="error-invalid-credentials">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-67-gold text-black font-bold rounded-xl hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            data-testid="login-button"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Demo credentials */}
        <div className="mt-8 p-4 bg-67-dark rounded-xl">
          <p className="text-xs text-gray-500 mb-2">Demo Credentials:</p>
          <div className="space-y-1 text-xs">
            <p className="text-gray-400">
              <span className="text-gray-500">Admin:</span> admin@67hub.test
            </p>
            <p className="text-gray-400">
              <span className="text-gray-500">Artist:</span> artist1@67hub.test
            </p>
            <p className="text-gray-400">
              <span className="text-gray-500">Password:</span> testpassword123
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
