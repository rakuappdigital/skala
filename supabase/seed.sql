-- skala: başlangıç kriter seti
-- schema.sql'den sonra, bir kez çalıştırılır. Kriterler daha sonra
-- Supabase tablosundan (categories/criteria) düzenlenebilir/eklenebilir —
-- uygulama kodu hiçbir kriteri sabit kodlamaz, hepsini DB'den okur.

insert into categories (tab, key, label, weight, sort_order) values
  ('arkadaslar', 'karakter', 'Karakter', 0.70, 1),
  ('arkadaslar', 'fiziksel', 'Fiziksel', 0.30, 2),
  ('sevgililer', 'karakter', 'Karakter', 0.55, 1),
  ('sevgililer', 'fiziksel', 'Fiziksel', 0.45, 2)
on conflict (tab, key) do nothing;

insert into criteria (category_id, label, sort_order)
select cat.id, seed.label, seed.sort_order
from (
  values
    ('arkadaslar', 'karakter', 'Güvenilirlik', 1),
    ('arkadaslar', 'karakter', 'Ulaşılabilirlik', 2),
    ('arkadaslar', 'karakter', 'Mizah', 3),
    ('arkadaslar', 'karakter', 'Zor günde yanında olma', 4),
    ('arkadaslar', 'karakter', 'Sohbet kalitesi', 5),
    ('arkadaslar', 'fiziksel', 'Genel görünüm', 1),
    ('arkadaslar', 'fiziksel', 'Bakım / stil', 2),
    ('arkadaslar', 'fiziksel', 'Enerji', 3),
    ('sevgililer', 'karakter', 'Zeka / sohbet kalitesi', 1),
    ('sevgililer', 'karakter', 'Duygusal olgunluk', 2),
    ('sevgililer', 'karakter', 'Mizah', 3),
    ('sevgililer', 'karakter', 'Tutarlılık', 4),
    ('sevgililer', 'karakter', 'Cömertlik / empati', 5),
    ('sevgililer', 'karakter', 'Uyum / iletişim', 6),
    ('sevgililer', 'fiziksel', 'Genel görünüm', 1),
    ('sevgililer', 'fiziksel', 'Stil / bakım', 2),
    ('sevgililer', 'fiziksel', 'Fiziksel çekim / uyum', 3),
    ('sevgililer', 'fiziksel', 'Enerji', 4)
) as seed(tab, category_key, label, sort_order)
join categories cat
  on cat.tab = seed.tab::person_tab
  and cat.key = seed.category_key::category_key
where not exists (
  select 1 from criteria c
  where c.category_id = cat.id and c.label = seed.label
);
