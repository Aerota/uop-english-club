import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

/** Edit your own display name and change your password. */
export function AccountSettings({
  userId,
  displayName,
}: {
  userId: string;
  displayName: string;
}) {
  const queryClient = useQueryClient();
  const [name, setName] = useState(displayName);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function saveName(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: name })
      .eq("user_id", userId);
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Name updated");
    queryClient.invalidateQueries({ queryKey: ["my_profile"] });
  }

  async function changePassword(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
      // Lovable Cloud may require the current password for signed-in changes.
      ...(currentPassword ? { current_password: currentPassword } : {}),
    } as Parameters<typeof supabase.auth.updateUser>[0]);
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setCurrentPassword("");
    setNewPassword("");
    toast.success("Password changed");
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="border-border/70 shadow-soft">
        <CardContent className="pt-6">
          <h2 className="text-lg font-semibold">Account name</h2>
          <form onSubmit={saveName} className="mt-4 space-y-4">
            <div>
              <Label htmlFor="a-name">Display name</Label>
              <Input
                id="a-name"
                className="mt-2"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <Button type="submit" className="rounded-full" disabled={busy}>
              Save name
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-border/70 shadow-soft">
        <CardContent className="pt-6">
          <h2 className="text-lg font-semibold">Change password</h2>
          <form onSubmit={changePassword} className="mt-4 space-y-4">
            <div>
              <Label htmlFor="a-current">Current password</Label>
              <Input
                id="a-current"
                type="password"
                className="mt-2"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="a-new">New password</Label>
              <Input
                id="a-new"
                type="password"
                minLength={8}
                required
                className="mt-2"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="rounded-full" disabled={busy}>
              Update password
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
