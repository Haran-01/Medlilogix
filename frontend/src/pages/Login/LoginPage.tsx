import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';
import {
  FiEye,
  FiInfo,
  FiLock,
  FiMail,
  FiShield,
  FiCheckCircle,
  FiFileText,
} from 'react-icons/fi';
import { z } from 'zod';
import medilogixLogo from '../../assets/medilogix-logo.png';
import { useAuth } from '../../contexts/AuthContext';
import { usePageTitle } from '../../hooks/usePageTitle';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginPage() {
  usePageTitle('Login');
  const { login } = useAuth();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit } = useForm<LoginFormValues>();

  async function onSubmit(values: LoginFormValues) {
    const parsedValues = loginSchema.safeParse(values);

    if (!parsedValues.success) {
      setErrorMessage('Enter a valid email and a password with at least 8 characters.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      await login(parsedValues.data.email, parsedValues.data.password);
      navigate('/patients', { replace: true });
    } catch {
      setErrorMessage('Invalid email or password.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#eef6ff] p-2 text-[#07194c] sm:p-4">
      <section className="relative grid min-h-[calc(100vh-1rem)] overflow-hidden rounded-[22px] border border-blue-100 bg-white shadow-[0_22px_80px_rgba(14,52,110,0.18)] lg:grid-cols-[1.22fr_1fr]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_11%_12%,rgba(219,234,254,0.9),transparent_28%),radial-gradient(circle_at_78%_86%,rgba(187,247,208,0.55),transparent_31%)]" />

        <aside className="relative hidden min-h-[690px] overflow-hidden bg-gradient-to-br from-white via-[#f2f8ff] to-[#dcecff] px-10 py-8 lg:flex lg:flex-col xl:px-14">
          <div className="absolute left-[-10%] top-[58%] h-[360px] w-[80%] rounded-[50%] bg-blue-500/18 blur-2xl" />
          <div className="absolute bottom-[-9rem] right-[-8rem] h-[380px] w-[640px] rounded-[50%] bg-emerald-300/35 blur-xl" />
          <div className="absolute right-16 top-20 h-10 w-10 rounded-xl border border-blue-100" />
          <div className="absolute right-28 top-60 grid grid-cols-4 gap-3 opacity-30">
            {Array.from({ length: 16 }).map((_, index) => (
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400" key={index} />
            ))}
          </div>
          <FiShield className="absolute left-[28%] top-[38%] text-blue-100" size={44} />
          <FiCheckCircle className="absolute right-[32%] top-[16%] text-blue-100" size={36} />

          <div className="relative z-10">
            <img alt="MediLogiX" className="h-14 w-auto object-contain" src={medilogixLogo} />
            <p className="mt-2 text-sm font-medium text-[#52628f]">Medical Record Management System</p>
          </div>

          <div className="relative z-10 mt-10 max-w-[520px]">
            <h1 className="text-5xl font-extrabold leading-tight tracking-normal text-[#07194c]">
              Secure. Reliable.
              <span className="block text-[#059669]">Evidence-ready.</span>
            </h1>
            <p className="mt-5 max-w-[430px] text-lg leading-8 text-[#43527f]">
              MediLogix helps you manage patient records with complete security, accuracy and legal integrity.
            </p>
          </div>

          <div className="relative z-10 mt-auto flex items-end justify-center pb-16">
            <div className="relative h-[292px] w-[560px]">
              <div className="absolute bottom-0 left-24 h-40 w-40 rounded-[36px] bg-gradient-to-br from-blue-500 to-blue-800 shadow-[0_22px_60px_rgba(37,99,235,0.35)]">
                <div className="absolute inset-3 rounded-[34px] border border-white/40" />
                <FiLock className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white" size={58} />
                <div className="absolute -inset-5 rounded-full border border-cyan-300/40 shadow-[0_0_38px_rgba(34,211,238,0.75)]" />
              </div>
              <div className="absolute bottom-2 right-0 h-[255px] w-[400px] rotate-[-3deg] rounded-[22px] border-[12px] border-[#07194c] bg-white shadow-[0_24px_70px_rgba(15,23,42,0.28)]">
                <div className="flex h-full overflow-hidden rounded-[10px] bg-[#f8fbff]">
                  <div className="w-24 bg-[#07194c] p-4 text-white">
                    <div className="mb-7 flex items-center gap-2 text-[10px] font-bold">
                      <span className="grid h-5 w-5 place-items-center rounded bg-emerald-500 text-white">+</span>
                      MediLogix
                    </div>
                    {['Dashboard', 'Patients', 'Records', 'Reports'].map((item, index) => (
                      <div
                        className={index === 0 ? 'mb-3 rounded bg-blue-600 px-2 py-2 text-[9px]' : 'mb-3 px-2 py-1 text-[9px] text-blue-100'}
                        key={item}
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                  <div className="flex-1 p-5">
                    <p className="text-sm font-bold text-[#07194c]">Dashboard</p>
                    <div className="mt-4 grid grid-cols-4 gap-2">
                      {[1248, 5632, 238, 124].map((value) => (
                        <div className="rounded-lg border border-blue-100 bg-white p-2 shadow-sm" key={value}>
                          <p className="text-[8px] text-slate-400">Total</p>
                          <p className="text-xs font-bold text-[#07194c]">{value}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 grid grid-cols-[1.2fr_1fr] gap-3">
                      <div className="h-28 rounded-lg border border-blue-100 bg-white p-3">
                        <div className="mt-12 h-0.5 rotate-[-18deg] bg-blue-600" />
                        <div className="mt-5 h-0.5 rotate-[10deg] bg-blue-600" />
                      </div>
                      <div className="space-y-2 rounded-lg border border-blue-100 bg-white p-3">
                        {[43, 32, 28, 26].map((value) => (
                          <div className="flex justify-between text-[8px] text-slate-500" key={value}>
                            <span>Dr. Record</span>
                            <span>{value} files</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute bottom-[-18px] right-[-24px] h-5 w-52 rounded-full bg-[#07194c] shadow-lg" />
            </div>
          </div>

          <div className="relative z-10 mb-1 flex w-fit items-center gap-7 rounded-3xl border border-white/70 bg-white/82 px-7 py-4 shadow-[0_18px_55px_rgba(33,83,159,0.16)] backdrop-blur">
            {[
              { icon: FiCheckCircle, label: 'HIPAA', text: 'Compliant' },
              { icon: FiLock, label: 'End-to-End', text: 'Encrypted' },
              { icon: FiFileText, label: 'Court', text: 'Admissible' },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div className="flex items-center gap-3 border-r border-slate-200 pr-8 last:border-r-0 last:pr-0" key={item.label}>
                  <Icon className="text-primary-700" size={30} />
                  <div>
                    <p className="text-sm font-bold text-[#07194c]">{item.label}</p>
                    <p className="text-sm text-[#52628f]">{item.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        <div className="relative z-10 flex min-h-[calc(100vh-1rem)] items-center justify-center px-4 py-5 sm:px-8 lg:px-10">
          <div className="w-full max-w-[580px] rounded-[22px] border border-slate-200 bg-white px-6 py-7 shadow-[0_18px_60px_rgba(15,23,42,0.12)] sm:px-10 lg:px-14">
            <div className="mx-auto mb-4 grid h-24 w-24 place-items-center rounded-full border border-dashed border-blue-400 bg-white">
              <img alt="MediLogiX" className="h-10 w-auto object-contain" src={medilogixLogo} />
            </div>

            <div className="text-center">
              <h2 className="text-3xl font-extrabold tracking-normal text-[#07194c]">Welcome Back</h2>
              <p className="mt-2 text-base text-[#52628f]">
                Sign in to your <span className="font-bold text-primary-600">Medi</span>
                <span className="font-bold text-accent-600">Logix</span> account
              </p>
            </div>

            <form className="mt-7 space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <label className="block">
                <span className="text-sm font-bold text-[#07194c]">Email Address</span>
                <span className="mt-2 flex h-12 items-center gap-4 rounded-lg border border-slate-200 bg-white px-4 shadow-sm focus-within:border-primary-500 focus-within:ring-4 focus-within:ring-primary-100">
                  <FiMail className="shrink-0 text-[#7d8db7]" size={20} />
                  <input
                    autoComplete="email"
                    className="w-full border-0 bg-transparent text-base text-[#07194c] outline-none placeholder:text-[#8a97bc]"
                    placeholder="Enter your email address"
                    type="email"
                    {...register('email')}
                  />
                </span>
              </label>

              <label className="block">
                <span className="flex items-center justify-between gap-3 text-sm font-bold text-[#07194c]">
                  Password
                  <a className="font-semibold text-primary-600" href="/login">Forgot password?</a>
                </span>
                <span className="mt-2 flex h-12 items-center gap-4 rounded-lg border border-slate-200 bg-white px-4 shadow-sm focus-within:border-primary-500 focus-within:ring-4 focus-within:ring-primary-100">
                  <FiLock className="shrink-0 text-[#7d8db7]" size={20} />
                  <input
                    autoComplete="current-password"
                    className="w-full border-0 bg-transparent text-base text-[#07194c] outline-none placeholder:text-[#8a97bc]"
                    placeholder="Enter your password"
                    type={showPassword ? 'text' : 'password'}
                    {...register('password')}
                  />
                  <button
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="grid h-9 w-9 place-items-center rounded-lg text-[#64749f] transition hover:bg-slate-100"
                    onClick={() => setShowPassword((value) => !value)}
                    type="button"
                  >
                    <FiEye aria-hidden="true" />
                  </button>
                </span>
              </label>

              <div className="flex flex-col gap-3 text-sm text-[#52628f] sm:flex-row sm:items-center sm:justify-between">
                <label className="flex items-center gap-3">
                  <input
                    className="h-5 w-5 rounded border-slate-300 text-primary-600 accent-primary-600"
                    defaultChecked
                    type="checkbox"
                  />
                  Remember me
                </label>
                <span className="flex items-center gap-2">
                  Keep me signed in
                  <FiInfo aria-hidden="true" className="text-[#7d8db7]" />
                </span>
              </div>

              <button
                className="flex h-14 w-full items-center justify-center gap-3 rounded-lg bg-gradient-to-r from-blue-600 via-cyan-600 to-emerald-600 text-lg font-bold text-white shadow-[0_16px_34px_rgba(37,99,235,0.25)] transition hover:brightness-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
                disabled={isSubmitting}
                type="submit"
              >
                <FiLock aria-hidden="true" />
                {isSubmitting ? 'Signing In...' : 'Sign In'}
              </button>
              {errorMessage ? <p className="text-sm font-bold text-rose-600">{errorMessage}</p> : null}
            </form>

            <div className="my-5 flex items-center gap-6 text-sm text-[#52628f]">
              <span className="h-px flex-1 bg-slate-200" />
              or continue with
              <span className="h-px flex-1 bg-slate-200" />
            </div>

            <button
              className="flex h-12 w-full items-center justify-center gap-3 rounded-lg border border-slate-200 bg-white text-base font-bold text-[#07194c] shadow-sm transition hover:bg-slate-50"
              type="button"
            >
              <FcGoogle aria-hidden="true" size={24} />
              Sign in with Google
            </button>

            <p className="mt-6 text-center text-base text-[#52628f]">
              Don&apos;t have an account? <a className="font-bold text-primary-600" href="/login">Contact Administrator</a>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
