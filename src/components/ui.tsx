import React from 'react';
import { Inbox, Star, X } from 'lucide-react';

export function Button(props: any) {
  const { children, variant, size, className, ...rest } = props;
  const variants: Record<string, string> = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'border border-slate-300 bg-white text-slate-800 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    ghost: 'hover:bg-slate-100 dark:hover:bg-slate-800'
  };
  const sizes: Record<string, string> = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-10 px-4 text-sm',
    lg: 'h-12 px-6 text-base'
  };
  const base = 'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition disabled:cursor-not-allowed disabled:opacity-50';
  return (
    <button className={[base, variants[variant || 'primary'], sizes[size || 'md'], className || ''].join(' ')} {...rest}>
      {children}
    </button>
  );
}

export function Input(props: any) {
  const { label, error, className, ...rest } = props;
  const inputClass = 'h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 ' + (className || '');
  return (
    <div className="space-y-1">
      {label ? <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label> : null}
      <input className={inputClass} {...rest} />
      {error ? <p className="text-xs text-red-500">{error}</p> : null}
    </div>
  );
}

export function Select(props: any) {
  const { label, error, className, children, ...rest } = props;
  const selectClass = 'h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 ' + (className || '');
  return (
    <div className="space-y-1">
      {label ? <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label> : null}
      <select className={selectClass} {...rest}>{children}</select>
      {error ? <p className="text-xs text-red-500">{error}</p> : null}
    </div>
  );
}

export function Textarea(props: any) {
  const { label, error, className, ...rest } = props;
  const areaClass = 'min-h-24 w-full rounded-lg border border-slate-300 bg-white p-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 ' + (className || '');
  return (
    <div className="space-y-1">
      {label ? <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label> : null}
      <textarea className={areaClass} {...rest} />
      {error ? <p className="text-xs text-red-500">{error}</p> : null}
    </div>
  );
}

export function Card(props: any) {
  const { children, className } = props;
  return (
    <div className={['rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900', className || ''].join(' ')}>
      {children}
    </div>
  );
}

export function Badge(props: any) {
  const { children, tone } = props;
  const tones: Record<string, string> = {
    default: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
    blue: 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300',
    green: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
    amber: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
    red: 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-300'
  };
  return <span className={['inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium', tones[tone || 'default']].join(' ')}>{children}</span>;
}

export function Modal(props: any) {
  const { open, onClose, title, children, footer } = props;
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-2xl rounded-xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button aria-label="Close" onClick={onClose} className="rounded-lg p-1 hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto pr-1">{children}</div>
        {footer ? <div className="mt-6 flex justify-end gap-2">{footer}</div> : null}
      </div>
    </div>
  );
}

export function EmptyState(props: any) {
  const { title, message, action } = props;
  return (
    <Card className="flex flex-col items-center justify-center gap-3 p-10 text-center">
      <Inbox className="h-10 w-10 text-slate-300 dark:text-slate-600" />
      <h3 className="text-lg font-semibold">{title}</h3>
      {message ? <p className="max-w-md text-sm text-slate-500 dark:text-slate-400">{message}</p> : null}
      {action ? action : null}
    </Card>
  );
}

export function Skeleton(props: any) {
  const { className } = props;
  return <div className={['animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800', className || ''].join(' ')} />;
}

export function StatusBadge(props: any) {
  const { status } = props;
  const styles: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
    confirmed: 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300',
    checked_in: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
    checked_out: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
    cancelled: 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-300',
    no_show: 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
    paid: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
    refunded: 'bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-300',
    failed: 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-300',
    available: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
    occupied: 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300',
    reserved: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300',
    cleaning: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
    maintenance: 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-300',
    out_of_service: 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
    active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
    inactive: 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
    visible: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
    hidden: 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
    dirty: 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-300',
    clean: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
    inspected: 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300'
  };
  const label = String(status || '').replace('_', ' ');
  return <span className={['inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize', styles[status] || styles.pending].join(' ')}>{label}</span>;
}

export function RatingStars(props: any) {
  const { rating } = props;
  const stars = [];
  for (let i = 1; i <= 5; i += 1) {
    stars.push(
      <Star key={i} className={i <= Math.round(rating || 0) ? 'h-4 w-4 fill-amber-400 text-amber-400' : 'h-4 w-4 text-slate-300 dark:text-slate-600'} />
    );
  }
  return <div className="flex items-center gap-0.5">{stars}</div>;
}

export function StatCard(props: any) {
  const { title, value, icon: Icon, hint } = props;
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
          <p className="mt-1 text-2xl font-semibold">{value}</p>
          {hint ? <p className="mt-1 text-xs text-slate-400">{hint}</p> : null}
        </div>
        <div className="rounded-lg bg-blue-50 p-2 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
          {Icon ? <Icon className="h-5 w-5" /> : null}
        </div>
      </div>
    </Card>
  );
}
