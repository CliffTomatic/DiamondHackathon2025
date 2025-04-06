// src/components/ui/Navbar.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { ThemeToggle } from "./theme-toggle";

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    // Navbar background is white in light mode and dark gray in dark mode
    <nav className="bg-white dark:bg-slate-950 p-4">
      <div className="container mx-auto flex items-center justify-between">
        {/* Brand */}
        <div className="text-green-500 dark:text-green-500 text-5xl font-bold font-mono">
          <Link href="/">Moneta</Link>
        </div>

        {/* Navigation Links and Dark Mode Toggle */}
        <ul className="flex items-center space-x-6">
          <li>
            <ThemeToggle />
          </li>
        </ul>
      </div>
    </nav>
  );
}
