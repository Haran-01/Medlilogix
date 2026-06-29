import { FiLogOut, FiUser } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { BrandLockup } from '../common/BrandLockup';
import { useAuth } from '../../contexts/AuthContext';

export function Topbar() {
  const { doctor, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <header className="sticky top-0 z-20 border-b border-[#dfe7f2] bg-white/92 shadow-[0_12px_34px_rgba(15,23,42,0.06)] backdrop-blur">
      <div className="mx-auto flex min-h-[76px] max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <button
          className="min-w-0 rounded-md text-left transition hover:opacity-90"
          onClick={() => navigate('/patients')}
          type="button"
        >
          <BrandLockup variant="header" />
        </button>

        <div className="flex items-center gap-3">
          <button
            aria-label="Open profile"
            className="grid h-11 w-11 place-items-center rounded-full border border-[#d7deea] bg-white text-[#07194c] shadow-sm transition hover:border-[#0647ff] hover:bg-[#eef4ff] hover:text-[#0647ff]"
            onClick={() => navigate('/profile')}
            title={doctor?.name ?? 'Profile'}
            type="button"
          >
            <FiUser aria-hidden="true" size={22} />
          </button>
          <button
            aria-label="Sign out"
            className="grid h-11 w-11 place-items-center rounded-md border border-[#d7deea] bg-white text-[#07194c] shadow-sm transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
            onClick={handleLogout}
            title="Sign out"
            type="button"
          >
            <FiLogOut aria-hidden="true" size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
