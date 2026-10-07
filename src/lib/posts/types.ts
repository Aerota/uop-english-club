/** Block-based blog posts published under an activity type. */

export type PostImage = {
  /** Path inside the private "posts" bucket. */
  path?: string | null;
  /** Ready-to-display link (signed at read time). */
  url?: string | null;
  caption?: string | null;
};

export type PostBlock =
  | { id: string; type: "heading"; text: string }
  | { id: string; type: "subheading"; text: string }
  | { id: string; type: "paragraph"; text: string }
  | ({ id: string; type: "photo" } & PostImage)
  | { id: string; type: "album"; images: PostImage[] }
  | { id: string; type: "video"; url: string; caption?: string | null }
  | {
      id: string;
      type: "pdf";
      path?: string | null;
      url?: string | null;
      fileName?: string | null;
      title?: string | null;
      caption?: string | null;
    }
  | { id: string; type: "link"; url: string; label: string; description?: string | null }
  | { id: string; type: "likes"; label: string };

export type PostBlockType = PostBlock["type"];

export type ActivityPost = {
  id: string;
  group_id: string;
  activity_id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  header_image_url: string | null;
  post_date: string;
  blocks: PostBlock[];
  status: "draft" | "published";
  likes_count: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  /** Display link for the header image (signed when stored). */
  header_url?: string | null;
};

export const BLOCK_LABELS: Record<PostBlockType, string> = {
  heading: "Heading",
  subheading: "Subheading",
  paragraph: "Paragraph",
  photo: "Photo",
  album: "Photo album",
  video: "Video",
  pdf: "PDF document",
  link: "Link",
  likes: "Like section",
};

export const ALBUM_MAX_PHOTOS = 10;
export const PDF_MAX_BYTES = 15 * 1024 * 1024;

export function newBlock(type: PostBlockType): PostBlock {
  const id = crypto.randomUUID();
  switch (type) {
    case "heading":
      return { id, type, text: "New heading" };
    case "subheading":
      return { id, type, text: "New subheading" };
    case "paragraph":
      return { id, type, text: "" };
    case "photo":
      return { id, type, path: null, url: null, caption: "" };
    case "album":
      return { id, type, images: [] };
    case "video":
      return { id, type, url: "", caption: "" };
    case "pdf":
      return { id, type, path: null, url: null, fileName: null, title: "", caption: "" };
    case "link":
      return { id, type, url: "", label: "", description: "" };
    case "likes":
      return { id, type, label: "Did you enjoy our work?" };
  }
}

/** Turn a title into a URL-friendly slug. */
export function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 70);
}

/** Convert a YouTube or Vimeo link into an embeddable URL. */
export function embedUrl(raw: string): string | null {
  const value = raw.trim();
  if (!value) return null;
  const yt = value.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/i,
  );
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vimeo = value.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  if (/^https?:\/\//i.test(value)) return value;
  return null;
}
