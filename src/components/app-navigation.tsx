import Link from "next/link";

import { Brand } from "@/components/brand";

const navigation = [
  { label: "আজ", href: "/dashboard", icon: "⌂" },
  { label: "Timeline", href: "#timeline", icon: "◷" },
  { label: "Daily Activity", href: "#daily-activities", icon: "✓" },
] as const;

export function AppNavigation() {
  return (
    <>
      <aside className="app-sidebar">
        <Brand />
        <nav className="app-nav" aria-label="Application navigation">
          {navigation.map((item, index) => (
            <Link
              className={index === 0 ? "is-active" : ""}
              href={item.href}
              key={item.label}
            >
              <span aria-hidden="true">{item.icon}</span>
              {item.label}
            </Link>
          ))}
          <span className="app-nav-disabled" aria-disabled="true">
            <span aria-hidden="true">⌁</span>
            Report
            <small>শীঘ্রই</small>
          </span>
        </nav>
        <div className="app-sidebar-note">
          <span>ব্যক্তিগত · নিরাপদ</span>
          <p>আপনার দিনের তথ্য শুধু আপনার জন্য।</p>
        </div>
      </aside>

      <nav
        className="app-mobile-nav"
        aria-label="Mobile application navigation"
      >
        {navigation.map((item, index) => (
          <Link
            className={index === 0 ? "is-active" : ""}
            href={item.href}
            key={item.label}
          >
            <span aria-hidden="true">{item.icon}</span>
            <small>{item.label}</small>
          </Link>
        ))}
      </nav>
    </>
  );
}
