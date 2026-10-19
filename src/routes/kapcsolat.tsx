import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { submitLead } from "@/lib/leads.functions";
import { PageHeader } from "@/components/site/Shell";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/kapcsolat")({
  head: () => ({
    meta: [
      { title: "Projekt indítása — GátAi studio" },
      { name: "description", content: "Mesélj a projektedről: weboldal, alkalmazás, AI vagy üzleti rendszer. A kérésed biztonságosan elmentődik." },
      { property: "og:title", content: "Projekt indítása — GátAi studio" },
      { property: "og:description", content: "Beszéljünk a projektedről." },
    ],
  }),
  component: Contact,
});

type Q = { key: string; q: string; options?: string[]; multi?: boolean; optional?: boolean; text?: boolean };
const questions: Q[] = [
  { key: "need", q: "Miben van szükséged segítségre?", options: ["Weboldal", "Alkalmazás", "AI / automatizáció", "Üzleti rendszer", "Márka / design", "Még nem tudom"], multi: true },
  { key: "business", q: "Mi a vállalkozásod vagy ötleted?", text: true },
  { key: "goal", q: "Mi az elsődleges üzleti célod?", options: ["Több ügyfél", "Hatékonyabb működés", "Új termék indítása", "Erősebb márka"] },
  { key: "existing", q: "Van már meglévő rendszered vagy weboldalad?", options: ["Igen", "Nem", "Részben"] },
  { key: "timeline", q: "Milyen időtávon szeretnél indulni?", options: ["Azonnal", "1–3 hónap", "3+ hónap", "Csak tájékozódom"] },
  { key: "budget", q: "Milyen nagyságrendű kerettel számolsz?", options: ["< 500e Ft", "500e – 1,5M Ft", "1,5M – 5M Ft", "5M Ft +", "Nem tudom még"], optional: true },
];

