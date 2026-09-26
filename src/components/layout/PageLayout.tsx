import type { ReactNode } from "react";

import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";
import { SiteMotion } from "./SiteMotion";

export function PageLayout({ children }: { children: ReactNode }) {
  return (
    <div className="site-motion flex min-h-screen flex-col bg-background">
      <SiteMotion />
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}

export function PageHero({
  eyebrow,
  title,
  description,
  image,
  imageAlt,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  image?: string;
  imageAlt?: string;
}) {
  return (
    <section className="motion-image relative overflow-hidden border-b border-border/70 bg-primary-soft/60">
      {image ? (
        <>
          <img
            src={image}
            alt={imageAlt ?? ""}
            className="motion-image-target absolute inset-0 size-full object-cover"
          />
          <div className="absolute inset-0 bg-ink/75" />
        </>
      ) : null}
      <div className="section-shell relative py-16 md:py-24">
        <p className={image ? "eyebrow text-ink-foreground/70" : "eyebrow"}>{eyebrow}</p>
        <h1
          className={`mt-4 max-w-3xl text-4xl font-semibold md:text-5xl ${
            image ? "text-ink-foreground" : "text-foreground"
          }`}
        >
          {title}
        </h1>
        {description ? (
          <p
            className={`mt-4 max-w-2xl text-base ${
              image ? "text-ink-foreground/80" : "text-muted-foreground"
            }`}
          >
            {description}
          </p>
        ) : null}
      </div>
    </section>
  );
}

