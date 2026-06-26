import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Topbar } from '../components/layout/Topbar';

export function AppLayout() {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f7fbff_0%,#f4f7fb_42%,#eef6f3_100%)]">
      <Topbar />
      <motion.main
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto w-full max-w-[1440px] px-4 py-8 sm:px-6 lg:px-9"
        initial={{ opacity: 0, y: 6 }}
        transition={{ duration: 0.16, ease: 'easeOut' }}
      >
        <Outlet />
      </motion.main>
    </div>
  );
}
