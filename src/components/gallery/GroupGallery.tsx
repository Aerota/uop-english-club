import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useState } from "react";
import { createPortal } from "react-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { galleryAlbumsQuery, galleryImagesQuery } from "@/lib/data/queries";
import type { GalleryImage } from "@/lib/data/types";

/** Public gallery for one group: album cards that open into their photos. */
export function GroupGallery({ groupId }: { groupId: string }) {
  const albums = useQuery(galleryAlbumsQuery);
  const images = useQuery(galleryImagesQuery);
  const [openAlbum, setOpenAlbum] = useState<string | null>(null);
  const [zoom, setZoom] = useState<GalleryImage | null>(null);

  const groupAlbums = (albums.data ?? []).filter((a) => a.group_id === groupId);
  const allImages = images.data ?? [];

  if (albums.isLoading) {
    return <p className="mt-6 text-sm text-muted-foreground">Loading gallery…</p>;
  }

  if (!groupAlbums.length) {
    return (
      <p className="mt-6 text-sm text-muted-foreground">
        🖼️ No photo albums published by this group yet.
      </p>
    );
  }

  const active = groupAlbums.find((a) => a.id === openAlbum) ?? null;
  const activeImages = active ? allImages.filter((i) => i.album_id === active.id) : [];

  function stepPhoto(direction: 1 | -1) {
    if (!zoom || activeImages.length < 2) return;
    const index = activeImages.findIndex((i) => i.id === zoom.id);
    const next = (index + direction + activeImages.length) % activeImages.length;
    setZoom(activeImages[next] ?? null);
  }

  return (
    <div className="mt-6">
      {active ? (
        <div>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full"
            onClick={() => setOpenAlbum(null)}
          >
            <ArrowLeft className="mr-1 size-4" /> All albums
          </Button>
          <h3 className="mt-4 font-display text-xl font-semibold">{active.title}</h3>
          {active.event_date ? (
            <p className="text-xs text-muted-foreground">{active.event_date}</p>
          ) : null}
          {active.description ? (
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{active.description}</p>
          ) : null}

          {activeImages.length ? (
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {activeImages.map((image) => (
                <button
                  key={image.id}
                  type="button"
                  onClick={() => setZoom(image)}
                  className="group relative block overflow-hidden rounded-xl border border-border/60 shadow-sm cursor-zoom-in"
                >
                  {image.url ? (
                    <img
                      src={image.url}
                      alt={image.caption ?? active.title}
                      loading="lazy"
                      className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                    />
                  ) : (
                    <div className="aspect-square w-full bg-secondary" />
                  )}
                </button>
              ))}
            </div>
          ) : (
            <p className="mt-6 text-sm text-muted-foreground">This album has no photos yet.</p>
          )}
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {groupAlbums.map((album) => {
            const albumImages = allImages.filter((i) => i.album_id === album.id);
            const cover = album.cover_url ?? albumImages[0]?.url ?? null;
            return (
              <button
                key={album.id}
                type="button"
                onClick={() => setOpenAlbum(album.id)}
                className="group overflow-hidden rounded-xl border border-border/60 bg-card text-left shadow-sm transition-shadow hover:shadow-md"
              >
                {cover ? (
                  <img
                    src={cover}
                    alt={album.title}
                    loading="lazy"
                    className="aspect-[4/3] w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="aspect-[4/3] w-full bg-secondary" />
                )}
                <div className="p-5">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-display text-base font-semibold">{album.title}</h3>
                    <Badge variant="outline">{albumImages.length} photos</Badge>
                  </div>
                  {album.event_date ? (
                    <p className="mt-1 text-xs text-muted-foreground">{album.event_date}</p>
                  ) : null}
                  {album.description ? (
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                      {album.description}
                    </p>
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {zoom
        ? createPortal(
        <div
          className="fixed inset-0 z-[100] flex h-dvh w-screen items-center justify-center bg-ink/95 p-4 animate-in fade-in sm:p-8"
          role="dialog"
          aria-modal="true"
          onClick={() => setZoom(null)}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") stepPhoto(-1);
            if (e.key === "ArrowRight") stepPhoto(1);
            if (e.key === "Escape") setZoom(null);
          }}
          tabIndex={-1}
          ref={(el) => el?.focus()}
        >
          <button
            type="button"
            aria-label="Close photo"
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/25"
            onClick={() => setZoom(null)}
          >
            <X className="size-5" />
          </button>
          {activeImages.length > 1 ? (
            <>
              <button
                type="button"
                aria-label="Previous photo"
                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/25 sm:left-6"
                onClick={(e) => {
                  e.stopPropagation();
                  stepPhoto(-1);
                }}
              >
                <ChevronLeft className="size-6" />
              </button>
              <button
                type="button"
                aria-label="Next photo"
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/25 sm:right-6"
                onClick={(e) => {
                  e.stopPropagation();
                  stepPhoto(1);
                }}
              >
                <ChevronRight className="size-6" />
              </button>
              <p className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-xs text-white">
                {activeImages.findIndex((i) => i.id === zoom.id) + 1} / {activeImages.length}
              </p>
            </>
          ) : null}
          {zoom.url ? (
            <img
              src={zoom.url}
              alt={zoom.caption ?? "Gallery photo"}
               className="max-h-[calc(100dvh-4rem)] max-w-[calc(100vw-2rem)] object-contain animate-in zoom-in-95 sm:max-h-[calc(100dvh-5rem)] sm:max-w-[calc(100vw-8rem)]"
              onClick={(e) => e.stopPropagation()}
            />
          ) : null}
         </div>,
         document.body,
       )
        : null}
    </div>
  );
}
