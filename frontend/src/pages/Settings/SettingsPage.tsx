import { Card } from '../../components/common/Card';
import { PageHeader } from '../../components/common/PageHeader';
import { usePageTitle } from '../../hooks/usePageTitle';

export function SettingsPage() {
  usePageTitle('Settings');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Application configuration."
      />
      <Card>
        <p className="text-sm font-semibold text-slate-950">Database-backed records are enabled</p>
        <p className="mt-2 text-sm leading-6 text-slate-500">Imported TXT files are saved only after required metadata is completed.</p>
      </Card>
    </div>
  );
}
