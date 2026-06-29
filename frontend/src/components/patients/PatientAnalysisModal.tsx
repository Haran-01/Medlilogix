import { FiDownload, FiFileText, FiX } from 'react-icons/fi';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import medilogixLogo from '../../assets/medilogix-logo.png';
import senstimLogo from '../../assets/senstim-logo.jpeg';
import { useAuth } from '../../contexts/AuthContext';
import type { PatientTestRecord } from '../../types/patientTest';
import { formatNumber } from '../../utils/format';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { Modal } from '../common/Modal';

interface PatientAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: PatientTestRecord | null;
}

function getAverage(record: PatientTestRecord) {
  if (record.samples.length === 0) {
    return 0;
  }

  return record.samples.reduce((sum, sample) => sum + sample.psi, 0) / record.samples.length;
}

function getMinimum(record: PatientTestRecord) {
  if (record.samples.length === 0) {
    return 0;
  }

  return Math.min(...record.samples.map((sample) => sample.psi));
}

export function PatientAnalysisModal({ isOpen, onClose, record }: PatientAnalysisModalProps) {
  const { doctor } = useAuth();

  if (!record) {
    return null;
  }

  const hospitalLogo = doctor?.hospitalLogoUrl || medilogixLogo;
  const patientDetails = [
    { label: 'Patient ID', value: record.id },
    { label: 'Patient Name', value: record.patientName || "Patient's Info pending" },
    { label: 'Test Date', value: record.testDate },
    { label: 'Case History', value: record.caseHistory || "Patient's Info pending" },
  ];

  const statCards = [
    { label: 'Peak PSI', value: `${record.peakPsi.toFixed(1)} PSI` },
    { label: 'Average PSI', value: `${getAverage(record).toFixed(1)} PSI` },
    { label: 'Minimum PSI', value: `${getMinimum(record).toFixed(1)} PSI` },
    { label: 'Test Duration', value: record.testDuration },
    { label: 'Samples', value: formatNumber(record.samples.length) },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" title="Pressure Analysis">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 rounded-lg border border-[#e7ebf3] bg-[#f8fbff] px-4 py-3 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
          <div className="grid min-w-0 max-w-[760px] flex-1 gap-x-4 gap-y-2 sm:grid-cols-2">
            {patientDetails.map((detail) => (
              <div className="min-w-0" key={detail.label}>
                <p className="text-[10px] font-extrabold uppercase tracking-normal text-[#68779f]">{detail.label}</p>
                <p className="mt-0.5 truncate text-sm font-extrabold text-[#07194c]">{detail.value}</p>
              </div>
            ))}
          </div>
          <div className="flex w-full items-center justify-between gap-4 border-t border-[#dfe7f2] pt-4 sm:justify-end lg:ml-auto lg:w-auto lg:min-w-[300px] lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
            <img alt="SenStim PNS, TOF Monitor" className="h-14 max-w-[150px] object-contain" src={senstimLogo} />
            <div className="grid h-20 w-20 shrink-0 place-items-center rounded-lg border border-[#dfe7f2] bg-white p-3 shadow-sm">
              <img alt={`${doctor?.name ?? 'Hospital'} logo`} className="max-h-14 max-w-14 object-contain" src={hospitalLogo} />
            </div>
          </div>
        </div>

        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-extrabold text-[#07194c]">PSI Readings</h3>
              <p className="mt-1 text-sm font-medium text-[#68779f]">Imported pressure trend from TXT sample data.</p>
            </div>
          </div>
          <div className="h-[360px] w-full">
            <ResponsiveContainer height="100%" width="100%">
              <LineChart data={record.samples} margin={{ bottom: 12, left: 0, right: 16, top: 12 }}>
                <CartesianGrid stroke="#e7ebf3" strokeDasharray="5 5" vertical={false} />
                <XAxis dataKey="time" tick={{ fill: '#52628f', fontSize: 12 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: '#52628f', fontSize: 12 }} tickLine={false} axisLine={false} width={42} />
                <Tooltip />
                <Line
                  dataKey="psi"
                  dot={{ fill: '#0647ff', r: 4 }}
                  name="PSI"
                  stroke="#0647ff"
                  strokeWidth={3}
                  type="monotone"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {statCards.map((stat) => (
            <Card className="p-4" key={stat.label}>
              <p className="text-xs font-bold uppercase text-[#68779f]">{stat.label}</p>
              <p className="mt-2 text-xl font-extrabold text-[#07194c]">{stat.value}</p>
            </Card>
          ))}
        </div>

        <div className="flex flex-col gap-3 border-t border-[#e7ebf3] pt-5 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary">
            <FiDownload aria-hidden="true" /> Download CSV
          </Button>
          <Button type="button" variant="secondary">
            <FiFileText aria-hidden="true" /> Export PDF
          </Button>
          <Button onClick={onClose} type="button">
            <FiX aria-hidden="true" /> Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
