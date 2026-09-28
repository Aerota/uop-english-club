import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";

import groupWorkImg from "@/assets/group-work.jpg";
import { PageHero, PageLayout } from "@/components/layout/PageLayout";
import { Badge } from "@/components/ui/badge";
import { contentQuery, groupsQuery, membersQuery, postsQuery } from "@/lib/data/queries";


export const Route = createFileRoute("/groups/")({
  head: () => ({
    meta: [
      { title: "Our Groups — 5-10 Group AB English Program" },
      {
        name: "description",
        content:
          "The six groups of the 5-10 Group AB English language program at the Faculty of Engineering, University of Peradeniya.",
      },
      { property: "og:title", content: "Our Groups — 5-10 Group AB" },
      {
        property: "og:description",
        content: "Meet the six groups and see the work each one has published.",
      },
    ],
  }),
  component: GroupsPage,
});

function GroupsPage() {
  const groups = useQuery(groupsQuery);
  const members = useQuery(membersQuery);
  const content = useQuery(contentQuery);

  return (
    <PageLayout>
      <PageHero
        eyebrow="Our teams"
        title="The six groups of 5-10 Group AB"
        description="Each group manages its own members, details and uploads. Open a group to see who is in it and what they have submitted."
        image={groupWorkImg}
        imageAlt="Students working together on an English group activity"
      />

      <section className="section-shell grid gap-6 py-16 sm:grid-cols-2 lg:grid-cols-3"> {(groups.data ?? []).map((group) => { const memberCount = (members.data ?? []).filter((m) => m.group_id === group.id).length; const uploadCount = (content.data ?? []).filter((c) => c.group_id === group.id).length; return ( <Link key={group.id} to="/groups/$slug" params={{ slug: group.slug }} className="rounded-2xl border border-border/70 bg-card p-6 shadow-soft transition-shadow hover:shadow-lift" > <p className="eyebrow">{group.tagline}</p> <h2 className="mt-3 font-display text-xl font-semibold">{group.name}</h2> <p className="mt-3 line-clamp-3 text-sm text-muted-foreground"> {group.description} </p> <div className="mt-5 flex gap-2"> <Badge variant="secondary">{memberCount} members</Badge> <Badge variant="outline">{uploadCount} uploads</Badge> </div> </Link> ); })} </section>
    </PageLayout>
  );
}
