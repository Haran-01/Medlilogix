import { FiFileText } from 'react-icons/fi';
import { Card } from '../common/Card';

interface ReportCardProps {
  title: string;
  cadence: string;
}

export function ReportCard({ title, cadence }: ReportCardProps) {
  return (
    <Card className="flex items-start gap-4">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary-50 text-primary-700">
        <FiFileText aria-hidden="true" />
      </div>
      <div>
        <h3 className="text-sm font-bold text-slate-950">{title}</h3>
        <p className="mt-1 text-sm text-slate-500">{cadence}</p>
      </div>
    </Card>
  );
}
