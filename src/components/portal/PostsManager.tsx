import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  FileText,
  GripVertical,
  Heading1,
  Heading2,
  Heart,
  Image as ImageIcon,
  Images,
  Pencil,
  Plus,
  Text,
  Trash2,
  Video,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

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
import { activitiesQuery, postsQuery } from "@/lib/data/queries";
import {
  deletePostImage,
  HEADER_MAX_WIDTH,
  PHOTO_MAX_WIDTH,
  uploadPostImage,
  uploadPostPdf,
} from "@/lib/posts/media";
import {
  ALBUM_MAX_PHOTOS,
  BLOCK_LABELS,
  newBlock,
  slugify,
  type ActivityPost,
  type PostBlock,
  type PostBlockType,
} from "@/lib/posts/types";

const PALETTE: { type: PostBlockType; icon: typeof Text }[] = [
  { type: "heading", icon: Heading1 },
  { type: "subheading", icon: Heading2 },
  { type: "paragraph", icon: Text },
  { type: "photo", icon: ImageIcon },
  { type: "album", icon: Images },
  { type: "video", icon: Video },
  { type: "pdf", icon: FileText },
  { type: "likes", icon: Heart },
];

type Props = { userId: string; isAdmin: boolean; groupId: string };

type Draft = {
  id: string | null;
  activityId: string;
  title: string;
  slug: string;
  postDate: string;
  excerpt: string;
  headerPath: string | null;
  headerPreview: string | null;
  blocks: PostBlock[];
  status: "draft" | "published";
};

function emptyDraft(): Draft {
  return {
    id: null,
    activityId: "",
    title: "",
    slug: "",
    postDate: new Date().toISOString().slice(0, 10),
    excerpt: "",
    headerPath: null,
    headerPreview: null,
    blocks: [],
    status: "published",
  };
}

