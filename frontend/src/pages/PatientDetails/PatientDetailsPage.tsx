import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { PageHeader } from '../../components/common/PageHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { usePageTitle } from '../../hooks/usePageTitle';
import { getPatientTest } from '../../services/patientTests.service';
import type { PatientTestRecord } from '../../types/patientTest';

export function PatientDetailsPage() {
  const { id } = useParams();
  const [record, setRecord] = useState<PatientTestRecord | null>(null);
  const [isMissing, setIsMissing] = useState(false);
  usePageTitle(record?.patientName ?? 'Patient Details');

  useEffect(() => {
    if (!id) {
      return;
    }

    void getPatientTest(id)
      .then((patientTest) => {
        setRecord(patientTest);
        setIsMissing(false);
      })
      .catch(() => {
        setRecord(null);
        setIsMissing(true);
      });
  }, [id]);

  if (!id || isMissing) {
    return (
      <div className="space-y-6">
        <PageHeader title="Record Not Found" description="The requested patient test record could not be loaded." />
      </div>
    );
  }

  if (!record) {
    return (
      <div className="space-y-6">
        <PageHeader title="Loading Record" description="Fetching saved patient test details." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={record.patientName}
        description={record.description}
        actions={<StatusBadge status={record.status === 'Completed' ? 'stable' : 'review'} />}
      />
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <p className="text-sm font-semibold text-slate-500">Patient ID</p>
          <p className="mt-2 text-xl font-bold text-slate-950">{record.id}</p>
        </Card>
        <Card>
          <p className="text-sm font-semibold text-slate-500">Case History</p>
          <p className="mt-2 text-xl font-bold text-slate-950">{record.caseHistory}</p>
        </Card>
        <Card>
          <p className="text-sm font-semibold text-slate-500">Test Date</p>
          <p className="mt-2 text-xl font-bold text-slate-950">{record.testDate}</p>
        </Card>
      </div>
    </div>
  );
}
