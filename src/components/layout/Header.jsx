import { HelpCircle, Headphones } from 'lucide-react';

export default function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-surface/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
        {/* Logo */}
        <a href="/" className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-600 text-lg font-bold text-white shadow-sm">
            N
          </span>
          <span className="leading-tight">
            <span className="block text-lg font-extrabold tracking-tight text-slate-900">
              NEXUS HMS
            </span>
            <span className="block text-sm font-semibold text-brand-600">
              Candidate Portal
            </span>
          </span>
        </a>

        {/* Nav actions */}
        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 sm:flex">
          <a href="#help" className="flex items-center gap-1.5 hover:text-slate-900">
            <HelpCircle className="h-4 w-4" />
            Need Help?
          </a>
          <a href="#faq" className="hover:text-slate-900">
            FAQ
          </a>
          <a
            href="#contact-hr"
            className="flex items-center gap-2 rounded-full border border-brand-600 px-4 py-2 font-semibold text-brand-600 transition hover:bg-brand-600 hover:text-white"
          >
            <Headphones className="h-4 w-4" />
            Contact HR
          </a>
        </nav>
      </div>
    </header>
  );
}
