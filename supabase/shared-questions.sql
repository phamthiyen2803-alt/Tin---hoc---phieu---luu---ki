-- Chạy trong Supabase SQL Editor để bật kho câu hỏi chung.
-- Không đụng tới dữ liệu kết quả học tập.
create table if not exists public.thdk_shared_questions (
 id text primary key,
 grade text not null check (grade in ('3','4','5')),
 lesson text not null,
 question text not null,
 answers jsonb not null check (jsonb_typeof(answers)='array' and jsonb_array_length(answers)=4),
 correct integer not null check (correct between 0 and 3),
 enabled boolean not null default true,
 created_at timestamptz not null default now()
);
create index if not exists thdk_shared_questions_lesson_idx on public.thdk_shared_questions(grade,lesson,enabled);
alter table public.thdk_shared_questions enable row level security;
revoke all on public.thdk_shared_questions from anon,authenticated;
-- API máy chủ Vercel dùng khóa service-role để đọc và ghi.
