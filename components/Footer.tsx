import Link from "next/link";
import { Wordmark } from "./Logo";

export function Footer() {
  return (
    <footer className="bg-surface-dark text-on-dark-soft">
      <div className="mx-auto grid max-w-[1200px] gap-10 px-5 py-16 md:grid-cols-[2fr_1fr_1fr]">
        <div>
          <Wordmark dark />
          <p className="mt-4 max-w-sm text-sm">
            Turn any image into animated particles and export the code. Everything runs in your
            browser; your images never leave your device.
          </p>
        </div>
        <div>
          <p className="caption-uppercase text-on-dark">Product</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link href="/studio">Studio</Link></li>
            <li><Link href="/#examples">Examples</Link></li>
            <li><Link href="/#how-it-works">How it works</Link></li>
          </ul>
        </div>
        <div>
          <p className="caption-uppercase text-on-dark">Resources</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link href="/#faq">FAQ</Link></li>
            <li><a href="/llms.txt">llms.txt</a></li>
            <li><a href="/sitemap.xml">Sitemap</a></li>
          </ul>
        </div>
      </div>
      <div className="mx-auto max-w-[1200px] px-5 pb-10 text-sm text-muted-soft">
        © {new Date().getFullYear()} Mote
      </div>
    </footer>
  );
}
