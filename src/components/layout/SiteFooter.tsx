import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="mt-24 bg-ink text-ink-foreground">
      <div className="section-shell grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="font-display text-lg font-semibold">5-10 Group AB</p>
          <p className="mt-3 max-w-sm text-sm text-ink-foreground/70">
            The English language program team of the Faculty of Engineering, University of
            Peradeniya. This site collects our assignments, group activities and presentations
            in one place.
          </p>
        </div>
        <div>
          <p className="eyebrow text-ink-foreground/60">Explore</p>
          <ul className="mt-4 space-y-2 text-sm text-ink-foreground/80">
            <li>
              <Link to="/" className="transition-colors hover:text-primary">Home</Link>
            </li>
            <li>
              <Link to="/about" className="transition-colors hover:text-primary">About</Link>
            </li>
            <li>
              <Link to="/groups" className="transition-colors hover:text-primary">Groups</Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="eyebrow text-ink-foreground/60">Faculty</p>
          <ul className="mt-4 space-y-2 text-sm text-ink-foreground/80">
            <li>Faculty of Engineering</li>
            <li>University of Peradeniya</li>
            <li>Peradeniya, Sri Lanka</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-ink-foreground/15">
        <div className="section-shell flex flex-col gap-2 py-5 text-xs text-ink-foreground/60 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} 5-10 Group AB. All rights reserved.</p>
          <p>Faculty of Engineering, University of Peradeniya</p>
        </div>
      </div>
    </footer>
  );
}
