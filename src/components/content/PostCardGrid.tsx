import { Link } from "@tanstack/react-router";

import { Badge } from "@/components/ui/badge";
import type { ActivityPost } from "@/lib/posts/types";
import { activityTheme } from "@/lib/theme/palette";

type Props = {
  posts: ActivityPost[];
  groupSlug: string;
  activitySlug: string;
  activityTitle?: string;
};

/** Three posts per row, showing header image, heading and a short description. */
export function PostCardGrid({ posts, groupSlug, activitySlug, activityTitle }: Props) {
  if (!posts.length) {
    return <p className="mt-6 text-sm text-muted-foreground">No posts published here yet.</p>;
  }

  const theme = activityTheme(activitySlug);

  return (
    <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <Link
          key={post.id}
          to="/groups/$slug/$activity/$post"
          params={{ slug: groupSlug, activity: activitySlug, post: post.slug }}
          className={`group theme-surface flex flex-col overflow-hidden rounded-2xl border bg-card shadow-soft hover:-translate-y-1 ${theme}`}
        >
          <span className="theme-stripe h-1.5 w-full" aria-hidden="true" />
          <div className="aspect-[16/10] overflow-hidden bg-[var(--tc-soft)]">
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
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              {activityTitle ? (
                <span className="theme-chip rounded-full px-2.5 py-0.5 text-[0.7rem] font-semibold uppercase tracking-wide">
                  {activityTitle}
                </span>
              ) : null}
              <span>{formatDate(post.post_date)}</span>
              {post.status === "draft" ? <Badge variant="outline">Draft</Badge> : null}
            </div>
            <h3 className="mt-2 font-display text-lg font-semibold">{post.title}</h3>
            <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
              {post.excerpt ?? firstParagraph(post)}
            </p>
            <span className="theme-text mt-4 text-sm font-medium">Read post →</span>
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
