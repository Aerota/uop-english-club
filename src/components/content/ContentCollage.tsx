import { useEffect, useState } from "react";
import { ExternalLink, FileText, Film, Image as ImageIcon, LinkIcon, Presentation, X } from "lucide-react";

import { openContent } from "@/components/content/ContentList";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getFileUrl } from "@/lib/data/queries";
import type { ContentItem } from "@/lib/data/types";
import { cn } from "@/lib/utils";

const ICONS = {
  document: FileText,
  presentation: Presentation,
  video: Film,
  image: ImageIcon,
  link: LinkIcon,
} as const;

function iconFor(kind: string) {
  return ICONS[kind as keyof typeof ICONS] ?? FileText;
}

/** Soft tinted backgrounds so non-image items still read as a collage tile. */
const TINTS = [
  "from-primary/25 to-primary/5",
  "from-accent/30 to-accent/5",
  "from-secondary to-primary/10",
  "from-primary/15 to-accent/15",
];

const RATIOS = ["aspect-[4/5]", "aspect-square", "aspect-[3/4]", "aspect-[4/3]"];

type Preview = Record<string, string>;

/** Resolve temporary links for files kept in the private bucket. */
function usePreviews(items: ContentItem[]) {
  const [previews, setPreviews] = useState<Preview>({});
  const paths = items
    .map((item) => (item.storage_path ? `${item.id}:${item.storage_path}` : null))
    .filter(Boolean)
    .join("|");

  useEffect(() => {
    let cancelled = false;
    const entries = paths ? paths.split("|") : [];
    if (entries.length === 0) return;
    (async () => {
      const resolved: Preview = {};
      await Promise.all(
        entries.map(async (entry) => {
          const idx = entry.indexOf(":");
          const id = entry.slice(0, idx);
          const path = entry.slice(idx + 1);
          try {
            resolved[id] = await getFileUrl(path);
          } catch {
            /* ignore a single failed preview */
          }
        }),
      );
      if (!cancelled) setPreviews((prev) => ({ ...prev, ...resolved }));
    })();
    return () => {
      cancelled = true;
    };
  }, [paths]);

  return previews;
}

function mediaUrl(item: ContentItem, previews: Preview) {
  const direct =
    item.external_url && /\.(png|jpe?g|gif|webp|avif|svg|mp4|webm|ogg|pdf)(\?|#|$)/i.test(item.external_url)
      ? item.external_url
      : null;
  return previews[item.id] ?? item.file_url ?? direct;
}

/** YouTube links get a real thumbnail so the collage stays visual. */
function youTubeId(url: string | null) {
  if (!url) return null;
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/,
  );
  return match?.[1] ?? null;
}

function vimeoId(url: string | null) {
  return url?.match(/vimeo\.com\/(\d+)/)?.[1] ?? null;
}

