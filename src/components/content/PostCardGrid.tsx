import { Link } from "@tanstack/react-router";

import { Badge } from "@/components/ui/badge";
import type { ActivityPost } from "@/lib/posts/types";

type Props = {
  posts: ActivityPost[];
  groupSlug: string;
  activitySlug: string;
};

/** Three posts per row, showing header image, heading and a short description. */
export function PostCardGrid({ posts, groupSlug, activitySlug }: Props) {
  if (!posts.length) {
    return <p className="mt-6 text-sm text-muted-foreground">No posts published here yet.</p>;
  }

  return (
    <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <Link
          key={post.id}
          to="/groups/$slug/$activity/$post"
          params={{ slug: groupSlug, activity: activitySlug, post: post.slug }}
          className="group flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-soft transition-all hover:-translate-y-1 hover:shadow-lg"
        >
          <div className="aspect-[16/10] overflow-hidden bg-primary-soft/60">
            {post.header_url ? (
              <img
                src={post.header_url}
                alt=""
                loading="lazy"
                className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : null}
          </div>
          <div className="flex flex-1 flex-col p-5">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{formatDate(post.post_date)}</span>
              {post.status === "draft" ? <Badge variant="outline">Draft</Badge> : null}
            </div>
            <h3 className="mt-2 font-display text-lg font-semibold">{post.title}</h3>
            <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
              {post.excerpt ?? firstParagraph(post)}
            </p>
            <span className="mt-4 text-sm font-medium text-primary">Read post →</span>
          </div>
        </Link>
      ))}
    </div>
  );
}

export function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

function firstParagraph(post: ActivityPost) {
  const block = (post.blocks ?? []).find((item) => item.type === "paragraph");
  return block && block.type === "paragraph" ? block.text : "";
}
