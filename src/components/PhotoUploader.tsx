"use client";

import { useRef, useState } from "react";

const TARGET_SIZE = 512;

function cropToSquare(img: HTMLImageElement): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = TARGET_SIZE;
  canvas.height = TARGET_SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas desteklenmiyor");

  const side = Math.min(img.naturalWidth, img.naturalHeight);
  const sx = (img.naturalWidth - side) / 2;
  const sy = (img.naturalHeight - side) / 2;

  ctx.drawImage(img, sx, sy, side, side, 0, 0, TARGET_SIZE, TARGET_SIZE);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("dönüştürme başarısız"))),
      "image/jpeg",
      0.88
    );
  });
}

export function PhotoUploader({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (url: string | null) => void;
}) {
  const [preview, setPreview] = useState<string | null>(value);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError(null);
    setUploading(true);
    try {
      const img = document.createElement("img");
      const objectUrl = URL.createObjectURL(file);
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("görsel okunamadı"));
        img.src = objectUrl;
      });

      // Sabit 512x512 kareye kırpılıp sıkıştırılıyor — hem önizleme hem
      // depolanan dosya her zaman aynı boyutta kalır, kaynak görsel
      // ne kadar büyük olursa olsun sayfa düzeni bozulmaz.
      const blob = await cropToSquare(img);
      URL.revokeObjectURL(objectUrl);
      setPreview(URL.createObjectURL(blob));

      const form = new FormData();
      form.append("file", blob, "avatar.jpg");
      const res = await fetch("/api/upload", { method: "POST", body: form });
      if (!res.ok) throw new Error("yükleme başarısız");
      const data = await res.json();
      onChange(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "bir şeyler ters gitti");
      setPreview(value);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="uploader">
      <div className="uploader-preview">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Önizleme" />
        ) : (
          <span className="uploader-hint">yok</span>
        )}
      </div>
      <div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
        <button
          type="button"
          className="btn"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? "Yükleniyor…" : preview ? "Görseli değiştir" : "Görsel seç"}
        </button>
        <p className="uploader-hint" style={{ marginTop: 8 }}>
          Kare olarak kırpılıp sabit boyuta küçültülür, sayfayı büyütmez.
        </p>
        {error && <p className="error-text">{error}</p>}
      </div>
    </div>
  );
}
