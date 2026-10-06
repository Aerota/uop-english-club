import { ExternalLink, Globe } from "lucide-react";
import type { RelatedSite } from "@/lib/data/queries";
import { groupTheme } from "@/lib/theme/palette";

const ACCENTS = ["group-5", "group-6", "group-7"];

function host(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function RelatedSites({ items }: { items: RelatedSite[] }) {
  return (
    <section className="section-shell py-20">
      <p className="eyebrow">Explore more</p>
      <h2 className="mt-3 text-3xl font-semibold md:text-4xl">Our other websites</h2>
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {items.map((site, i) => {
          const theme = groupTheme(ACCENTS[i % ACCENTS.length]);
          return (
            <a
              key={site.id}
              href={site.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group overflow-hidden rounded-2xl border bg-card shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              style={theme.style}
            >
              <div className="flex items-center gap-1.5 border-b bg-muted px-3 py-2">
                <span className="size-2.5 rounded-full bg-destructive/60" />
                <span className="size-2.5 rounded-full bg-accent" />
                <span className="size-2.5 rounded-full bg-primary/50" />
                <span className="ml-2 truncate rounded bg-background px-2 py-0.5 text-xs text-muted-foreground">
                  {host(site.url)}
                </span>
              </div>
              <div className="relative aspect-[16/10] overflow-hidden bg-secondary">
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                  <Globe className="size-10" />
                </div>
                <img
                  src={`https://image.thum.io/get/width/800/crop/1000/${site.url}`}
                  alt={`Preview of ${site.name}`}
                  loading="lazy"
                  className="relative h-full w-full object-cover object-top transition duration-500 group-hover:scale-105"
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-lg font-semibold">{site.name}</h3>
                  <ExternalLink className="size-4 text-muted-foreground transition group-hover:text-primary" />
                </div>
                {site.description ? (
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{site.description}</p>
                ) : null}
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}
