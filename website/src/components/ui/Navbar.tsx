// src/components/ui/Navbar.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    // Navbar background is white in light mode and dark gray in dark mode
    <nav className="bg-white dark:bg-slate-950 p-4">
      <div className="container mx-auto flex items-center justify-between">
        {/* Brand */}
        <div className="text-slate-800 dark:text-green-500 text-xl font-bold">
          <Link href="/">Budget Guardian</Link>
        </div>

        {/* Navigation Links and Dark Mode Toggle */}
        <ul className="flex items-center space-x-6">
          <li>
            <Link
              href="/"
              className="text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white"
            >
              Dashboard
            </Link>
          </li>
          <li>
            <Link
              href="/profile"
              className="text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white"
            >
              Profile
            </Link>
          </li>
          <li>
            <button
              onClick={toggleTheme}
              className="bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white px-3 py-1 rounded"
            >
              {theme === "dark" ? "Light Mode" : "Dark Mode"}
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
}
