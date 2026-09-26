import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { openContent } from "@/components/content/ContentList";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import {
  activitiesQuery,
  activityNamesQuery,
  contentQuery,
  groupsQuery,
} from "@/lib/data/queries";
import type { ContentItem } from "@/lib/data/types";

/** Activity types whose work is organised into named boxes. */
const GROUPED_SLUGS = ["presentations", "group-activities", "projects"];

const KINDS = ["document", "presentation", "video", "image", "link"] as const;

type Props = {
  userId: string;
  isAdmin: boolean;
  groupId: string;
};

/** Upload, edit, re-upload and delete content items. */
export function ContentManager({ userId, isAdmin, groupId: selectedGroupId }: Props) {
  const queryClient = useQueryClient();
  const content = useQuery(contentQuery);
  const activities = useQuery(activitiesQuery);
  const groups = useQuery(groupsQuery);
  const activityNames = useQuery(activityNamesQuery);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [kind, setKind] = useState<string>("document");
  const [activityId, setActivityId] = useState<string>("");
  const [topic, setTopic] = useState("");
  const [externalUrl, setExternalUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const visible = (content.data ?? []).filter(
    (item) => item.group_id === selectedGroupId && (isAdmin || item.uploaded_by === userId),
  );

  const activeActivity = (activities.data ?? []).find((a) => a.id === activityId);
  const grouped = GROUPED_SLUGS.includes(activeActivity?.slug ?? "");
  const targetGroup = selectedGroupId;
  const nameOptions = (activityNames.data ?? [])
    .filter((row) => row.activity_id === activityId && row.group_id === targetGroup)
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name));

  function reset() {
    setTitle("");
    setDescription("");
    setKind("document");
    setActivityId("");
    setTopic("");
    setExternalUrl("");
    setFile(null);
    setEditingId(null);
  }

  async function uploadFile(targetGroupId: string) {
    if (!file) return null;
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `${targetGroupId}/${crypto.randomUUID()}-${safeName}`;
    const { error } = await supabase.storage.from("content").upload(path, file, {
      upsert: false,
      ...(file.type ? { contentType: file.type } : {}),
    });
    if (error) throw error;
    return path;
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const targetGroupId = selectedGroupId;
    if (!targetGroupId) {
      toast.error("Please choose a group.");
      return;
    }
    setBusy(true);
    try {
      const newPath = await uploadFile(targetGroupId);
      const payload = {
        title,
        description: description || null,
        kind,
        activity_id: activityId || null,
        topic: topic.trim() || null,
        group_id: targetGroupId,
        external_url: externalUrl || null,
        uploaded_by: userId,
        ...(newPath ? { storage_path: newPath } : {}),
      };


      if (editingId) {
        const previous = visible.find((i) => i.id === editingId);
        const { error } = await supabase.from("content_items").update(payload).eq("id", editingId);
        if (error) throw error;
        if (newPath && previous?.storage_path) {
          await supabase.storage.from("content").remove([previous.storage_path]);
        }
        toast.success("Content updated");
      } else {
        if (!newPath && !externalUrl) {
          toast.error("Attach a file or provide a link.");
          setBusy(false);
          return;
        }
        const { error } = await supabase.from("content_items").insert(payload);
        if (error) throw error;
        toast.success("Content uploaded");
      }
      reset();
      queryClient.invalidateQueries({ queryKey: ["content_items"] });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  async function remove(item: ContentItem) {
    if (!confirm(`Delete "${item.title}"?`)) return;
    const { error } = await supabase.from("content_items").delete().eq("id", item.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (item.storage_path) {
      await supabase.storage.from("content").remove([item.storage_path]);
    }
    toast.success("Deleted");
    queryClient.invalidateQueries({ queryKey: ["content_items"] });
  }

  function startEdit(item: ContentItem) {
    setEditingId(item.id);
    setTitle(item.title);
    setDescription(item.description ?? "");
    setKind(item.kind);
    setActivityId(item.activity_id ?? "");
    setTopic(item.topic ?? "");
    setExternalUrl(item.external_url ?? "");
    setFile(null);
  }

  return (
    <div className="space-y-6">
      <Card className="border-border/70 shadow-soft">
        <CardContent className="pt-6">
          <h2 className="text-lg font-semibold">
            {editingId ? "Edit / re-upload content" : "Upload new content"}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Attach a PDF, presentation, video or image (up to 200 MB per file), or paste a link
            to a large file hosted elsewhere.
          </p>
          <form onSubmit={submit} className="mt-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="c-title">Title</Label>
                <Input
                  id="c-title"
                  className="mt-2"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div>
                <Label>Type</Label>
                <Select value={kind} onValueChange={setKind}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {KINDS.map((k) => (
                      <SelectItem key={k} value={k} className="capitalize">
                        {k}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Activity</Label>
                <Select
                  value={activityId}
                  onValueChange={(value) => {
                    setActivityId(value);
                    setTopic("");
                  }}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Choose activity" />
                  </SelectTrigger>
                  <SelectContent>
                    {(activities.data ?? []).map((activity) => (
                      <SelectItem key={activity.id} value={activity.id}>
                        {activity.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {grouped ? (
                <div>
                  <Label>Activity name</Label>
                  <Select value={topic} onValueChange={setTopic}>
                    <SelectTrigger className="mt-2">
                      <SelectValue
                        placeholder={
                          nameOptions.length ? "Choose activity name" : "No names added yet"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {nameOptions.map((row) => (
                        <SelectItem key={row.id} value={row.name}>
                          {row.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Add names in the “Activity names” tab. Items sharing a name appear together in
                    one box on the group page.
                  </p>
                </div>
              ) : null}
            </div>
            <div>
              <Label htmlFor="c-desc">Description</Label>
              <Textarea
                id="c-desc"
                rows={3}
                className="mt-2"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="c-file">File {editingId ? "(optional — replaces)" : ""}</Label>
                <Input
                  id="c-file"
                  type="file"
                  className="mt-2"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
              </div>
              <div>
                <Label htmlFor="c-link">External link (optional)</Label>
                <Input
                  id="c-link"
                  className="mt-2"
                  placeholder="https://…"
                  value={externalUrl}
                  onChange={(e) => setExternalUrl(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="rounded-full" disabled={busy}>
                {busy ? "Working…" : editingId ? "Save changes" : "Upload"}
              </Button>
              {editingId ? (
                <Button type="button" variant="ghost" className="rounded-full" onClick={reset}>
                  Cancel
                </Button>
              ) : null}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border-border/70 shadow-soft">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              {isAdmin ? "Group uploads" : "My uploads"}
            </h2>
            <Badge variant="outline">{visible.length}</Badge>
          </div>
          <ul className="mt-4 divide-y divide-border">
            {visible.map((item) => (
              <li key={item.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-3">
                <div className="min-w-0">
                  <p className="font-medium">{item.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {[
                      groups.data?.find((g) => g.id === item.group_id)?.name,
                      activities.data?.find((a) => a.id === item.activity_id)?.title,
                      item.topic,
                      item.kind,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => openContent(item)}>
                    Open
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => startEdit(item)}>
                    <Pencil className="size-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => remove(item)}>
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              </li>
            ))}
            {visible.length === 0 ? (
              <li className="py-4 text-sm text-muted-foreground">Nothing uploaded yet.</li>
            ) : null}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
