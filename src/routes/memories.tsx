import { createFileRoute } from "@tanstack/react-router";

import memoriesBuildingImg from "@/assets/memories-building.jpg";
import memoriesLaunchImg from "@/assets/memories-launch.jpg";
import memoriesPlanningImg from "@/assets/memories-planning.jpg";
import memoriesReviewImg from "@/assets/IMG_20260910_125701.jpg";
import groupWorkImg from "@/assets/group-work.jpg";
import panelImg from "@/assets/panel.jpg";
import presentationsImg from "@/assets/presentations.jpg";
import { PageHero, PageLayout } from "@/components/layout/PageLayout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { activityTheme, groupTheme } from "@/lib/theme/palette";

export const Route = createFileRoute("/memories")({
  head: () => ({
    meta: [
      { title: "Memories — How the Web Committee Built This Site" },
      {
        name: "description",
        content:
          "The journey of the 5-10 Group AB web committee: how we planned, designed, built and launched this English language program website, with a photo gallery.",
      },
      { property: "og:title", content: "Memories — 5-10 Group AB Web Committee" },
      {
        property: "og:description",
        content:
          "Photos, milestones and behind-the-scenes stories from the web committee that built this site.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MemoriesPage,
});

const JOURNEY = [
  {
    step: "01",
    theme: groupTheme("group-5"),
    title: "The Concept",
    text: "Our program's work was fragmented across chat apps and cloud drives. We proposed a single, structured repository for every assignment, presentation, and recording.",
  },
  {
    step: "02",
    theme: activityTheme("projects"),
    title: "Architecture & Planning",
    text: "We mapped the site's skeleton on a whiteboard. We established early on that each of the six groups needed a dedicated, self-managed portal for their members and uploads.",
  },
  {
    step: "03",
    theme: activityTheme("creative-corner"),
    title: "Development",
    text: "Late nights were spent coding layouts, building the secure backend, and refining a blue-themed UI inspired by the Faculty’s official visual identity.",
  },
  {
    step: "04",
    theme: activityTheme("group-activities"),
    title: "Iteration & Review",
    text: "We presented early builds to the batch and the teachers' panel. Their feedback directly shaped the final navigation, content filters, and upload mechanics.",
  },
  {
    step: "05",
    theme: activityTheme("presentations"),
    title: "Deployment",
    text: "The archive went live for all six groups. It now serves as an actively growing, permanent record of our batch’s collective effort.",
  },
];

const GALLERY = [
  { src: memoriesPlanningImg, alt: "Web committee sketching the website layout on a whiteboard", caption: "Sketching the first sitemap", theme: groupTheme("group-5") },
  { src: memoriesBuildingImg, alt: "Two committee members coding the site on laptops", caption: "Build nights", theme: groupTheme("group-6") },
  { src: memoriesReviewImg, alt: "A committee member demoing the site to classmates", caption: "First demo to the batch", theme: groupTheme("group-7") },
  { src: groupWorkImg, alt: "Students collaborating on an English activity", caption: "Collecting group content", theme: groupTheme("group-9") },
  { src: presentationsImg, alt: "A student presenting in a lecture room", caption: "Documenting presentations", theme: groupTheme("group-10") },
  { src: panelImg, alt: "A lecturer reviewing work with students", caption: "Guidance from the panel", theme: activityTheme("group-activities") },
];

const NUMBERS = [
  { value: "6", label: "Autonomous Group Portals Managed", theme: groupTheme("group-6") },
  { value: "4", label: "Core Public Pages Designed & Implemented", theme: activityTheme("projects") },
  { value: "100+", label: "Files, Submissions & Presentations Archived", theme: activityTheme("creative-corner") },
  { value: "∞", label: "Late-night debugging sessions", theme: activityTheme("presentations") },
];

function MemoriesPage() {
  return (
    <PageLayout>
      <PageHero
        eyebrow="Memories"
        title="The Making of the Archive"
        description="A retrospective on how the web committee built a unified digital home for our batch's English program work. From whiteboard sketches to launch day, this is the story behind the site."
        image={memoriesLaunchImg}
        imageAlt="The web committee celebrating the finished website"
      />

      <section className="section-shell py-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {NUMBERS.map((item) => (
            <div
              key={item.label}
              data-motion-reveal
              className={`motion-card rounded-lg border border-[var(--tc-border)] bg-card p-6 text-center shadow-soft ${item.theme}`}
            >
              <span className="theme-stripe mx-auto mb-4 block h-1 w-10 rounded-full" aria-hidden="true" />
              <p className="font-display text-3xl font-semibold text-[var(--tc)]">{item.value}</p>
              <p className="mt-2 text-sm text-muted-foreground">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-secondary/60 py-16">
        <div className="section-shell">
          <p className="eyebrow">Our journey</p>
          <h2 className="mt-3 text-3xl font-semibold md:text-4xl">From whiteboard to launch</h2>
          <div className="mt-10 space-y-6">
            {JOURNEY.map((item) => (
              <Card key={item.step} data-motion-reveal className={`motion-card overflow-hidden border border-[var(--tc-border)] shadow-soft ${item.theme}`}>
                <span className="theme-stripe block h-1 w-full" aria-hidden="true" />
                <CardContent className="flex gap-5 pt-6">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-md bg-[var(--tc-soft)] font-display text-lg font-semibold text-[var(--tc)]">
                    {item.step}
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold">{item.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{item.text}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell py-16">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-3xl font-semibold md:text-4xl">Behind the Screens</h2>
          <Badge variant="secondary">{GALLERY.length} photos</Badge>
        </div>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          The milestones, meetings, and moments that brought this platform to life.
        </p>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {GALLERY.map((photo) => (
            <figure
              key={photo.caption}
              data-motion-reveal
              className={`motion-card overflow-hidden rounded-lg border border-[var(--tc-border)] bg-card shadow-soft ${photo.theme}`}
            >
              <img
                src={photo.src}
                alt={photo.alt}
                loading="lazy"
                width={1200}
                height={900}
                className="motion-image-target h-56 w-full object-cover"
              />
              <figcaption className="border-t-2 border-[var(--tc-border)] px-5 py-4 text-sm font-medium text-[var(--tc)]">
                {photo.caption}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="bg-primary-soft/60 py-16">
        <div className="section-shell max-w-3xl text-center">
          <p className="eyebrow">Thank you</p>
          <h2 className="mt-3 text-3xl font-semibold md:text-4xl">
            To every group that trusted us with their work
          </h2>
          <p className="mt-4 text-muted-foreground">
            To the six groups of 5-10 AB: thank you for trusting us with your work. The web committee only built the shelves; the substance on them belongs entirely to you. We built this archive to ensure your efforts remain accessible and preserved for the batches that follow.
          </p>
        </div>
      </section>
    </PageLayout>
  );
}
