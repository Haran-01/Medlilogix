import { FiActivity, FiChevronDown, FiChevronUp, FiEdit3, FiFileText } from 'react-icons/fi';
import type { PatientTestRecord } from '../../types/patientTest';
import { cn } from '../../utils/cn';

interface PatientTableProps {
  onEditMetadata: (record: PatientTestRecord) => void;
  onViewAnalysis: (record: PatientTestRecord) => void;
  records: PatientTestRecord[];
}

const columns = ['Patient ID', 'Patient Name', 'Test Date', 'Test Duration', 'Peak PSI', 'Status', 'Actions'];

function SortIcon() {
  return (
    <span className="ml-2 inline-flex translate-y-[1px] flex-col text-[#07194c]">
      <FiChevronUp aria-hidden="true" size={11} />
      <FiChevronDown aria-hidden="true" className="-mt-1" size={11} />
    </span>
  );
}

function StatusBadge({ status }: { status: PatientTestRecord['status'] }) {
  return (
    <span
      className={cn(
        'inline-flex h-8 items-center rounded-md px-3 text-sm font-bold',
        status === 'Completed'
          ? 'bg-[#dff4e8] text-[#008035]'
          : 'bg-[#fff3dd] text-[#d97706]',
      )}
    >
      {status}
    </span>
  );
}

export function PatientTable({ onEditMetadata, onViewAnalysis, records }: PatientTableProps) {
  if (records.length === 0) {
    return (
      <section className="rounded-lg border border-[#e1e7f2] bg-white px-6 py-14 text-center shadow-[0_10px_26px_rgba(15,23,42,0.04)]">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-2xl bg-[#eef4ff] text-[#0647ff]">
          <FiFileText aria-hidden="true" size={36} />
        </div>
        <h2 className="mt-6 text-2xl font-extrabold tracking-normal text-[#07194c]">No Patient Records Found</h2>
        <p className="mx-auto mt-3 max-w-md text-base font-medium leading-7 text-[#68779f]">
          Connect the laboratory device and import patient test files to begin.
        </p>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-lg border border-[#e1e7f2] bg-white shadow-[0_10px_26px_rgba(15,23,42,0.04)]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1160px] text-left text-[15px] text-[#07194c]">
          <thead className="bg-[#fbfcff]">
            <tr>
              {columns.map((column) => (
                <th
                  className={cn(
                    'h-[58px] whitespace-nowrap border-b border-[#e7ebf3] px-6 font-bold',
                    column === 'Actions' && 'text-right',
                  )}
                  key={column}
                >
                  <span className={cn('inline-flex items-center', column === 'Actions' && 'justify-end')}>
                    {column}
                    {column !== 'Actions' ? <SortIcon /> : null}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr className="border-b border-[#e7ebf3] last:border-b-0 hover:bg-[#fbfdff]" key={record.id}>
                <td className="h-16 whitespace-nowrap px-6 font-extrabold">{record.id}</td>
                <td className="h-16 whitespace-nowrap px-6 font-medium">
                  {record.patientName || <span className="text-[#8a97bc]">Pending metadata</span>}
                </td>
                <td className="h-16 whitespace-nowrap px-6 font-medium">{record.testDate}</td>
                <td className="h-16 whitespace-nowrap px-6 font-medium">{record.testDuration}</td>
                <td className="h-16 whitespace-nowrap px-6 font-bold">{record.peakPsi.toFixed(1)} PSI</td>
                <td className="h-16 whitespace-nowrap px-6">
                  <StatusBadge status={record.status} />
                </td>
                <td className="h-16 whitespace-nowrap px-6">
                  <div className="flex justify-end gap-2">
                    <button
                      aria-label={`Edit metadata for patient ${record.id}`}
                      className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-[#d7deea] bg-white px-3 text-sm font-bold text-[#07194c] shadow-sm transition hover:bg-[#f6f8fb]"
                      onClick={() => onEditMetadata(record)}
                      title="Edit Metadata"
                      type="button"
                    >
                      <FiEdit3 aria-hidden="true" size={16} />
                      <span>Edit Metadata</span>
                    </button>
                    <button
                      aria-label={`View analysis for patient ${record.id}`}
                      className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-[#0647ff] px-3 text-sm font-bold text-white shadow-[0_8px_16px_rgba(6,71,255,0.2)] transition hover:bg-[#053ee0]"
                      onClick={() => onViewAnalysis(record)}
                      title="View Analysis"
                      type="button"
                    >
                      <FiActivity aria-hidden="true" size={16} />
                      <span>View Analysis</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
