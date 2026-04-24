"use client";
import { cn } from "./utils";
import React, { type ReactNode } from "react";

interface AuroraBackgroundProps extends React.HTMLProps<HTMLDivElement> {
  children: ReactNode;
  showRadialGradient?: boolean;
}

export const AuroraBackground = ({
  className,
  children,
  showRadialGradient = true,
  ...props
}: AuroraBackgroundProps) => {
  return (
    <div
      className={cn(
        "relative flex flex-col min-h-screen items-center justify-center bg-[#050811] text-white overflow-hidden",
        className
      )}
      {...props}
    >
      {/* Aurora layer */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className={cn(
            `[--white-gradient:repeating-linear-gradient(100deg,rgba(255,255,255,0.03)_0%,rgba(255,255,255,0.03)_7%,transparent_10%,transparent_12%,rgba(255,255,255,0.03)_16%)]
             [--aurora:repeating-linear-gradient(100deg,#1e3a8a_10%,#4f46e5_15%,#0ea5e9_20%,#7c3aed_25%,#2563eb_30%)]
             [background-image:var(--white-gradient),var(--aurora)]
             [background-size:300%,_200%]
             [background-position:50%_50%,50%_50%]
             after:content-[""] after:absolute after:inset-0
             after:[background-image:var(--white-gradient),var(--aurora)]
             after:[background-size:200%,_100%]
             after:animate-aurora after:[background-attachment:fixed]
             after:mix-blend-screen after:opacity-40
             absolute -inset-[10px] opacity-30 will-change-transform blur-[8px]`,
            showRadialGradient &&
              `[mask-image:radial-gradient(ellipse_at_60%_0%,black_20%,transparent_75%)]`
          )}
        />
      </div>

      {/* Noise texture overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "128px 128px",
        }}
      />

      {children}
    </div>
  );
};
