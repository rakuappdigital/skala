-- skala: şema + hesaplama motoru
-- Supabase SQL editöründe tek seferde çalıştırılır.

create extension if not exists pgcrypto;

do $$ begin
  create type person_tab as enum ('arkadaslar', 'sevgililer');
exception when duplicate_object then null; end $$;

do $$ begin
  create type category_key as enum ('karakter', 'fiziksel');
exception when duplicate_object then null; end $$;

-- Her tab için kategori ağırlıkları (toplamı 1.0 olmalı, ama zorunlu değil:
-- puanlama sistemi eksik kategoriyi otomatik dışlayıp kalan ağırlıkları
-- yeniden normalize eder, bkz. person_scores view'i).
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  tab person_tab not null,
  key category_key not null,
  label text not null,
  weight numeric(4,3) not null check (weight >= 0 and weight <= 1),
  sort_order int not null default 0,
  unique (tab, key)
);

create table if not exists criteria (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references categories(id) on delete cascade,
  label text not null,
  sort_order int not null default 0,
  active boolean not null default true
);

create table if not exists people (
  id uuid primary key default gen_random_uuid(),
  tab person_tab not null,
  name text not null,
  photo_url text,
  created_at timestamptz not null default now()
);

-- Puanlar üstüne yazılmaz: her güncelleme yeni bir satır.
-- Böylece geçmiş korunur ve trend hesaplanabilir.
create table if not exists score_entries (
  id uuid primary key default gen_random_uuid(),
  person_id uuid not null references people(id) on delete cascade,
  criterion_id uuid not null references criteria(id) on delete cascade,
  value numeric(3,1) not null check (value >= 1 and value <= 10),
  note text,
  scored_at timestamptz not null default now()
);

create table if not exists person_notes (
  id uuid primary key default gen_random_uuid(),
  person_id uuid not null references people(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_score_entries_person on score_entries(person_id);
create index if not exists idx_score_entries_criterion on score_entries(criterion_id);
create index if not exists idx_criteria_category on criteria(category_id);
create index if not exists idx_person_notes_person on person_notes(person_id);

-- ---------------------------------------------------------------------
-- Hesaplama motoru: kişi+kritere göre en güncel puan -> kategori
-- ortalaması -> ağırlıklı genel puan. Hepsi view olarak tanımlı,
-- yani uygulama kodu asla "toplam puan" saklamaz, hep DB'den türetilir.
-- ---------------------------------------------------------------------

create or replace view latest_scores as
select distinct on (person_id, criterion_id)
  person_id, criterion_id, value, note, scored_at
from score_entries
order by person_id, criterion_id, scored_at desc, id desc;

create or replace view category_scores as
select
  ls.person_id,
  cat.id as category_id,
  cat.tab,
  cat.key as category_key,
  cat.label as category_label,
  cat.weight as category_weight,
  round(avg(ls.value), 2) as category_avg,
  count(*) as criteria_scored,
  max(ls.scored_at) as category_last_scored_at
from latest_scores ls
join criteria c on c.id = ls.criterion_id
join categories cat on cat.id = c.category_id
group by ls.person_id, cat.id, cat.tab, cat.key, cat.label, cat.weight;

-- Genel puan: sadece en az bir kritere puan verilmiş kategoriler dahil
-- edilir, ağırlıklar bu alt küme üzerinde yeniden normalize edilir.
-- Böylece "henüz fiziksel puan girilmedi" durumu kişiyi 0'a çekmez.
create or replace view person_scores as
select
  p.id as person_id,
  p.tab,
  p.name,
  p.photo_url,
  p.created_at,
  round(
    sum(cs.category_avg * cs.category_weight) / nullif(sum(cs.category_weight), 0)
  , 2) as overall_score,
  count(cs.category_id) as categories_scored,
  max(cs.category_last_scored_at) as last_scored_at
from people p
left join category_scores cs on cs.person_id = p.id
group by p.id, p.tab, p.name, p.photo_url, p.created_at;

-- ---------------------------------------------------------------------
-- RLS: uygulama sadece service-role anahtarıyla, sunucu tarafında
-- konuşuyor (bkz. src/lib/supabase/server.ts). Bu yüzden anon/authenticated
-- rolleri için hiçbir policy tanımlanmıyor -> tarayıcıdan doğrudan erişim
-- her zaman reddedilir, service role RLS'i zaten bypass eder.
-- ---------------------------------------------------------------------
alter table categories enable row level security;
alter table criteria enable row level security;
alter table people enable row level security;
alter table score_entries enable row level security;
alter table person_notes enable row level security;
