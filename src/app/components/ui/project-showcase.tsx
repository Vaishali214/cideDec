import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowUpRight, TrendingUp, BarChart3, ShieldCheck, Brain } from "lucide-react";
import type { Page } from "../App";

interface Module {
  title: string;
  description: string;
  category: string;
  year: string;
  page: Page;
  image: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
  accentBg: string;
}

const modules: Module[] = [
  {
    title: "Market Intelligence",
    description: "SWOT analysis, TAM/SAM segmentation, competitor matrix & growth forecasting.",
    category: "Market", year: "Live", page: "market",
    image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&q=80&fit=crop",
    icon: TrendingUp, accent: "text-sky-400", accentBg: "bg-sky-500/10 border-sky-500/20",
  },
  {
    title: "Financial Modelling",
    description: "ROI, IRR, NPV, cash-flow analysis, break-even curves & 5-year feasibility.",
    category: "Finance", year: "Live", page: "financial",
    image: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=600&q=80&fit=crop",
    icon: BarChart3, accent: "text-emerald-400", accentBg: "bg-emerald-500/10 border-emerald-500/20",
  },
  {
    title: "Risk Analytics",
    description: "6-factor composite risk scoring, mitigation playbooks & regulatory exposure maps.",
    category: "Risk", year: "Live", page: "insights",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80&fit=crop",
    icon: ShieldCheck, accent: "text-amber-400", accentBg: "bg-amber-500/10 border-amber-500/20",
  },
  {
    title: "AI Strategy Engine",
    description: "Priority-ranked recommendations, confidence intervals & scenario simulation.",
    category: "AI", year: "Live", page: "insights",
    image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=600&q=80&fit=crop",
    icon: Brain, accent: "text-violet-400", accentBg: "bg-violet-500/10 border-violet-500/20",
  },
];

interface ProjectShowcaseProps {
  onNavigate?: (page: Page) => void;
}

export function ProjectShowcase({ onNavigate }: ProjectShowcaseProps) {
  const [hoveredIndex,   setHoveredIndex]   = useState<number | null>(null);
  const [mousePosition,  setMousePosition]  = useState({ x: 0, y: 0 });
  const [smoothPosition, setSmoothPosition] = useState({ x: 0, y: 0 });
  const [isVisible,      setIsVisible]      = useState(false);
  const [containerRect,  setContainerRect]  = useState<DOMRect | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef       = useRef<number | null>(null);

  useEffect(() => {
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const loop = () => {
      setSmoothPosition(prev => ({
        x: lerp(prev.x, mousePosition.x, 0.12),
        y: lerp(prev.y, mousePosition.y, 0.12),
      }));
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [mousePosition]);

  useEffect(() => {
    const update = () => {
      if (containerRef.current) setContainerRect(containerRef.current.getBoundingClientRect());
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => { window.removeEventListener("resize", update); window.removeEventListener("scroll", update, true); };
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setContainerRect(rect);
      setMousePosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }
  };

  return (
    <section ref={containerRef} onMouseMove={handleMouseMove} className="relative w-full max-w-2xl mx-auto">

      {/* Section divider label */}
      <div className="flex items-center gap-3 mb-6">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10" />
        <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/30">Analytics Modules</span>
        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/10" />
      </div>

      {/* Floating image tooltip */}
      <AnimatePresence>
        {isVisible && hoveredIndex !== null && containerRect && (
          <motion.div
            className="pointer-events-none fixed z-[200]"
            style={{
              left: containerRect.left + smoothPosition.x + 24,
              top:  containerRect.top  + smoothPosition.y - 120,
            }}
            initial={{ opacity: 0, scale: 0.85, y: 8 }}
            animate={{ opacity: 1, scale: 1,    y: 0 }}
            exit={{    opacity: 0, scale: 0.88,  y: 4 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="relative w-[220px] h-[140px] rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black/60">
              {modules.map((mod, i) => (
                <img key={mod.title} src={mod.image} alt={mod.title}
                  className="absolute inset-0 w-full h-full object-cover transition-all duration-400"
                  style={{
                    opacity:   hoveredIndex === i ? 1 : 0,
                    transform: hoveredIndex === i ? "scale(1)" : "scale(1.08)",
                    filter:    hoveredIndex === i ? "none" : "blur(6px)",
                  }}
                />
              ))}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-2.5">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${modules[hoveredIndex].accentBg} ${modules[hoveredIndex].accent}`}>
                  {modules[hoveredIndex].category}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Module rows */}
      <div>
        {modules.map((mod, i) => {
          const Icon    = mod.icon;
          const hovered = hoveredIndex === i;
          return (
            <motion.button key={mod.title} className="group relative w-full text-left"
              onMouseEnter={() => { setHoveredIndex(i); setIsVisible(true);  }}
              onMouseLeave={() => { setHoveredIndex(null); setIsVisible(false); }}
              onClick={() => onNavigate?.(mod.page)}
              whileTap={{ scale: 0.995 }}>

              {/* Hover bg */}
              <motion.div className="absolute inset-0 rounded-2xl bg-white/[0.025]"
                animate={{ opacity: hovered ? 1 : 0 }} transition={{ duration: 0.15 }} />

              <div className="relative flex items-center gap-4 px-4 py-4 border-t border-white/[0.06]">

                {/* Icon */}
                <motion.div animate={{ scale: hovered ? 1.06 : 1 }} transition={{ duration: 0.15 }}
                  className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 transition-all duration-200 ${hovered ? mod.accentBg : "bg-white/[0.04] border-white/[0.08]"}`}>
                  <Icon className={`w-4 h-4 transition-colors duration-200 ${hovered ? mod.accent : "text-white/40"}`} />
                </motion.div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <h3 className={`text-[14px] font-semibold leading-tight transition-colors duration-200 ${hovered ? "text-white" : "text-white/70"}`}>
                      {mod.title}
                    </h3>
                    <motion.div animate={{ opacity: hovered ? 1 : 0, x: hovered ? 0 : -5, y: hovered ? 0 : 4 }} transition={{ duration: 0.15 }}>
                      <ArrowUpRight className={`w-3.5 h-3.5 ${mod.accent}`} />
                    </motion.div>
                  </div>
                  <p className={`text-[12px] leading-relaxed transition-colors duration-200 ${hovered ? "text-white/50" : "text-white/25"}`}>
                    {mod.description}
                  </p>
                </div>

                {/* Badge */}
                <div className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full border transition-all duration-200 ${hovered ? `${mod.accentBg} ${mod.accent}` : "bg-transparent border-white/[0.08] text-white/20"}`}>
                  {mod.year}
                </div>
              </div>

              {/* Bottom border for last item */}
              {i === modules.length - 1 && <div className="border-t border-white/[0.06]" />}
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}
