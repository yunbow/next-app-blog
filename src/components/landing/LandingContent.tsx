"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from "@/lib/i18n";
import {
  BellRing,
  Bookmark,
  ChartNoAxesColumnIncreasing,
  CheckCircle2,
  DollarSign,
  FileText,
  MessageCircle,
  Search,
  Send,
  Tags,
} from "lucide-react";

export function LandingContent() {
  const { t } = useTranslations();

  const featureItems = [
    {
      icon: FileText,
      title: t("landing.features.markdown.title"),
      description: t("landing.features.markdown.description"),
    },
    {
      icon: Search,
      title: t("landing.features.share.title"),
      description: t("landing.features.share.description"),
    },
    {
      icon: DollarSign,
      title: t("landing.features.monetize.title"),
      description: t("landing.features.monetize.description"),
    },
    {
      icon: MessageCircle,
      title: t("landing.features.audience.title"),
      description: t("landing.features.audience.description"),
    },
    {
      icon: Bookmark,
      title: t("landing.features.organize.title"),
      description: t("landing.features.organize.description"),
    },
    {
      icon: BellRing,
      title: t("landing.features.notify.title"),
      description: t("landing.features.notify.description"),
    },
  ];

  const workflowItems = [
    {
      label: t("landing.workflow.draft.label"),
      icon: FileText,
      title: t("landing.workflow.draft.title"),
      description: t("landing.workflow.draft.description"),
    },
    {
      label: t("landing.workflow.publish.label"),
      icon: Send,
      title: t("landing.workflow.publish.title"),
      description: t("landing.workflow.publish.description"),
    },
    {
      label: t("landing.workflow.learn.label"),
      icon: ChartNoAxesColumnIncreasing,
      title: t("landing.workflow.learn.title"),
      description: t("landing.workflow.learn.description"),
    },
  ];

  return (
    <div className="flex flex-col">
      <section className="relative isolate min-h-[calc(72svh-4rem)] overflow-hidden px-4 py-10 md:min-h-[calc(88svh-4rem)] md:py-16">
        <Image
          src="/landing-hero.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="absolute inset-0 -z-20 object-cover object-center"
        />
        <div className="absolute inset-0 -z-10 bg-background/82" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,var(--background)_0%,color-mix(in_oklch,var(--background)_88%,transparent)_42%,transparent_78%)]" />

        <div className="container mx-auto flex min-h-[calc(72svh-8rem)] max-w-6xl items-center md:min-h-[calc(88svh-10rem)]">
          <div className="max-w-2xl space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border bg-background/80 px-3 py-1 text-sm font-medium text-muted-foreground shadow-sm backdrop-blur">
              <CheckCircle2 className="size-4 text-primary" aria-hidden="true" />
              <span>{t("landing.hero.kicker")}</span>
            </div>

            <div className="space-y-5">
              <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-6xl">
                {t("landing.hero.title")}
              </h1>
              <p className="max-w-xl text-lg leading-8 text-muted-foreground md:text-xl">
                {t("landing.hero.subtitle")}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/register">
                <Button size="lg" className="w-full px-8 text-base sm:w-auto">
                  {t("landing.hero.cta")}
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="w-full px-8 text-base sm:w-auto">
                  {t("landing.hero.secondaryCta")}
                </Button>
              </Link>
            </div>

            <dl className="hidden max-w-xl grid-cols-3 gap-3 sm:grid">
              <div className="rounded-lg border bg-background/78 p-4 shadow-sm backdrop-blur">
                <dt className="text-sm text-muted-foreground">{t("landing.hero.statArticlesLabel")}</dt>
                <dd className="mt-1 font-semibold">{t("landing.hero.statArticles")}</dd>
              </div>
              <div className="rounded-lg border bg-background/78 p-4 shadow-sm backdrop-blur">
                <dt className="text-sm text-muted-foreground">{t("landing.hero.statModesLabel")}</dt>
                <dd className="mt-1 font-semibold">{t("landing.hero.statModes")}</dd>
              </div>
              <div className="rounded-lg border bg-background/78 p-4 shadow-sm backdrop-blur">
                <dt className="text-sm text-muted-foreground">{t("landing.hero.statSignalsLabel")}</dt>
                <dd className="mt-1 font-semibold">{t("landing.hero.statSignals")}</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <section className="border-y bg-muted/25 px-4 py-16 md:py-20">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-10 max-w-2xl space-y-3">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              {t("landing.features.title")}
            </h2>
            <p className="text-muted-foreground md:text-lg">
              {t("landing.features.subtitle")}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {featureItems.map((item) => (
              <Card key={item.title} className="rounded-lg shadow-none">
                <CardHeader className="gap-4">
                  <div className="flex size-11 items-center justify-center rounded-lg bg-primary/10" aria-hidden="true">
                    <item.icon className="size-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-6 text-muted-foreground">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 md:py-20">
        <div className="container mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              <Tags className="size-4" aria-hidden="true" />
              <span>{t("landing.workflow.kicker")}</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              {t("landing.workflow.title")}
            </h2>
            <p className="text-muted-foreground md:text-lg">
              {t("landing.workflow.subtitle")}
            </p>
          </div>

          <div className="grid gap-4">
            {workflowItems.map((item) => (
              <div
                key={item.label}
                className="grid gap-4 rounded-lg border bg-background p-5 shadow-sm sm:grid-cols-[auto_1fr]"
              >
                <div className="flex items-center gap-3 sm:flex-col sm:items-start">
                  <span className="text-sm font-semibold text-primary">{item.label}</span>
                  <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground" aria-hidden="true">
                    <item.icon className="size-5" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="text-sm leading-6 text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-16 md:pb-20">
        <div className="container mx-auto max-w-6xl rounded-lg border bg-foreground px-6 py-10 text-background md:px-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl space-y-3">
              <h2 className="text-3xl font-bold tracking-tight">
                {t("landing.cta.title")}
              </h2>
              <p className="text-background/72">
                {t("landing.cta.description")}
              </p>
            </div>
            <Link href="/register">
              <Button size="lg" variant="secondary" className="w-full px-8 text-base md:w-auto">
                {t("landing.hero.cta")}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
