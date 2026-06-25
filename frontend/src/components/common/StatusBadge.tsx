import type { PatientStatus } from '../../types/patient';
import { cn } from '../../utils/cn';

const statusClasses: Record<PatientStatus, string> = {
  stable: 'bg-accent-50 text-accent-600 ring-accent-500/20',
  review: 'bg-amber-50 text-amber-700 ring-amber-500/20',
  critical: 'bg-rose-50 text-rose-700 ring-rose-500/20',
};

interface StatusBadgeProps {
  status: PatientStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1',
        statusClasses[status],
      )}
    >
      {status}
    </span>
  );
}
