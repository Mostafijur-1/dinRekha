import Link from "next/link";

import { Brand } from "@/components/brand";

const navigation = [
  { label: "আজ", href: "/dashboard", icon: "⌂" },
  { label: "Timeline", href: "/dashboard#timeline", icon: "◷" },
  { label: "Daily Activity", href: "/dashboard#daily-activities", icon: "✓" },
  { label: "Report", href: "/reports", icon: "⌁" },
] as const;

export function AppNavigation({
  active = "dashboard",
}: {
  active?: "dashboard" | "reports";
}) {
  return (
    <>
      <aside className="app-sidebar">
        <Brand />
        <nav className="app-nav" aria-label="Application navigation">
          {navigation.map((item, index) => (
            <Link
              className={
                (active === "dashboard" && index === 0) ||
                (active === "reports" && item.href === "/reports")
                  ? "is-active"
                  : ""
              }
              href={item.href}
              key={item.label}
            >
              <span aria-hidden="true">{item.icon}</span>
              {item.label}
            </Link>
          ))}
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
            className={
              (active === "dashboard" && index === 0) ||
              (active === "reports" && item.href === "/reports")
                ? "is-active"
                : ""
            }
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
