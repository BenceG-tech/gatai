import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type Flow = { key: string; label: string; input: string; manual: { t: string; min: string }[]; ai: string[] };

// Illustrative only — durations describe a typical manual process, not measured client results.
const flows: Flow[] = [
  {
    key: "lead", label: "Új érdeklődő", input: "„Szia! Webshopot szeretnénk, kb. 2 hónapon belül.”",
    manual: [{ t: "Email elolvasása, továbbítás", min: "kézi" }, { t: "Kategória és prioritás eldöntése", min: "kézi" }, { t: "Válasz megírása nulláról", min: "kézi" }, { t: "Táblázatba másolás", min: "kézi" }],
    ai: ["Beérkezés (űrlap / email)", "Besorolás: Webshop · sürgős", "Válaszvázlat jóváhagyásra", "CRM-bejegyzés + emlékeztető"],
  },
  {
    key: "booking", label: "Időpontfoglalás", input: "„Csütörtök délutánra kérnék időpontot hajvágásra.”",
    manual: [{ t: "Telefon / üzenet fogadása", min: "kézi" }, { t: "Naptár átnézése", min: "kézi" }, { t: "Visszaírás, egyeztetés", min: "kézi" }, { t: "Papírra / naptárba rögzítés", min: "kézi" }],
    ai: ["Szabad idősávok lekérdezése", "Munkatárs hozzárendelése", "Visszaigazolás küldése", "Naptár frissítése"],
  },
  {
    key: "docs", label: "Számlafeldolgozás", input: "invoice_0412.pdf",
    manual: [{ t: "PDF megnyitása", min: "kézi" }, { t: "Adatok begépelése", min: "kézi" }, { t: "Ellenőrzés szemmel", min: "kézi" }, { t: "Feltöltés a könyvelésbe", min: "kézi" }],
    ai: ["Dokumentum beolvasása", "Összeg, partner, dátum kinyerése", "Szabályalapú ellenőrzés", "Könyvelési rendszerbe küldés"],
  },
];

export function AIShowcase() {
  const [i, setI] = useState(0);
  const [mode, setMode] = useState<"manual" | "ai">("ai");
  const [step, setStep] = useState(0);
  const [run, setRun] = useState(0);
  const f = flows[i]!;
  const steps = mode === "ai" ? f.ai : f.manual.map((m) => m.t);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return void setStep(steps.length);
    setStep(0);
    const t = setInterval(() => setStep((s) => (s < steps.length ? s + 1 : s)), mode === "ai" ? 650 : 1300);
    return () => clearInterval(t);
  }, [i, mode, run, steps.length]);

  const done = step >= steps.length;
  return (
    <div className="grid gap-10 md:grid-cols-12">
      <div className="md:col-span-4">
        <p className="eyebrow mb-4">Folyamat</p>
        <div role="tablist" aria-label="Minta folyamatok" className="flex flex-wrap gap-2 md:flex-col">
          {flows.map((x, k) => (
            <button key={x.key} role="tab" aria-selected={k === i} onClick={() => setI(k)}
              className={cn("rounded-full border px-5 py-3 text-left text-sm transition-colors", k === i ? "border-primary text-primary" : "text-muted-foreground hover:text-foreground")}>
              {x.label}
            </button>
          ))}
        </div>
        <p className="eyebrow mt-10 mb-4">Mód</p>
        <div className="inline-flex rounded-full border p-1" role="group" aria-label="Kézi vagy AI folyamat">
          {(["manual", "ai"] as const).map((m) => (
            <button key={m} aria-pressed={mode === m} onClick={() => setMode(m)}
              className={cn("rounded-full px-5 py-2 text-sm transition-colors", mode === m ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>
              {m === "manual" ? "Kézi" : "AI-val"}
            </button>
          ))}
        </div>
        <p className="mt-8 text-xs text-muted-foreground">Interaktív szemléltető demó — nem valós ügyféladat és nem élő automatizáció.</p>
      </div>

      <div className="relative overflow-hidden border bg-card p-6 font-mono text-sm md:col-span-8 md:p-10">
        <div className="flex items-start justify-between gap-4">
          <div><p className="eyebrow">Bemenet</p><p className="mt-2 text-foreground">{f.input}</p></div>
          <button onClick={() => setRun((r) => r + 1)} className="eyebrow shrink-0 rounded-full border px-3 py-2 hover:text-foreground">↻ Újra</button>
        </div>
        <ol className="relative mt-10 space-y-6 pl-8" aria-live="polite">
          <span aria-hidden className="absolute top-1 bottom-1 left-[5px] w-px bg-border" />
          <span aria-hidden className={cn("absolute top-1 left-[5px] w-px transition-[height] duration-700 ease-out", mode === "ai" ? "bg-primary shadow-[0_0_12px_var(--primary)]" : "bg-muted-foreground")}
            style={{ height: `${(Math.min(step, steps.length) / steps.length) * 100}%` }} />
          {steps.map((s, k) => (
            <li key={mode + s} className={cn("relative flex items-center justify-between gap-4 transition-all duration-500", k < step ? "opacity-100" : "translate-x-2 opacity-20")}>
              <span aria-hidden className={cn("absolute -left-8 h-[11px] w-[11px] rounded-full border-2 border-card", k < step ? (mode === "ai" ? "bg-primary" : "bg-muted-foreground") : "bg-border")} />
              <span>{s}</span>
              {mode === "manual" && <span className="eyebrow shrink-0">ember</span>}
              {mode === "ai" && <span className="eyebrow shrink-0 text-primary">auto</span>}
            </li>
          ))}
        </ol>
        <p className={cn("mt-10 transition-opacity", done ? "opacity-100" : "opacity-0", mode === "ai" ? "text-primary" : "text-muted-foreground")}>
          {mode === "ai" ? "✓ Kész — csak a jóváhagyás marad emberi feladat." : "Kész — minden lépés kézi munkát igényelt."}
        </p>
      </div>
    </div>
  );
}
