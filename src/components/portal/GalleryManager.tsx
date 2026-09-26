import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ImagePlus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { galleryAlbumsQuery, galleryImagesQuery } from "@/lib/data/queries";
import type { GalleryAlbum, GalleryImage } from "@/lib/data/types";

const EMPTY = { title: "", description: "", event_date: "", sort_order: "0" };

function safeName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "-");
}

/** Gallery editor for one group: create albums and upload images in bulk. */
export function GalleryManager({ userId, groupId }: { userId: string; groupId: string }) {
  const queryClient = useQueryClient();
  const albums = useQuery(galleryAlbumsQuery);
  const images = useQuery(galleryImagesQuery);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);

  function refresh() {
    queryClient.invalidateQueries({ queryKey: ["gallery_albums"] });
    queryClient.invalidateQueries({ queryKey: ["gallery_images"] });
  }

  async function submitAlbum(event: React.FormEvent) {
    event.preventDefault();
    if (!form.title.trim()) return;
    setBusy(true);
    const payload = {
      title: form.title.trim(),
      description: form.description || null,
      event_date: form.event_date || null,
      sort_order: Number(form.sort_order) || 0,
      created_by: userId,
      group_id: groupId,
    };
    const { error } = editingId
      ? await supabase.from("gallery_albums").update(payload).eq("id", editingId)
      : await supabase.from("gallery_albums").insert(payload);
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(editingId ? "Photo set updated" : "Photo set created");
    setForm(EMPTY);
    setEditingId(null);
    refresh();
  }

  async function uploadFiles(album: GalleryAlbum, files: FileList | null) {
    if (!files || !files.length) return;
    setBusy(true);
    const list = Array.from(files);
    let done = 0;
    let failed = 0;
    const existing = (images.data ?? []).filter((i) => i.album_id === album.id).length;

    for (const file of list) {
      setProgress(`Uploading ${done + 1} of ${list.length}…`);
      const path = `gallery/${album.id}/${Date.now()}-${safeName(file.name)}`;
      const { error: uploadError } = await supabase.storage
        .from("content")
        .upload(path, file, { upsert: false, contentType: file.type });
      if (uploadError) {
        failed += 1;
        continue;
      }
      const { error: rowError } = await supabase.from("gallery_images").insert({
        album_id: album.id,
        caption: null,
        storage_path: path,
        sort_order: existing + done,
      });
      if (rowError) failed += 1;
      done += 1;
    }

    setProgress(null);
    setBusy(false);
    if (failed) toast.error(`${failed} photo(s) failed to upload`);
    if (done - failed > 0) toast.success(`${done - failed} photo(s) added to ${album.title}`);
    refresh();
  }

  async function removeImage(image: GalleryImage) {
    if (!confirm("Remove this photo?")) return;
    if (image.storage_path) {
      await supabase.storage.from("content").remove([image.storage_path]);
    }
    const { error } = await supabase.from("gallery_images").delete().eq("id", image.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Photo removed");
    refresh();
  }

  async function removeAlbum(album: GalleryAlbum) {
    if (!confirm(`Delete "${album.title}" and all its photos?`)) return;
    const paths = (images.data ?? [])
      .filter((i) => i.album_id === album.id)
      .map((i) => i.storage_path)
      .filter((p): p is string => !!p);
    if (paths.length) await supabase.storage.from("content").remove(paths);
    const { error } = await supabase.from("gallery_albums").delete().eq("id", album.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Photo set deleted");
    refresh();
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={submitAlbum} className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <Label htmlFor="album-title">Photo set title</Label>
              <Input
                id="album-title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Presentation day — Group 7"
                required
              />
            </div>
            <div>
              <Label htmlFor="album-date">Date</Label>
              <Input
                id="album-date"
                type="date"
                value={form.event_date}
                onChange={(e) => setForm({ ...form, event_date: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="album-order">Display order</Label>
              <Input
                id="album-order"
                type="number"
                value={form.sort_order}
                onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="album-desc">Description</Label>
              <Textarea
                id="album-desc"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="flex gap-2 md:col-span-2">
              <Button type="submit" disabled={busy} className="rounded-full">
                {editingId ? "Save photo set" : "Create photo set"}
              </Button>
              {editingId ? (
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full"
                  onClick={() => {
                    setForm(EMPTY);
                    setEditingId(null);
                  }}
                >
                  Cancel
                </Button>
              ) : null}
            </div>
          </form>
        </CardContent>
      </Card>

      {progress ? <p className="text-sm text-muted-foreground">{progress}</p> : null}

      <div className="space-y-6">
        {(albums.data ?? []).filter((a) => a.group_id === groupId).map((album) => {
          const albumImages = (images.data ?? []).filter((i) => i.album_id === album.id);
          return (
            <Card key={album.id}>
              <CardContent className="space-y-4 pt-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display text-lg font-semibold">{album.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {albumImages.length} photo(s)
                      {album.event_date ? ` · ${album.event_date}` : ""}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full"
                      onClick={() => {
                        setEditingId(album.id);
                        setForm({
                          title: album.title,
                          description: album.description ?? "",
                          event_date: album.event_date ?? "",
                          sort_order: String(album.sort_order),
                        });
                      }}
                    >
                      Edit details
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full text-destructive"
                      onClick={() => removeAlbum(album)}
                    >
                      <Trash2 className="mr-1 size-4" /> Delete set
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor={`bulk-${album.id}`} className="flex items-center gap-2">
                    <ImagePlus className="size-4" /> Add photos (select many at once)
                  </Label>
                  <Input
                    id={`bulk-${album.id}`}
                    type="file"
                    accept="image/*"
                    multiple
                    disabled={busy}
                    onChange={(e) => {
                      void uploadFiles(album, e.target.files);
                      e.target.value = "";
                    }}
                  />
                </div>

                {albumImages.length ? (
                  <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
                    {albumImages.map((image) => (
                      <div key={image.id} className="group relative overflow-hidden rounded-lg border">
                        {image.url ? (
                          <img
                            src={image.url}
                            alt={image.caption ?? album.title}
                            loading="lazy"
                            className="aspect-square w-full object-cover"
                          />
                        ) : (
                          <div className="aspect-square w-full bg-secondary" />
                        )}
                        <button
                          type="button"
                          aria-label="Remove photo"
                          onClick={() => removeImage(image)}
                          className="absolute right-1 top-1 rounded-full bg-background/90 p-1 text-destructive opacity-0 transition-opacity group-hover:opacity-100"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No photos in this set yet.</p>
                )}
              </CardContent>
            </Card>
          );
        })}
        {!albums.isLoading &&
        !(albums.data ?? []).filter((a) => a.group_id === groupId).length ? (
          <p className="text-sm text-muted-foreground">No albums yet — create your first one above.</p>
        ) : null}
      </div>
    </div>
  );
}
