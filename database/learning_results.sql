-- Chạy một lần trong Supabase SQL Editor. Không công khai service_role key.
create table if not exists public.learning_results (
 id bigint generated always as identity primary key,
 created_at timestamptz not null default now(),
 student_name varchar(70) not null,
 class_name varchar(20) not null,
 grade varchar(1) not null check (grade in ('3','4','5')),
 lesson varchar(120) not null,
 score smallint not null check (score >= 0),
 total smallint not null check (total between 1 and 100 and score <= total)
);
create index if not exists learning_results_grade_class_idx on public.learning_results (grade,class_name,created_at desc);
alter table public.learning_results enable row level security;
revoke all on table public.learning_results from anon, authenticated;
-- Chỉ Vercel API sử dụng SUPABASE_SERVICE_ROLE_KEY ở môi trường máy chủ.

-- Bổ sung tên trường cho dữ liệu kết quả hiện có (chạy trong Supabase SQL Editor).
alter table public.learning_results add column if not exists school_name varchar(150);
create index if not exists learning_results_school_idx on public.learning_results (school_name,created_at desc);
-- Để NULL với các lượt làm bài cũ chưa có thông tin trường.
