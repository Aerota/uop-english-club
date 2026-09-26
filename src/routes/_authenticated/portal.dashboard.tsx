import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  BookOpenText,
  Camera,
  Images,
  LayoutDashboard,
  LogOut,
  Newspaper,
  Settings,
  Tags,
  UserRoundCog,
  Users,
} from "lucide-react";

import { useEffect, useState } from "react";

import { PageLayout } from "@/components/layout/PageLayout";
import { AccountSettings } from "@/components/portal/AccountSettings";
import { ActivityNamesManager } from "@/components/portal/ActivityNamesManager";
import { ActivityTypesManager } from "@/components/portal/ActivityTypesManager";
import { ContentManager } from "@/components/portal/ContentManager";
import { GalleryManager } from "@/components/portal/GalleryManager";
import { GroupDetailsForm } from "@/components/portal/GroupDetailsForm";
import { MembersManager } from "@/components/portal/MembersManager";
import { PanelManager } from "@/components/portal/PanelManager";
import { PostsManager } from "@/components/portal/PostsManager";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { groupsQuery, myProfileQuery } from "@/lib/data/queries";

export const Route = createFileRoute("/_authenticated/portal/dashboard")({
  head: () => ({
    meta: [
      { title: "Portal Dashboard — 5-10 Group AB" },
      {
        name: "description",
        content: "Manage group details, members, activities, uploads, and galleries.",
      },
      { property: "og:title", content: "Portal Dashboard — 5-10 Group AB" },
      {
        property: "og:description",
        content: "Manage group details, members, activities, uploads, and galleries.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const me = useQuery(myProfileQuery);
  const groups = useQuery(groupsQuery);
  const [section, setSection] = useState("posts");
  const [adminGroupId, setAdminGroupId] = useState("");

  useEffect(() => {
    if (!adminGroupId && groups.data?.[0]?.id) setAdminGroupId(groups.data[0].id);
  }, [adminGroupId, groups.data]);

  if (me.isLoading) {
    return (
      <PageLayout>
        <div className="section-shell py-24 text-sm text-muted-foreground">Loading portal…</div>
      </PageLayout>
    );
  }

  const userId = me.data?.userId;
  const isAdmin = me.data?.isAdmin ?? false;
  const ownGroupId = me.data?.profile?.group_id ?? null;
  const ownGroup = (groups.data ?? []).find((g) => g.id === ownGroupId) ?? null;
  const selectedGroupId = isAdmin ? adminGroupId : ownGroupId;
  const selectedGroup = (groups.data ?? []).find((g) => g.id === selectedGroupId) ?? null;

  if (!userId) {
    return (
      <PageLayout>
        <div className="section-shell py-24 text-sm text-muted-foreground">
          Session expired. Please sign in again.
        </div>
      </PageLayout>
    );
  }

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/portal/login", replace: true });
  }

  const groupSections = [
    { value: "posts", label: "Posts", icon: Newspaper },
    { value: "content", label: "Content", icon: BookOpenText },
    { value: "group", label: "Group details", icon: LayoutDashboard },
    { value: "members", label: "Members", icon: Users },
    { value: "activity-names", label: "Activity names", icon: Tags },
    { value: "gallery", label: "Gallery", icon: Images },
  ];

  const adminSections = [
    { value: "activity-types", label: "Activity type labels", icon: UserRoundCog },
    { value: "panels", label: "Panels", icon: Camera },
  ];
  const sections = [
    ...groupSections,
    ...(isAdmin ? adminSections : []),
    { value: "account", label: "Account", icon: Settings },
  ];
  const activeLabel = sections.find((item) => item.value === section)?.label ?? "Content";

  return (
    <PageLayout>
      <div className="section-shell py-6 sm:py-10">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b pb-6 sm:flex sm:flex-wrap sm:justify-between">
          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-2">
              <h1 className="truncate text-xl font-semibold sm:text-2xl">
                {isAdmin ? "Admin workspace" : (ownGroup?.name ?? "Group workspace")}
              </h1>
              <Badge variant="secondary" className="shrink-0">
                {isAdmin ? "Admin" : "Group"}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {me.data?.profile?.display_name ?? "Signed in"}
            </p>
          </div>
          <Button variant="outline" size="icon" className="shrink-0" onClick={signOut} aria-label="Sign out">
            <LogOut className="size-4" />
          </Button>
        </div>

        {isAdmin ? (
          <div className="mt-6 rounded-lg border bg-primary-soft/45 p-4 sm:grid sm:grid-cols-[minmax(0,1fr)_20rem] sm:items-center sm:gap-6">
            <div className="min-w-0">
              <p className="text-sm font-semibold">Editing group</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Choose once, then use the menu to edit every part of that group.
              </p>
            </div>
            <Select value={adminGroupId} onValueChange={setAdminGroupId}>
              <SelectTrigger className="mt-3 h-11 bg-background sm:mt-0" aria-label="Select group to edit">
                <SelectValue placeholder="Choose a group" />
              </SelectTrigger>
              <SelectContent>
                {(groups.data ?? []).map((group) => (
                  <SelectItem key={group.id} value={group.id}>{group.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : null}

        {selectedGroup ? (
          <div className="mt-4 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-lg border bg-card px-4 py-3">
            <div className="min-w-0">
              <p className="truncate font-semibold">{selectedGroup.name}</p>
              <p className="truncate text-xs text-muted-foreground">{selectedGroup.tagline ?? "Group management"}</p>
            </div>
            <Badge variant="outline" className="shrink-0">Selected</Badge>
          </div>
        ) : null}

        <Tabs value={section} onValueChange={setSection} orientation="vertical" className="mt-6 lg:grid lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-8">
          <div>
            <div className="lg:hidden">
              <label className="mb-2 block text-sm font-medium" htmlFor="portal-section">Manage</label>
              <Select value={section} onValueChange={setSection}>
                <SelectTrigger id="portal-section" className="h-11 bg-card">
                  <SelectValue>{activeLabel}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {sections.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <TabsList className="hidden h-auto w-full flex-col items-stretch gap-1 bg-transparent p-0 lg:flex">
              {sections.map((item) => {
                const Icon = item.icon;
                return (
                  <TabsTrigger key={item.value} value={item.value} className="h-11 justify-start gap-3 px-3 data-[state=active]:bg-primary-soft data-[state=active]:text-primary data-[state=active]:shadow-none">
                    <Icon className="size-4" /> {item.label}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

          <div className="min-w-0">
            <div className="mb-4 mt-5 lg:mt-0">
              <p className="eyebrow">Workspace</p>
              <h2 className="mt-1 text-xl font-semibold">{activeLabel}</h2>
            </div>

          <TabsContent value="posts" className="mt-6">
            {selectedGroupId ? <PostsManager key={selectedGroupId} userId={userId} isAdmin={isAdmin} groupId={selectedGroupId} /> : null}
          </TabsContent>

          <TabsContent value="content" className="mt-6">
            {selectedGroupId ? <ContentManager key={selectedGroupId} userId={userId} isAdmin={isAdmin} groupId={selectedGroupId} /> : null}
          </TabsContent>


          {selectedGroup ? (
            <TabsContent value="group" className="mt-6">
              <GroupDetailsForm key={selectedGroup.id} group={selectedGroup} />
            </TabsContent>
          ) : null}

          {selectedGroupId ? (
            <TabsContent value="members" className="mt-6">
              <MembersManager key={selectedGroupId} groupId={selectedGroupId} />
            </TabsContent>
          ) : null}

          <TabsContent value="activity-names" className="mt-6">
            {selectedGroupId ? <ActivityNamesManager key={selectedGroupId} groupId={selectedGroupId} /> : null}
          </TabsContent>

          {isAdmin ? <TabsContent value="activity-types" className="mt-6"><ActivityTypesManager /></TabsContent> : null}

          {isAdmin ? (
            <TabsContent value="panels" className="mt-6">
              <PanelManager />
            </TabsContent>
          ) : null}

          {selectedGroupId ? (
            <TabsContent value="gallery" className="mt-6">
              <GalleryManager key={selectedGroupId} userId={userId} groupId={selectedGroupId} />
            </TabsContent>
          ) : null}

          <TabsContent value="account" className="mt-6">
            <AccountSettings
              userId={userId}
              displayName={me.data?.profile?.display_name ?? ""}
            />
          </TabsContent>
          </div>
        </Tabs>
      </div>
    </PageLayout>
  );
}
