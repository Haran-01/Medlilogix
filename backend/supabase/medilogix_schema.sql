create extension if not exists pgcrypto;

create table if not exists public.doctors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  phone_number text not null default '',
  serial_number text not null default '',
  password_hash text not null,
  password_salt text not null,
  created_at timestamptz not null default now()
);

alter table public.doctors
  add column if not exists phone_number text not null default '',
  add column if not exists serial_number text not null default '';

create table if not exists public.patient_test_records (
  id uuid primary key default gen_random_uuid(),
  doctor_id uuid not null references public.doctors(id) on delete cascade,
  patient_file_id text not null,
  patient_name text not null,
  gender text not null check (gender in ('Female', 'Male', 'Other')),
  age integer not null check (age > 0),
  description text not null,
  test_date text not null,
  test_duration text not null,
  peak_psi numeric not null,
  average_psi numeric not null,
  minimum_psi numeric not null,
  sample_count integer not null check (sample_count > 0),
  imported_at timestamptz not null,
  saved_at timestamptz not null default now(),
  source_file_name text
);

do $$
begin
  if not exists (
    select 1
    from public.patient_test_records
    group by patient_file_id
    having count(*) > 1
  ) then
    create unique index if not exists idx_patient_test_records_patient_file_id_unique
      on public.patient_test_records(patient_file_id);
  end if;
end;
$$;

create or replace function public.prevent_duplicate_patient_file_id()
returns trigger
language plpgsql
as $$
begin
  if exists (
    select 1
    from public.patient_test_records
    where patient_file_id = new.patient_file_id
      and id <> new.id
  ) then
    raise exception 'Patient ID % already exists. Duplicate patient IDs are not allowed.', new.patient_file_id
      using errcode = '23505';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_prevent_duplicate_patient_file_id on public.patient_test_records;

create trigger trg_prevent_duplicate_patient_file_id
before insert or update of patient_file_id on public.patient_test_records
for each row execute function public.prevent_duplicate_patient_file_id();

create table if not exists public.patient_test_samples (
  id bigint generated always as identity primary key,
  record_id uuid not null references public.patient_test_records(id) on delete cascade,
  sample_order integer not null,
  timestamp text not null,
  psi numeric not null
);

create index if not exists idx_patient_test_records_doctor_saved
  on public.patient_test_records(doctor_id, saved_at desc);

create index if not exists idx_patient_test_samples_record_order
  on public.patient_test_samples(record_id, sample_order);

alter table public.doctors enable row level security;
alter table public.patient_test_records enable row level security;
alter table public.patient_test_samples enable row level security;

create or replace function public.save_patient_test(
  p_id uuid,
  p_doctor_id uuid,
  p_patient_file_id text,
  p_patient_name text,
  p_gender text,
  p_age integer,
  p_description text,
  p_test_date text,
  p_test_duration text,
  p_peak_psi numeric,
  p_average_psi numeric,
  p_minimum_psi numeric,
  p_imported_at timestamptz,
  p_saved_at timestamptz,
  p_source_file_name text,
  p_samples jsonb
)
returns public.patient_test_records
language plpgsql
as $$
declare
  saved_record public.patient_test_records;
begin
  insert into public.patient_test_records (
    id,
    doctor_id,
    patient_file_id,
    patient_name,
    gender,
    age,
    description,
    test_date,
    test_duration,
    peak_psi,
    average_psi,
    minimum_psi,
    sample_count,
    imported_at,
    saved_at,
    source_file_name
  )
  values (
    p_id,
    p_doctor_id,
    p_patient_file_id,
    p_patient_name,
    p_gender,
    p_age,
    p_description,
    p_test_date,
    p_test_duration,
    p_peak_psi,
    p_average_psi,
    p_minimum_psi,
    jsonb_array_length(p_samples),
    p_imported_at,
    p_saved_at,
    p_source_file_name
  )
  returning * into saved_record;

  insert into public.patient_test_samples (record_id, sample_order, timestamp, psi)
  select
    p_id,
    sample_index - 1,
    sample_item ->> 'timestamp',
    (sample_item ->> 'psi')::numeric
  from jsonb_array_elements(p_samples) with ordinality as samples(sample_item, sample_index);

  return saved_record;
end;
$$;
