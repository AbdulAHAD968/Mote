import Link from "next/link";
import { Wordmark } from "./Logo";

export function Nav() {
  return (
    <header className="sticky top-0 z-20 border-b border-hairline-soft bg-canvas">
      <nav
        aria-label="Main"
        className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-5"
      >
        <Link href="/" aria-label="Mote home">
          <Wordmark />
        </Link>
        <div className="flex items-center gap-7">
          <Link href="/#examples" className="hidden text-sm font-medium text-body md:block">
            Examples
          </Link>
          <Link href="/#how-it-works" className="hidden text-sm font-medium text-body md:block">
            How it works
          </Link>
          <Link href="/#faq" className="hidden text-sm font-medium text-body md:block">
            FAQ
          </Link>
          <Link href="/studio" className="btn btn-primary">
            Open studio
          </Link>
        </div>
      </nav>
    </header>
  );
}