function Contact() {
  const [step, setStep] = useState(0);
  const [a, setA] = useState<Record<string, string | string[]>>({});
  const [who, setWho] = useState({ name: "", email: "", consent: false, website: "" });
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const send = useServerFn(submitLead);
  const total = questions.length + 1;
  const cur = questions[step];

  const pick = (q: Q, o: string) => {
    if (q.multi) {
      const arr = (a[q.key] as string[]) ?? [];
      setA({ ...a, [q.key]: arr.includes(o) ? arr.filter((x) => x !== o) : [...arr, o] });
    } else {
      setA({ ...a, [q.key]: o });
      setTimeout(() => setStep((s) => s + 1), 200);
    }
  };
  const answered = cur ? cur.optional || (Array.isArray(a[cur.key]) ? (a[cur.key] as string[]).length > 0 : !!a[cur.key]) : true;
  const emailOk = /^\S+@\S+\.\S+$/.test(who.email);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!who.name.trim() || !emailOk || !who.consent || pending) return;
    setPending(true);
    setError(null);
    const one = (k: string) => (typeof a[k] === "string" ? (a[k] as string) : undefined);
    try {
      const res = await send({
        data: {
          name: who.name, email: who.email, consent: true, website: who.website,
          needs: (a['need'] as string[]) ?? [], business: one("business") ?? "",
          goal: one("goal"), existing: one("existing"), timeline: one("timeline"), budget: one("budget"),
        },
      });
      if (res.ok) setSent(true);
      else setError(res.error);
    } catch {
      setError("Hálózati hiba — a kérés nem lett elmentve. Próbáld újra.");
    } finally {
      setPending(false);
    }
  };

  return (
    <>
      <PageHeader eyebrow="Projektindítás" title={<>Beszéljünk a<br /><span className="text-primary">projektedről.</span></>} />
      <section className="mx-auto max-w-[1100px] px-5 pb-32 md:px-10">
        <div className="mb-10 flex items-center gap-4">
          <span className="eyebrow">{String(Math.min(step + 1, total)).padStart(2, "0")} / {String(total).padStart(2, "0")}</span>
          <div className="h-px flex-1 bg-border">
            <div className="h-px bg-primary transition-all duration-500" style={{ width: `${((step + (sent ? 1 : 0)) / total) * 100}%` }} />
          </div>
        </div>

        {sent ? (
          <div className="py-10">
            <h2 className="font-display text-4xl font-bold md:text-6xl">Köszönöm!</h2>
            <p className="mt-4 max-w-xl text-muted-foreground">A kérésed elmentettem. Átnézem a válaszaidat, és a megadott email címen jelentkezem.</p>
            <div className="mt-10 flex flex-wrap gap-6"><Link to="/munkak" className="eyebrow text-foreground hover:text-primary">Munkáim megtekintése →</Link><Link to="/" className="eyebrow hover:text-foreground">Vissza a főoldalra</Link></div>
          </div>
        ) : cur ? (
          <div key={cur.key} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="font-display text-3xl font-bold md:text-5xl">
              {cur.q} {cur.optional && <span className="text-base font-normal text-muted-foreground">(opcionális)</span>}
            </h2>
            {cur.text ? (
              <textarea
                value={(a[cur.key] as string) ?? ""}
                onChange={(e) => setA({ ...a, [cur.key]: e.target.value.slice(0, 1000) })}
                rows={4}
                maxLength={1000}
                placeholder="Pár mondatban…"
                className="mt-10 w-full border-b bg-transparent py-4 text-xl outline-none placeholder:text-muted-foreground focus:border-primary"
              />
            ) : (
              <div className="mt-10 flex flex-wrap gap-3">
                {cur.options!.map((o) => {
                  const on = [a[cur.key]].flat().includes(o);
                  return (
                    <button key={o} type="button" onClick={() => pick(cur, o)} className={cn("rounded-full border px-6 py-4 text-sm transition-all", on ? "border-primary bg-primary text-primary-foreground" : "hover:border-foreground")}>
                      {o}
                    </button>
                  );
                })}
              </div>
            )}
            <div className="mt-12 flex justify-between">
              <button type="button" disabled={step === 0} onClick={() => setStep(step - 1)} className="eyebrow disabled:opacity-30">← Vissza</button>
              <button type="button" disabled={!answered} onClick={() => setStep(step + 1)} className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground disabled:opacity-30">
                Tovább →
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="relative animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="font-display text-3xl font-bold md:text-5xl">Hogyan tudlak elérni?</h2>
            <div className="mt-10 grid gap-8 md:grid-cols-2">
              <input required aria-label="Neved" autoComplete="name" maxLength={100} value={who.name} onChange={(e) => setWho({ ...who, name: e.target.value })} placeholder="Neved" className="border-b bg-transparent py-4 text-xl outline-none placeholder:text-muted-foreground focus:border-primary" />
              <input required aria-label="Email címed" autoComplete="email" type="email" maxLength={255} value={who.email} onChange={(e) => setWho({ ...who, email: e.target.value })} placeholder="Email címed" className="border-b bg-transparent py-4 text-xl outline-none placeholder:text-muted-foreground focus:border-primary" />
            </div>
            <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
              <label>Weboldal<input tabIndex={-1} autoComplete="off" value={who.website} onChange={(e) => setWho({ ...who, website: e.target.value })} /></label>
            </div>
            <label className="mt-8 flex items-start gap-3 text-sm text-muted-foreground">
              <input type="checkbox" checked={who.consent} onChange={(e) => setWho({ ...who, consent: e.target.checked })} className="mt-1 accent-primary" />
              <span>Hozzájárulok, hogy a megadott adataimat (név, email, válaszok) a GátAi studio a megkeresésem megválaszolására tárolja és kezelje. Részletek az <Link to="/adatvedelem" className="text-foreground underline">adatvédelmi tájékoztatóban</Link>; a törlést bármikor kérheted.</span>
            </label>
            {error && (
              <p role="alert" className="mt-8 border-l-2 border-destructive pl-4 text-sm text-destructive">{error}</p>
            )}
            <div className="mt-12 flex justify-between">
              <button type="button" onClick={() => setStep(step - 1)} className="eyebrow">← Vissza</button>
              <button type="submit" aria-busy={pending} disabled={pending || !who.name.trim() || !emailOk || !who.consent} className="rounded-full bg-primary px-8 py-4 text-sm font-medium text-primary-foreground disabled:opacity-30">
                {pending ? "Küldés folyamatban…" : "Küldés →"}
              </button>
            </div>
          </form>
        )}
      </section>
    </>
  );
}
