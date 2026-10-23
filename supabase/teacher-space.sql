-- Run once in Supabase SQL Editor. No changes to existing learning_results.
create table if not exists public.thdk_teachers (
 user_id uuid primary key references auth.users(id) on delete cascade,
 teacher_name text not null check (char_length(teacher_name) between 2 and 100),
 school_name text not null check (char_length(school_name) between 2 and 150),
 created_at timestamptz not null default now()
);
create table if not exists public.thdk_classes (
 id uuid primary key default gen_random_uuid(),
 teacher_id uuid not null references public.thdk_teachers(user_id) on delete cascade,
 school_name text not null,
 class_name text not null,
 grade text not null check (grade in ('3','4','5')),
 school_year text not null default '',
 created_at timestamptz not null default now()
);
create index if not exists thdk_classes_owner_idx on public.thdk_classes(teacher_id);
create table if not exists public.thdk_questions (
 id uuid primary key default gen_random_uuid(),
 teacher_id uuid not null references public.thdk_teachers(user_id) on delete cascade,
 class_id uuid not null references public.thdk_classes(id) on delete cascade,
 grade text not null check (grade in ('3','4','5')),
 lesson text not null,
 question text not null,
 answers jsonb not null check (jsonb_typeof(answers) = 'array' and jsonb_array_length(answers)=4),
 correct integer not null check (correct between 0 and 3),
 enabled boolean not null default true,
 created_at timestamptz not null default now()
);
create index if not exists thdk_questions_scope_idx on public.thdk_questions(teacher_id,class_id,grade);
-- Browser clients cannot access these tables directly. All access goes through
-- api/teacher-space.js, which verifies Auth token and enforces teacher_id.
alter table public.thdk_teachers enable row level security;
alter table public.thdk_classes enable row level security;
alter table public.thdk_questions enable row level security;
revoke all on public.thdk_teachers,public.thdk_classes,public.thdk_questions from anon,authenticated;
