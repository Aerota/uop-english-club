import { useEffect, useState } from "react";

const LOGO_URL =
  "https://www.image2url.com/r2/default/images/1788324763552-37ec9453-9d75-4e1a-8f4e-af6280587a7f.png";

export function HomeLoadingScreen() {
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFadeOut(true), 1800);
    const hideTimer = setTimeout(() => setVisible(false), 2200);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`home-loader fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-ink px-6 text-ink-foreground transition-all duration-500 ${
        fadeOut ? "invisible scale-[1.015] opacity-0" : "visible scale-100 opacity-100"
      }`}
      aria-live="polite"
      aria-busy="true"
    >
      <div className="home-loader-grid absolute inset-0 opacity-30" aria-hidden="true" />
      <div className="absolute left-0 top-0 h-px w-24 bg-primary/60 sm:w-40" aria-hidden="true" />
      <div className="absolute left-0 top-0 h-24 w-px bg-primary/60 sm:h-40" aria-hidden="true" />
      <div className="absolute bottom-0 right-0 h-px w-24 bg-primary/60 sm:w-40" aria-hidden="true" />
      <div className="absolute bottom-0 right-0 h-24 w-px bg-primary/60 sm:h-40" aria-hidden="true" />

      <div className="relative flex flex-col items-center text-center">
        <div className="relative flex size-32 items-center justify-center sm:size-36">
          <div className="absolute inset-0 rounded-full border border-primary/20" />
          <div className="home-loader-orbit absolute inset-2 rounded-full border border-primary/70 border-r-transparent" />
          <div className="absolute inset-5 rounded-full border border-ink-foreground/10" />
          <span className="home-loader-pulse absolute inset-8 rounded-full bg-primary/15" aria-hidden="true" />
          <img
            src={LOGO_URL}
            alt="University of Peradeniya logo"
            className="relative size-20 object-contain sm:size-24"
            width={96}
            height={96}
          />
        </div>

        <div className="mt-8 h-px w-12 bg-primary" aria-hidden="true" />
        <p className="mt-5 font-display text-base font-semibold sm:text-lg">
          English Language Teaching Unit
        </p>
        <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-ink-foreground/55">
          Faculty of Engineering · University of Peradeniya
        </p>

        <div className="mt-8 h-px w-40 overflow-hidden bg-ink-foreground/10" aria-hidden="true">
          <div className="home-loader-progress h-full bg-primary" />
        </div>
      </div>
    </div>
  );
}
