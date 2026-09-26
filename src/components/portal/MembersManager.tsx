import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { membersQuery } from "@/lib/data/queries";
import type { GroupMember } from "@/lib/data/types";

const EMPTY = {
  full_name: "",
  committee: "",
  bio: "",
  photo_url: "",
};

/** Add, edit and remove the members of one group. */
export function MembersManager({ groupId }: { groupId: string }) {
  const queryClient = useQueryClient();
  const members = useQuery(membersQuery);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const rows = (members.data ?? []).filter((m) => m.group_id === groupId);

  function reset() {
    setForm(EMPTY);
    setEditingId(null);
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    const payload = {
      group_id: groupId,
      full_name: form.full_name,
      role_in_group: null,
      committee: form.committee || null,
      registration_no: null,
      bio: form.bio || null,
      photo_url: form.photo_url || null,
    };
    const { error } = editingId
      ? await supabase.from("group_members").update(payload).eq("id", editingId)
      : await supabase.from("group_members").insert(payload);
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(editingId ? "Member updated" : "Member added");
    reset();
    queryClient.invalidateQueries({ queryKey: ["group_members"] });
  }

  async function remove(member: GroupMember) {
    if (!confirm(`Remove ${member.full_name}?`)) return;
    const { error } = await supabase.from("group_members").delete().eq("id", member.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Member removed");
    queryClient.invalidateQueries({ queryKey: ["group_members"] });
  }

  function startEdit(member: GroupMember) {
    setEditingId(member.id);
    setForm({
      full_name: member.full_name,
      committee: member.committee ?? "",
      bio: member.bio ?? "",
      photo_url: member.photo_url ?? "",
    });
  }

  return (
    <Card className="border-border/70 shadow-soft">
      <CardContent className="pt-6">
        <h2 className="text-lg font-semibold">Members</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          These names appear on the public group page.
        </p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="m-name">Full name</Label>
              <Input
                id="m-name"
                className="mt-2"
                required
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="m-committee">Committee</Label>
              <Input
                id="m-committee"
                className="mt-2"
                placeholder="e.g. Web Committee"
                value={form.committee}
                onChange={(e) => setForm({ ...form, committee: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="m-photo">Photo URL (optional)</Label>
              <Input
                id="m-photo"
                className="mt-2"
                value={form.photo_url}
                onChange={(e) => setForm({ ...form, photo_url: e.target.value })}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="m-bio">Short bio</Label>
            <Textarea
              id="m-bio"
              rows={3}
              className="mt-2"
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" className="rounded-full" disabled={busy}>
              {editingId ? "Save member" : "Add member"}
            </Button>
            {editingId ? (
              <Button type="button" variant="ghost" className="rounded-full" onClick={reset}>
                Cancel
              </Button>
            ) : null}
          </div>
        </form>

        <ul className="mt-8 divide-y divide-border">
          {rows.map((member) => (
            <li key={member.id} className="flex items-center justify-between gap-4 py-3">
              <div>
                <p className="font-medium">{member.full_name}</p>
                <p className="text-sm text-muted-foreground">
                  {[member.committee].filter(Boolean).join(" · ")}
                </p>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => startEdit(member)}>
                  <Pencil className="size-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => remove(member)}>
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </div>
            </li>
          ))}
          {rows.length === 0 ? (
            <li className="py-4 text-sm text-muted-foreground">No members added yet.</li>
          ) : null}
        </ul>
      </CardContent>
    </Card>
  );
}
