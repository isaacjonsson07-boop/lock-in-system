import React, { useState } from 'react';
import { X, AlertCircle, CheckCircle } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignIn: (email: string, password: string) => Promise<any>;
  onSignUp: (email: string, password: string) => Promise<any>;
  onResetPassword: (email: string) => Promise<any>;
}

export function AuthModal({ isOpen, onClose, onSignIn, onSignUp, onResetPassword }: AuthModalProps) {
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [signUpSuccess, setSignUpSuccess] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'forgot') {
        const { error } = await onResetPassword(email);
        if (error) {
          setError(error.message || 'Failed to send reset email');
        } else {
          setResetSent(true);
        }
      } else if (mode === 'signin') {
        const { error } = await onSignIn(email, password);
        if (error) {
          setError(error.message || 'Sign in failed');
        } else {
          onClose();
          resetForm();
        }
      } else {
        const { error } = await onSignUp(email, password);
        if (error) {
          setError(error.message || 'Sign up failed');
        } else {
          // Email confirmation is off — auto sign in
          const { error: signInError } = await onSignIn(email, password);
          if (signInError) {
            setError(signInError.message || 'Account created but sign in failed. Try signing in.');
          } else {
            onClose();
            resetForm();
          }
        }
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setError('');
    setSignUpSuccess(false);
    setResetSent(false);
  };

  const switchMode = (newMode: 'signin' | 'signup' | 'forgot') => {
    setMode(newMode);
    setError('');
    setSignUpSuccess(false);
    setResetSent(false);
  };

  const headings: Record<string, string> = {
    signin: 'Welcome back',
    signup: 'Create account',
    forgot: 'Reset password',
  };

  const subtexts: Record<string, string> = {
    signin: 'Sign in to sync your system.',
    signup: 'Start building your operating system.',
    forgot: 'Enter your email and we\'ll send a reset link.',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-sa-bg-warm border border-sa-border-light rounded-2xl p-8 animate-rise">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-sa-cream-faint hover:text-sa-cream transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="font-serif text-xl text-sa-cream mb-1">
          {headings[mode]}
        </h2>
        <p className="text-[0.78rem] text-sa-cream-muted mb-6">
          {subtexts[mode]}
        </p>

        {resetSent ? (
          <div className="bg-[rgba(90,219,126,0.08)] border border-[rgba(90,219,126,0.2)] rounded-lg p-4 text-center">
            <CheckCircle className="w-5 h-5 text-sa-green mx-auto mb-2" />
            <p className="text-sa-green text-[0.88rem] font-medium mb-1">Reset link sent</p>
            <p className="text-sa-cream-muted text-[0.78rem]">Check your email for a password reset link.</p>
          </div>
        ) : signUpSuccess ? (
          <div className="bg-[rgba(90,219,126,0.08)] border border-[rgba(90,219,126,0.2)] rounded-lg p-4 text-center">
            <p className="text-sa-green text-[0.88rem] font-medium mb-1">Account created</p>
            <p className="text-sa-cream-muted text-[0.78rem]">Check your email to verify, then sign in.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="w-full bg-sa-bg border border-sa-border-light rounded-lg px-4 py-3 text-[0.88rem] text-sa-cream placeholder:text-sa-cream-faint outline-none focus:border-sa-gold transition-colors"
            />
            {mode !== 'forgot' && (
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                minLength={6}
                className="w-full bg-sa-bg border border-sa-border-light rounded-lg px-4 py-3 text-[0.88rem] text-sa-cream placeholder:text-sa-cream-faint outline-none focus:border-sa-gold transition-colors"
              />
            )}

            {error && (
              <div className="flex items-start gap-2 bg-[rgba(230,100,100,0.08)] border border-[rgba(230,100,100,0.2)] rounded-lg px-3 py-2">
                <AlertCircle className="w-4 h-4 text-sa-rose flex-shrink-0 mt-0.5" />
                <p className="text-[0.78rem] text-sa-rose">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[rgba(201,169,110,0.15)] border border-[rgba(201,169,110,0.3)] text-sa-gold rounded-lg text-[0.88rem] font-medium hover:bg-[rgba(201,169,110,0.25)] transition-colors disabled:opacity-50"
            >
              {loading
                ? 'Loading...'
                : mode === 'signin'
                  ? 'Sign In'
                  : mode === 'signup'
                    ? 'Create Account'
                    : 'Send Reset Link'}
            </button>
          </form>
        )}

        <div className="mt-5 text-center space-y-2">
          {mode === 'signin' && (
            <>
              <button
                onClick={() => switchMode('forgot')}
                className="block w-full text-[0.78rem] text-sa-cream-faint hover:text-sa-cream transition-colors"
              >
                Forgot password?
              </button>
              <button
                onClick={() => switchMode('signup')}
                className="block w-full text-[0.78rem] text-sa-cream-faint hover:text-sa-cream transition-colors"
              >
                Don't have an account? Sign up
              </button>
            </>
          )}
          {mode === 'signup' && (
            <button
              onClick={() => switchMode('signin')}
              className="text-[0.78rem] text-sa-cream-faint hover:text-sa-cream transition-colors"
            >
              Already have an account? Sign in
            </button>
          )}
          {mode === 'forgot' && (
            <button
              onClick={() => switchMode('signin')}
              className="text-[0.78rem] text-sa-cream-faint hover:text-sa-cream transition-colors"
            >
              Back to sign in
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
