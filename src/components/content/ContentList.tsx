import { FileText, Film, Image as ImageIcon, LinkIcon, Presentation } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getFileUrl } from "@/lib/data/queries";
import type { ContentItem } from "@/lib/data/types";

const ICONS = {
  document: FileText,
  presentation: Presentation,
  video: Film,
  image: ImageIcon,
  link: LinkIcon,
} as const;

export function kindIcon(kind: string) {
  return ICONS[kind as keyof typeof ICONS] ?? FileText;
}

export async function openContent(item: ContentItem) {
  try {
    if (item.external_url) {
      window.open(item.external_url, "_blank", "noopener,noreferrer");
      return;
    }
    if (item.storage_path) {
      const url = await getFileUrl(item.storage_path);
      window.open(url, "_blank", "noopener,noreferrer");
      return;
    }
    if (item.file_url) {
      window.open(item.file_url, "_blank", "noopener,noreferrer");
      return;
    }
    toast.error("No file or link attached to this item.");
  } catch {
    toast.error("Could not open this file. Please try again.");
  }
}

export function ContentList({
  items,
  labelFor,
  emptyText = "Nothing has been uploaded here yet.",
}: {
  items: ContentItem[];
  labelFor?: (item: ContentItem) => string | undefined;
  emptyText?: string;
}) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card/50 p-10 text-center text-sm text-muted-foreground">
        {emptyText}
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {items.map((item) => {
        const Icon = kindIcon(item.kind);
        const label = labelFor?.(item);
        return (
          <li
            key={item.id}
            className="flex flex-col gap-4 rounded-2xl border border-border/70 bg-card p-5 shadow-soft sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex gap-4">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
                <Icon className="size-5" />
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold">{item.title}</p>
                  <Badge variant="secondary" className="capitalize">
                    {item.kind}
                  </Badge>
                  {label ? <Badge variant="outline">{label}</Badge> : null}
                </div>
                {item.description ? (
                  <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                    {item.description}
                  </p>
                ) : null}
                <p className="mt-1 text-xs text-muted-foreground">
                  Added {new Date(item.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              className="rounded-full sm:shrink-0"
              onClick={() => openContent(item)}
            >
              {item.external_url ? "Open link" : "Open file"}
            </Button>
          </li>
        );
      })}
    </ul>
  );
}
