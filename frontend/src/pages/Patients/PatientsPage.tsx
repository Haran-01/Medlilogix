import { useEffect, useMemo, useState } from 'react';
import {
  FiCheckCircle,
  FiCloud,
  FiDatabase,
  FiFileText,
  FiFilter,
  FiHardDrive,
  FiLoader,
  FiSearch,
} from 'react-icons/fi';
import { ToastStack, type ToastMessage } from '../../components/common/Toast';
import { ImportPreviewModal } from '../../components/patients/ImportPreviewModal';
import { ImportProgressModal } from '../../components/patients/ImportProgressModal';
import { PatientAnalysisModal } from '../../components/patients/PatientAnalysisModal';
import { PatientMetadataModal } from '../../components/patients/PatientMetadataModal';
import { PatientTable } from '../../components/patients/PatientTable';
import { usePageTitle } from '../../hooks/usePageTitle';
import { importedPatientTests } from '../../services/patientTests.mock';
import type { PatientMetadataFormValues, PatientTestRecord } from '../../types/patientTest';

function isCompleted(values: PatientMetadataFormValues) {
  return Boolean(values.patientName && values.gender && values.age && values.description);
}

type UsbImportState =
  | 'No USB Connected'
  | 'USB Connected'
  | 'Scanning Files'
  | 'Ready to Import'
  | 'Importing'
  | 'Import Complete';

const txtFilesFound = 15;

const usbStateClasses: Record<UsbImportState, string> = {
  'Import Complete': 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  Importing: 'bg-blue-50 text-blue-700 ring-blue-200',
  'No USB Connected': 'bg-slate-50 text-slate-600 ring-slate-200',
  'Ready to Import': 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  'Scanning Files': 'bg-amber-50 text-amber-700 ring-amber-200',
  'USB Connected': 'bg-blue-50 text-blue-700 ring-blue-200',
};

const filterOptions = [
  'All Records',
  'Completed',
  'Pending',
  'Newest First',
  'Oldest First',
  'Highest Peak PSI',
  'Lowest Peak PSI',
];

