import type { ReactNode } from "react";

interface BentoCardProps {
  title?: string;
  description?: string;
  value?: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  footer?: ReactNode;
  children?: ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function BentoCard({
  title,
  description,
  value,
  icon,
  action,
  footer,
  children,
  className,
  onClick,
  hoverable = false,
}: BentoCardProps) {
  const hoverEnabled = Boolean(onClick) || hoverable;
  const interactive = Boolean(onClick);

  return (
    <section
      onClick={onClick}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_12px_35px_-22px_rgba(15,23,42,0.45)] transition-all sm:p-5",
        hoverEnabled &&
          "hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-22px_rgba(15,23,42,0.55)]",
        interactive && "cursor-pointer",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-slate-50/70 via-transparent to-indigo-50/60" />
      <div className="relative z-10">
        {(title || icon || action) && (
          <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-3">
              {icon && (
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm sm:h-10 sm:w-10">
                  {icon}
                </div>
              )}
              {(title || description) && (
                <div className="min-w-0">
                  {title && <h3 className="truncate text-sm font-semibold text-slate-900">{title}</h3>}
                  {description && <p className="mt-0.5 text-xs text-slate-500">{description}</p>}
                </div>
              )}
            </div>
            {action}
          </div>
        )}

        {value !== undefined && (
          <p className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            {value}
          </p>
        )}

        {children}

        {footer && <div className="mt-4 border-t border-slate-100 pt-3">{footer}</div>}
      </div>
    </section>
  );
}
