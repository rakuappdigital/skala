type Size = "sm" | "md" | "lg";

const PX: Record<Size, number> = { sm: 40, md: 64, lg: 128 };

export function PersonAvatar({
  name,
  photoUrl,
  size = "md",
}: {
  name: string;
  photoUrl: string | null;
  size?: Size;
}) {
  const px = PX[size];
  const initial = name.trim().charAt(0).toUpperCase() || "?";

  if (photoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photoUrl}
        alt={name}
        width={px}
        height={px}
        className={`avatar avatar-${size}`}
      />
    );
  }

  return (
    <div
      className={`avatar avatar-${size} avatar-placeholder`}
      style={{ fontSize: px * 0.4 }}
      aria-hidden
    >
      {initial}
    </div>
  );
}
