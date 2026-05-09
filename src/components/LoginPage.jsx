import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';

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
    <div className="flex min-h-screen items-center justify-center bg-bg px-4 py-10 text-slate-100">
      <div className="w-full max-w-md rounded-lg border border-surface2 bg-surface p-6 shadow-xl">
        <div className="mb-6 flex flex-col items-center text-center">
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-accent-400" />
            <span>
              <span className="text-accent-400">Drop</span>Track
            </span>
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Track your DeFi airdrops and NFT whitelists in one place.
          </p>
        </div>

        <button
          type="button"
          onClick={handleGoogle}
          disabled={busy}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-accent-500 px-3 py-2 text-sm font-semibold text-slate-900 transition-colors hover:bg-accent-400 focus:outline-none focus:ring-2 focus:ring-accent-500/40 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Continue with Google
        </button>

        <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-wider text-slate-500">
          <span className="h-px flex-1 bg-surface2" />
          <span>or</span>
          <span className="h-px flex-1 bg-surface2" />
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
              className="w-full rounded-md border border-surface2 bg-surface px-3 py-2 text-sm text-slate-100 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/40"
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
              className="w-full rounded-md border border-surface2 bg-surface px-3 py-2 text-sm text-slate-100 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/40"
              required
              minLength={6}
            />
          </div>

          {errorMsg ? (
            <p className="text-sm text-red-400" role="alert">
              {errorMsg}
            </p>
          ) : null}
          {infoMsg ? (
            <p className="text-sm text-accent-400" role="status">
              {infoMsg}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-md border border-surface2 bg-surface2 px-3 py-2 text-sm font-semibold text-slate-100 transition-colors hover:bg-surface2/70 focus:outline-none focus:ring-2 focus:ring-accent-500/40 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? 'Please wait...' : submitLabel}
          </button>
        </form>

        <div className="mt-4 flex flex-col items-center gap-2 text-xs text-slate-400">
          <button
            type="button"
            onClick={toggleMode}
            className="text-slate-300 hover:text-accent-400 focus:outline-none focus:ring-2 focus:ring-accent-500/40"
          >
            {mode === 'login'
              ? "Don't have an account? Sign up"
              : 'Already have an account? Log in'}
          </button>
          <button
            type="button"
            onClick={handleForgotPassword}
            className="text-slate-400 hover:text-accent-400 focus:outline-none focus:ring-2 focus:ring-accent-500/40"
          >
            Forgot password?
          </button>
        </div>
      </div>
    </div>
  );
}
