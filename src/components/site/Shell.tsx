import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { contact } from "@/content/site";
import { BrandLockup, BrandLogo } from "@/components/site/BrandLogo";
import { CursorGlow } from "@/components/effects/CursorGlow";
import {
  RevealWords,
  SynapseDivider,
} from "@/components/effects/MotionGraphics";
import { MagneticLink } from "@/components/site/ui";
import {
  publishMotionState,
  setMotionToggle,
  useMotionToggle,
  useReducedMotion,
} from "@/lib/motion";

const nav = [
  { to: "/munkak", label: "Munkáim" },
  { to: "/szolgaltatasok", label: "Szolgáltatások" },
  { to: "/rolam", label: "Rólam" },
] as const;

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });
  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    let last = window.scrollY;
    let raf = 0;
    const update = () => {
      raf = 0;
      const y = window.scrollY;
      setScrolled(y > 40);
      setHidden(y > last && y > 400);
      last = y;
    };
    const on = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", on, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", on);
    };
  }, []);
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) =>
      event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);
  return (
    <header
      className={cn(
        "site-header",
        hidden && !open && "is-hidden",
        (scrolled || open) && "is-solid",
        open && "is-open",
      )}
    >
      <div className="site-header__bar">
        <Link
          to="/"
          aria-label="GátAi studio – főoldal"
          className="site-header__logo"
        >
          <BrandLogo decorative className="block h-auto w-full" />
        </Link>
        <nav aria-label="Fő navigáció" className="site-nav">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="site-nav__link"
              activeProps={{ "aria-current": "page" }}
            >
              <span>{n.label}</span>
              <i aria-hidden="true" />
            </Link>
          ))}
          <MagneticLink to="/kapcsolat" className="btn--sm">
            Projekt indítása
          </MagneticLink>
        </nav>
        <button
          type="button"
          aria-label={open ? "Menü bezárása" : "Menü megnyitása"}
          aria-controls="mobile-nav"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
          className="site-header__burger"
        >
          <span className={cn(open && "translate-y-[3.5px] rotate-45")} />
          <span className={cn(open && "-translate-y-[3.5px] -rotate-45")} />
        </button>
      </div>
      {open && (
        <nav id="mobile-nav" aria-label="Mobil menü" className="mobile-nav">
          {[...nav, { to: "/kapcsolat", label: "Kapcsolat" } as const].map(
            (n, i) => (
              <Link
                key={n.to}
                to={n.to}
                className="mobile-nav__link"
                style={{ animationDelay: `${60 + i * 60}ms` }}
                activeProps={{ "aria-current": "page" }}
              >
                <span className="mobile-nav__index">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {n.label}
              </Link>
            ),
          )}
          <p className="mobile-nav__meta">
            <a href={`mailto:${contact.email}`}>{contact.email}</a>
            <span>{contact.location}</span>
          </p>
        </nav>
      )}
    </header>
  );
}

function MotionSwitch() {
  const on = useMotionToggle();
  const reduced = useReducedMotion();
  if (reduced)
    return (
      <p className="text-xs text-muted-foreground">
        Animációk: a rendszer csökkentett mozgás beállítása szerint kikapcsolva.
      </p>
    );
  return (
    <button
      type="button"
      className="footer-switch"
      onClick={() => setMotionToggle(!on)}
      aria-pressed={!on}
    >
      <span className="footer-switch__track" aria-hidden="true">
        <span />
      </span>
      Animációk kikapcsolása
    </button>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <SynapseDivider label="Kapcsolat" />
      <div className="mx-auto max-w-[1440px] px-5 pt-16 pb-8 md:px-10 md:pt-24">
        <p className="eyebrow">Van egy ötleted?</p>
        <Link to="/kapcsolat" className="footer-cta group mt-6 block">
          <RevealWords
            as="span"
            text="Beszéljünk."
            className="footer-cta__text"
          />
          <span className="footer-cta__arrow" aria-hidden="true">
            ↗
          </span>
        </Link>
        <div className="mt-16 grid gap-10 text-sm text-muted-foreground sm:grid-cols-2 md:grid-cols-4">
          <div>
            <p className="eyebrow mb-3">Email</p>
            <a
              href={`mailto:${contact.email}`}
              className="link-underline text-foreground"
            >
              {contact.email}
            </a>
            <p className="mt-2 text-xs">
              Az ajánlatkérés a kapcsolati űrlapon a legbiztosabb.
            </p>
          </div>
          <div>
            <p className="eyebrow mb-3">Helyszín</p>
            <p className="text-foreground">{contact.location}</p>
          </div>
          <div>
            <p className="eyebrow mb-3">Oldalak</p>
            <div className="flex flex-col gap-1.5">
              {nav.map((n) => (
                <Link
                  key={n.to}
                  to={n.to}
                  className="link-underline w-fit hover:text-foreground"
                >
                  {n.label}
                </Link>
              ))}
              <Link
                to="/kapcsolat"
                className="link-underline w-fit hover:text-foreground"
              >
                Projekt indítása
              </Link>
              <Link
                to="/adatvedelem"
                className="link-underline w-fit hover:text-foreground"
              >
                Adatvédelem
              </Link>
            </div>
          </div>
          <div className="md:text-right">
            <p className="font-display text-foreground">
              Design. Technology. Intelligence.
            </p>
            <div className="mt-4 md:flex md:justify-end">
              <MotionSwitch />
            </div>
          </div>
        </div>
        <div className="mt-16 flex flex-col gap-6 border-t pt-8 sm:flex-row sm:items-end sm:justify-between">
          <Link
            to="/"
            aria-label="GátAi studio – főoldal"
            className="block w-64 max-w-full md:w-80"
          >
            <BrandLockup decorative className="block h-auto w-full" />
          </Link>
          <p className="font-mono text-xs text-muted-foreground">
            © {new Date().getFullYear()} GátAi studio — Gátai Bence
          </p>
        </div>
      </div>
    </footer>
  );
}

export function Shell({ children }: { children: ReactNode }) {
  useEffect(() => publishMotionState(), []);
  return (
    <div className="grain min-h-screen">
      <a href="#main" className="skip-link">
        Ugrás a tartalomra
      </a>
      <Nav />
      <main id="main">{children}</main>
      <Footer />
      <CursorGlow />
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  intro,
  accent,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  /** Words of the title rendered in azure. */
  accent?: readonly string[];
}) {
  return (
    <section className="page-header">
      <div className="page-header__inner">
        <p className="eyebrow reveal flex items-center gap-3">
          <span className="eyebrow-node" aria-hidden="true" />
          {eyebrow}
        </p>
        <RevealWords
          as="h1"
          text={title}
          accent={accent}
          className="page-header__title"
        />
        {intro && <p className="reveal page-header__intro">{intro}</p>}
      </div>
      <SynapseDivider className="mt-16 md:mt-24" />
    </section>
  );
}
