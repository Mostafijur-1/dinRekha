import Link from "next/link";

import { Brand } from "@/components/brand";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="auth-page">
      <header className="auth-header">
        <Brand />
        <Link href="/" className="nav-link">
          হোমে ফিরুন
        </Link>
      </header>
      <section className="auth-stage">
        <div className="auth-context" aria-hidden="true">
          <span>দিনরেখা</span>
          <blockquote>
            “দিন কোথায় গেল—দিনরেখায় দেখুন, নিজের মতো করে।”
          </blockquote>
          <div className="auth-context-bars">
            <i />
            <i />
            <i />
            <i />
            <i />
          </div>
        </div>
        {children}
      </section>
    </main>
  );
}
