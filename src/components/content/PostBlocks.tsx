import { Heart } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { embedUrl, type PostBlock } from "@/lib/posts/types";

/** Render a published post's blocks in the order they were arranged. */
export function PostBlocks({
  blocks,
  postId,
  likes,
}: {
  blocks: PostBlock[];
  postId: string;
  likes: number;
}) {
  return (
    <div className="mt-8 space-y-6">
      {blocks.map((block) => {
        if (block.type === "heading") {
          return (
            <h2 key={block.id} className="font-display text-2xl font-semibold md:text-3xl">
              {block.text}
            </h2>
          );
        }
        if (block.type === "subheading") {
          return (
            <h3 key={block.id} className="font-display text-xl font-semibold">
              {block.text}
            </h3>
          );
        }
        if (block.type === "paragraph") {
          return (
            <p key={block.id} className="whitespace-pre-line text-base leading-relaxed text-muted-foreground">
              {block.text}
            </p>
          );
        }
        if (block.type === "photo") {
          return block.url ? (
            <figure key={block.id}>
              <img
                src={block.url}
                alt={block.caption ?? ""}
                loading="lazy"
                className="w-full rounded-2xl object-cover shadow-soft"
              />
              {block.caption ? (
                <figcaption className="mt-2 text-sm text-muted-foreground">{block.caption}</figcaption>
              ) : null}
            </figure>
          ) : null;
        }
        if (block.type === "album") {
          const images = (block.images ?? []).filter((image) => image.url);
          if (!images.length) return null;
          return (
            <div key={block.id} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {images.map((image, index) => (
                <figure key={`${image.path ?? image.url}-${index}`}>
                  <img
                    src={image.url ?? ""}
                    alt={image.caption ?? ""}
                    loading="lazy"
                    className="aspect-square w-full rounded-xl object-cover shadow-soft"
                  />
                  {image.caption ? (
                    <figcaption className="mt-1 text-xs text-muted-foreground">
                      {image.caption}
                    </figcaption>
                  ) : null}
                </figure>
              ))}
            </div>
          );
        }
        if (block.type === "video") {
          const src = embedUrl(block.url);
          if (!src) return null;
          return (
            <figure key={block.id}>
              <div className="aspect-video w-full overflow-hidden rounded-2xl shadow-soft">
                <iframe
                  src={src}
                  title={block.caption ?? "Video"}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
                  allowFullScreen
                  className="size-full border-0"
                />
              </div>
              {block.caption ? (
                <figcaption className="mt-2 text-sm text-muted-foreground">{block.caption}</figcaption>
              ) : null}
            </figure>
          );
        }
        return <LikeSection key={block.id} label={block.label} postId={postId} likes={likes} />;
      })}
    </div>
  );
}

const STORAGE_KEY = "post-like-key";

function clientKey() {
  let key = localStorage.getItem(STORAGE_KEY);
  if (!key) {
    key = crypto.randomUUID();
    localStorage.setItem(STORAGE_KEY, key);
  }
  return key;
}

/** Like button whose counter updates immediately. */
export function LikeSection({
  label,
  postId,
  likes,
}: {
  label: string;
  postId: string;
  likes: number;
}) {
  const [count, setCount] = useState(likes);
  const [liked, setLiked] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setCount(likes);
  }, [likes]);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await supabase
        .from("post_likes")
        .select("id")
        .eq("post_id", postId)
        .eq("client_key", clientKey())
        .maybeSingle();
      if (active) {
        setLiked(Boolean(data));
        setReady(true);
      }
    })();
    return () => {
      active = false;
    };
  }, [postId]);

  async function toggle() {
    const key = clientKey();
    if (liked) {
      setLiked(false);
      setCount((value) => Math.max(0, value - 1));
      await supabase.from("post_likes").delete().eq("post_id", postId).eq("client_key", key);
      return;
    }
    setLiked(true);
    setCount((value) => value + 1);
    const { error } = await supabase
      .from("post_likes")
      .insert({ post_id: postId, client_key: key });
    if (error) {
      setLiked(true);
    }
  }

  return (
    <div className="rounded-2xl border border-border/70 bg-primary-soft/40 p-6 text-center">
      <p className="font-display text-lg font-semibold">{label}</p>
      <Button
        type="button"
        variant={liked ? "default" : "outline"}
        className="mt-4 rounded-full"
        onClick={toggle}
        disabled={!ready}
      >
        <Heart className={`size-4 ${liked ? "fill-current" : ""}`} /> {count}
      </Button>
    </div>
  );
}
