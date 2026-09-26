import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { activitiesQuery } from "@/lib/data/queries";
import type { Activity } from "@/lib/data/types";

export function ActivityTypesManager() {
  const queryClient = useQueryClient();
  const activities = useQuery(activitiesQuery);
  const [editing, setEditing] = useState<Activity | null>(null);
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (!editing || !title.trim()) return;
    setBusy(true);
    const { error } = await supabase
      .from("activities")
      .update({ title: title.trim() })
      .eq("id", editing.id);
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Activity type name updated");
    setEditing(null);
    setTitle("");
    queryClient.invalidateQueries({ queryKey: ["activities"] });
  }

  const rows = (activities.data ?? []).slice().sort((a, b) => a.sort_order - b.sort_order);

  return (
    <Card className="border-border/70 shadow-soft">
      <CardContent className="pt-6">
        <h2 className="text-lg font-semibold">Activity type names</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Rename the four labels shown across the site. Their order and behaviour stay fixed.
        </p>

        {editing ? (
          <form onSubmit={save} className="mt-6 rounded-lg border bg-primary-soft/40 p-4">
            <Label htmlFor="activity-type-title">Displayed name</Label>
            <div className="mt-2 grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto_auto]">
              <Input
                id="activity-type-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
                autoFocus
              />
              <Button type="submit" disabled={busy}>
                {busy ? "Saving…" : "Save name"}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setEditing(null)}>
                Cancel
              </Button>
            </div>
          </form>
        ) : null}

        <ul className="mt-6 divide-y divide-border">
          {rows.map((activity, index) => (
            <li
              key={activity.id}
              className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-3"
            >
              <div className="min-w-0">
                <p className="truncate font-medium">{activity.title}</p>
                <p className="text-xs text-muted-foreground">Activity type {index + 1}</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setEditing(activity);
                  setTitle(activity.title);
                }}
              >
                <Pencil className="size-4" /> Rename
              </Button>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}