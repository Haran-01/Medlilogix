import { Card } from '../../components/common/Card';
import { PageHeader } from '../../components/common/PageHeader';
import { usePageTitle } from '../../hooks/usePageTitle';

export function SettingsPage() {
  usePageTitle('Settings');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Settings route placeholder for future preferences, roles, and workspace configuration."
      />
      <Card>
        <p className="text-sm font-semibold text-slate-950">Configuration surface prepared</p>
        <p className="mt-2 text-sm leading-6 text-slate-500">No backend, authentication, or database logic is connected.</p>
      </Card>
    </div>
  );
}
