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
  if (!record) {
    return null;
  }

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
        <div className="grid gap-4 rounded-xl border border-[#e7ebf3] bg-[#f8fbff] p-4 sm:grid-cols-3">
          <div>
            <p className="text-xs font-bold uppercase text-[#68779f]">Patient ID</p>
            <p className="mt-1 text-lg font-extrabold text-[#07194c]">{record.id}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-[#68779f]">Patient Name</p>
            <p className="mt-1 text-lg font-extrabold text-[#07194c]">{record.patientName || 'Metadata pending'}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-[#68779f]">Test Date</p>
            <p className="mt-1 text-lg font-extrabold text-[#07194c]">{record.testDate}</p>
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
