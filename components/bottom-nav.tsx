"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./bottom-nav.module.css";

type Onglet = {
  href: string;
  libelle: string;
  icone: React.ReactNode;
};

const onglets: Onglet[] = [
  {
    href: "/",
    libelle: "Foyer",
    icone: (
      <svg viewBox="0 0 24 24" aria-hidden="true" width="24" height="24">
        <path
          d="M4 11.5 12 5l8 6.5M6 10.5V19h12v-8.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    href: "/epargne",
    libelle: "Épargne",
    icone: (
      <svg viewBox="0 0 24 24" aria-hidden="true" width="24" height="24">
        <path
          d="M12 3v18M5 8l7-5 7 5M5 8v8l7 5 7-5V8"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    href: "/reglages",
    libelle: "Réglages",
    icone: (
      <svg viewBox="0 0 24 24" aria-hidden="true" width="24" height="24">
        <circle
          cx="12"
          cy="12"
          r="3"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <path
          d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className={styles.nav} aria-label="Navigation principale">
      {onglets.map((o) => {
        const actif = o.href === "/" ? pathname === "/" : pathname.startsWith(o.href);
        return (
          <Link
            key={o.href}
            href={o.href}
            className={styles.onglet}
            aria-current={actif ? "page" : undefined}
            data-actif={actif || undefined}
          >
            <span className={styles.icone}>{o.icone}</span>
            <span className={styles.libelle}>{o.libelle}</span>
          </Link>
        );
      })}
    </nav>
  );
}
