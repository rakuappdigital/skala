# skala

Arkadaşları ve sevgilileri karakter/fiziksel kriterlere göre puanlayan,
zaman içinde güncellenen bir sıralama tablosuyla takip eden kişisel site.

Next.js (App Router) + Supabase (Postgres + Storage). Genel puan hiçbir
yerde saklanmaz — her zaman `supabase/schema.sql` içindeki view'lardan
(`latest_scores` → `category_scores` → `person_scores`) canlı hesaplanır.
Bir kategoriye henüz puan girilmediyse o kategori genel puana dahil
edilmez, ağırlıklar kalan kategoriler üzerinde yeniden normalize edilir.

## Kurulum

### 1. Supabase projesi

1. [supabase.com](https://supabase.com) üzerinde yeni bir proje oluştur.
2. SQL Editor'de sırayla çalıştır:
   - `supabase/schema.sql` (tablolar + hesaplama view'ları)
   - `supabase/seed.sql` (başlangıç kriter seti — Arkadaşlar ve Sevgililer için ayrı ayrı)
3. **Storage** sekmesinden `avatars` adında **public** bir bucket oluştur (profil fotoğrafları buraya yüklenir).
4. **Project Settings → API**'den `Project URL` ve `service_role` anahtarını al.

### 2. Ortam değişkenleri

`.env.local.example` dosyasını `.env.local` olarak kopyala ve doldur:

```
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
APP_PASSWORD=...
```

`APP_PASSWORD` siteye giriş şifresi — içerik gerçek kişilerin fotoğraf ve
değerlendirmeleri olduğu için site `proxy.ts` üzerinden şifreyle korunuyor.

### 3. Geliştirme

```bash
npm install
npm run dev
```

### 4. Vercel'e deploy

Repo'yu Vercel'e bağla, üstteki üç ortam değişkenini Vercel proje
ayarlarından ekle, deploy et.

## Kriterleri / kategorileri güncelleme

Hiçbir kriter kodda sabit değil — hepsi `categories` ve `criteria`
tablolarında. Yeni bir kriter eklemek, birini kapatmak (`active = false`)
ya da kategori ağırlığını değiştirmek için Supabase Table Editor'den
doğrudan düzenle; kod değişikliği ya da yeniden deploy gerekmez. Yeni bir
kişi eklemek de aynı şekilde anında yansır — sıralama sayfası her istekte
canlı sorgulanıyor (`force-dynamic`), statik önbelleğe alınmıyor.

## Mimari notları

- **Fotoğraflar**: yükleme öncesi tarayıcıda canvas ile 512×512 kareye
  kırpılıp sıkıştırılıyor (`PhotoUploader.tsx`). Bu sayede hem önizleme
  hem depolanan dosya her zaman sabit boyutta kalıyor, kaynak görsel ne
  kadar büyük olursa olsun sayfa düzeni bozulmuyor.
- **Puan geçmişi**: puanlar üstüne yazılmıyor, her güncelleme
  `score_entries` tablosuna yeni bir satır ekliyor. Kişi sayfasındaki
  "Geçmiş" bölümü bu geçmişi gösteriyor.
- **Erişim**: tüm veritabanı erişimi sunucu tarafında `service_role`
  anahtarıyla yapılıyor (`src/lib/supabase/server.ts`), tarayıcı hiçbir
  zaman Supabase anahtarı görmüyor.