/** True when the file behind this item is a PDF we can render inline. */
function isPdf(item: ContentItem, url: string | null) {
  const candidate = url ?? item.storage_path ?? item.file_url ?? item.external_url ?? "";
  return /\.pdf(\?|#|$)/i.test(candidate);
}

/** Google Docs / Slides / Drive links can be embedded with a /preview URL. */
function googleEmbed(url: string | null) {
  if (!url) return null;
  const match = url.match(
    /https?:\/\/(?:docs|drive)\.google\.com\/[^\s]*?\/d\/(?:e\/)?([A-Za-z0-9_-]+)/,
  );
  if (!match) return null;
  return url.replace(/\/(edit|view|preview)(\?[^#]*)?(#.*)?$/, "/preview");
}

function hostOf(url: string | null) {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

type Props = {
  items: ContentItem[];
  /** Items outside the current filter are shown greyscale and inactive. */
  isActive?: (item: ContentItem) => boolean;
  labelFor?: (item: ContentItem) => string | undefined;
  emptyText?: string;
};

export function ContentCollage({ items, isActive, labelFor, emptyText = "Nothing has been uploaded here yet." }: Props) {
  const previews = usePreviews(items);
  const [open, setOpen] = useState<ContentItem | null>(null);
  const [zoomed, setZoomed] = useState(false);
  const [broken, setBroken] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  function openItem(item: ContentItem) {
    setOpen(item);
    setZoomed(false);
    requestAnimationFrame(() => requestAnimationFrame(() => setZoomed(true)));
  }

  function close() {
    setZoomed(false);
    window.setTimeout(() => setOpen(null), 220);
  }

  const width = Math.min(window.innerWidth * 0.92, 1000);
  const height = Math.min(window.innerHeight * 0.86, 780);

  const visible = isActive ? items.filter((item) => isActive(item)) : items;

  if (visible.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card/50 p-10 text-center text-sm text-muted-foreground">
        {emptyText}
      </div>
    );
  }

  return (
    <>
      <div className="columns-2 gap-4 sm:columns-3 lg:columns-4 [&>*]:mb-4">
        {visible.map((item, index) => {
          const Icon = iconFor(item.kind);
          const url = mediaUrl(item, previews);
          const label = labelFor?.(item);
          const ytId = youTubeId(item.external_url);
          const pdf = isPdf(item, url) ? url : null;
          const host = hostOf(item.external_url);
          const thumb = broken[item.id]
            ? null
            : ytId
              ? `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`
              : item.kind === "image" && url
                ? url
                : null;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => openItem(item)}
              aria-label={`Open ${item.title}`}
              className={cn(
                "group relative block w-full break-inside-avoid overflow-hidden rounded-2xl border border-border/70 text-left shadow-soft transition-all duration-500",
                RATIOS[index % RATIOS.length],
                "cursor-zoom-in hover:-translate-y-1 hover:shadow-lg",
              )}
            >
              {thumb ? (
                <img
                  src={thumb}
                  alt={item.title}
                  loading="lazy"
                  onError={() => setBroken((prev) => ({ ...prev, [item.id]: true }))}
                  className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : item.kind === "video" && url && !broken[item.id] ? (
                <div
                  className={cn(
                    "relative size-full bg-gradient-to-br",
                    TINTS[index % TINTS.length],
                  )}
                >
                  <video
                    src={url}
                    muted
                    playsInline
                    preload="metadata"
                    onError={() => setBroken((prev) => ({ ...prev, [item.id]: true }))}
                    className="size-full object-cover"
                  />
                  <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-4">
                    <Icon className="size-7 text-primary drop-shadow" />
                    <p className="font-display text-sm font-semibold leading-snug text-background drop-shadow">
                      {item.title}
                    </p>
                  </div>
                </div>
              ) : pdf ? (
                <div className="relative size-full overflow-hidden bg-white">
                  <iframe
                    src={`${pdf}#page=1&view=FitH&toolbar=0&navpanes=0&scrollbar=0&zoom=page-width`}
                    title={item.title}
                    tabIndex={-1}
                    className="pointer-events-none h-full border-0"
                    style={{ width: "calc(100% + 24px)" }}
                    scrolling="no"
                  />
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-foreground/85 to-transparent p-3 pt-10">
                    <Icon className="mb-1 size-5 text-background" />
                    <p className="font-display text-sm font-semibold leading-snug text-background">
                      {item.title}
                    </p>
                  </div>
                </div>
              ) : (
                <div
                  className={cn(
                    "flex size-full flex-col justify-between bg-gradient-to-br p-4",
                    TINTS[index % TINTS.length],
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="size-7 text-primary" />
                    {host ? (
                      <img
                        src={`https://www.google.com/s2/favicons?sz=64&domain=${host}`}
                        alt=""
                        loading="lazy"
                        className="size-5 rounded"
                      />
                    ) : null}
                  </div>
                  <div>
                    <p className="font-display text-sm font-semibold leading-snug">{item.title}</p>
                    {host ? (
                      <p className="mt-1 truncate text-[11px] text-muted-foreground">{host}</p>
                    ) : null}
                  </div>
                </div>
              )}

              <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-foreground/80 to-transparent p-3 pt-8 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <p className="line-clamp-2 text-xs font-semibold text-background">{item.title}</p>
                <p className="text-[11px] capitalize text-background/80">
                  {[item.kind, label].filter(Boolean).join(" · ")}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {open ? (
        <div
          className={cn(
            "fixed inset-0 z-50 bg-foreground/70 backdrop-blur-sm transition-opacity duration-300",
            zoomed ? "opacity-100" : "opacity-0",
          )}
          onClick={close}
          role="presentation"
        >
          <div
            className={cn(
              "fixed left-1/2 top-1/2 overflow-hidden rounded-3xl bg-card shadow-2xl transition-all duration-300 ease-out",
              zoomed ? "-translate-x-1/2 -translate-y-1/2 scale-100 opacity-100" : "-translate-x-1/2 -translate-y-1/2 scale-95 opacity-0",
            )}
            style={{ width: `${width}px`, height: `${height}px` }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex h-full flex-col">
              <div className="flex items-start justify-between gap-4 border-b border-border/70 p-5">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display text-lg font-semibold">{open.title}</h3>
                    <Badge variant="secondary" className="capitalize">
                      {open.kind}
                    </Badge>
                    {labelFor?.(open) ? <Badge variant="outline">{labelFor(open)}</Badge> : null}
                  </div>
                  {open.description ? (
                    <p className="mt-1 text-sm text-muted-foreground">{open.description}</p>
                  ) : null}
                </div>
                <Button variant="ghost" size="icon" className="rounded-full" onClick={close} aria-label="Close">
                  <X className="size-5" />
                </Button>
              </div>

              <div className="flex-1 overflow-auto bg-secondary/50">
                <PreviewBody item={open} url={mediaUrl(open, previews)} />
              </div>

              <div className="flex items-center justify-between gap-3 border-t border-border/70 p-4">
                <p className="text-xs text-muted-foreground">
                  Added {new Date(open.created_at).toLocaleDateString()}
                </p>
                <Button variant="outline" className="rounded-full" onClick={() => openContent(open)}>
                  <ExternalLink className="mr-2 size-4" />
                  {open.external_url ? "Open link" : "Open original"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function PreviewBody({ item, url }: { item: ContentItem; url: string | null }) {
  const ytId = youTubeId(item.external_url);
  if (ytId) {
    return (
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&rel=0`}
        title={item.title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="size-full border-0 bg-black"
      />
    );
  }
  const vId = vimeoId(item.external_url);
  if (vId) {
    return (
      <iframe
        src={`https://player.vimeo.com/video/${vId}?autoplay=1`}
        title={item.title}
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        className="size-full border-0 bg-black"
      />
    );
  }
  const gdoc = googleEmbed(item.external_url);
  if (gdoc) {
    return (
      <iframe
        src={gdoc}
        title={item.title}
        className="size-full overflow-hidden border-0 scrollbar-hide"
        scrolling="no"
      />
    );
  }
  if (item.kind === "image" && url) {
    return <img src={url} alt={item.title} className="mx-auto max-h-full object-contain" />;
  }
  if (item.kind === "video" && url) {
    return <video src={url} controls autoPlay className="size-full bg-black object-contain" />;
  }
  if (url) {
    const docUrl = isPdf(item, url) ? `${url}#toolbar=0&navpanes=0&scrollbar=0&view=FitH` : url;
    return (
      <iframe
        src={docUrl}
        title={item.title}
        className="size-full overflow-hidden border-0 scrollbar-hide"
        scrolling="no"
      />
    );
  }
  if (item.external_url) {
    return <ExternalPreview item={item} />;
  }
  return (
    <div className="flex size-full items-center justify-center p-8 text-sm text-muted-foreground">
      No preview available for this item.
    </div>
  );
}

/** Many sites block embedding; show the frame with a fallback hint. */
function ExternalPreview({ item }: { item: ContentItem }) {
  const Icon = iconFor(item.kind);
  const host = hostOf(item.external_url);
  return (
    <div className="relative size-full">
      <iframe
        src={item.external_url ?? undefined}
        title={item.title}
        referrerPolicy="no-referrer"
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
        className="size-full overflow-hidden border-0 bg-card scrollbar-hide"
        scrolling="no"
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center gap-2 bg-card/90 px-4 py-2 text-xs text-muted-foreground">
        <Icon className="size-4 text-primary" />
        <span>
          {host ? `Embedded from ${host}. ` : ""}Some sites block embedding — use “Open link” if it
          stays blank.
        </span>
      </div>
    </div>
  );
}
