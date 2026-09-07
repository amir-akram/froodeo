'use client';

import { useAdmin } from '@/context/AdminContext';
import { useChangePassword } from '@/hooks/admin/useChangePassword';
import { cn } from '@/lib/utils';
import { Check, CheckCircle2, Eye, EyeOff, Loader2, X } from 'lucide-react';
import { useMemo, useState } from 'react';

export default function SettingsPage() {
  const { admin } = useAdmin();
  const changePassword = useChangePassword();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [touched, setTouched] = useState(false);
  const [success, setSuccess] = useState(false);

  const lengthOk = newPassword.length >= 8;
  const matchOk = confirmPassword.length > 0 && newPassword === confirmPassword;
  const canSubmit = currentPassword.length > 0 && lengthOk && matchOk;

  const mismatchError = touched && confirmPassword.length > 0 && !matchOk ? 'Passwords do not match' : null;

  const strength = useMemo(() => {
    if (!newPassword) return 0;
    let score = 0;
    if (newPassword.length >= 8) score++;
    if (newPassword.length >= 12) score++;
    if (/[0-9]/.test(newPassword) && /[a-zA-Z]/.test(newPassword)) score++;
    if (/[^a-zA-Z0-9]/.test(newPassword)) score++;
    return score;
  }, [newPassword]);

  const strengthLabel = ['Too short', 'Weak', 'Fair', 'Good', 'Strong'][strength];
  const strengthColor = ['bg-zinc-800', 'bg-red-500', 'bg-amber-500', 'bg-emerald-600', 'bg-emerald-400'][strength];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    setSuccess(false);
    if (!canSubmit) return;

    changePassword.mutate(
      { current_password: currentPassword, new_password: newPassword },
      {
        onSuccess: () => {
          setSuccess(true);
          setTouched(false);
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
        },
      }
    );
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-8 animate-fade-up">
        <h1 className="text-lg font-semibold text-zinc-100">Settings</h1>
        <p className="mt-1 text-sm text-zinc-500">Manage your account and security preferences.</p>
      </div>

      {/* Account section */}
      <SettingsRow
        title="Account"
        description="The username associated with this admin account."
        delay={0.05}
      >
        <div className="flex items-center gap-3 rounded-md border border-zinc-800 bg-zinc-900/40 px-3 py-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs font-medium text-zinc-300">
            {admin?.username?.slice(0, 2).toUpperCase()}
          </div>
          <span className="text-sm text-zinc-200">{admin?.username}</span>
        </div>
      </SettingsRow>

      <Divider />

      {/* Password section */}
      <SettingsRow
        title="Password"
        description="Choose a strong password you don't use elsewhere. You'll stay signed in on this device after changing it."
        delay={0.1}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <PasswordField
            label="Current password"
            value={currentPassword}
            onChange={setCurrentPassword}
            show={showCurrent}
            onToggle={() => setShowCurrent((v) => !v)}
            autoComplete="current-password"
          />

          <div className="space-y-2">
            <PasswordField
              label="New password"
              value={newPassword}
              onChange={setNewPassword}
              show={showNew}
              onToggle={() => setShowNew((v) => !v)}
              autoComplete="new-password"
            />
            {newPassword.length > 0 && (
              <div className="animate-fade-in space-y-1.5">
                <div className="flex gap-1">
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={cn(
                        'h-1 flex-1 rounded-full transition-colors duration-300',
                        i < strength ? strengthColor : 'bg-zinc-800'
                      )}
                    />
                  ))}
                </div>
                <p
                  className={cn(
                    'text-xs',
                    strength <= 1 ? 'text-red-400' : strength === 2 ? 'text-amber-400' : 'text-emerald-400'
                  )}
                >
                  {strengthLabel}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <PasswordField
              label="Confirm new password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              show={showConfirm}
              onToggle={() => setShowConfirm((v) => !v)}
              autoComplete="new-password"
              error={!!mismatchError}
            />
            {confirmPassword.length > 0 && (
              <p
                className={cn(
                  'flex items-center gap-1.5 text-xs animate-fade-in',
                  matchOk ? 'text-emerald-400' : 'text-red-400'
                )}
              >
                {matchOk ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                {matchOk ? 'Passwords match' : 'Passwords do not match'}
              </p>
            )}
          </div>

          {changePassword.isError && (
            <p className="rounded-md bg-red-950/30 px-3 py-2 text-sm text-red-400 animate-fade-in">
              {(changePassword.error as Error).message}
            </p>
          )}

          {success && (
            <p className="flex items-center gap-2 rounded-md bg-emerald-950/30 px-3 py-2 text-sm text-emerald-400 animate-fade-in">
              <CheckCircle2 className="h-4 w-4" /> Password updated successfully
            </p>
          )}

          <div className="flex items-center gap-3 pt-1">
            <button
              type="submit"
              disabled={changePassword.isPending || !canSubmit}
              className="flex items-center gap-2 rounded-md bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-950 transition-colors hover:bg-white active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100"
            >
              {changePassword.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Update password
            </button>
            {!canSubmit && touched && (
              <span className="text-xs text-zinc-600">Fill in all fields to continue</span>
            )}
          </div>
        </form>
      </SettingsRow>
    </div>
  );
}

function SettingsRow({
  title,
  description,
  children,
  delay = 0,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <div
      className="grid animate-fade-up grid-cols-1 gap-6 py-6 sm:grid-cols-[220px_1fr]"
      style={{ animationDelay: `${delay}s` }}
    >
      <div>
        <h2 className="text-sm font-medium text-zinc-200">{title}</h2>
        <p className="mt-1 text-sm leading-relaxed text-zinc-500">{description}</p>
      </div>
      <div>{children}</div>
    </div>
  );
}

function Divider() {
  return <div className="border-t border-zinc-800/80" />;
}

function PasswordField({
  label,
  value,
  onChange,
  show,
  onToggle,
  autoComplete,
  error,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  onToggle: () => void;
  autoComplete?: string;
  error?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm text-zinc-400">{label}</label>
      <div className="relative max-w-sm">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
          autoComplete={autoComplete}
          className={cn(
            'w-full rounded-md border bg-zinc-900 px-3 py-2 pr-10 text-sm text-zinc-100 transition-colors focus:outline-none',
            error
              ? 'border-red-900/60 focus:border-red-700'
              : 'border-zinc-800 focus:border-zinc-600'
          )}
        />
        <button
          type="button"
          onClick={onToggle}
          tabIndex={-1}
          aria-label={show ? 'Hide password' : 'Show password'}
          className="absolute inset-y-0 right-0 flex items-center px-3 text-zinc-500 transition-colors hover:text-zinc-300"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}