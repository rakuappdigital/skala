# skala

Arkadaşları ve sevgilileri karakter/fiziksel kriterlere göre puanlayan,
zaman içinde güncellenen bir sıralama tablosuyla takip eden kişisel site.

Next.js (App Router) + Vercel Blob. Genel puan hiçbir yerde saklanmıyor —
her zaman `src/lib/scoring.ts` içindeki hesaplama zincirinden
(en güncel puan → kategori ortalaması → ağırlıklı genel puan) canlı
türetiliyor. Bir kategoriye henüz puan girilmediyse o kategori genel
puana dahil edilmez, ağırlıklar kalan kategoriler üzerinde yeniden
normalize edilir.

## Veri katmanı

Ayrı bir veritabanı sunucusu yok — tüm veri (kişiler, kriterler, puan
geçmişi, notlar) tek bir JSON dosyası olarak Vercel Blob'da tutuluyor
(`src/lib/store.ts`, `skala/db.json`). Kişisel/tek kullanıcılı bir site
için bu yeterli ve ekstra bir hesap/kayıt gerektirmiyor — proje zaten
Vercel'e bağlı olduğu için `BLOB_READ_WRITE_TOKEN` otomatik enjekte
ediliyor. İleride gerçek bir veritabanına (Postgres vb.) geçmek
istersen tek değişim noktası bu dosya.

## Kurulum

### 1. Ortam değişkenleri

`.env.local.example` dosyasını `.env.local` olarak kopyala (ya da
`vercel env pull .env.local` çalıştır — proje zaten Vercel'e bağlıysa
`BLOB_READ_WRITE_TOKEN` otomatik gelir) ve `APP_PASSWORD`'ü doldur.

İçerik gerçek kişilerin fotoğraf ve değerlendirmeleri olduğu için site
`proxy.ts` üzerinden şifreyle korunuyor — `/login` hariç her istek bu
şifreyi kontrol ediyor.

### 2. Geliştirme

```bash
npm install
npm run dev
```

### 3. Vercel'e deploy

```bash
vercel --prod
```

## Kriterleri / kategorileri güncelleme

Başlangıç kriter seti `src/lib/seed.ts` içinde — DB Blob'da ilk kez
oluşturulurken buradan tohumlanıyor. İlk kurulumdan sonra kriter
eklemek/kapatmak/ağırlık değiştirmek için `skala/db.json`'daki
`categories` / `criteria` dizilerini düzenlemek yeterli (Vercel Blob
dashboard'undan indirip düzenleyip geri yükleyebilir ya da ileride bir
ayarlar ekranı eklenebilir) — kod değişikliği ya da yeniden deploy
gerekmez. Yeni bir kişi eklemek de aynı şekilde anında yansır —
sıralama sayfaları her istekte canlı okunuyor (`force-dynamic`).

## Mimari notları

- **Fotoğraflar**: yükleme öncesi tarayıcıda canvas ile 512×512 kareye
  kırpılıp sıkıştırılıyor (`PhotoUploader.tsx`). Bu sayede hem önizleme
  hem depolanan dosya her zaman sabit boyutta kalıyor, kaynak görsel ne
  kadar büyük olursa olsun sayfa düzeni bozulmuyor.
- **Puan geçmişi**: puanlar üstüne yazılmıyor, her güncelleme DB'deki
  `scoreEntries` dizisine yeni bir kayıt ekliyor. Kişi sayfasındaki
  "Geçmiş" bölümü bu geçmişi gösteriyor.
- **Erişim**: tüm veri okuma/yazma sunucu tarafında yapılıyor
  (`src/lib/store.ts`), tarayıcı hiçbir zaman Blob token'ını görmüyor.
  Fotoğraflar `public` erişimli ama URL'leri tahmin edilemez (rastgele
  UUID); site geneli ayrıca şifreyle korunuyor.
- **Eşzamanlılık**: her yazma tüm DB dosyasını okuyup-değiştirip geri
  yazıyor. Tek kullanıcılı kişisel kullanım için yeterli; çok sayıda eş
  zamanlı yazma olursa (aynı anda birden fazla sekmeden puanlama gibi)
  son yazan kazanır.
