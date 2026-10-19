import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { contact } from "@/content/site";
import { BrandLogo } from "@/components/site/BrandLogo";

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
    let last = 0;
    const on = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
      setHidden(y > last && y > 300);
      last = y;
    };
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        hidden && !open ? "-translate-y-full" : "translate-y-0",
        scrolled || open ? "bg-background/80 backdrop-blur-md border-b" : "",
      )}
    >
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-5 md:px-10">
        <Link to="/" aria-label="GátAi studio – főoldal" className="block w-[148px] shrink-0 md:w-[172px]">
          <BrandLogo variant="flat" className="block w-full" />
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          {nav.map((n) => (
            <Link key={n.to} to={n.to} className="eyebrow transition-colors hover:text-foreground" activeProps={{ className: "text-foreground" }}>
              {n.label}
            </Link>
          ))}
          <Link to="/kapcsolat" className="rounded-full bg-primary px-4 py-2 text-xs font-medium text-primary-foreground transition-colors hover:bg-foreground">
            Projekt indítása
          </Link>
        </nav>
        <button aria-label={open ? "Menü bezárása" : "Menü megnyitása"} aria-controls="mobile-nav" aria-expanded={open} onClick={() => setOpen(!open)} className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 md:hidden">
          <span className={cn("h-px w-6 bg-foreground transition-transform", open && "translate-y-[3.5px] rotate-45")} />
          <span className={cn("h-px w-6 bg-foreground transition-transform", open && "-translate-y-[3.5px] -rotate-45")} />
        </button>
      </div>
      {open && (
        <nav id="mobile-nav" aria-label="Mobil menü" className="flex min-h-[calc(100svh-4rem)] flex-col gap-3 px-5 pt-6 pb-10 md:hidden">
          {[...nav, { to: "/kapcsolat", label: "Kapcsolat" } as const].map((n) => (
            <Link key={n.to} to={n.to} className="font-display text-4xl font-semibold transition-colors hover:text-primary" activeProps={{ className: "text-primary" }}>
              {n.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}

function Footer() {
  return (
    <footer className="relative z-10 overflow-hidden border-t bg-background px-5 pt-20 pb-8 md:px-10">
      <div className="mx-auto max-w-[1440px]">
        <p className="eyebrow">Van egy ötleted?</p>
        <Link to="/kapcsolat" className="group mt-6 block">
          <span className="font-display block text-[15vw] font-bold leading-[0.85] transition-colors duration-500 group-hover:text-primary md:text-[11vw]">
            Beszéljünk.
          </span>
        </Link>
        <div className="mt-16 grid gap-8 text-sm text-muted-foreground md:grid-cols-4">
          <div>
            <p className="eyebrow mb-2">Email</p>
            <a href={`mailto:${contact.email}`} className="text-foreground hover:text-primary">{contact.email}</a>
            <p className="mt-1 text-xs">Az ajánlatkérés a kapcsolati űrlapon a legbiztosabb.</p>
          </div>
          <div>
            <p className="eyebrow mb-2">Helyszín</p>
            <p className="text-foreground">{contact.location}</p>
          </div>
          <div>
            <p className="eyebrow mb-2">Oldalak</p>
            <div className="flex flex-col gap-1">
              {nav.map((n) => <Link key={n.to} to={n.to} className="hover:text-foreground">{n.label}</Link>)}
            </div>
          </div>
          <div className="md:text-right">
            <p className="text-foreground">Design. Technology. Intelligence.</p>
            <Link to="/kapcsolat" className="mt-2 block hover:text-foreground">Projekt indítása</Link>
            <Link to="/adatvedelem" className="mt-1 inline-block hover:text-foreground">Adatvédelem</Link>
          </div>
        </div>
        <div className="mt-16 flex flex-col gap-6 border-t pt-8 sm:flex-row sm:items-end sm:justify-between">
          <Link to="/" aria-label="GátAi studio – főoldal" className="block w-48"><BrandLogo variant="flat" className="block w-full" /></Link>
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} GátAi studio — Gátai Bence</p>
        </div>
      </div>
    </footer>
  );
}

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="grain min-h-screen">
      <Nav />
      <main>{children}</main>
      <Footer />
    </div>
  );
}

export function PageHeader({ eyebrow, title, intro }: { eyebrow: string; title: ReactNode; intro?: string }) {
  return (
    <section className="mx-auto max-w-[1440px] px-5 pt-36 pb-16 md:px-10 md:pt-48">
      <p className="eyebrow reveal">{eyebrow}</p>
      <h1 className="font-display reveal mt-6 text-5xl font-bold leading-[0.9] md:text-8xl">{title}</h1>
      {intro && <p className="reveal mt-8 max-w-xl text-lg text-muted-foreground">{intro}</p>}
    </section>
  );
}
