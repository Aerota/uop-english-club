import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { ContentCollage } from "@/components/content/ContentCollage";
import { PostCardGrid } from "@/components/content/PostCardGrid";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  activitiesQuery,
  activityNamesQuery,
  contentQuery,
  postsQuery,
} from "@/lib/data/queries";
import type { ActivityName, ContentItem } from "@/lib/data/types";


/** Activity types that keep their work inside named boxes. */
const GROUPED_SLUGS = ["presentations", "group-activities", "projects"];

const UNSORTED = "Other work";

/** Boxes follow the group's saved activity names; extras fall into "Other work". */
function boxesFor(items: ContentItem[], names: ActivityName[]) {
  const boxes = new Map<string, ContentItem[]>();
  for (const row of names) boxes.set(row.name, []);
  for (const item of items) {
    const key = item.topic?.trim() || UNSORTED;
    const list = boxes.get(key) ?? [];
    list.push(item);
    boxes.set(key, list);
  }
  return Array.from(boxes.entries()).filter(([, list]) => list.length > 0);
}

/** Per-group work, switched by activity type: posts first, then uploaded files. */
export function GroupActivities({ groupId, groupSlug }: { groupId: string; groupSlug: string }) {
  const activities = useQuery(activitiesQuery);
  const content = useQuery(contentQuery);
  const activityNames = useQuery(activityNamesQuery);
  const posts = useQuery(postsQuery);
  const list = (activities.data ?? []).slice().sort((a, b) => a.sort_order - b.sort_order);
  const [active, setActive] = useState<string>("");
  const [openBox, setOpenBox] = useState<{ name: string; items: ContentItem[] } | null>(null);

  if (!list.length) {
    return <p className="mt-6 text-sm text-muted-foreground">Loading activities…</p>;
  }

  const current = active || list[0]!.slug;
  const groupContent = (content.data ?? []).filter((c) => c.group_id === groupId);
  const groupPosts = (posts.data ?? []).filter(
    (p) => p.group_id === groupId && p.status === "published",
  );


  return (
    <>
      <Tabs value={current} onValueChange={setActive} className="mt-6">
        <TabsList className="flex-wrap">
          {list.map((activity) => (
            <TabsTrigger
              key={activity.id}
              value={activity.slug}
              className={`${activityTheme(activity.slug)} border border-transparent transition-colors hover:text-[var(--tc)] data-[state=active]:border-[var(--tc-border)] data-[state=active]:bg-[var(--tc-soft)] data-[state=active]:text-[var(--tc)]`}
            >
              {activity.title}
            </TabsTrigger>
          ))}
        </TabsList>


        {list.map((activity) => {
          const items = groupContent.filter((c) => c.activity_id === activity.id);
          const activityPosts = groupPosts.filter((p) => p.activity_id === activity.id);
          const grouped = GROUPED_SLUGS.includes(activity.slug);
          return (
            <TabsContent key={activity.id} value={activity.slug} className="mt-6">
              {activity.description ? (
                <p className="max-w-3xl text-sm text-muted-foreground">{activity.description}</p>
              ) : null}

              <PostCardGrid
                posts={activityPosts}
                groupSlug={groupSlug}
                activitySlug={activity.slug}
                activityTitle={activity.title}
              />

              {items.length === 0 ? null : grouped ? (

                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {boxesFor(
                    items,
                    (activityNames.data ?? []).filter(
                      (row) => row.activity_id === activity.id && row.group_id === groupId,
                    ),
                  ).map(([topic, boxItems]) => (
                    <button
                      key={topic}
                      type="button"
                      onClick={() => setOpenBox({ name: topic, items: boxItems })}
                      className={`theme-surface relative flex flex-col items-center justify-center gap-2 rounded-2xl border bg-card p-6 shadow-soft hover:-translate-y-1 ${activityTheme(activity.slug)}`}

                    >

                      <h3 className="text-center font-display text-lg font-semibold">{topic}</h3>
                      <p className="text-xs text-muted-foreground">
                        {boxItems.length} {boxItems.length === 1 ? "item" : "items"} — tap to view
                      </p>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="mt-6">
                  <ContentCollage items={items} emptyText="Nothing here yet." />
                </div>
              )}
            </TabsContent>
          );
        })}
      </Tabs>

      <Dialog open={!!openBox} onOpenChange={(open) => !open && setOpenBox(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="font-display">{openBox?.name}</DialogTitle>
            <DialogDescription>
              {openBox?.items.length ?? 0} {(openBox?.items.length ?? 0) === 1 ? "item" : "items"}{" "}
              in this activity. Open any item to view it.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-y-auto pr-1">
            {openBox ? (
              <ContentCollage items={openBox.items} emptyText="Nothing in this activity yet." />
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