export function PatientsPage() {
  usePageTitle('Patients');
  const [records, setRecords] = useState<PatientTestRecord[]>(importedPatientTests);
  const [editingRecord, setEditingRecord] = useState<PatientTestRecord | null>(null);
  const [analysisRecord, setAnalysisRecord] = useState<PatientTestRecord | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isImportPreviewOpen, setIsImportPreviewOpen] = useState(false);
  const [isImportProgressOpen, setIsImportProgressOpen] = useState(false);
  const [importButtonState, setImportButtonState] = useState<'default' | 'ready' | 'importing'>('ready');
  const [usbStatus, setUsbStatus] = useState<{
    connected: boolean;
    device: { deviceName: string; driveLetter: string; status: 'connected' | 'disconnected' } | null;
  }>({
    connected: false,
    device: null,
  });
  const [toasts] = useState<ToastMessage[]>([
    { id: 'success', message: '15 Patient Tests Imported Successfully', tone: 'success' },
  ]);

  const pendingCount = useMemo(() => records.filter((record) => record.status === 'Pending').length, [records]);
  const completedCount = records.length - pendingCount;
  const usbState: UsbImportState = usbStatus.connected ? 'Ready to Import' : 'No USB Connected';
  const usbDeviceName = usbStatus.device?.deviceName ?? 'No USB Connected';
  const usbDriveLetter = usbStatus.device?.driveLetter ?? '-';
  const usbConnectionStatus = usbStatus.connected ? 'Connected' : 'Disconnected';
  const displayedTxtFilesFound = usbStatus.connected ? txtFilesFound : 0;

  useEffect(() => {
    const usbBridge = window.medilogix?.usb;

    if (!usbBridge) {
      return undefined;
    }

    void usbBridge.getStatus().then(setUsbStatus);

    const unsubscribeStatus = usbBridge.onStatus(setUsbStatus);
    const unsubscribeConnected = usbBridge.onConnected((device) => {
      setUsbStatus({ connected: true, device });
    });
    const unsubscribeDisconnected = usbBridge.onDisconnected(() => {
      setUsbStatus({ connected: false, device: null });
    });

    return () => {
      unsubscribeStatus();
      unsubscribeConnected();
      unsubscribeDisconnected();
    };
  }, []);

  function handleSaveMetadata(values: PatientMetadataFormValues) {
    if (!editingRecord) {
      return;
    }

    setRecords((currentRecords) =>
      currentRecords.map((record) =>
        record.id === editingRecord.id
          ? {
              ...record,
              ...values,
              status: isCompleted(values) ? 'Completed' : 'Pending',
            }
          : record,
      ),
    );
  }

  function handleStartImport() {
    setIsImportPreviewOpen(false);
    setIsImportProgressOpen(true);
    setImportButtonState('importing');
  }

  const importButtonLabel =
    importButtonState === 'importing'
      ? 'Importing...'
      : importButtonState === 'ready'
        ? `Import ${txtFilesFound} Tests`
        : 'Import TXT';

  return (
    <div className="space-y-6">
      <ToastStack messages={toasts} />

      <div className="grid gap-5 xl:grid-cols-[minmax(240px,1fr)_minmax(300px,520px)_auto] xl:items-center">
        <div>
          <h1 className="text-[25px] font-extrabold leading-tight tracking-normal text-[#07194c]">Patients</h1>
          <p className="mt-2 text-[16px] font-medium text-[#68779f]">
            {records.length} imported tests · {pendingCount} pending metadata · {completedCount} completed
          </p>
        </div>

        <label className="flex h-12 min-w-0 items-center gap-4 rounded-md border border-[#d7deea] bg-white px-5 shadow-sm focus-within:border-[#0647ff] focus-within:ring-4 focus-within:ring-blue-100">
          <FiSearch aria-hidden="true" className="shrink-0 text-[#64749f]" size={21} />
          <input
            className="min-w-0 flex-1 border-0 bg-transparent text-[15px] font-medium text-[#07194c] outline-none placeholder:text-[#6f7fa6]"
            placeholder="Search by Patient ID or Patient Name..."
            type="search"
          />
        </label>

        <div className="flex flex-wrap gap-4 xl:justify-end">
          <div className="relative">
            <button
              className="inline-flex h-12 min-w-[120px] items-center justify-center gap-3 rounded-md border border-[#d7deea] bg-white px-6 text-[16px] font-bold text-[#07194c] shadow-sm transition hover:bg-[#f6f8fb]"
              onClick={() => setIsFilterOpen((value) => !value)}
              type="button"
            >
              <FiFilter aria-hidden="true" size={20} />
              Filter
            </button>
            {isFilterOpen ? (
              <div className="absolute right-0 top-14 z-20 w-56 overflow-hidden rounded-lg border border-[#e1e7f2] bg-white py-2 shadow-[0_18px_44px_rgba(15,23,42,0.14)]">
                {filterOptions.map((option) => (
                  <button
                    className="block w-full px-4 py-2.5 text-left text-sm font-bold text-[#07194c] transition hover:bg-[#f6f8fb]"
                    key={option}
                    onClick={() => setIsFilterOpen(false)}
                    type="button"
                  >
                    {option}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <button
            className="inline-flex h-12 min-w-[150px] items-center justify-center gap-3 rounded-md bg-[#0647ff] px-6 text-[16px] font-bold text-white shadow-[0_10px_22px_rgba(6,71,255,0.24)] transition hover:bg-[#053ee0]"
            onClick={() => setIsImportPreviewOpen(true)}
            type="button"
          >
            {importButtonState === 'importing' ? (
              <FiLoader aria-hidden="true" className="animate-spin" size={20} />
            ) : (
              <FiCloud aria-hidden="true" size={20} />
            )}
            {importButtonLabel}
          </button>
        </div>
      </div>

      <section className="rounded-xl border border-[#e1e7f2] bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.04)]">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="grid h-14 w-14 place-items-center rounded-xl bg-[#eef4ff] text-[#0647ff]">
              <FiHardDrive aria-hidden="true" size={26} />
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-normal text-[#68779f]">USB Device</p>
              <h2 className="mt-1 text-xl font-extrabold tracking-normal text-[#07194c]">{usbDeviceName}</h2>
              <span className={`mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-bold ring-1 ${usbStateClasses[usbState]}`}>
                {usbState === 'Importing' || usbState === 'Scanning Files' ? (
                  <FiLoader aria-hidden="true" className="animate-spin" />
                ) : (
                  <FiCheckCircle aria-hidden="true" />
                )}
                {usbState}
              </span>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 lg:min-w-[520px]">
            <div className="rounded-lg bg-[#f8fbff] p-4">
              <p className="text-xs font-bold uppercase text-[#68779f]">Status</p>
              <p className="mt-2 text-base font-extrabold text-[#07194c]">{usbConnectionStatus}</p>
            </div>
            <div className="rounded-lg bg-[#f8fbff] p-4">
              <p className="text-xs font-bold uppercase text-[#68779f]">TXT Files Found</p>
              <p className="mt-2 text-base font-extrabold text-[#07194c]">{displayedTxtFilesFound}</p>
            </div>
            <div className="rounded-lg bg-[#f8fbff] p-4">
              <p className="text-xs font-bold uppercase text-[#68779f]">Drive</p>
              <p className="mt-2 text-base font-extrabold text-[#07194c]">{usbDriveLetter}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-[#e1e7f2] bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.04)]">
          <div className="flex items-center gap-3">
            <FiFileText aria-hidden="true" className="text-[#0647ff]" size={22} />
            <p className="text-sm font-bold text-[#68779f]">Today&apos;s Imports</p>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-[#07194c]">15</p>
          <p className="mt-1 text-sm font-medium text-[#68779f]">New TXT files detected today</p>
        </div>
        <div className="rounded-lg border border-[#e1e7f2] bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.04)]">
          <div className="flex items-center gap-3">
            <FiDatabase aria-hidden="true" className="text-[#d97706]" size={22} />
            <p className="text-sm font-bold text-[#68779f]">Pending Metadata</p>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-[#d97706]">{pendingCount}</p>
          <p className="mt-1 text-sm font-medium text-[#68779f]">Records waiting for completion</p>
        </div>
        <div className="rounded-lg border border-[#e1e7f2] bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.04)]">
          <div className="flex items-center gap-3">
            <FiCheckCircle aria-hidden="true" className="text-[#059669]" size={22} />
            <p className="text-sm font-bold text-[#68779f]">Completed Records</p>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-[#059669]">{completedCount}</p>
          <p className="mt-1 text-sm font-medium text-[#68779f]">Saved patient test records</p>
        </div>
      </div>

      <PatientTable
        onEditMetadata={setEditingRecord}
        onViewAnalysis={setAnalysisRecord}
        records={records}
      />

      <ImportPreviewModal
        isOpen={isImportPreviewOpen}
        onClose={() => setIsImportPreviewOpen(false)}
        onImport={handleStartImport}
      />
      <ImportProgressModal
        isOpen={isImportProgressOpen}
        onClose={() => {
          setIsImportProgressOpen(false);
          setImportButtonState('ready');
        }}
      />
      <PatientMetadataModal
        isOpen={Boolean(editingRecord)}
        onClose={() => setEditingRecord(null)}
        onSave={handleSaveMetadata}
        record={editingRecord}
      />
      <PatientAnalysisModal
        isOpen={Boolean(analysisRecord)}
        onClose={() => setAnalysisRecord(null)}
        record={analysisRecord}
      />
    </div>
  );
}
