import React from "react";
import { cn } from "@/lib/utils";

export interface LogoProps extends React.ComponentPropsWithoutRef<"svg"> {
  variant?: "full" | "mark";
}

export const Logo: React.FC<LogoProps> = ({ variant = "mark", className, ...props }) => {
  return (
    <div className="flex items-center gap-3">
      <svg
        viewBox="0 0 32 32"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn("h-8 w-8 text-brand-primary transition-colors duration-200", className)}
        {...props}
      >
        {/* Left vertical bar */}
        <path d="M8 5v22" />
        {/* Top geometric loop representing upper "B" */}
        <path d="M8 5h9l4 5.5-4 5.5H8" />
        {/* Bottom geometric loop representing lower "B" */}
        <path d="M8 16h11l4 5.5-4 5.5H8" />
        {/* Tech grid dot representing a bitstream connection */}
        <circle cx="21" cy="16" r="1.5" fill="currentColor" stroke="none" />
      </svg>

      {variant === "full" && (
        <span className="font-sans text-xl font-extrabold tracking-tight text-slate-100">
          bit<span className="text-brand-primary">wrangler</span>
        </span>
      )}
    </div>
  );
};

export default Logo;
