import { useParams } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { PageHeader } from '../../components/common/PageHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { usePageTitle } from '../../hooks/usePageTitle';
import { mockPatients } from '../../services/mockData';
import { formatDate } from '../../utils/format';

export function PatientDetailsPage() {
  const { id } = useParams();
  const patient = mockPatients.find((item) => item.id === id) ?? mockPatients[0];
  usePageTitle(patient.name);

  return (
    <div className="space-y-6">
      <PageHeader
        title={patient.name}
        description="Patient details route scaffold prepared for future clinical modules."
        actions={<StatusBadge status={patient.status} />}
      />
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <p className="text-sm font-semibold text-slate-500">Patient ID</p>
          <p className="mt-2 text-xl font-bold text-slate-950">{patient.id}</p>
        </Card>
        <Card>
          <p className="text-sm font-semibold text-slate-500">Care Team</p>
          <p className="mt-2 text-xl font-bold text-slate-950">{patient.careTeam}</p>
        </Card>
        <Card>
          <p className="text-sm font-semibold text-slate-500">Last Visit</p>
          <p className="mt-2 text-xl font-bold text-slate-950">{formatDate(patient.lastVisit)}</p>
        </Card>
      </div>
    </div>
  );
}
