import { FiBell, FiMenu, FiUser } from 'react-icons/fi';
import { Button } from '../common/Button';

interface TopbarProps {
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-[#e7ebf3] bg-white shadow-[0_2px_12px_rgba(15,23,42,0.05)]">
      <div className="flex min-h-[86px] items-center gap-3 px-4 sm:px-6 lg:px-8">
        <Button
          aria-label="Open navigation"
          className="h-10 w-10 px-0 lg:hidden"
          onClick={onMenuClick}
          variant="secondary"
        >
          <FiMenu aria-hidden="true" />
        </Button>

        <div className="ml-auto flex items-center gap-6">
          <div className="relative grid h-10 w-10 place-items-center rounded-full text-[#07194c]">
            <FiBell aria-hidden="true" size={25} />
            <span className="absolute right-0 top-0 grid h-5 min-w-5 place-items-center rounded-full bg-red-500 px-1 text-[11px] font-bold leading-none text-white">
              3
            </span>
          </div>
          <div className="grid h-10 w-10 place-items-center rounded-full border-2 border-[#07194c] text-[#07194c]">
            <FiUser aria-hidden="true" size={22} />
          </div>
        </div>
      </div>
    </header>
  );
}
