import { useEffect, useState } from "react";
import { Quote } from "lucide-react";

import type { Testimonial } from "@/lib/data/queries";
import { groupTheme } from "@/lib/theme/palette";

/** Static trio for ≤3 voices; otherwise a "card deck shuffle" — cards flip and fan in place. */
export function VoicesCarousel({ items }: { items: Testimonial[] }) {
  const [start, setStart] = useState(0);
  const [paused, setPaused] = useState(false);
  const rotate = items.length > 3;

  useEffect(() => {
    if (!rotate || paused) return;
    const t = setInterval(() => setStart((s) => (s + 1) % items.length), 4500);
    return () => clearInterval(t);
  }, [rotate, paused, items.length]);

  const visible = rotate
    ? [0, 1, 2].map((o) => items[(start + o) % items.length]!)
    : items;

  return (
    <div onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="mt-10 grid gap-5 md:grid-cols-3" style={{ perspective: "1200px" }}>
        {visible.map((voice, slot) => (
          <figure
            key={`${voice.id}-${start}`}
            className={`voice-card motion-card rounded-2xl border border-[var(--tc-border)] bg-card p-6 shadow-soft ${groupTheme(`group-${5 + (items.findIndex((item) => item.id === voice.id) % 6)}`)}`}
            style={rotate ? { animationDelay: `${slot * 140}ms` } : undefined}
          >
            <Quote className="size-6 text-[var(--tc)]" />
            <blockquote className="mt-4 text-sm text-muted-foreground">“{voice.quote}”</blockquote>
            <figcaption className="mt-5 border-t border-[var(--tc-border)] pt-4 text-sm font-semibold text-[var(--tc)]">
              {voice.author_name}
              {voice.author_role ? (
                <span className="block text-xs font-normal text-muted-foreground">{voice.author_role}</span>
              ) : null}
            </figcaption>
          </figure>
        ))}
      </div>
      {rotate ? (
        <div className="mt-6 flex justify-center gap-2">
          {items.map((t, i) => (
            <button
              key={t.id}
              aria-label={`Show testimonial ${i + 1}`}
              onClick={() => setStart(i)}
              className={`h-2 rounded-full transition-all ${i === start ? "w-6 bg-primary" : "w-2 bg-primary/30"}`}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
