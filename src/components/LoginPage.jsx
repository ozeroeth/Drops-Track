import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import BackgroundDecoration from './BackgroundDecoration.jsx';

export default function LoginPage() {
  const {
    signInWithGoogle,
    signInWithPassword,
    signUpWithPassword,
    resetPassword,
  } = useAuth();

  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');

  async function handleGoogle() {
    if (busy) return;
    setErrorMsg('');
    setInfoMsg('');
    setBusy(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) setErrorMsg(error.message || 'Google sign-in failed.');
    } catch (err) {
      setErrorMsg(err?.message || 'Google sign-in failed.');
    } finally {
      setBusy(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (busy) return;
    setErrorMsg('');
    setInfoMsg('');
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setErrorMsg('Email and password are required.');
      return;
    }
    setBusy(true);
    try {
      if (mode === 'login') {
        const { error } = await signInWithPassword(trimmedEmail, password);
        if (error) setErrorMsg(error.message || 'Login failed.');
      } else {
        const { data, error } = await signUpWithPassword(
          trimmedEmail,
          password,
        );
        if (error) {
          setErrorMsg(error.message || 'Sign-up failed.');
        } else if (!data?.session) {
          setInfoMsg('Check your email to confirm your address.');
        }
      }
    } catch (err) {
      setErrorMsg(err?.message || 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  }

  async function handleForgotPassword() {
    if (busy) return;
    const prefill = email.trim();
    const entered = window.prompt(
      'Enter the email address for your DropTrack account:',
      prefill,
    );
    if (entered === null) return;
    const target = entered.trim();
    if (!target) {
      setErrorMsg('Email is required to reset your password.');
      return;
    }
    setErrorMsg('');
    setInfoMsg('');
    setBusy(true);
    try {
      const { error } = await resetPassword(target);
      if (error) {
        setErrorMsg(error.message || 'Could not send reset email.');
      } else {
        setInfoMsg(`Password reset email sent to ${target}.`);
      }
    } catch (err) {
      setErrorMsg(err?.message || 'Could not send reset email.');
    } finally {
      setBusy(false);
    }
  }

  function toggleMode() {
    setMode((m) => (m === 'login' ? 'signup' : 'login'));
    setErrorMsg('');
    setInfoMsg('');
  }

  const submitLabel = mode === 'login' ? 'Log in' : 'Sign up';

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-10">
      <BackgroundDecoration />
      <div
        className="relative z-10 w-full max-w-[420px] rounded-2xl p-8"
        style={{
          background: 'rgba(13,17,23,0.85)',
          border: '1px solid rgba(255,255,255,0.06)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      >
        <div className="mb-6 flex flex-col items-center text-center">
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight font-heading">
            <span className="text-primary">&#9670;</span>
            <span>
              <span className="text-primary">Drop</span><span className="text-white">Track</span>
            </span>
          </h1>
          <p className="mt-2 text-sm text-textSecondary">
            Track your airdrops. Never miss a drop.
          </p>
        </div>

        <button
          type="button"
          onClick={handleGoogle}
          disabled={busy}
          className="flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-white transition-all hover:shadow-[0_0_20px_rgba(247,147,26,0.3)] focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-60"
          style={{
            background: 'linear-gradient(135deg, #F7931A, #E8820A)',
          }}
        >
          Continue with Google
        </button>

        <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-wider text-textSecondary">
          <span className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.06)' }} />
          <span>or continue with</span>
          <span className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.06)' }} />
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label
              htmlFor="login-email"
              className="mb-1 block text-xs font-medium text-slate-300"
            >
              Email
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-[10px] px-3 py-2 text-sm text-white placeholder-[#4A5568] focus:outline-none focus:ring-2 focus:ring-primary/40"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
              required
            />
          </div>
          <div>
            <label
              htmlFor="login-password"
              className="mb-1 block text-xs font-medium text-slate-300"
            >
              Password
            </label>
            <input
              id="login-password"
              type="password"
              autoComplete={
                mode === 'login' ? 'current-password' : 'new-password'
              }
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-[10px] px-3 py-2 text-sm text-white placeholder-[#4A5568] focus:outline-none focus:ring-2 focus:ring-primary/40"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
              required
              minLength={6}
            />
          </div>

          {errorMsg ? (
            <p className="text-sm text-danger" role="alert">
              {errorMsg}
            </p>
          ) : null}
          {infoMsg ? (
            <p className="text-sm text-primary" role="status">
              {infoMsg}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-[10px] px-3 py-2 text-sm font-semibold text-white transition-colors hover:border-[rgba(255,255,255,0.2)] focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-60"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.12)',
            }}
          >
            {busy ? 'Please wait...' : submitLabel}
          </button>
        </form>

        <div className="mt-4 flex flex-col items-center gap-2 text-xs text-textSecondary">
          <button
            type="button"
            onClick={toggleMode}
            className="text-slate-300 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            {mode === 'login'
              ? "Don't have an account? Sign up"
              : 'Already have an account? Log in'}
          </button>
          <button
            type="button"
            onClick={handleForgotPassword}
            className="text-textSecondary hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            Forgot password?
          </button>
        </div>

        <p className="mt-6 text-center text-xs text-textSecondary">
          Powered by Supabase
        </p>
      </div>
    </div>
  );
}
