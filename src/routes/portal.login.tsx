import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

/**
 * Private sign-in page for the 5 group logins + admin login.
 * It is intentionally NOT linked anywhere on the public site and is
 * excluded from search engines in public/robots.txt.
 */
export const Route = createFileRoute("/portal/login")({
  head: () => ({
    meta: [
      { title: "Team Sign In — 5-10 Group AB" },
      { name: "description", content: "Private sign-in for 5-10 Group AB team accounts." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Team Sign In — 5-10 Group AB" },
      { property: "og:description", content: "Private sign-in for team accounts." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/portal/dashboard", replace: true });
    });
  }, [navigate]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Signed in");
    navigate({ to: "/portal/dashboard", replace: true });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/60 px-4">
      <Card className="w-full max-w-md border-border/70 shadow-lift">
        <CardContent className="pt-8">
          <span className="flex size-11 items-center justify-center rounded-xl bg-primary font-display text-sm font-bold text-primary-foreground">
            AB
          </span>
          <h1 className="mt-5 text-2xl font-semibold">Team sign in</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            For the six group accounts (Groups 5–10) and the admin account of 5-10 Group AB.
          </p>
          <form onSubmit={handleSubmit} className="mt-7 space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2"
              />
            </div>
            <Button type="submit" className="w-full rounded-full" disabled={loading}>
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
