import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import type { Group } from "@/lib/data/types";

/** Edit a group's public details (name, tagline, description, cover image). */
export function GroupDetailsForm({ group }: { group: Group }) {
  const queryClient = useQueryClient();
  const [name, setName] = useState(group.name);
  const [tagline, setTagline] = useState(group.tagline ?? "");
  const [description, setDescription] = useState(group.description ?? "");
  const [coverUrl, setCoverUrl] = useState(group.cover_url ?? "");
  const [mobileCoverUrl, setMobileCoverUrl] = useState(group.mobile_cover_url ?? "");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<"desktop" | "mobile" | null>(null);

  async function uploadCover(kind: "desktop" | "mobile", file: File | null) {
    if (!file) return;
    setUploading(kind);
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const path = `${group.id}/${kind}-${Date.now()}-${safeName}`;
    const { error } = await supabase.storage
      .from("covers")
      .upload(path, file, { upsert: false, contentType: file.type });
    setUploading(null);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (kind === "desktop") setCoverUrl(path);
    else setMobileCoverUrl(path);
    toast.success("Image uploaded. Save details to publish it.");
  }

  useEffect(() => {
    setName(group.name);
    setTagline(group.tagline ?? "");
    setDescription(group.description ?? "");
    setCoverUrl(group.cover_url ?? "");
    setMobileCoverUrl(group.mobile_cover_url ?? "");
  }, [group]);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    // The loaded group carries temporary display links; only send images that changed here.
    const payload: {
      name: string;
      tagline: string | null;
      description: string | null;
      cover_url?: string | null;
      mobile_cover_url?: string | null;
    } = {
      name,
      tagline: tagline || null,
      description: description || null,
    };
    if (coverUrl !== (group.cover_url ?? "")) payload.cover_url = coverUrl || null;
    if (mobileCoverUrl !== (group.mobile_cover_url ?? ""))
      payload.mobile_cover_url = mobileCoverUrl || null;
    const { error } = await supabase.from("groups").update(payload).eq("id", group.id);
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Group details saved");
    queryClient.invalidateQueries({ queryKey: ["groups"] });
  }

  return (
    <Card className="border-border/70 shadow-soft">
      <CardContent className="pt-6">
        <h2 className="text-lg font-semibold">Group details</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Shown on the public group page and the activities page.
        </p>
        <form onSubmit={save} className="mt-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="group-name">Group name</Label>
              <Input
                id="group-name"
                className="mt-2"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="group-tagline">Tagline</Label>
              <Input
                id="group-tagline"
                className="mt-2"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="group-description">Description</Label>
            <Textarea
              id="group-description"
              className="mt-2"
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="group-cover">Desktop cover image (16:9)</Label>
              <Input
                id="group-cover"
                type="file"
                accept="image/*"
                className="mt-2"
                disabled={uploading !== null}
                onChange={(e) => void uploadCover("desktop", e.target.files?.[0] ?? null)}
              />
              <p className="mt-2 text-xs text-muted-foreground">
                {uploading === "desktop"
                  ? "Uploading…"
                  : coverUrl
                    ? "Image added. Choose a new file to replace it."
                    : "No image yet."}
              </p>
              {coverUrl ? (
                <Button
                  type="button"
                  variant="link"
                  className="mt-1 h-auto p-0 text-xs"
                  onClick={() => setCoverUrl("")}
                >
                  Remove image
                </Button>
              ) : null}
            </div>
            <div>
              <Label htmlFor="group-mobile-cover">Mobile cover image (4:3, optional)</Label>
              <Input
                id="group-mobile-cover"
                type="file"
                accept="image/*"
                className="mt-2"
                disabled={uploading !== null}
                onChange={(e) => void uploadCover("mobile", e.target.files?.[0] ?? null)}
              />
              <p className="mt-2 text-xs text-muted-foreground">
                {uploading === "mobile"
                  ? "Uploading…"
                  : mobileCoverUrl
                    ? "Image added. Choose a new file to replace it."
                    : "Uses the desktop image when left empty."}
              </p>
              {mobileCoverUrl ? (
                <Button
                  type="button"
                  variant="link"
                  className="mt-1 h-auto p-0 text-xs"
                  onClick={() => setMobileCoverUrl("")}
                >
                  Remove image
                </Button>
              ) : null}
            </div>
          </div>
          <Button type="submit" className="rounded-full" disabled={saving}>
            {saving ? "Saving…" : "Save details"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
