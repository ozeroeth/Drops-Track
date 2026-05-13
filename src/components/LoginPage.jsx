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
        className="sketchy-card relative z-10 w-full max-w-[420px] p-8"
      >
        <div className="mb-6 flex flex-col items-center text-center">
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <span style={{ color: 'var(--accent)' }}>&#9670;</span>
            <span>
              <span style={{ color: 'var(--accent)' }}>Drop</span><span style={{ color: 'var(--text)' }}>Track</span>
            </span>
          </h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
            Track your airdrops. Never miss a drop.
          </p>
        </div>

        <button
          type="button"
          onClick={handleGoogle}
          disabled={busy}
          className="sketchy-btn w-full px-3 py-2.5 text-sm"
          style={{ background: 'var(--accent)', color: 'white' }}
        >
          Continue with Google
        </button>

        <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
          <span className="h-px flex-1" style={{ background: 'var(--border)' }} />
          <span>or continue with</span>
          <span className="h-px flex-1" style={{ background: 'var(--border)' }} />
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label
              htmlFor="login-email"
              className="mb-1 block text-xs font-medium"
              style={{ color: 'var(--text-muted)' }}
            >
              Email
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="sketchy-input w-full px-3 py-2 text-sm"
              required
            />
          </div>
          <div>
            <label
              htmlFor="login-password"
              className="mb-1 block text-xs font-medium"
              style={{ color: 'var(--text-muted)' }}
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
              className="sketchy-input w-full px-3 py-2 text-sm"
              required
              minLength={6}
            />
          </div>

          {errorMsg ? (
            <p className="text-sm" style={{ color: '#c62828' }} role="alert">
              {errorMsg}
            </p>
          ) : null}
          {infoMsg ? (
            <p className="text-sm" style={{ color: 'var(--accent)' }} role="status">
              {infoMsg}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={busy}
            className="sketchy-btn-ghost w-full px-3 py-2 text-sm"
          >
            {busy ? 'Please wait...' : submitLabel}
          </button>
        </form>

        <div className="mt-4 flex flex-col items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
          <button
            type="button"
            onClick={toggleMode}
            className="focus:outline-none"
            style={{ color: 'var(--text-muted)' }}
          >
            {mode === 'login'
              ? "Don't have an account? Sign up"
              : 'Already have an account? Log in'}
          </button>
          <button
            type="button"
            onClick={handleForgotPassword}
            className="focus:outline-none"
            style={{ color: 'var(--text-muted)' }}
          >
            Forgot password?
          </button>
        </div>

        <p className="mt-6 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
          Powered by Supabase
        </p>
      </div>
    </div>
  );
}
