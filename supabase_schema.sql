-- Scholarship Monitoring System - Supabase PostgreSQL schema
-- Based on the laboratory's required minimum database structure and workflow.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role text not null check (role in ('admin','staff','scholar')),
  created_at timestamptz not null default now()
);

create table if not exists public.scholarship_programs (
  id uuid primary key default gen_random_uuid(),
  program_name text not null,
  required_gwa numeric(4,2) not null check (required_gwa >= 0 and required_gwa <= 5),
  min_units integer not null check (min_units >= 0),
  allow_failing_grade boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.scholars (
  id uuid primary key default gen_random_uuid(),
  student_id text unique not null,
  full_name text not null,
  degree_program text not null,
  year_level text not null,
  scholarship_id uuid not null references public.scholarship_programs(id),
  status text not null default 'Active',
  created_at timestamptz not null default now()
);

create table if not exists public.grade_submissions (
  id uuid primary key default gen_random_uuid(),
  scholar_id uuid not null references public.scholars(id) on delete cascade,
  academic_year text not null,
  semester text not null check (semester in ('1st Semester','2nd Semester','Summer')),
  gwa numeric(4,2) not null check (gwa >= 0 and gwa <= 5),
  units_enrolled integer not null check (units_enrolled >= 0),
  failed_subjects integer not null default 0 check (failed_subjects >= 0),
  incomplete_subjects integer not null default 0 check (incomplete_subjects >= 0),
  submission_status text not null default 'Pending' check (submission_status in ('Pending','Verified','Returned')),
  submitted_at timestamptz not null default now(),
  verified_by uuid references public.profiles(id),
  verified_at timestamptz
);

-- Starter scholarship programs
insert into public.scholarship_programs(program_name,required_gwa,min_units,allow_failing_grade)
select 'University Merit Scholarship',1.75,15,false
where not exists (select 1 from public.scholarship_programs where program_name='University Merit Scholarship');

insert into public.scholarship_programs(program_name,required_gwa,min_units,allow_failing_grade)
select 'Government Scholarship',2.00,15,false
where not exists (select 1 from public.scholarship_programs where program_name='Government Scholarship');

insert into public.scholarship_programs(program_name,required_gwa,min_units,allow_failing_grade)
select 'Private Academic Scholarship',2.25,12,true
where not exists (select 1 from public.scholarship_programs where program_name='Private Academic Scholarship');

-- Recommended RLS starting point. Review before production use.
alter table public.profiles enable row level security;
alter table public.scholarship_programs enable row level security;
alter table public.scholars enable row level security;
alter table public.grade_submissions enable row level security;

-- In a real deployment, create policies based on auth.uid() and the user's role.
-- Do not expose service_role keys in frontend code.
