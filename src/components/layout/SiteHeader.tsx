import { Link } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/groups", label: "Groups" },
  
  { to: "/memories", label: "Memories" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur">
      <div className="section-shell flex h-16 items-center justify-between gap-6">

        <Link to="/" className="group flex items-center gap-3">
          <img src="https://www.image2url.com/r2/default/images/1788324763552-37ec9453-9d75-4e1a-8f4e-af6280587a7f.png" alt="English Language Program logo" className="h-9 w-9 object-contain transition-transform duration-500 ease-out group-hover:rotate-3 group-hover:scale-110" />
          <span className="leading-tight">
            <span className="block font-display text-sm font-semibold">English Language Teaching Unit</span>
            <span className="block text-xs text-muted-foreground">
              Faculty of Engineering 
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              activeProps={{ className: "bg-primary-soft text-primary" }}
              className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary-soft hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:block">
          <Button asChild size="sm" className="rounded-full">
            <Link to="/groups">Browse work</Link>
          </Button>
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" aria-label="Open menu">
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <nav className="mt-10 flex flex-col gap-2">
              {NAV.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2 text-base font-medium text-foreground hover:bg-secondary"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
