import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { activitiesQuery, activityNamesQuery } from "@/lib/data/queries";
import type { ActivityName } from "@/lib/data/types";

type Props = {
  groupId: string;
};

/** Manage the named activities (boxes) inside each fixed activity type. */
export function ActivityNamesManager({ groupId: selectedGroupId }: Props) {
  const queryClient = useQueryClient();
  const activities = useQuery(activitiesQuery);
  const names = useQuery(activityNamesQuery);

  const [activityId, setActivityId] = useState("");
  const [name, setName] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const types = (activities.data ?? []).slice().sort((a, b) => a.sort_order - b.sort_order);
  const visible = (names.data ?? []).filter((row) => row.group_id === selectedGroupId);

  function reset() {
    setActivityId("");
    setName("");
    setSortOrder("0");
    setEditingId(null);
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!activityId) {
      toast.error("Choose an activity type.");
      return;
    }
    const targetGroupId = selectedGroupId;
    if (!targetGroupId) {
      toast.error("Choose a group.");
      return;
    }
    setBusy(true);
    try {
      const payload = {
        activity_id: activityId,
        group_id: targetGroupId,
        name: name.trim(),
        sort_order: Number(sortOrder) || 0,
      };
      if (editingId) {
        const { error } = await supabase
          .from("activity_names")
          .update(payload)
          .eq("id", editingId);
        if (error) throw error;
        toast.success("Activity name updated");
      } else {
        const { error } = await supabase.from("activity_names").insert(payload);
        if (error) throw error;
        toast.success("Activity name added");
      }
      reset();
      queryClient.invalidateQueries({ queryKey: ["activity_names"] });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save");
    } finally {
      setBusy(false);
    }
  }

  async function remove(row: ActivityName) {
    if (!confirm(`Delete "${row.name}"? Uploads keep their files.`)) return;
    const { error } = await supabase.from("activity_names").delete().eq("id", row.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Deleted");
    queryClient.invalidateQueries({ queryKey: ["activity_names"] });
  }

  function startEdit(row: ActivityName) {
    setEditingId(row.id);
    setActivityId(row.activity_id);
    setName(row.name);
    setSortOrder(String(row.sort_order));
  }

  return (
    <div className="space-y-6">
      <Card className="border-border/70 shadow-soft">
        <CardContent className="pt-6">
          <h2 className="text-lg font-semibold">
            {editingId ? "Edit activity name" : "Add activity name"}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Pick one of the four activity types, then type the activity name. Each name becomes a
            box on the group page, and appears in the upload form once the type is chosen.
          </p>
          <form onSubmit={submit} className="mt-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Activity type</Label>
                <Select value={activityId} onValueChange={setActivityId}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Choose type" />
                  </SelectTrigger>
                  <SelectContent>
                    {types.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="an-name">Activity name</Label>
                <Input
                  id="an-name"
                  className="mt-2"
                  required
                  placeholder="e.g. Renewable energy"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="an-order">Order</Label>
                <Input
                  id="an-order"
                  type="number"
                  className="mt-2"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="rounded-full" disabled={busy}>
                {busy ? "Working…" : editingId ? "Save changes" : "Add"}
              </Button>
              {editingId ? (
                <Button type="button" variant="ghost" className="rounded-full" onClick={reset}>
                  Cancel
                </Button>
              ) : null}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border-border/70 shadow-soft">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Activity names</h2>
            <Badge variant="outline">{visible.length}</Badge>
          </div>
          <div className="mt-4 space-y-6">
            {types.map((type) => {
              const rows = visible
                .filter((row) => row.activity_id === type.id)
                .sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name));
              return (
                <div key={type.id}>
                  <p className="text-sm font-semibold">{type.title}</p>
                  <ul className="mt-2 divide-y divide-border">
                    {rows.map((row) => (
                      <li key={row.id} className="flex items-center justify-between gap-4 py-2">
                        <div>
                          <p className="font-medium">{row.name}</p>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => startEdit(row)}>
                            <Pencil className="size-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => remove(row)}>
                            <Trash2 className="size-4 text-destructive" />
                          </Button>
                        </div>
                      </li>
                    ))}
                    {rows.length === 0 ? (
                      <li className="py-2 text-sm text-muted-foreground">No names yet.</li>
                    ) : null}
                  </ul>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
