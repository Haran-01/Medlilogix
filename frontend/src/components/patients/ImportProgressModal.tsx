import { FiFileText, FiLoader } from 'react-icons/fi';
import { Modal } from '../common/Modal';

interface ImportProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ImportProgressModal({ isOpen, onClose }: ImportProgressModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Importing Patient Tests...">
      <div className="space-y-6">
        <div className="flex items-center gap-4 rounded-lg border border-blue-100 bg-[#f8fbff] p-5">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-[#eef4ff] text-[#0647ff]">
            <FiLoader aria-hidden="true" className="animate-spin" size={24} />
          </div>
          <div>
            <p className="text-lg font-extrabold text-[#07194c]">8 / 15 Files Imported</p>
            <p className="mt-1 text-sm font-medium text-[#68779f]">Processing imported TXT files from MEDILAB DEVICE.</p>
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between text-sm font-bold text-[#52628f]">
            <span>Import Progress</span>
            <span>53%</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-[#e8eef8]">
            <div className="h-full w-[53%] rounded-full bg-gradient-to-r from-[#0647ff] to-[#10b981]" />
          </div>
        </div>

        <div className="rounded-lg border border-[#e1e7f2] bg-white p-4">
          <div className="flex items-center gap-3">
            <FiFileText aria-hidden="true" className="text-[#0647ff]" size={20} />
            <div>
              <p className="text-sm font-bold uppercase text-[#68779f]">Current File</p>
              <p className="mt-1 text-lg font-extrabold text-[#07194c]">209.TXT</p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
