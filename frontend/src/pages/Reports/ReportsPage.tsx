import { PageHeader } from '../../components/common/PageHeader';
import { ReportCard } from '../../components/reports/ReportCard';
import { usePageTitle } from '../../hooks/usePageTitle';

export function ReportsPage() {
  usePageTitle('Reports');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="Reusable report cards ready for export, scheduling, and review workflows later."
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <ReportCard title="Clinical Summary" cadence="Daily review" />
        <ReportCard title="Patient Throughput" cadence="Weekly operations" />
        <ReportCard title="Quality Indicators" cadence="Monthly governance" />
      </div>
    </div>
  );
}
