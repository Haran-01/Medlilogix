import { useState } from 'react';
import { useForm, type UseFormRegisterReturn } from 'react-hook-form';
import { FiKey, FiMail, FiPhone, FiShield, FiUser } from 'react-icons/fi';
import { Card } from '../../components/common/Card';
import { PageHeader } from '../../components/common/PageHeader';
import { useAuth } from '../../contexts/AuthContext';
import { usePageTitle } from '../../hooks/usePageTitle';
import { changePassword } from '../../services/auth.service';

interface PasswordFormValues {
  confirmPassword: string;
  currentPassword: string;
  newPassword: string;
}

export function ProfilePage() {
  usePageTitle('Profile');
  const { doctor } = useAuth();
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, reset } = useForm<PasswordFormValues>();
  const initials = doctor?.name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'ML';

  async function onSubmit(values: PasswordFormValues) {
    setMessage('');
    setErrorMessage('');

    if (values.newPassword.length < 8) {
      setErrorMessage('New password must be at least 8 characters.');
      return;
    }

    if (values.newPassword !== values.confirmPassword) {
      setErrorMessage('New password and confirm password must match.');
      return;
    }

    setIsSubmitting(true);

    try {
      const successMessage = await changePassword(values.currentPassword, values.newPassword);
      setMessage(successMessage);
      reset();
    } catch (error) {
      const apiMessage =
        typeof error === 'object' && error && 'response' in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : '';
      setErrorMessage(apiMessage || 'Password could not be updated.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Profile" description="Manage your MediLogiX account details." />

      <Card className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="flex items-center gap-4">
          <div className="grid h-16 w-16 place-items-center rounded-lg bg-[#eef4ff] text-xl font-extrabold text-[#0647ff]">
            {initials}
          </div>
          <div>
            <p className="text-lg font-extrabold text-[#07194c]">{doctor?.name}</p>
            <p className="text-sm font-medium text-[#64749f]">Registered user</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <InfoItem icon={FiUser} label="Name" value={doctor?.name} />
          <InfoItem icon={FiPhone} label="Phone number" value={doctor?.phoneNumber || 'Not provided'} />
          <InfoItem icon={FiShield} label="Serial number" value={doctor?.serialNumber || 'Not provided'} />
          <InfoItem icon={FiMail} label="Gmail" value={doctor?.email} />
        </div>
      </Card>

      <Card>
        <div className="mb-5 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-[#eef4ff] text-[#0647ff]">
            <FiKey aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-[#07194c]">Change Password</h2>
            <p className="text-sm font-medium text-[#64749f]">Password is encrypted and never displayed.</p>
          </div>
        </div>

        <form className="grid gap-4 lg:grid-cols-3" onSubmit={handleSubmit(onSubmit)}>
          <PasswordField label="Current password" register={register('currentPassword', { required: true })} />
          <PasswordField label="New password" register={register('newPassword', { required: true })} />
          <PasswordField label="Confirm new password" register={register('confirmPassword', { required: true })} />

          {errorMessage ? <p className="rounded-md bg-rose-50 px-3 py-2 text-sm font-bold text-rose-700 lg:col-span-3">{errorMessage}</p> : null}
          {message ? <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-700 lg:col-span-3">{message}</p> : null}

          <div className="lg:col-span-3">
            <button
              className="h-11 rounded-md bg-[#0647ff] px-5 text-sm font-extrabold text-white shadow-[0_12px_24px_rgba(6,71,255,0.22)] transition hover:bg-[#053ee0] disabled:cursor-not-allowed disabled:opacity-70"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? 'Updating...' : 'Update password'}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}

function InfoItem({ icon: Icon, label, value }: { icon: typeof FiUser; label: string; value?: string }) {
  return (
    <div className="rounded-lg border border-[#e1e7f2] bg-[#f8fbff] p-4">
      <div className="flex items-center gap-2 text-xs font-bold uppercase text-[#64749f]">
        <Icon aria-hidden="true" />
        {label}
      </div>
      <p className="mt-2 break-words text-sm font-extrabold text-[#07194c]">{value || 'Not available'}</p>
    </div>
  );
}

function PasswordField({
  label,
  register,
}: {
  label: string;
  register: UseFormRegisterReturn;
}) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-[#07194c]">{label}</span>
      <input
        className="mt-2 h-11 w-full rounded-md border border-[#d7deea] bg-white px-3 text-sm outline-none focus:border-[#0647ff] focus:ring-4 focus:ring-blue-100"
        type="password"
        {...register}
      />
    </label>
  );
}
