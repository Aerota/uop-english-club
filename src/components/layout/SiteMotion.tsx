import { useLocation } from "@tanstack/react-router";
import { BookOpen, MessageCircleMore, PenTool } from "lucide-react";
import { useEffect, useRef } from "react";

export function SiteMotion() {
  const layerRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const isPortal = location.pathname.startsWith("/portal");

  useEffect(() => {
    const layer = layerRef.current;
    const main = layer?.parentElement?.querySelector("main");
    if (!layer || !main || isPortal) return;

    const targets = Array.from(
      main.querySelectorAll<HTMLElement>("section, [data-motion-reveal]"),
    );

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("motion-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -8%" },
    );

    targets.forEach((target, index) => {
      target.classList.add("motion-reveal");
      target.style.setProperty("--motion-order", String(index % 4));
      observer.observe(target);
    });

    let frame = 0;
    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        layer.style.setProperty("--cursor-x", `${event.clientX}px`);
        layer.style.setProperty("--cursor-y", `${event.clientY}px`);
        layer.classList.add("motion-pointer-active");
      });
    };

    const onPointerLeave = () => layer.classList.remove("motion-pointer-active");
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onPointerLeave);

    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onPointerMove);
      document.documentElement.removeEventListener("mouseleave", onPointerLeave);
      targets.forEach((target) => {
        target.classList.remove("motion-reveal", "motion-visible");
        target.style.removeProperty("--motion-order");
      });
    };
  }, [isPortal]);

  if (isPortal) return null;

  return (
    <div ref={layerRef} className="site-motion-layer" aria-hidden="true">
      <div className="site-motion-cursor" />
      <BookOpen className="site-motion-symbol site-motion-symbol-book" />
      <PenTool className="site-motion-symbol site-motion-symbol-pen" />
      <MessageCircleMore className="site-motion-symbol site-motion-symbol-talk" />
    </div>
  );
}
