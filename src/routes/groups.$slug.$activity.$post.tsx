import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowUpRight, CalendarDays, Camera, Clapperboard, List, MoveUpRight } from "lucide-react";

import { formatDate } from "@/components/content/PostCardGrid";
import { LikeSection, PostBlocks } from "@/components/content/PostBlocks";
import { PageLayout } from "@/components/layout/PageLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { activitiesQuery, groupsQuery, postsQuery } from "@/lib/data/queries";
import { activityTheme, groupTheme } from "@/lib/theme/palette";

export const Route = createFileRoute("/groups/$slug/$activity/$post")({
  head: () => ({
    meta: [
      { title: "Activity post — 5-10 Group AB" },
      {
        name: "description",
        content: "Read a group's activity post with photos, albums and videos.",
      },
      { property: "og:title", content: "Activity post — 5-10 Group AB" },
      {
        property: "og:description",
        content: "Read a group's activity post with photos, albums and videos.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PostPage,
});

function PostPage() {
  const { slug, activity: activitySlug, post: postSlug } = Route.useParams();
  const groups = useQuery(groupsQuery);
  const activities = useQuery(activitiesQuery);
  const posts = useQuery(postsQuery);

  const group = groups.data?.find((g) => g.slug === slug);
  const activity = activities.data?.find((a) => a.slug === activitySlug);
  const post = posts.data?.find(
    (p) =>
      p.slug === postSlug && p.group_id === group?.id && p.activity_id === activity?.id,
  );

  if (groups.isLoading || posts.isLoading || activities.isLoading) {
    return (
      <PageLayout>
        <div className="section-shell py-24 text-sm text-muted-foreground">Loading post…</div>
      </PageLayout>
    );
  }

  if (!group || !activity || !post) {
    return (
      <PageLayout>
        <div className="section-shell py-24">
          <h1 className="text-3xl font-semibold">Post not found</h1>
          <Button asChild className="mt-6 rounded-full">
            <Link to="/groups">Back to groups</Link>
          </Button>
        </div>
      </PageLayout>
    );
  }

  const hasLikeBlock = post.blocks.some((block) => block.type === "likes");
  const headings = post.blocks.filter((block) => block.type === "heading" || block.type === "subheading");
  const photoCount = post.blocks.reduce((count, block) => count + (block.type === "photo" ? 1 : block.type === "album" ? block.images.length : 0), 0);
  const videoCount = post.blocks.filter((block) => block.type === "video" && block.url).length;
  const publishedPosts = (posts.data ?? []).filter((item) => item.group_id === group.id && item.activity_id === activity.id && item.status === "published" && item.id !== post.id).slice(0, 3);

  return (
    <PageLayout>
      <article className="pb-20">
        {post.header_url ? (
          <div className="relative w-full">
            <img src={post.header_url} alt="" className="h-auto w-full object-contain" />
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background/70 to-transparent" />
          </div>
        ) : null}
        <div className="section-shell pt-6 sm:pt-9">
          <Link to="/groups/$slug" params={{ slug: group.slug }} search={{ activity: activity.slug }} className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
            <ArrowLeft className="size-4" /> {group.name}
          </Link>
          <div className="mt-6 grid min-w-0 gap-8 lg:grid-cols-[minmax(0,11rem)_minmax(0,1fr)_minmax(0,13rem)] xl:grid-cols-[minmax(0,12rem)_minmax(0,1fr)_minmax(0,15rem)] xl:gap-10">
            <aside aria-label="Post navigation" className="hidden self-start lg:sticky lg:top-24 lg:block lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">
              <div className="border-l-2 border-border pl-4">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground"><List className="size-4" /> In this post</p>
                <nav className="mt-4 space-y-1" aria-label="Sections in this post">
                  <a href="#post-start" className="block py-2 text-sm font-medium text-primary">Overview</a>
                  {headings.map((block) => <a key={block.id} href={`#section-${block.id}`} className={`block break-words py-2 text-sm text-muted-foreground transition-colors hover:text-primary ${block.type === "subheading" ? "pl-3" : "font-medium"}`}>{block.text || "Untitled section"}</a>)}
                  <a href="#post-reactions" className="block py-2 text-sm text-muted-foreground transition-colors hover:text-primary">Reactions</a>
                </nav>
              </div>
              {publishedPosts.length > 0 ? <div className="mt-8 border-t pt-5">
                <p className="text-xs font-semibold uppercase text-muted-foreground">More in {activity.title}</p>
                <div className="mt-3 space-y-1">{publishedPosts.map((item) => <Link key={item.id} to="/groups/$slug/$activity/$post" params={{ slug: group.slug, activity: activity.slug, post: item.slug }} className="flex items-start gap-2 py-2 text-sm font-medium transition-colors hover:text-primary"><span className="min-w-0 break-words">{item.title}</span><ArrowUpRight className="mt-0.5 size-3.5 shrink-0" /></Link>)}</div>
              </div> : null}
            </aside>

            <div className="min-w-0" id="post-start">
              <div className={`flex flex-wrap items-center gap-2 ${activityTheme(activity.slug)}`}>
  <span className="theme-chip rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide">
    {activity.title}
  </span>
  <span className="text-sm text-muted-foreground">{formatDate(post.post_date)}</span>
  {post.status === "draft" ? <Badge variant="outline">Draft preview</Badge> : null}
</div>

              <h1 className="mt-4 break-words font-display text-3xl font-semibold leading-tight md:text-5xl">{post.title}</h1>
              {post.excerpt ? <p className="mt-5 text-lg leading-relaxed text-muted-foreground">{post.excerpt}</p> : null}
              <PostBlocks blocks={post.blocks} postId={post.id} likes={post.likes_count} />
              {!hasLikeBlock ? <div id="post-reactions" className="mt-10 scroll-mt-24"><LikeSection label="Did you enjoy this post?" postId={post.id} likes={post.likes_count} /></div> : null}
            </div>

            <aside aria-label="Post details and groups" className="self-start lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">
              <section className="rounded-lg border border-border bg-card p-5">
                <h2 className="text-xs font-semibold uppercase text-muted-foreground">Content stats</h2>
                <dl className="mt-4 divide-y divide-border border-t border-border text-sm">
                  <div className="flex items-center justify-between gap-3 py-3"><dt className="flex items-center gap-2 text-muted-foreground"><Camera className="size-4" /> Photos</dt><dd className="font-semibold tabular-nums">{photoCount}</dd></div>
                  <div className="flex items-center justify-between gap-3 py-3"><dt className="flex items-center gap-2 text-muted-foreground"><Clapperboard className="size-4" /> Videos</dt><dd className="font-semibold tabular-nums">{videoCount}</dd></div>
                  <div className="flex items-center justify-between gap-3 py-3"><dt className="flex items-center gap-2 text-muted-foreground"><CalendarDays className="size-4" /> Updated</dt><dd className="text-right font-semibold">{formatDate(post.updated_at)}</dd></div>
                </dl>
              </section>
              <section className="mt-5 rounded-lg border border-border bg-card p-5">
  <h2 className="text-xs font-semibold uppercase text-muted-foreground">Groups 5–10</h2>
  <nav className="mt-4 space-y-1 border-t border-border pt-3" aria-label="Browse groups">
    {(groups.data ?? []).map((item) => {
      const isCurrent = item.id === group.id;
      return (
        <Link
          key={item.id}
          to="/groups/$slug"
          params={{ slug: item.slug }}
          aria-current={isCurrent ? "page" : undefined}
          className={`flex min-w-0 items-center justify-between gap-2 rounded-md px-2.5 py-2 text-sm transition-all ${groupTheme(item.slug)} ${
            isCurrent
              ? "theme-chip font-semibold shadow-xs"
               : "text-muted-foreground hover:bg-[var(--tc-soft)] hover:text-[var(--tc)]"
          }`}
        >
          <span className="min-w-0 truncate">{item.name}</span>
          <MoveUpRight className="size-4 shrink-0" />
        </Link>
      );
    })}
  </nav>
</section>

            </aside>
          </div>
        </div>
      </article>
    </PageLayout>
  );
}
