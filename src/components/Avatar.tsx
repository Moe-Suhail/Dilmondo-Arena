import { initials } from "@/lib/format";

type AvatarProps = {
  name: string;
  imageUrl?: string | null;
  color?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
};

const sizes = {
  sm: "h-10 w-10 text-sm",
  md: "h-12 w-12 text-base",
  lg: "h-16 w-16 text-xl",
  xl: "h-24 w-24 text-3xl",
};

export function Avatar({ name, imageUrl, color = "#f5c542", size = "md" }: AvatarProps) {
  return (
    <div
      className={`${sizes[size]} shrink-0 overflow-hidden rounded-full border border-white/15 bg-slate-900 shadow-lg`}
      aria-label={name}
    >
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt=""
          className="h-full w-full object-cover"
          loading="lazy"
        />
      ) : (
        <div
          className="flex h-full w-full items-center justify-center font-bold text-slate-950"
          style={{
            background: `linear-gradient(135deg, ${color ?? "#f5c542"}, rgba(255,255,255,0.86))`,
          }}
        >
          {initials(name)}
        </div>
      )}
    </div>
  );
}
