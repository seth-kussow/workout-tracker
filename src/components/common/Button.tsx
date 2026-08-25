import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: 'bg-sky-500 text-slate-950 active:bg-sky-400',
  secondary: 'bg-slate-800 text-slate-100 active:bg-slate-700',
  ghost: 'bg-transparent text-sky-300 active:bg-slate-800',
  danger: 'bg-red-500/10 text-red-400 active:bg-red-500/20',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  fullWidth?: boolean;
}

export function Button({ variant = 'primary', fullWidth, className = '', ...props }: ButtonProps) {
  return (
    <button
      className={`rounded-xl px-4 py-3 text-base font-medium transition-colors disabled:opacity-40 ${VARIANT_CLASSES[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    />
  );
}
