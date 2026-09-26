import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";

import { formatDate } from "@/components/content/PostCardGrid";
import { LikeSection, PostBlocks } from "@/components/content/PostBlocks";
import { PageLayout } from "@/components/layout/PageLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { activitiesQuery, groupsQuery, postsQuery } from "@/lib/data/queries";

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

  return (
    <PageLayout>
      <article className="pb-20">
        {post.header_url ? (
          <div className="relative aspect-[16/9] w-full overflow-hidden border-b border-border/70 md:aspect-[21/9]">
            <img src={post.header_url} alt="" className="size-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/30 to-transparent" />
          </div>
        ) : null}

        <div className="section-shell max-w-3xl pt-10">
          <Link
            to="/groups/$slug"
            params={{ slug: group.slug }}
            className="text-sm font-medium text-primary"
          >
            👈 {group.name}
          </Link>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{activity.title}</Badge>
            <span className="text-sm text-muted-foreground">{formatDate(post.post_date)}</span>
            {post.status === "draft" ? <Badge variant="outline">Draft preview</Badge> : null}
          </div>
          <h1 className="mt-3 font-display text-3xl font-semibold md:text-5xl">{post.title}</h1>
          {post.excerpt ? (
            <p className="mt-4 text-lg text-muted-foreground">{post.excerpt}</p>
          ) : null}

          <PostBlocks blocks={post.blocks} postId={post.id} likes={post.likes_count} />

          {!hasLikeBlock ? (
            <div className="mt-10">
              <LikeSection label="Did you enjoy this post?" postId={post.id} likes={post.likes_count} />
            </div>
          ) : null}
        </div>
      </article>
    </PageLayout>
  );
}
