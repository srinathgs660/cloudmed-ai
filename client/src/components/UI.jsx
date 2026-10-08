import React from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';

export const Card = ({ children, className = '', title, subtitle, action }) => (
  <div className={`bg-white rounded-xl border border-slate-200/80 shadow-sm transition-all hover:shadow-md ${className}`}>
    {(title || action) && (
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <div>
          {title && <h3 className="font-semibold text-slate-800 text-base">{title}</h3>}
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
    )}
    <div className="p-6">{children}</div>
  </div>
);

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  icon: Icon,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-teal-600 hover:bg-teal-700 text-white focus:ring-teal-500 shadow-sm',
    secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-700 focus:ring-slate-400',
    outline: 'border border-slate-300 hover:bg-slate-50 text-slate-700 focus:ring-teal-500',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-500 shadow-sm',
    ghost: 'hover:bg-slate-100 text-slate-600 focus:ring-slate-300',
    success: 'bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-500 shadow-sm',
  };

  const sizes = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
      ) : Icon ? (
        <Icon className="w-4 h-4" />
      ) : null}
      {children}
    </button>
  );
};

export const Badge = ({ children, variant = 'neutral', size = 'sm', className = '' }) => {
  const variants = {
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    info: 'bg-sky-50 text-sky-700 border-sky-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
  };

  const sizes = {
    xs: 'text-[10px] px-1.5 py-0.5',
    sm: 'text-xs px-2.5 py-0.5',
    md: 'text-sm px-3 py-1',
  };

  return (
    <span className={`inline-flex items-center font-medium rounded-full border ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </span>
  );
};

export const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
        <div className={`relative transform overflow-hidden rounded-2xl bg-white text-left shadow-xl transition-all sm:my-8 w-full ${maxWidth} z-10 border border-slate-100`}>
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <h3 className="text-base font-semibold text-slate-800">{title}</h3>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="px-6 py-5 max-h-[80vh] overflow-y-auto">{children}</div>
        </div>
      </div>
    </div>
  );
};

export const Loader = ({ message = 'Loading details...' }) => (
  <div className="flex flex-col items-center justify-center p-12 text-slate-500">
    <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin mb-3" />
    <p className="text-sm font-medium text-slate-600">{message}</p>
  </div>
);

export const EmptyState = ({ title = 'No records found', description, icon: Icon = Info, action }) => (
  <div className="text-center py-12 px-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/50">
    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 text-slate-400 mb-3">
      <Icon className="w-6 h-6" />
    </div>
    <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
    {description && <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">{description}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

export const RiskCard = ({ assessment }) => {
  if (!assessment) return null;

  const { riskLevel, probability, message, keyFactors, disclaimer } = assessment;

  const levelConfig = {
    High: {
      color: 'rose',
      border: 'border-rose-200',
      bg: 'bg-rose-50/70',
      text: 'text-rose-700',
      badge: 'danger',
      icon: AlertTriangle,
    },
    Medium: {
      color: 'amber',
      border: 'border-amber-200',
      bg: 'bg-amber-50/70',
      text: 'text-amber-700',
      badge: 'warning',
      icon: AlertCircle,
    },
    Low: {
      color: 'emerald',
      border: 'border-emerald-200',
      bg: 'bg-emerald-50/70',
      text: 'text-emerald-700',
      badge: 'success',
      icon: CheckCircle2,
    },
  };

  const config = levelConfig[riskLevel] || levelConfig.Low;
  const Icon = config.icon;

  return (
    <div className={`rounded-xl border ${config.border} ${config.bg} p-6 shadow-sm`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className={`p-2.5 rounded-lg bg-white shadow-xs ${config.text}`}>
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                AI Health Risk Assessment
              </span>
              <Badge variant={config.badge}>{riskLevel} Risk</Badge>
            </div>
            <h4 className="text-lg font-bold text-slate-900 mt-0.5">
              Confidence Index: {(probability * 100).toFixed(1)}%
            </h4>
          </div>
        </div>
      </div>

      <p className="mt-4 text-sm text-slate-700 font-medium">{message}</p>

      {keyFactors && keyFactors.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-200/60">
          <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Key Contributing Indicators
          </h5>
          <ul className="space-y-1.5 text-xs text-slate-600">
            {keyFactors.map((factor, idx) => (
              <li key={idx} className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                <span>{factor}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-5 p-3 rounded-lg bg-white/80 border border-slate-200 text-[11px] text-slate-500 leading-relaxed">
        <strong>Medical Disclaimer:</strong> {disclaimer || 'AI results are intended for educational and decision-support purposes only and must not replace professional medical judgment.'}
      </div>
    </div>
  );
};
