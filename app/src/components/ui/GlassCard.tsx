import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
  padding?: "sm" | "md" | "lg" | "none";
}

const paddingMap = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export function GlassCard({
  children,
  className,
  hover = false,
  onClick,
  padding = "md",
}: GlassCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "glass",
        hover && "glass-hover cursor-pointer",
        onClick && "cursor-pointer",
        paddingMap[padding],
        className
      )}
    >
      {children}
    </div>
  );
}
