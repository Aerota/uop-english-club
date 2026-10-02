import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  BookOpen,
  CalendarDays,
  Palette,
  MessagesSquare,
  Mic,
  PenLine,
  Presentation,
  Users,
} from "lucide-react";

import assignmentsImg from "@/assets/assignments.jpg";
import groupWorkImg from "@/assets/group-work.jpg";
import heroImg from "@/assets/hero-campus.jpg";
import panelImg from "@/assets/panel.jpg";
import presentationsImg from "@/assets/presentations.jpg";
import { PageLayout } from "@/components/layout/PageLayout";
import { HomeLoadingScreen } from "@/components/HomeLoadingScreen";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { activitiesQuery, contentQuery, groupsQuery, membersQuery, panelsQuery, testimonialsQuery } from "@/lib/data/queries";
import { VoicesCarousel } from "@/components/content/VoicesCarousel";
import { activityTheme, groupTheme } from "@/lib/theme/palette";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Foundation Course in English 25/26, Faculty of Engineering, University of Peradeniya" },
      {
        name: "description",
        content:
          "The Foundation Course in English at the Faculty of Engineering, University of Peradeniya is a preparatory programme designed to equip students with the essential English language skills required for their undergraduate engineering studies.",
      },
      { property: "og:title", content: "Foundation Course in English 25/26" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      {
        property: "og:description",
        content:
          "The Foundation Course in English at the Faculty of Engineering, University of Peradeniya is a preparatory programme designed to equip students with the essential English language skills required for their undergraduate engineering studies.",
      },
    ],
  }),
  component: HomePage,
});

const HIGHLIGHTS = [
  {
    icon: Palette,
    slug: "creative-corner",
    title: "Creative Corner",
    text: "Creative works from all six groups, collected and presented in one organised archive.",
    image: assignmentsImg,
  },
  {
    icon: Users,
    slug: "group-activities",
    title: "Group activities",
    text: "Collaborative tasks, roles and reflections from every group in the program.",
    image: groupWorkImg,
  },
  {
    icon: Presentation,
    slug: "presentations",
    title: "Presentations",
    text: "Slide decks and recorded presentations delivered throughout the semester.",
    image: presentationsImg,
  },
  {
    icon: BookOpen,
    slug: "projects",
    title: "Projects",
    text: "Longer project reports and resources produced by the English program teams.",
    image: panelImg,
  },
];

const SKILLS = [
  {
    icon: PenLine,
    title: "Academic writing",
    text: "Report structure, referencing, summarising technical material and editing our own drafts.",
  },
  {
    icon: Mic,
    title: "Speaking & presenting",
    text: "Delivering technical talks with clear pronunciation, pacing and confident body language.",
  },
  {
    icon: MessagesSquare,
    title: "Discussion & debate",
    text: "Group discussions, interviews and role plays that build fluency under pressure.",
  },
  {
    icon: BookOpen,
    title: "Reading & research",
    text: "Working through journals, standards and articles to gather evidence for our work.",
  },
];

const TIMELINE = [
  {
    phase: "Phase 01",
    title: "Orientation & group formation",
    text: "Six groups are formed, roles are assigned and each group sets its learning goals with the teachers' panel.",
  },
  {
    phase: "Phase 02",
    title: "Creative Corner",
    text: "Essays, technical reports and reflective writing are drafted, reviewed and published to this archive.",
  },
  {
    phase: "Phase 03",
    title: "Group activities",
    text: "Discussions, role plays and collaborative tasks are recorded and documented with group reflections.",
  },
  {
    phase: "Phase 04",
    title: "Presentations & projects",
    text: "Each group presents its final project, and the slides, recordings and reports are archived here.",
  },
];

