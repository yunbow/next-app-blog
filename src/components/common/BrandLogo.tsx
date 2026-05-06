import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  className?: string;
  iconClassName?: string;
  textClassName?: string;
  showText?: boolean;
  label: string;
};

export function BrandLogo({
  className,
  iconClassName,
  textClassName,
  showText = true,
  label,
}: BrandLogoProps) {
  return (
    <Link
      href="/"
      className={cn("flex items-center gap-2", className)}
      aria-label={label}
    >
      <Image
        src="/brand-icon.png"
        alt=""
        aria-hidden="true"
        width={64}
        height={64}
        priority
        className={cn("size-8 rounded-md object-cover", iconClassName)}
      />
      {showText && (
        <span className={cn("font-bold", textClassName)}>Blog</span>
      )}
    </Link>
  );
}
