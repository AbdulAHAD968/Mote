import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/JsonLd";
import { Nav } from "@/components/Nav";
import { Studio } from "@/components/Studio";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Studio - convert an image to particles",
  description:
    "Upload an image, choose an animation, and export three.js particle code as HTML or a React component. Runs in your browser; nothing is uploaded.",
  alternates: { canonical: "/studio" },
  openGraph: { url: "/studio" },
};

export default function StudioPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: `${SITE_NAME} Studio`,
          url: `${SITE_URL}/studio`,
          isPartOf: { "@id": `${SITE_URL}/#app` },
        }}
      />
      <Nav />
      <main>
        <Studio />
      </main>
      <Footer />
    </>
  );
}
