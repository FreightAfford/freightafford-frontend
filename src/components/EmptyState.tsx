import { type ReactNode } from "react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

const EmptyState = ({ icon, title, description, action }: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      {icon && (
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-100">
          {icon}
        </div>
      )}

      <h3 className="text-xl font-semibold text-slate-900">{title}</h3>

      {description && (
        <p className="mt-2 max-w-sm text-slate-500">{description}</p>
      )}

      {action && <div className="mt-6">{action}</div>}
    </div>
  );
};

export default EmptyState;