/** Create and edit blog-style posts with drag-and-drop content blocks. */
export function PostsManager({ userId, isAdmin, groupId }: Props) {
  const queryClient = useQueryClient();
  const posts = useQuery(postsQuery);
  const activities = useQuery(activitiesQuery);

  const [draft, setDraft] = useState<Draft | null>(null);
  const [busy, setBusy] = useState(false);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const dragRef = useRef<{ kind: "new"; type: PostBlockType } | { kind: "move"; index: number } | null>(
    null,
  );

  const activityList = (activities.data ?? []).slice().sort((a, b) => a.sort_order - b.sort_order);
  const mine = (posts.data ?? []).filter((p) => p.group_id === groupId);

  function startNew() {
    const first = activityList[0]?.id ?? "";
    setDraft({ ...emptyDraft(), activityId: first });
  }

  function startEdit(post: ActivityPost) {
    setDraft({
      id: post.id,
      activityId: post.activity_id,
      title: post.title,
      slug: post.slug,
      postDate: post.post_date,
      excerpt: post.excerpt ?? "",
      headerPath: post.header_image_url,
      headerPreview: post.header_url ?? post.header_image_url,
      blocks: post.blocks ?? [],
      status: post.status,
    });
  }

  function patch(changes: Partial<Draft>) {
    setDraft((current) => (current ? { ...current, ...changes } : current));
  }

  function setBlocks(updater: (blocks: PostBlock[]) => PostBlock[]) {
    setDraft((current) => (current ? { ...current, blocks: updater(current.blocks) } : current));
  }

  function updateBlock(id: string, changes: Record<string, unknown>) {
    setBlocks((blocks) =>
      blocks.map((block) => (block.id === id ? ({ ...block, ...changes } as PostBlock) : block)),
    );
  }

  function insertAt(block: PostBlock, index: number) {
    setBlocks((blocks) => {
      const next = blocks.slice();
      next.splice(index, 0, block);
      return next;
    });
  }

  function moveBlock(from: number, to: number) {
    setBlocks((blocks) => {
      const next = blocks.slice();
      const [item] = next.splice(from, 1);
      if (!item) return blocks;
      next.splice(from < to ? to - 1 : to, 0, item);
      return next;
    });
  }

  function handleDrop(index: number) {
    const payload = dragRef.current;
    dragRef.current = null;
    setDropIndex(null);
    if (!payload) return;
    if (payload.kind === "new") insertAt(newBlock(payload.type), index);
    else moveBlock(payload.index, index);
  }

  async function uploadInto(kind: "header" | "photo", file: File, apply: (result: { path: string; url: string }) => void) {
    setBusy(true);
    try {
      const result = await uploadPostImage(
        file,
        groupId,
        kind === "header" ? HEADER_MAX_WIDTH : PHOTO_MAX_WIDTH,
      );
      apply(result);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  async function save(status: "draft" | "published") {
    if (!draft) return;
    if (!draft.activityId) {
      toast.error("Choose an activity type");
      return;
    }
    if (!draft.title.trim()) {
      toast.error("Add a post heading");
      return;
    }
    const slug = (draft.slug.trim() ? slugify(draft.slug) : slugify(draft.title)) || crypto.randomUUID().slice(0, 8);

    const payload = {
      group_id: groupId,
      activity_id: draft.activityId,
      slug,
      title: draft.title.trim(),
      excerpt: draft.excerpt.trim() || null,
      header_image_url: draft.headerPath,
      post_date: draft.postDate,
      blocks: draft.blocks as unknown as never,
      status,
    };

    setBusy(true);
    const { error } = draft.id
      ? await supabase.from("activity_posts").update(payload).eq("id", draft.id)
      : await supabase.from("activity_posts").insert({ ...payload, created_by: userId });
    setBusy(false);

    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(status === "published" ? "Post published" : "Draft saved");
    setDraft(null);
    queryClient.invalidateQueries({ queryKey: ["activity_posts"] });
  }

  async function remove(post: ActivityPost) {
    if (!window.confirm(`Delete "${post.title}"?`)) return;
    setBusy(true);
    const { error } = await supabase.from("activity_posts").delete().eq("id", post.id);
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Post deleted");
    queryClient.invalidateQueries({ queryKey: ["activity_posts"] });
  }

  const dropZone = (index: number) => (
    <div
      onDragOver={(event) => {
        event.preventDefault();
        setDropIndex(index);
      }}
      onDragLeave={() => setDropIndex((current) => (current === index ? null : current))}
      onDrop={(event) => {
        event.preventDefault();
        handleDrop(index);
      }}
      className={`rounded-full transition-all ${
        dropIndex === index ? "my-2 h-2 bg-primary" : "my-1 h-2 bg-transparent"
      }`}
    />
  );

  if (draft) {
    return (
      <Card className="border-border/70 shadow-soft">
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">{draft.id ? "Edit post" : "Create post"}</h2>
            <div className="flex flex-wrap gap-2">
              <Button variant="ghost" onClick={() => setDraft(null)} disabled={busy}>
                Cancel
              </Button>
              <Button variant="outline" onClick={() => save("draft")} disabled={busy}>
                Save draft
              </Button>
              <Button onClick={() => save("published")} disabled={busy}>
                {busy ? "Saving…" : "Publish"}
              </Button>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="post-activity">Activity type</Label>
              <Select value={draft.activityId} onValueChange={(value) => patch({ activityId: value })}>
                <SelectTrigger id="post-activity" className="mt-2">
                  <SelectValue placeholder="Choose activity type" />
                </SelectTrigger>
                <SelectContent>
                  {activityList.map((activity) => (
                    <SelectItem key={activity.id} value={activity.id}>
                      {activity.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="post-date">Post date</Label>
              <Input
                id="post-date"
                type="date"
                className="mt-2"
                value={draft.postDate}
                onChange={(event) => patch({ postDate: event.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="post-title">Heading</Label>
              <Input
                id="post-title"
                className="mt-2"
                value={draft.title}
                onChange={(event) => patch({ title: event.target.value })}
                placeholder="Our first creative session"
              />
            </div>
            <div>
              <Label htmlFor="post-slug">Link name</Label>
              <Input
                id="post-slug"
                className="mt-2"
                value={draft.slug}
                onChange={(event) => patch({ slug: event.target.value })}
                placeholder={slugify(draft.title) || "auto-from-heading"}
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="post-excerpt">Short description</Label>
              <Textarea
                id="post-excerpt"
                className="mt-2"
                rows={2}
                value={draft.excerpt}
                onChange={(event) => patch({ excerpt: event.target.value })}
                placeholder="Shown on the post card, keep it to one or two lines."
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="post-header">Header image</Label>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <Input
                  id="post-header"
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    event.target.value = "";
                    if (!file) return;
                    const previous = draft.headerPath;
                    void uploadInto("header", file, ({ path, url }) => {
                      patch({ headerPath: path, headerPreview: url });
                      void deletePostImage(previous);
                    });
                  }}
                />
                {draft.headerPreview ? (
                  <img
                    src={draft.headerPreview}
                    alt=""
                    className="h-16 w-28 rounded-md object-cover"
                  />
                ) : null}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Photos are shrunk automatically before upload, so they stay small.
              </p>
            </div>
          </div>

          <div className="mt-8 lg:grid lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-6">
            <div>
              <p className="text-sm font-semibold">Content blocks</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Drag a block into the post, or tap to add it at the end.
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2 lg:grid-cols-1">
                {PALETTE.map(({ type, icon: Icon }) => (
                  <button
                    key={type}
                    type="button"
                    draggable
                    onDragStart={() => {
                      dragRef.current = { kind: "new", type };
                    }}
                    onClick={() => insertAt(newBlock(type), draft.blocks.length)}
                    className="flex items-center gap-2 rounded-lg border border-border/70 bg-card px-3 py-2 text-left text-sm shadow-soft transition-colors hover:bg-primary-soft/60"
                  >
                    <Icon className="size-4 text-primary" /> {BLOCK_LABELS[type]}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-dashed border-border bg-secondary/30 p-3 lg:mt-0">
              {draft.blocks.length === 0 ? (
                <p className="py-10 text-center text-sm text-muted-foreground">
                  Drop blocks here to build the post.
                </p>
              ) : null}

              {dropZone(0)}
              {draft.blocks.map((block, index) => (
                <div key={block.id}>
                  <div
                    draggable
                    onDragStart={() => {
                      dragRef.current = { kind: "move", index };
                    }}
                    className="rounded-lg border border-border/70 bg-card p-3 shadow-soft"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                        <GripVertical className="size-4 cursor-grab" /> {BLOCK_LABELS[block.type]}
                      </span>
                      <div className="flex gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => moveBlock(index, Math.max(0, index - 1))}
                          disabled={index === 0}
                        >
                          ↑
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => moveBlock(index, Math.min(draft.blocks.length, index + 2))}
                          disabled={index === draft.blocks.length - 1}
                        >
                          ↓
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setBlocks((blocks) => blocks.filter((item) => item.id !== block.id))
                          }
                          aria-label="Remove block"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="mt-3">
                      <BlockEditor
                        block={block}
                        busy={busy}
                        onChange={(changes) => updateBlock(block.id, changes)}
                        onUpload={(file, apply) => uploadInto("photo", file, apply)}
                      />
                    </div>
                  </div>
                  {dropZone(index + 1)}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/70 shadow-soft">
      <CardContent className="pt-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Posts</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Publish your activities as posts with headings, photos, albums and videos.
            </p>
          </div>
          <Button onClick={startNew}>
            <Plus className="size-4" /> Create post
          </Button>
        </div>

        {mine.length === 0 ? (
          <p className="mt-6 text-sm text-muted-foreground">No posts yet for this group.</p>
        ) : (
          <ul className="mt-6 divide-y divide-border">
            {mine.map((post) => {
              const activity = activityList.find((a) => a.id === post.activity_id);
              return (
                <li key={post.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{post.title}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="secondary">{activity?.title ?? "Activity"}</Badge>
                      <span>{post.post_date}</span>
                      {post.status === "draft" ? <Badge variant="outline">Draft</Badge> : null}
                      <span>{post.likes_count} likes</span>
                    </div>

                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => startEdit(post)}>
                      <Pencil className="size-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => remove(post)} disabled={busy}>
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        {isAdmin ? (
          <p className="mt-4 text-xs text-muted-foreground">
            You are editing the group selected above.
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}

type BlockEditorProps = {
  block: PostBlock;
  busy: boolean;
  onChange: (changes: Record<string, unknown>) => void;
  onUpload: (file: File, apply: (result: { path: string; url: string }) => void) => void;
};

function BlockEditor({ block, busy, onChange, onUpload }: BlockEditorProps) {
  if (block.type === "heading" || block.type === "subheading") {
    return (
      <Input
        value={block.text}
        onChange={(event) => onChange({ text: event.target.value })}
        placeholder={BLOCK_LABELS[block.type]}
      />
    );
  }

  if (block.type === "paragraph") {
    return (
      <Textarea
        rows={4}
        value={block.text}
        onChange={(event) => onChange({ text: event.target.value })}
        placeholder="Write your paragraph…"
      />
    );
  }

  if (block.type === "likes") {
    return (
      <Input
        value={block.label}
        onChange={(event) => onChange({ label: event.target.value })}
        placeholder="Did you enjoy our work?"
      />
    );
  }

  if (block.type === "video") {
    return (
      <div className="grid gap-2">
        <Input
          value={block.url}
          onChange={(event) => onChange({ url: event.target.value })}
          placeholder="Paste a YouTube or Vimeo link"
        />
        <Input
          value={block.caption ?? ""}
          onChange={(event) => onChange({ caption: event.target.value })}
          placeholder="Caption (optional)"
        />
        <p className="text-xs text-muted-foreground">
          Videos are linked, not uploaded, so they use no storage.
        </p>
      </div>
    );
  }

  if (block.type === "photo") {
    return (
      <div className="grid gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <Input
            type="file"
            accept="image/*"
            disabled={busy}
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (!file) return;
              const previous = block.path;
              onUpload(file, ({ path, url }) => {
                onChange({ path, url });
                void deletePostImage(previous);
              });
            }}
          />
          {block.url ? (
            <img src={block.url} alt="" className="h-16 w-24 rounded-md object-cover" />
          ) : null}
        </div>
        <Input
          value={block.caption ?? ""}
          onChange={(event) => onChange({ caption: event.target.value })}
          placeholder="Caption (optional)"
        />
      </div>
    );
  }

  const images = block.images ?? [];
  return (
    <div className="grid gap-2">
      <Input
        type="file"
        accept="image/*"
        multiple
        disabled={busy || images.length >= ALBUM_MAX_PHOTOS}
        onChange={(event) => {
          const files = Array.from(event.target.files ?? []);
          event.target.value = "";
          const room = ALBUM_MAX_PHOTOS - images.length;
          if (room <= 0) return;
          for (const file of files.slice(0, room)) {
            onUpload(file, ({ path, url }) => {
              onChange({ images: [...(block.images ?? []), { path, url, caption: "" }] });
            });
          }
        }}
      />
      <p className="text-xs text-muted-foreground">
        Up to {ALBUM_MAX_PHOTOS} photos per album ({images.length} added).
      </p>
      {images.length ? (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
          {images.map((image, index) => (
            <button
              key={`${image.path ?? image.url}-${index}`}
              type="button"
              onClick={() => {
                void deletePostImage(image.path);
                onChange({ images: images.filter((_, i) => i !== index) });
              }}
              className="relative overflow-hidden rounded-md border"
              title="Remove photo"
            >
              <img src={image.url ?? ""} alt="" className="aspect-square w-full object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
