'use client';

import { useState } from 'react';
import { X, Mail, ArrowRight } from 'lucide-react';
import styles from '@/styles/AuthModal.module.css';

interface AuthModalProps {
  onClose: () => void;
  onSuccess: (user: any) => void;
}

export default function AuthModal({ onClose, onSuccess }: AuthModalProps) {
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);

  async function handleRequestOTP(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send code');
      }

      setStep('otp');
    } catch (err: any) {
      setError(err.message || 'Failed to send verification code');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOTP(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Invalid code');
      }

      setIsNewUser(data.isNewUser);
      onSuccess(data.user);
    } catch (err: any) {
      setError(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  }

  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }

  return (
    <div className={styles.backdrop} onClick={handleBackdropClick}>
      <div className={styles.modal}>
        <button className={styles.closeButton} onClick={onClose} aria-label="Close">
          <X size={20} />
        </button>

        <div className={styles.header}>
          <h2>{step === 'email' ? 'Sign In / Sign Up' : 'Enter Code'}</h2>
          <p className={styles.subtitle}>
            {step === 'email'
              ? 'Enter your email to get started'
              : `We sent a code to ${email}`}
          </p>
        </div>

        {error && (
          <div className={styles.error}>
            {error}
          </div>
        )}

        {step === 'email' ? (
          <form onSubmit={handleRequestOTP} className={styles.form}>
            <div className={styles.inputGroup}>
              <Mail className={styles.inputIcon} size={20} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                autoFocus
                disabled={loading}
                className={styles.input}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !email}
              className={styles.submitButton}
            >
              {loading ? 'Sending...' : 'Continue'}
              <ArrowRight size={16} />
            </button>

            <p className={styles.notice}>
              We'll send you a verification code. No password needed!
            </p>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className={styles.form}>
            <div className={styles.inputGroup}>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                required
                autoFocus
                disabled={loading}
                className={`${styles.input} ${styles.otpInput}`}
                maxLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className={styles.submitButton}
            >
              {loading ? 'Verifying...' : 'Verify Code'}
            </button>

            <button
              type="button"
              onClick={() => setStep('email')}
              className={styles.backButton}
              disabled={loading}
            >
              Back to email
            </button>

            <p className={styles.notice}>
              Didn't receive the code? Check your spam folder or try again.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
