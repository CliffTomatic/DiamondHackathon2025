'use client';

import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    setShowTooltip(true);
    setTimeout(() => setShowTooltip(false), 1000);
  };

  const iconKey = theme === "dark" ? "sun" : "moon";

  return (
    <div className="relative">
      <Button
        variant="ghost"
        onClick={toggleTheme}
        className="relative flex items-center space-x-2 rounded-md p-2 text-sm font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-50 dark:focus:ring-offset-slate-950"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={iconKey}
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5 text-yellow-400" />
            ) : (
              <Moon className="h-5 w-5 text-slate-800" />
            )}
          </motion.div>
        </AnimatePresence>
        {/* Text inside the button */}
        <span className="text-sm font-medium">
          {theme === "dark" ? "Light Mode" : "Dark Mode"}
        </span>
        <span className="sr-only">Toggle theme</span>
      </Button>

      {showTooltip && (
        <motion.div
          className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-slate-950 text-white dark:bg-slate-50 dark:text-slate-950 text-xs px-2 py-1 rounded shadow z-10"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          {theme === "dark" ? "Light mode" : "Dark mode"}
        </motion.div>
      )}
    </div>
  );
}