function HomePage() {
  const groups = useQuery(groupsQuery);
  const activities = useQuery(activitiesQuery);
  const content = useQuery(contentQuery);
  const members = useQuery(membersQuery);
  const panels = useQuery(panelsQuery);
  const voices = (useQuery(testimonialsQuery).data ?? []).filter((t) => t.is_published);
  const teachers = (panels.data ?? []).filter((person) => person.panel === "teachers");

  return (
    <PageLayout>
      <HomeLoadingScreen />
      {/* Hero */}
      <section className="motion-image relative overflow-hidden border-b border-border/70">

        <img
          src={heroImg}
          alt="Faculty of Engineering, University of Peradeniya campus with students walking"
          width={1600}
          height={1104}
          className="motion-image-target absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/92 via-ink/80 to-ink/45" />
        <div className="section-shell relative grid items-center gap-12 py-24 md:grid-cols-[1.1fr_0.9fr] md:py-32">
          <div className="text-ink-foreground">
            <p className="eyebrow text-ink-foreground/70">
              Faculty of Engineering · University of Peradeniya
            </p>
            <h1 className="mt-5 text-4xl font-semibold leading-[1.05] md:text-6xl">
              Intensive English Program E25
              <br />
              AB5-AB10
            </h1>
            <p className="mt-6 max-w-lg text-base text-ink-foreground/80">
              The Foundation Course in English at the Faculty of Engineering, University of Peradeniya is a preparatory programme designed to equip students with the essential English language skills required for their undergraduate engineering studies.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-full px-7">
                <Link to="/groups">Explore our work</Link>
              </Button>
              <Button asChild size="lg" variant="secondary" className="rounded-full px-7">
                <Link to="/about">Meet the panel</Link>
              </Button>
            </div>
          </div>

          {/*<div className="rounded-3xl border border-ink-foreground/15 bg-ink/60 p-8 text-ink-foreground backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-foreground/70">
              Let&apos;s learn together
            </p>
            <p className="mt-4 font-display text-3xl font-semibold leading-tight">
              Five groups. One shared English portfolio.
            </p>
            <dl className="mt-8 grid grid-cols-2 gap-6 border-t border-ink-foreground/20 pt-6 sm:grid-cols-4">
              <div>
                <dt className="text-xs text-ink-foreground/70">Groups</dt>
                <dd className="font-display text-2xl font-semibold">
                  {groups.data?.length ?? 5}
                </dd>
              </div>
           <div>
                <dt className="text-xs text-ink-foreground/70">Activity types</dt>
                <dd className="font-display text-2xl font-semibold">
                  {activities.data?.length ?? 4}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-ink-foreground/70">Members</dt>
                <dd className="font-display text-2xl font-semibold">
                  {members.data?.length ?? 0}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-ink-foreground/70">Uploads</dt>
                <dd className="font-display text-2xl font-semibold">
                  {content.data?.length ?? 0}
                </dd>
              </div>
            </dl>
          </div>*/}
        </div>
      </section>

      {/* What you find here */}
      <section className="section-shell py-20">
        <p className="eyebrow">What you will find here</p>
        <h2 className="mt-3 max-w-2xl text-3xl font-semibold md:text-4xl">
          A single home for every submission
        </h2>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          Every piece of work our groups produce during the English language program is uploaded,
          labelled and kept accessible — for classmates, juniors and the teachers&apos; panel.
        </p>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {HIGHLIGHTS.map((item) => (
            <Card key={item.title} data-motion-reveal className={`motion-card group overflow-hidden border p-0 shadow-soft ${activityTheme(item.slug)} border-[var(--tc-border)]`}>
              <img
                src={item.image}
                alt={item.title}
                loading="lazy"
                width={1200}
                height={912}
                className="motion-image-target h-40 w-full object-cover"
              />
              <CardContent className="pt-6">
                <span className="motion-icon flex size-10 items-center justify-center rounded-xl bg-[var(--tc-soft)] text-[var(--tc)]">
                  <item.icon className="size-5" />
                </span>
                <h3 className="mt-4 text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Split feature */}
      <section className="bg-secondary/60 py-20">
        <div className="section-shell grid items-center gap-12 md:grid-cols-2">
          <div className="motion-image overflow-hidden rounded-3xl shadow-lift">
            <img
              src={groupWorkImg}
              alt="Engineering students collaborating on an English group activity"
              loading="lazy"
              width={1200}
              height={912}
              className="motion-image-target h-full w-full object-cover"
            />
          </div>
          <div>
            <p className="eyebrow">How we work</p>
            <h2 className="mt-3 text-3xl font-semibold md:text-4xl">
              Learning English as engineers, together
            </h2>
            <p className="mt-4 text-muted-foreground">
              The program pairs language practice with the kind of communication engineers
              actually need: technical reports, design presentations, meeting discussions and
              professional correspondence. Each group works through the same activities and then
              shares its results here.
            </p>
            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              {SKILLS.map((skill) => (
                <div key={skill.title} data-motion-reveal className="motion-skill group">
                  <span className="motion-icon flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                    <skill.icon className="size-4" />
                  </span>
                  <h3 className="mt-3 font-semibold">{skill.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{skill.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Timeline 
      <section className="section-shell py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Program journey</p>
            <h2 className="mt-3 text-3xl font-semibold md:text-4xl">
              How a semester unfolds
            </h2>
          </div>
          <Badge variant="secondary" className="gap-2">
            <CalendarDays className="size-4" /> Semester 5-10
          </Badge>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {TIMELINE.map((step) => (
            <div
              key={step.phase}
              data-motion-reveal
              className="motion-card rounded-2xl border border-border/70 bg-card p-6 shadow-soft"
            >
              <p className="eyebrow">{step.phase}</p>
              <h3 className="mt-3 font-display text-lg font-semibold">{step.title}</h3>
              <p className="mt-3 text-sm text-muted-foreground">{step.text}</p>
            </div>
          ))}
        </div>
      </section>*/}

      {/* Groups */}
      <section className="bg-secondary/60 py-20">
        <div className="section-shell">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Our teams</p>
              <h2 className="mt-3 text-3xl font-semibold md:text-4xl">The six groups</h2>
            </div>
            <Button asChild variant="outline" className="rounded-full">
              <Link to="/groups">See all groups</Link>
            </Button>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {(groups.data ?? []).map((group) => (
              <Link
                key={group.id}
                to="/groups/$slug"
                params={{ slug: group.slug }}
                data-motion-reveal
                className={`motion-card group rounded-2xl border bg-card p-6 shadow-soft ${groupTheme(group.slug)} border-[var(--tc-border)]`}
              >
                <p className="eyebrow text-[var(--tc)]">{group.tagline}</p>
                <h3 className="mt-3 font-display text-xl font-semibold">{group.name}</h3>
                <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">
                  {group.description}
                </p>
                <span className="mt-5 inline-block text-sm font-semibold text-[var(--tc)]">
                  <span className="motion-arrow">View group 👉</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Teachers' panel */}
      <section className="section-shell py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">Academic mentorship</p>
          <h2 className="mt-3 text-3xl font-semibold md:text-4xl">Teachers&apos; Panel of English</h2>
          <p className="mt-4 text-muted-foreground">
            Meet the lecturers and instructors guiding our English language programme.
          </p>
        </div>
        {panels.isPending ? (
          <p className="mt-10 text-center text-sm text-muted-foreground">Loading the panel…</p>
        ) : teachers.length > 0 ? (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {teachers.map((person, index) => (
              <Card key={person.id} data-motion-reveal className={`motion-card border shadow-soft ${groupTheme(`group-${5 + (index % 6)}`)} border-[var(--tc-border)]`}>
                <CardContent className="flex flex-col items-center px-6 py-8 text-center">
                  {person.photo_url ? (
                    <img
                      src={person.photo_url}
                      alt={person.full_name}
                      loading="lazy"
                      className="size-28 rounded-full border-4 border-[var(--tc-border)] object-cover"
                    />
                  ) : (
                    <span className="flex size-28 items-center justify-center rounded-full border-4 border-[var(--tc-border)] bg-[var(--tc-soft)] font-display text-2xl font-semibold text-[var(--tc)]">
                      {person.full_name.split(" ").map((part) => part[0]).slice(0, 2).join("")}
                    </span>
                  )}
                  <h3 className="mt-5 font-display text-lg font-semibold">{person.full_name}</h3>
                  {person.role ? <p className="mt-1 text-sm text-[var(--tc)]">{person.role}</p> : null}
                  {person.bio ? <p className="mt-3 text-sm text-muted-foreground">{person.bio}</p> : null}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="mt-10 text-center text-sm text-muted-foreground">Names will be announced soon.</p>
        )}
        <div className="mt-10 text-center">
          <Button asChild variant="outline" className="rounded-full px-7">
            <Link to="/about">Meet the panel &amp; committees</Link>
          </Button>
        </div>
      </section>

      {/* Voices */}
      <section className="bg-secondary/60 py-20">
        <div className="section-shell">
          <p className="eyebrow">In our own words</p>
          <h2 className="mt-3 text-3xl font-semibold md:text-4xl">Voices from the groups</h2>
          <VoicesCarousel items={voices} />
        </div>
      </section>

      {/* CTA */}
      <section className="section-shell py-20">
        <div className="motion-cta rounded-3xl bg-ink px-8 py-14 text-ink-foreground md:px-14">
          <h2 className="max-w-2xl text-3xl font-semibold md:text-4xl">
            Looking for a specific group activity?
          </h2>
          <p className="mt-4 max-w-xl text-ink-foreground/75">
            Choose an activity and a group, and see that group&apos;s members, details and
            everything they submitted.
          </p>
          <Button asChild size="lg" variant="secondary" className="mt-8 rounded-full px-7">
            <Link to="/groups">Browse the groups</Link>
          </Button>
        </div>
      </section>
    </PageLayout>
  );
}
