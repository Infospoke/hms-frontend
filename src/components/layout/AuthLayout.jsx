import Header from './Header.jsx';
import Footer from './Footer.jsx';

/**
 * Shared two-column shell used by both Login and Signup pages:
 * left = eyebrow + headline + copy + feature grid, right = the form card.
 */
export default function AuthLayout({ eyebrow, title, highlight, description, features, children }) {
  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <Header />

      <main className="mx-auto grid w-full max-w-7xl flex-1 grid-cols-1 gap-16 px-6 py-14 lg:grid-cols-2 lg:items-start lg:gap-12 lg:px-10 lg:py-20">
        {/* Left column */}
        <div>
          <p className="text-sm font-bold tracking-[0.15em] text-brand-600">{eyebrow}</p>
          <h1 className="mt-4 text-5xl font-extrabold leading-[1.05] tracking-tight text-slate-900 sm:text-6xl">
            {title}
            <br />
            <span className="text-brand-600">{highlight}</span>
          </h1>
          <p className="mt-6 max-w-md text-lg text-slate-500">{description}</p>

          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3">{features}</div>
        </div>

        {/* Right column — form card */}
        <div className="w-full max-w-xl justify-self-center lg:justify-self-end">
          <div className="rounded-3xl bg-white p-8  ring-1 ring-slate-100 sm:p-10">
            {children}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
