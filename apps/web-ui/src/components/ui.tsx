import { Link } from 'react-router-dom';

export function LoadingState({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-700 border-t-transparent" />
      <p className="mt-3 text-sm text-slate-500">{message}</p>
    </div>
  );
}

export function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-danger-border bg-danger-light px-4 py-3 text-sm text-danger animate-fade-in">
      {message}
    </div>
  );
}

export function EmptyState({
  message,
  icon,
  actionLabel,
  actionTo,
}: {
  message: string;
  icon?: string;
  actionLabel?: string;
  actionTo?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center animate-fade-in">
      {icon && <span className="mb-3 text-4xl">{icon}</span>}
      <p className="text-slate-500">{message}</p>
      {actionLabel && actionTo && (
        <Link
          to={actionTo}
          className="mt-4 inline-block rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary-hover transition-colors"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}

type ButtonVariant = 'primary' | 'positive' | 'muted' | 'danger';

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-primary hover:bg-primary-hover text-white',
  positive: 'bg-positive hover:bg-positive-hover text-white',
  muted: 'bg-muted hover:bg-muted-hover text-slate-800',
  danger: 'bg-danger hover:bg-red-700 text-white',
};

export function Button({
  variant = 'primary',
  children,
  onClick,
  disabled,
  type = 'button',
  className = '',
}: {
  variant?: ButtonVariant;
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`rounded-lg px-4 py-2 font-semibold transition-all duration-150 disabled:opacity-50 hover:shadow-md active:scale-[0.98] ${variantClasses[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

export function ButtonLink({
  variant = 'primary',
  to,
  children,
  className = '',
}: {
  variant?: ButtonVariant;
  to: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      to={to}
      className={`inline-block rounded-lg px-4 py-2 font-semibold transition-all duration-150 hover:shadow-md ${variantClasses[variant]} ${className}`}
    >
      {children}
    </Link>
  );
}

export function Input({
  label,
  error,
  className = '',
  ...props
}: {
  label?: string;
  error?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-semibold text-slate-700 mb-1">
          {label}
        </label>
      )}
      <input
        {...props}
        className={`w-full rounded-lg border px-3 py-2 text-slate-800 bg-field transition-colors placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-600 ${
          error ? 'border-danger' : 'border-slate-300'
        }`}
      />
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}

export function Select({
  label,
  children,
  className = '',
  ...props
}: {
  label?: string;
  children: React.ReactNode;
} & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-semibold text-slate-700 mb-1">
          {label}
        </label>
      )}
      <select
        {...props}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 bg-field transition-colors focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-600"
      >
        {children}
      </select>
    </div>
  );
}

export function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 text-center">
      <div className="text-2xl font-display text-green-900">{value}</div>
      <div className="text-xs text-slate-500 mt-1 uppercase tracking-wide font-semibold">{label}</div>
    </div>
  );
}
