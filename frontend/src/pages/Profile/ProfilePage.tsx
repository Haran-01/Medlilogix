import { Card } from '../../components/common/Card';
import { PageHeader } from '../../components/common/PageHeader';
import { usePageTitle } from '../../hooks/usePageTitle';

export function ProfilePage() {
  usePageTitle('Profile');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profile"
        description="Profile route scaffold for future user-facing preferences and account details."
      />
      <Card className="flex items-center gap-4">
        <div className="grid h-14 w-14 place-items-center rounded-lg bg-accent-50 text-lg font-bold text-accent-600">
          ML
        </div>
        <div>
          <p className="font-bold text-slate-950">MediLogiX Operator</p>
          <p className="text-sm text-slate-500">Demo profile data</p>
        </div>
      </Card>
    </div>
  );
}
