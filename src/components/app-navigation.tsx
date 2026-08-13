import Link from "next/link";

import { Brand } from "@/components/brand";

const navigation = [
  { label: "আজ", href: "/dashboard", icon: "⌂" },
  { label: "Timeline", href: "/dashboard#timeline", icon: "◷" },
  { label: "Daily Activity", href: "/dashboard#daily-activities", icon: "✓" },
  { label: "Report", href: "/reports", icon: "⌁" },
  { label: "Settings", href: "/settings", icon: "⚙" },
  { label: "Connections", href: "/connections", icon: "◎" },
] as const;

function isActive(
  active: "dashboard" | "reports" | "settings" | "connections",
  item: (typeof navigation)[number],
  index: number,
) {
  return (
    (active === "dashboard" && index === 0) ||
    (active === "reports" && item.href === "/reports") ||
    (active === "settings" && item.href === "/settings") ||
    (active === "connections" && item.href === "/connections")
  );
}

export function AppNavigation({
  active = "dashboard",
}: {
  active?: "dashboard" | "reports" | "settings" | "connections";
}) {
  return (
    <>
      <aside className="app-sidebar">
        <Brand />
        <nav className="app-nav" aria-label="Application navigation">
          {navigation.map((item, index) => (
            <Link
              className={isActive(active, item, index) ? "is-active" : ""}
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
            className={isActive(active, item, index) ? "is-active" : ""}
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
