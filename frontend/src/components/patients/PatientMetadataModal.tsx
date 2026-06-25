import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import type { PatientMetadataFormValues, PatientTestRecord } from '../../types/patientTest';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';

interface PatientMetadataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (values: PatientMetadataFormValues) => void;
  record: PatientTestRecord | null;
}

export function PatientMetadataModal({ isOpen, onClose, onSave, record }: PatientMetadataModalProps) {
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = useForm<PatientMetadataFormValues>({
    defaultValues: {
      age: '',
      description: '',
      gender: '',
      patientName: '',
    },
  });

  useEffect(() => {
    if (record) {
      reset({
        age: record.age,
        description: record.description,
        gender: record.gender,
        patientName: record.patientName,
      });
    }
  }, [record, reset]);

  if (!record) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Metadata">
      <form
        className="space-y-5"
        onSubmit={handleSubmit((values) => {
          onSave(values);
          onClose();
        })}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-bold text-[#07194c]">Patient ID</span>
            <input
              className="mt-2 h-11 w-full rounded-lg border border-[#d7deea] bg-[#f6f8fb] px-3 text-sm font-semibold text-[#52628f]"
              readOnly
              value={record.id}
            />
          </label>
          <label className="block">
            <span className="text-sm font-bold text-[#07194c]">Test Date</span>
            <input
              className="mt-2 h-11 w-full rounded-lg border border-[#d7deea] bg-[#f6f8fb] px-3 text-sm font-semibold text-[#52628f]"
              readOnly
              value={record.testDate}
            />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-bold text-[#07194c]">Patient Name</span>
            <input
              className="mt-2 h-11 w-full rounded-lg border border-[#d7deea] bg-white px-3 text-sm text-[#07194c] outline-none focus:border-[#0647ff] focus:ring-4 focus:ring-blue-100"
              placeholder="Enter patient name"
              {...register('patientName', { required: 'Patient name is required' })}
            />
            {errors.patientName ? <p className="mt-1 text-xs font-semibold text-rose-600">{errors.patientName.message}</p> : null}
          </label>

          <label className="block">
            <span className="text-sm font-bold text-[#07194c]">Gender</span>
            <select
              className="mt-2 h-11 w-full rounded-lg border border-[#d7deea] bg-white px-3 text-sm text-[#07194c] outline-none focus:border-[#0647ff] focus:ring-4 focus:ring-blue-100"
              {...register('gender', { required: 'Gender is required' })}
            >
              <option value="">Select gender</option>
              <option value="Female">Female</option>
              <option value="Male">Male</option>
              <option value="Other">Other</option>
            </select>
            {errors.gender ? <p className="mt-1 text-xs font-semibold text-rose-600">{errors.gender.message}</p> : null}
          </label>
        </div>

        <label className="block">
          <span className="text-sm font-bold text-[#07194c]">Age</span>
          <input
            className="mt-2 h-11 w-full rounded-lg border border-[#d7deea] bg-white px-3 text-sm text-[#07194c] outline-none focus:border-[#0647ff] focus:ring-4 focus:ring-blue-100"
            placeholder="Enter age"
            type="number"
            {...register('age', {
              required: 'Age is required',
              min: { value: 1, message: 'Age must be at least 1' },
            })}
          />
          {errors.age ? <p className="mt-1 text-xs font-semibold text-rose-600">{errors.age.message}</p> : null}
        </label>

        <label className="block">
          <span className="text-sm font-bold text-[#07194c]">Description</span>
          <textarea
            className="mt-2 min-h-28 w-full resize-none rounded-lg border border-[#d7deea] bg-white px-3 py-3 text-sm text-[#07194c] outline-none focus:border-[#0647ff] focus:ring-4 focus:ring-blue-100"
            placeholder="Enter clinical description"
            {...register('description', { required: 'Description is required' })}
          />
          {errors.description ? <p className="mt-1 text-xs font-semibold text-rose-600">{errors.description.message}</p> : null}
        </label>

        <div className="flex justify-end gap-3 border-t border-[#e7ebf3] pt-5">
          <Button onClick={onClose} type="button" variant="secondary">
            Cancel
          </Button>
          <Button type="submit">Save</Button>
        </div>
      </form>
    </Modal>
  );
}
