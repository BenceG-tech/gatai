import { NodeIcon, type NodeIconName } from "@/components/effects/NodeIcon";
import { Eyebrow } from "@/components/site/ui";
import { imagine } from "@/content/site";

/*
 * "Képzeld el": a pinned, scroll-scrubbed horizontal day in the life of a
 * business that runs on its own. Pure CSS (a named view timeline drives the
 * track, a parallax "24/7" layer and the progress beam); without scroll-driven
 * animation support, with reduced motion or the motion toggle off it becomes a
 * plain vertical list.
 */
export function ImagineDay() {
  return (
    <section
      className="imagine"
      data-formation="flow"
      aria-labelledby="imagine-title"
    >
      <div className="imagine__pin">
        <span className="imagine__ghost" aria-hidden="true">
          24/7
        </span>
        <header className="imagine__head">
          <Eyebrow n="02">Képzeld el</Eyebrow>
          <h2 id="imagine-title" className="section-title mt-6 max-w-4xl">
            Egy nap, amikor a vállalkozásod{" "}
            <span className="text-primary">magától működik.</span>
          </h2>
        </header>
        <ol className="imagine__track">
          {imagine.map((scene, i) => (
            <li key={scene.time} className="imagine__card">
              <div className="flex items-center justify-between">
                <span className="imagine__time font-mono">{scene.time}</span>
                <NodeIcon
                  name={scene.icon as NodeIconName}
                  className="h-12 w-12"
                />
              </div>
              <h3 className="font-display mt-10 text-2xl leading-tight font-semibold md:text-3xl">
                {scene.title}
              </h3>
              <p className="mt-4 text-muted-foreground">{scene.text}</p>
              <span className="imagine__index font-mono" aria-hidden="true">
                {String(i + 1).padStart(2, "0")} /{" "}
                {String(imagine.length).padStart(2, "0")}
              </span>
            </li>
          ))}
          <li className="imagine__card imagine__card--end">
            <p className="font-display text-3xl leading-tight font-semibold md:text-4xl">
              Ehhez nem kell nagyvállalatnak lenned.{" "}
              <span className="text-primary">Csak egy jó tervnek.</span>
            </p>
            <a href="#idea-title" className="btn btn--ghost mt-10 w-fit">
              Mutasd, mi lenne az enyém ↓
            </a>
          </li>
        </ol>
        <div className="imagine__progress" aria-hidden="true">
          <span />
        </div>
      </div>
    </section>
  );
}
