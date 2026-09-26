/** Shared row types for the 5-10 Group AB site. */

export type Group = {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  cover_url: string | null;
  mobile_cover_url: string | null;
  sort_order: number;
};

export type GroupMember = {
  id: string;
  group_id: string;
  full_name: string;
  role_in_group: string | null;
  committee: string | null;
  registration_no: string | null;
  bio: string | null;
  photo_url: string | null;
  sort_order: number;
};

/** Teachers' panel of English and the web committee. */
export type PanelMember = {
  id: string;
  panel: string;
  full_name: string;
  role: string | null;
  bio: string | null;
  photo_url: string | null;
  sort_order: number;
};

export type Activity = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  sort_order: number;
};

/** A named activity (box) inside one of the fixed activity types. */
export type ActivityName = {
  id: string;
  activity_id: string;
  group_id: string | null;
  name: string;
  sort_order: number;
};

export type ContentKind = "document" | "presentation" | "video" | "link" | "image";

export type ContentItem = {
  id: string;
  group_id: string | null;
  activity_id: string | null;
  /** Custom sub-group ("box") name inside an activity type. */
  topic: string | null;
  title: string;
  description: string | null;
  kind: string;
  storage_path: string | null;
  file_url: string | null;
  external_url: string | null;
  uploaded_by: string;
  created_at: string;
};

export type Profile = {
  user_id: string;
  display_name: string;
  group_id: string | null;
};

/** A set of photos published in the site gallery. */
export type GalleryAlbum = {
  id: string;
  group_id: string | null;
  title: string;
  description: string | null;
  event_date: string | null;
  cover_url: string | null;
  sort_order: number;
  created_at: string;
};

export type GalleryImage = {
  id: string;
  album_id: string;
  caption: string | null;
  storage_path: string | null;
  image_url: string | null;
  sort_order: number;
  /** Ready-to-display link (signed for stored files). */
  url?: string | null;
};
