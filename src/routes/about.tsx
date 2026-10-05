import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import groupWorkImg from "@/assets/image 5.jpeg";
import panelImg from "@/assets/panel.jpg";
import { PageHero, PageLayout } from "@/components/layout/PageLayout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { panelsQuery } from "@/lib/data/queries";
import type { PanelMember } from "@/lib/data/types";
import { activityTheme, groupTheme } from "@/lib/theme/palette";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About & Panels — 5-10 Group AB English Program" },
      {
        name: "description",
        content:
          "The teachers' panel of English and the web committee of 5-10 Group AB, Faculty of Engineering, University of Peradeniya.",
      },
      { property: "og:title", content: "About & Panels — 5-10 Group AB" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      {
        property: "og:description",
        content:
          "Meet the English teachers' panel and the web committee behind our English language program.",
      },
    ],
  }),
  component: AboutPage,
});

const PANEL_SECTIONS = [
  {
    key: "teachers",
    name: "Teachers' Panel of English",
    summary:
      "The lecturers and instructors of the English language program who guide, review and evaluate our work.",
  },
  {
    key: "web",
    name: "Web Committee",
    summary:
      "The student committee that builds and maintains this website and manages all uploads.",
  },
];

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("");
}

function AboutPage() {
  const panels = useQuery(panelsQuery);

  return (
    <PageLayout>
      <PageHero
        eyebrow="About us"
        title="Meet the People Behind the Programme"
        description="We are six groups of E25 Engineering undergraduates at the University of Peradeniya, participating in an ELTU English course. Through presentations, activities, and projects, develop communication, teamwork, creativity, and technical writing skills. This website showcases our work and experiences while supporting shared learning and future students."
        image={panelImg}
        imageAlt="A lecturer reviewing English written work with students"
      />

      <section className="section-shell py-16">
        <div className="grid gap-6 md:grid-cols-3">
          <div className={`motion-card rounded-2xl border border-[var(--tc-border)] bg-card p-6 shadow-soft ${groupTheme("group-5")}`}>
            <span className="theme-stripe mb-5 block h-1 w-12 rounded-full" aria-hidden="true" />
            <p className="eyebrow theme-text">Who we are</p>
            <p className="mt-3 text-sm text-muted-foreground">
              We are six groups of E25 Engineering undergraduates from the university of Peradeniya participating in an English course conducted by the ELTU of the Faculty of Engineering.
            </p>
          </div>
          <div className={`motion-card rounded-2xl border border-[var(--tc-border)] bg-card p-6 shadow-soft ${activityTheme("group-activities")}`}>
            <span className="theme-stripe mb-5 block h-1 w-12 rounded-full" aria-hidden="true" />
            <p className="eyebrow theme-text">What we do</p>
            <p className="mt-3 text-sm text-muted-foreground">
              We take part in various activities, presentations, and projects that help us develop the English communication, teamwork, and creative skills needed as engineers.
            </p>
          </div>
          <div className={`motion-card rounded-2xl border border-[var(--tc-border)] bg-card p-6 shadow-soft ${activityTheme("creative-corner")}`}>
            <span className="theme-stripe mb-5 block h-1 w-12 rounded-full" aria-hidden="true" />
            <p className="eyebrow theme-text">Why this site</p>
            <p className="mt-3 text-sm text-muted-foreground">
              This website is to showcase and document the work, activities, and experiences of the six groups: AB05, AB06, AB07, A808, AB09, and AB10, throughout the course. We submit our work through this website allowing us to learn from one another and improve together.
            </p>
          </div>
        </div>
      </section>

      <section className="section-shell pb-16">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div className={`overflow-hidden rounded-3xl border-4 border-[var(--tc-border)] shadow-lift ${activityTheme("presentations")}`}>
            <img
              src={groupWorkImg}
              alt="Students of 5-10 Group AB working on an English activity"
              loading="lazy"
              width={1200}
              height={912}
              className="h-full w-full object-cover"
            />
          </div>
          <div className={activityTheme("projects")}>
            <p className="eyebrow theme-text">Our commitment</p>
            <span className="theme-stripe mt-3 block h-1 w-12 rounded-full" aria-hidden="true" />
            <h2 className="mt-3 text-3xl font-semibold md:text-4xl">
              Communication skills for engineers
            </h2>
            <p className="mt-4 text-muted-foreground">
              This programme prepares us for our future careers as engineers by improving our English communication, presentation and teamwork. It also helps us to develop our ability to write clear technical reports and communicate our ideas confidently. Through this website, we aim to preserve our work and create a useful standard and reference for the students who come after us.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-secondary/60 py-16">
        <div className="section-shell space-y-12">
          {PANEL_SECTIONS.map((section) => {
            const people: PanelMember[] = (panels.data ?? []).filter(
              (p) => p.panel === section.key,
            );
            return (
              <div key={section.key} className={section.key === "teachers" ? activityTheme("presentations") : activityTheme("projects")}>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="theme-stripe h-8 w-1 rounded-full" aria-hidden="true" />
                  <h2 className="text-2xl font-semibold md:text-3xl">{section.name}</h2>
                  <Badge className="theme-chip">{people.length} listed</Badge>
                </div>
                <p className="mt-3 max-w-2xl text-sm text-muted-foreground">{section.summary}</p>
                {people.length === 0 ? (
                  <p className="mt-6 text-sm text-muted-foreground">
                    Names will be announced soon.
                  </p>
                ) : (
                  <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {people.map((member, index) => (
                      <Card key={member.id} className={`motion-card overflow-hidden border border-[var(--tc-border)] shadow-soft ${groupTheme(`group-${5 + (index % 6)}`)}`}>
                        <span className="theme-stripe block h-1.5 w-full" aria-hidden="true" />
                        <CardContent className="flex items-center gap-4 pt-6">
                          {member.photo_url ? (
                            <img
                              src={member.photo_url}
                              alt={member.full_name}
                              loading="lazy"
                              className="size-12 shrink-0 rounded-full border-2 border-[var(--tc-border)] object-cover"
                            />
                          ) : (
                            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[var(--tc-soft)] font-display text-sm font-semibold text-[var(--tc)]">
                              {initials(member.full_name)}
                            </span>
                          )}
                          <div>
                            <p className="font-semibold">{member.full_name}</p>
                            <p className="text-sm text-muted-foreground">{member.role}</p>
                            {member.bio ? (
                              <p className="mt-1 text-sm text-muted-foreground">{member.bio}</p>
                            ) : null}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </PageLayout>
  );
}
