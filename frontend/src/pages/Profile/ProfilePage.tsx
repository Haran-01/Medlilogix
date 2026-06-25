import { Card } from '../../components/common/Card';
import { PageHeader } from '../../components/common/PageHeader';
import { useAuth } from '../../contexts/AuthContext';
import { usePageTitle } from '../../hooks/usePageTitle';

export function ProfilePage() {
  usePageTitle('Profile');
  const { doctor } = useAuth();
  const initials = doctor?.name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'DR';

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profile"
        description="Signed-in doctor account."
      />
      <Card className="flex items-center gap-4">
        <div className="grid h-14 w-14 place-items-center rounded-lg bg-accent-50 text-lg font-bold text-accent-600">
          {initials}
        </div>
        <div>
          <p className="font-bold text-slate-950">{doctor?.name}</p>
          <p className="text-sm text-slate-500">{doctor?.email}</p>
        </div>
      </Card>
    </div>
  );
}
