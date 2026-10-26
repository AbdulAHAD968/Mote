import Link from "next/link";
import { ExampleCard, HeroDemo } from "@/components/ExampleParticles";
import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/JsonLd";
import { Nav } from "@/components/Nav";
import { EXAMPLES } from "@/lib/examples";
import { FAQ, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

const STEPS = [
  {
    title: "Upload an image",
    body: "Drop in a PNG, JPG, WebP, GIF or SVG. Transparent or plain backgrounds give the cleanest shapes. Nothing leaves your device.",
  },
  {
    title: "Pick an animation",
    body: "Choose from ten animations, from Assemble to Sparkle, then tune the particle count, size and color while you watch it live.",
  },
  {
    title: "Export the code",
    body: "Copy or download a single HTML file or a React component. The particle data is baked in, and only three.js is needed to run it.",
  },
];

const SNIPPET = `import MoteParticles from "./MoteParticles";

export default function Hero() {
  return (
    <section style={{ height: 480 }}>
      <MoteParticles />
    </section>
  );
}`;

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": `${SITE_URL}/#app`,
      name: SITE_NAME,
      url: SITE_URL,
      description: SITE_DESCRIPTION,
      applicationCategory: "DesignApplication",
      operatingSystem: "Any (modern web browser with WebGL)",
      browserRequirements: "Requires WebGL and JavaScript",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      featureList: [
        "Convert any image to 3D particles in the browser",
        "Ten animations including Assemble, Wave, Swirl, Repel and Magnet",
        "Export as standalone HTML or a React component",
        "No upload: images never leave the device",
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: FAQ.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
    {
      "@type": "HowTo",
      name: "How to turn an image into animated particles",
      step: STEPS.map((s, i) => ({
        "@type": "HowToStep",
        position: i + 1,
        name: s.title,
        text: s.body,
      })),
    },
  ],
};

export default function Home() {
  return (
    <>
      <JsonLd data={jsonLd} />
      <Nav />
      <main>
        {/* Hero - cream */}
        <section className="mx-auto grid max-w-[1200px] grid-cols-1 items-center gap-12 px-5 py-16 md:py-24 lg:grid-cols-2">
          <div>
            <span className="badge-pill">Free · Runs in your browser</span>
            <h1 className="display-xl mt-6">Turn any image into particles.</h1>
            <p className="mt-6 max-w-[34rem] text-lg text-body-strong">
              Upload a picture, watch it break into thousands of animated 3D particles, then export
              the code for your own site. No sign-up, no upload.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/studio" className="btn btn-primary">Upload an image</Link>
              <Link href="#examples" className="btn btn-secondary">See examples</Link>
            </div>
          </div>
          <HeroDemo />
        </section>

        {/* Examples - soft cream band with cream cards */}
        <section id="examples" className="bg-surface-soft py-16 md:py-24">
          <div className="mx-auto max-w-[1200px] px-5">
            <p className="caption-uppercase text-primary">Examples</p>
            <h2 className="display-lg mt-3 max-w-2xl">From pixels to particles.</h2>
            <p className="mt-4 max-w-xl text-body">
              Every example below is a plain image converted live in your browser. Move your cursor
              over the Rings to push the particles around.
            </p>
            <div className="mt-12 grid gap-6 md:grid-cols-2">
              {EXAMPLES.map((e) => (
                <ExampleCard key={e.id} id={e.id} />
              ))}
            </div>
          </div>
        </section>

        {/* How it works - dark */}
        <section id="how-it-works" className="bg-surface-dark py-16 md:py-24">
          <div className="mx-auto grid max-w-[1200px] grid-cols-1 items-center gap-12 px-5 lg:grid-cols-2">
            <div>
              <p className="caption-uppercase text-accent-amber">How it works</p>
              <h2 className="display-lg mt-3 !text-on-dark">Three steps, one file.</h2>
              <ol className="mt-10 space-y-8">
                {STEPS.map((s, i) => (
                  <li key={s.title} className="flex gap-5">
                    <span className="font-display text-4xl leading-none text-primary">{i + 1}</span>
                    <div>
                      <h3 className="m-0 text-lg font-medium text-on-dark">{s.title}</h3>
                      <p className="mt-1 text-on-dark-soft">{s.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
            <div className="rounded-lg bg-surface-dark-elevated p-6">
              <div className="flex items-center justify-between text-xs text-on-dark-soft">
                <span className="font-mono">Hero.jsx</span>
                <span className="font-mono">React</span>
              </div>
              <pre className="mt-4 overflow-x-auto rounded-md bg-surface-dark-soft p-5 font-mono text-sm leading-relaxed text-on-dark">
                <code>{SNIPPET}</code>
              </pre>
              <p className="mt-4 text-sm text-on-dark-soft">
                Drop the exported component into any React or Next.js project.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ - cream */}
        <section id="faq" className="mx-auto max-w-[800px] px-5 py-16 md:py-24">
          <p className="caption-uppercase text-primary">FAQ</p>
          <h2 className="display-lg mt-3">Questions, answered.</h2>
          <div className="mt-10 border-t border-hairline">
            {FAQ.map((f) => (
              <details key={f.q} className="group border-b border-hairline py-5">
                <summary className="flex items-center justify-between gap-4 text-lg font-medium text-ink">
                  {f.q}
                  <span aria-hidden="true" className="text-2xl leading-none text-primary group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-body">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* CTA - coral callout */}
        <section className="mx-auto max-w-[1200px] px-5 pb-16 md:pb-24">
          <div className="rounded-lg bg-primary p-8 text-center md:p-16">
            <h2 className="display-sm !text-3xl text-white md:!text-5xl">
              Make your first one in a minute.
            </h2>
            <p className="mx-auto mt-4 max-w-md text-white/90">
              Upload an image and get code you can paste straight into your site.
            </p>
            <Link href="/studio" className="btn btn-on-coral mt-8">Open the studio</Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
