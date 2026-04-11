"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all"
      style={{
        background: scrolled
          ? "rgba(250,250,250,0.85)"
          : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? "1px solid #E2E4EC" : "1px solid transparent",
        transition: "background 200ms ease, border-color 200ms ease, backdrop-filter 200ms ease",
      }}
    >
      <div className="mx-auto max-w-6xl px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-sm font-bold"
            style={{ background: "#6366F1" }}
          >
            J
          </div>
          <span
            className="text-base font-bold tracking-tight"
            style={{ color: "#111318", letterSpacing: "-0.02em" }}
          >
            Jex
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {[
            { label: "Features", href: "#features" },
            { label: "How it works", href: "#how-it-works" },
            { label: "Docs", href: "/docs" },
            { label: "GitHub", href: "https://github.com/mibienpanjoe/jex", external: true },
          ].map(({ label, href, external }) => (
            <Link
              key={label}
              href={href}
              target={external ? "_blank" : undefined}
              rel={external ? "noopener noreferrer" : undefined}
              className="px-3 py-1.5 text-sm font-medium rounded-lg transition-colors"
              style={{ color: "#5A5F75" }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.color = "#111318";
                (e.target as HTMLElement).style.background = "#F4F5F9";
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.color = "#5A5F75";
                (e.target as HTMLElement).style.background = "transparent";
              }}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* CTA group */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
            style={{ color: "#5A5F75" }}
          >
            Login
          </Link>
          <Link
            href="/register"
            className="text-sm font-medium px-4 py-1.5 rounded-lg text-white transition-colors"
            style={{ background: "#6366F1" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#4F46E5")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "#6366F1")}
          >
            Get started
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 rounded-lg"
          style={{ color: "#5A5F75" }}
          aria-label="Toggle menu"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            {menuOpen ? (
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            ) : (
              <path
                fillRule="evenodd"
                d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                clipRule="evenodd"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          className="md:hidden border-t px-6 py-4 flex flex-col gap-2"
          style={{ background: "#FAFAFA", borderColor: "#E2E4EC" }}
        >
          {[
            { label: "Features", href: "#features" },
            { label: "How it works", href: "#how-it-works" },
            { label: "Docs", href: "/docs" },
            { label: "GitHub", href: "https://github.com/mibienpanjoe/jex" },
            { label: "Login", href: "/login" },
          ].map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              className="py-2 text-sm font-medium"
              style={{ color: "#5A5F75" }}
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </Link>
          ))}
          <Link
            href="/register"
            className="mt-2 py-2 px-4 text-sm font-medium text-center rounded-lg text-white"
            style={{ background: "#6366F1" }}
            onClick={() => setMenuOpen(false)}
          >
            Get started free
          </Link>
        </div>
      )}
    </header>
  );
}
