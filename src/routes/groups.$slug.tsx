import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

import { GroupActivities } from "@/components/content/GroupActivities";
import { GroupGallery } from "@/components/gallery/GroupGallery";
import { PageLayout } from "@/components/layout/PageLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { contentQuery, groupsQuery, membersQuery } from "@/lib/data/queries";

export const Route = createFileRoute("/groups/$slug")({
  head: () => ({
    meta: [
      { title: "AB Group — 5-10 English Program" },
      {
        name: "description",
        content:
          "Uploaded work, members and details of a group in the 5-10 Group AB English language program.",
      },
      { property: "og:title", content: "Group — 5-10 Group AB" },
      {
        property: "og:description",
        content: "See the submissions, members and description of this English program group.",
      },
    ],
  }),
  component: GroupDetailPage,
});

const ALL = "all";

function GroupDetailPage() {
  const { slug } = Route.useParams();
  const groups = useQuery(groupsQuery);
  const members = useQuery(membersQuery);
  const content = useQuery(contentQuery);

  const [committee, setCommittee] = useState<string>(ALL);

  const group = groups.data?.find((g) => g.slug === slug);

  if (groups.isLoading) {
    return (
      <PageLayout>
        <div className="section-shell py-24 text-sm text-muted-foreground">Loading group…</div>
      </PageLayout>
    );
  }

  if (!group) {
    return (
      <PageLayout>
        <div className="section-shell py-24">
          <h1 className="text-3xl font-semibold">Group not found</h1>
          <Button asChild className="mt-6 rounded-full">
            <Link to="/groups">Back to groups</Link>
          </Button>
        </div>
      </PageLayout>
    );
  }

  const groupMembers = (members.data ?? []).filter((m) => m.group_id === group.id);
  const groupContent = (content.data ?? []).filter((c) => c.group_id === group.id);
  const hasCover = Boolean(group.cover_url || group.mobile_cover_url);

  const committees = Array.from(
    new Set(groupMembers.map((m) => m.committee).filter((c): c is string => Boolean(c))),
  );

  const visibleMembers = groupMembers.filter(
    (member) => committee === ALL || member.committee === committee,
  );

  return (
    <PageLayout>
      <section className="relative flex aspect-[4/3] flex-col justify-center overflow-hidden border-b border-border/70 bg-primary-soft/60 md:aspect-auto md:h-[100svh] md:min-h-[560px]">
        {hasCover ? (
          <>
            <picture className="absolute inset-0 size-full">
              {group.mobile_cover_url ? (
                <source media="(max-width: 767px)" srcSet={group.mobile_cover_url} />
              ) : null}
              <img
                src={group.cover_url ?? group.mobile_cover_url ?? ""}
                alt=""
                className="size-full object-cover"
              />
            </picture>
            <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/45 to-ink/25" />
          </>
        ) : null}
        <div className="section-shell relative z-10 flex flex-col justify-center py-16">
          <Link
            to="/groups"
            className={`text-sm font-medium ${
              hasCover
                ? "text-ink-foreground/90 hover:text-ink-foreground"
                : "text-primary"
            }`}
          >
            👈 All groups
          </Link>
          <p
            className={`eyebrow mt-8 ${
              hasCover ? "text-ink-foreground/80" : ""
            }`}
          >
            {group.tagline}
          </p>
          <h1
            className={`mt-3 text-4xl font-semibold md:text-6xl ${
              hasCover ? "text-ink-foreground" : "text-foreground"
            }`}
          >
            {group.name}
          </h1>
          <p
            className={`mt-4 max-w-2xl text-base md:text-lg ${
              hasCover ? "text-ink-foreground/90" : "text-muted-foreground"
            }`}
          >
            {group.description}
          </p>
          <div className="mt-6 flex gap-2">
            <Badge variant="secondary">{groupContent.length} uploads</Badge>
            <Badge variant="secondary">{groupMembers.length} members</Badge>
          </div>
        </div>
      </section>

      <section className="section-shell py-16">
        <h2 className="text-2xl font-semibold">📚 Activities</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Switch between activity types to see this group&apos;s work.
        </p>
        <GroupActivities groupId={group.id} />
      </section>

      <section className="bg-secondary/60 py-16">
        <div className="section-shell">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold">👥 Members</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Filter the members of this group by committee.
              </p>
            </div>
            <div className="w-full sm:w-64">
              <label className="text-sm font-medium">Committee</label>
              <Select value={committee} onValueChange={setCommittee}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="All committees" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>All committees</SelectItem>
                  {committees.map((name) => (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {visibleMembers.length === 0 ? (
            <p className="mt-6 text-sm text-muted-foreground">
              No members match this filter yet.
            </p>
          ) : (
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {visibleMembers.map((member) => (
                <Card key={member.id} className="border-border/70 shadow-soft">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      {member.photo_url ? (
                        <img
                          src={member.photo_url}
                          alt={member.full_name}
                          className="size-12 rounded-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <span className="flex size-12 items-center justify-center rounded-full bg-primary-soft font-display text-sm font-semibold text-primary">
                          {member.full_name.slice(0, 2).toUpperCase()}
                        </span>
                      )}
                      <div>
                        <p className="font-semibold">{member.full_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {[member.role_in_group, member.registration_no]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                      </div>
                    </div>
                    {member.committee ? (
                      <Badge variant="secondary" className="mt-4">
                        {member.committee}
                      </Badge>
                    ) : null}
                    {member.bio ? (
                      <p className="mt-4 text-sm text-muted-foreground">{member.bio}</p>
                    ) : null}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="section-shell py-16">
        <h2 className="text-2xl font-semibold">📷 Gallery</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Photo albums published by this group. Open an album to see its photos.
        </p>
        <GroupGallery groupId={group.id} />
      </section>
    </PageLayout>
  );
}
