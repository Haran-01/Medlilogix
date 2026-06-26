import { useState } from 'react';
import { useForm, type UseFormRegisterReturn } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { FiHash, FiLock, FiMail, FiPhone, FiUser } from 'react-icons/fi';
import { z } from 'zod';
import medilogixLogo from '../../assets/medilogix-logo.png';
import { usePageTitle } from '../../hooks/usePageTitle';
import { registerDoctor } from '../../services/auth.service';

const signupSchema = z.object({
  name: z.string().trim().min(1),
  phoneNumber: z.string().trim().min(1),
  serialNumber: z.string().trim().min(1).regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z0-9]+$/),
  gmail: z.string().email().refine((value) => value.toLowerCase().endsWith('@gmail.com')),
  password: z.string().min(8),
});

type SignupFormValues = z.infer<typeof signupSchema>;

export function SignupPage() {
  usePageTitle('Sign Up');
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit } = useForm<SignupFormValues>();

  async function onSubmit(values: SignupFormValues) {
    const parsedValues = signupSchema.safeParse(values);

    if (!parsedValues.success) {
      setErrorMessage('Complete all fields. Serial number must include letters and numbers.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      await registerDoctor({
        ...parsedValues.data,
        gmail: parsedValues.data.gmail.toLowerCase(),
        serialNumber: parsedValues.data.serialNumber.toUpperCase(),
      });
      setSuccessMessage('Account created successfully. Redirecting to login...');
      window.setTimeout(() => navigate('/login', { replace: true }), 1200);
    } catch (error) {
      const message =
        typeof error === 'object' && error && 'response' in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : '';
      setErrorMessage(message || 'Sign-up failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#f4f7fb] px-4 py-8 text-[#07194c]">
      <section className="w-full max-w-[520px] rounded-xl border border-[#e1e7f2] bg-white p-7 shadow-[0_24px_70px_rgba(15,23,42,0.12)] sm:p-9">
        <div className="text-center">
          <img alt="MediLogiX" className="mx-auto h-12 w-auto object-contain" src={medilogixLogo} />
          <h1 className="mt-6 text-3xl font-extrabold tracking-normal">Create account</h1>
          <p className="mt-2 text-sm font-medium text-[#64749f]">Register your device and user credentials.</p>
        </div>

        <form className="mt-7 grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
          <Field icon={FiUser} label="Name" placeholder="Full name" register={register('name')} />
          <Field icon={FiPhone} label="Phone number" placeholder="Phone number" register={register('phoneNumber')} />
          <Field icon={FiHash} label="Serial number" placeholder="MED123A" register={register('serialNumber')} />
          <Field icon={FiMail} label="Gmail" placeholder="name@gmail.com" register={register('gmail')} type="email" />
          <div className="sm:col-span-2">
            <Field icon={FiLock} label="Password" placeholder="Minimum 8 characters" register={register('password')} type="password" />
          </div>

          {errorMessage ? <p className="rounded-md bg-rose-50 px-3 py-2 text-sm font-bold text-rose-700 sm:col-span-2">{errorMessage}</p> : null}
          {successMessage ? <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-700 sm:col-span-2">{successMessage}</p> : null}

          <button
            className="h-12 rounded-md bg-[#0647ff] text-sm font-extrabold text-white shadow-[0_14px_28px_rgba(6,71,255,0.24)] transition hover:bg-[#053ee0] disabled:cursor-not-allowed disabled:opacity-70 sm:col-span-2"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? 'Creating account...' : 'Sign up'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm font-medium text-[#64749f]">
          Already have an account? <Link className="font-extrabold text-[#0647ff]" to="/login">Sign in</Link>
        </p>
      </section>
    </main>
  );
}

function Field({
  icon: Icon,
  label,
  placeholder,
  register,
  type = 'text',
}: {
  icon: typeof FiUser;
  label: string;
  placeholder: string;
  register: UseFormRegisterReturn;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-bold">{label}</span>
      <span className="mt-2 flex h-12 items-center gap-3 rounded-md border border-[#d7deea] bg-white px-4 focus-within:border-[#0647ff] focus-within:ring-4 focus-within:ring-blue-100">
        <Icon aria-hidden="true" className="text-[#7d8db7]" />
        <input
          autoComplete="off"
          className="min-w-0 flex-1 border-0 bg-transparent text-sm outline-none"
          placeholder={placeholder}
          type={type}
          {...register}
        />
      </span>
    </label>
  );
}
