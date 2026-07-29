export default function Footer() {
  return (
    <footer className="border-t border-slate-200/70">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-6 text-sm text-slate-500 sm:flex-row lg:px-10">
        <p>&copy; {new Date().getFullYear()} Nexus HMS. All rights reserved.</p>
        <div className="flex items-center gap-6 font-medium">
          <a href="#privacy" className="hover:text-slate-800">
            Privacy Policy
          </a>
          <a href="#terms" className="hover:text-slate-800">
            Terms &amp; Conditions
          </a>
          <a href="#accessibility" className="hover:text-slate-800">
            Accessibility
          </a>
        </div>
      </div>
    </footer>
  );
}
