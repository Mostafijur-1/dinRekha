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
          <span>ছন্দ</span>
          <blockquote>“দিনের হিসাব নয়—নিজের ছন্দটা বুঝুন।”</blockquote>
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
