import { queryOptions } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import type {
  Activity,
  ActivityName,
  ContentItem,
  Group,
  GalleryAlbum,
  GalleryImage,
  GroupMember,
  PanelMember,
  Profile,
} from "./types";

export const panelsQuery = queryOptions({
  queryKey: ["panel_members"],
  queryFn: async (): Promise<PanelMember[]> => {
    const { data, error } = await supabase
      .from("panel_members")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return (data ?? []) as PanelMember[];
  },
});

/** All public read queries used across the site. */

/** Cover images may be stored files (paths) or plain links. */
function isStoredPath(value: string | null): value is string {
  return Boolean(value) && !/^https?:\/\//i.test(value as string) && !value!.startsWith("/");
}

export const groupsQuery = queryOptions({
  queryKey: ["groups"],
  queryFn: async (): Promise<Group[]> => {
    const { data, error } = await supabase
      .from("groups")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw error;
    const rows = (data ?? []) as Group[];

    const paths = Array.from(
      new Set(
        rows
          .flatMap((g) => [g.cover_url, g.mobile_cover_url])
          .filter(isStoredPath),
      ),
    );
    if (!paths.length) return rows;

    const { data: urls } = await supabase.storage
      .from("covers")
      .createSignedUrls(paths, 60 * 60 * 24);
    const signed: Record<string, string> = {};
    for (const entry of urls ?? []) {
      if (entry.path && entry.signedUrl) signed[entry.path] = entry.signedUrl;
    }
    return rows.map((g) => ({
      ...g,
      cover_url: isStoredPath(g.cover_url) ? (signed[g.cover_url] ?? null) : g.cover_url,
      mobile_cover_url: isStoredPath(g.mobile_cover_url)
        ? (signed[g.mobile_cover_url] ?? null)
        : g.mobile_cover_url,
    }));
  },
});

export const activitiesQuery = queryOptions({
  queryKey: ["activities"],
  queryFn: async (): Promise<Activity[]> => {
    const { data, error } = await supabase
      .from("activities")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return (data ?? []) as Activity[];
  },
});

export const activityNamesQuery = queryOptions({
  queryKey: ["activity_names"],
  queryFn: async (): Promise<ActivityName[]> => {
    const { data, error } = await supabase
      .from("activity_names")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });
    if (error) throw error;
    return (data ?? []) as ActivityName[];
  },
});

export const membersQuery = queryOptions({
  queryKey: ["group_members"],
  queryFn: async (): Promise<GroupMember[]> => {
    const { data, error } = await supabase
      .from("group_members")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return (data ?? []) as GroupMember[];
  },
});

export const contentQuery = queryOptions({
  queryKey: ["content_items"],
  queryFn: async (): Promise<ContentItem[]> => {
    const { data, error } = await supabase
      .from("content_items")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as ContentItem[];
  },
});

export const myProfileQuery = queryOptions({
  queryKey: ["my_profile"],
  queryFn: async (): Promise<{ profile: Profile | null; isAdmin: boolean; userId: string | null }> => {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    if (!user) return { profile: null, isAdmin: false, userId: null };

    const [{ data: profile }, { data: roles }] = await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", user.id),
    ]);

    return {
      profile: (profile ?? null) as Profile | null,
      isAdmin: (roles ?? []).some((r) => r.role === "admin"),
      userId: user.id,
    };
  },
});

/** Files live in a private bucket; build a temporary link to open them. */
export async function getFileUrl(storagePath: string) {
  const { data, error } = await supabase.storage
    .from("content")
    .createSignedUrl(storagePath, 60 * 60);
  if (error) throw error;
  return data.signedUrl;
}

export const galleryAlbumsQuery = queryOptions({
  queryKey: ["gallery_albums"],
  queryFn: async (): Promise<GalleryAlbum[]> => {
    const { data, error } = await supabase
      .from("gallery_albums")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as GalleryAlbum[];
  },
});

export const galleryImagesQuery = queryOptions({
  queryKey: ["gallery_images"],
  queryFn: async (): Promise<GalleryImage[]> => {
    const { data, error } = await supabase
      .from("gallery_images")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) throw error;
    const rows = (data ?? []) as GalleryImage[];
    const paths = rows.map((r) => r.storage_path).filter((p): p is string => !!p);
    let signed: Record<string, string> = {};
    if (paths.length) {
      const { data: urls } = await supabase.storage
        .from("content")
        .createSignedUrls(paths, 60 * 60);
      for (const entry of urls ?? []) {
        if (entry.path && entry.signedUrl) signed[entry.path] = entry.signedUrl;
      }
    }
    return rows.map((row) => ({
      ...row,
      url: row.storage_path ? (signed[row.storage_path] ?? null) : row.image_url,
    }));
  },
});
