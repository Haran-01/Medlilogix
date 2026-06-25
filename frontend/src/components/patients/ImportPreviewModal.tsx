import { FiFileText, FiHardDrive } from 'react-icons/fi';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';

interface ImportPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: () => void;
}

export function ImportPreviewModal({ isOpen, onClose, onImport }: ImportPreviewModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Import Preview">
      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-[#e1e7f2] bg-[#f8fbff] p-4">
            <div className="flex items-center gap-3 text-[#0647ff]">
              <FiHardDrive aria-hidden="true" size={22} />
              <p className="text-sm font-bold uppercase text-[#68779f]">USB Device</p>
            </div>
            <p className="mt-3 text-xl font-extrabold text-[#07194c]">MEDILAB DEVICE</p>
          </div>

          <div className="rounded-lg border border-[#e1e7f2] bg-[#f8fbff] p-4">
            <div className="flex items-center gap-3 text-[#059669]">
              <FiFileText aria-hidden="true" size={22} />
              <p className="text-sm font-bold uppercase text-[#68779f]">TXT Files Found</p>
            </div>
            <p className="mt-3 text-xl font-extrabold text-[#07194c]">15</p>
          </div>
        </div>

        <div className="rounded-lg border border-[#e1e7f2] bg-white p-5">
          <p className="text-sm font-bold uppercase text-[#68779f]">Import Summary</p>
          <p className="mt-2 text-2xl font-extrabold text-[#07194c]">15 New Patient Tests</p>
        </div>

        <div className="flex justify-end gap-3 border-t border-[#e7ebf3] pt-5">
          <Button onClick={onClose} type="button" variant="secondary">
            Cancel
          </Button>
          <Button onClick={onImport} type="button">
            Import
          </Button>
        </div>
      </div>
    </Modal>
  );
}
