import { NavLink } from 'react-router-dom';
import { FiChevronLeft, FiFileText, FiSettings, FiUser, FiUsers } from 'react-icons/fi';
import medilogixLogo from '../../assets/medilogix-logo.png';
import { paths } from '../../routes/paths';
import type { NavigationItem } from '../../types/navigation';
import { cn } from '../../utils/cn';

const navigationItems: NavigationItem[] = [
  { label: 'Patients', path: paths.patients, icon: FiUsers },
  { label: 'Reports', path: paths.reports, icon: FiFileText },
  { label: 'Settings', path: paths.settings, icon: FiSettings },
  { label: 'Profile', path: paths.profile, icon: FiUser },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-30 bg-slate-950/30 transition-opacity lg:hidden',
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={onClose}
      />
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-[236px] max-w-[84vw] flex-col border-r border-[#e7ebf3] bg-white transition-transform duration-200 lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-[86px] items-center px-8">
          <img alt="MediLogiX" className="h-[43px] w-auto object-contain" src={medilogixLogo} />
        </div>

        <nav className="flex-1 space-y-4 px-3 pt-12">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                className={({ isActive }) =>
                  cn(
                    'relative flex h-[54px] items-center gap-4 rounded-md px-8 text-[15px] font-bold transition',
                    isActive
                      ? 'bg-[#eef4ff] text-[#0647ff] before:absolute before:left-0 before:top-0 before:h-full before:w-[3px] before:rounded-r-full before:bg-[#0647ff]'
                      : 'text-[#07194c] hover:bg-[#f6f8fb]',
                  )
                }
                key={item.path}
                onClick={onClose}
                to={item.path}
              >
                <Icon aria-hidden="true" size={18} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="px-8 pb-8">
          <div className="flex items-center gap-3 text-[15px] font-medium text-[#5f6f9a]">
            <FiChevronLeft aria-hidden="true" size={20} />
            <span>Collapse</span>
          </div>
        </div>
      </aside>
    </>
  );
}
