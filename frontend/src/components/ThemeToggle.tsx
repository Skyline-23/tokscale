"use client";

import { motion } from "framer-motion";
import { Monitor, Moon, Sun } from "lucide-react";
import type { ThemePreference } from "@/lib/useSettings";

/**
 * Size constants for consistent styling
 */
const SIZES = {
  /** Size of each button (square for circle) */
  buttonSize: 28,
  /** Padding inside the container */
  containerPadding: 3,
  /** Icon size */
  iconSize: 14,
} as const;

/** Calculate total container width: 3 buttons + padding */
const CONTAINER_WIDTH = SIZES.buttonSize * 3 + SIZES.containerPadding * 2;

/** Calculate container height: button size + padding */
const CONTAINER_HEIGHT = SIZES.buttonSize + SIZES.containerPadding * 2;

/**
 * Theme options configuration
 */
const themes = [
  { value: "light" as const, label: "Light theme", icon: Sun },
  { value: "dark" as const, label: "Dark theme", icon: Moon },
  { value: "system" as const, label: "System theme", icon: Monitor },
] as const;

interface ThemeToggleProps {
  theme: ThemePreference;
  onThemeChange: (theme: ThemePreference) => void;
  mounted: boolean;
}

/**
 * 3-state theme toggle with sliding indicator.
 * Supports Light / Dark / System modes.
 */
export function ThemeToggle({ theme, onThemeChange, mounted }: ThemeToggleProps) {
  const activeIndex = themes.findIndex((t) => t.value === theme);

  // Calculate indicator position based on active index
  const indicatorX = SIZES.containerPadding + activeIndex * SIZES.buttonSize;

  // Skeleton loader for SSR hydration
  if (!mounted) {
    return (
      <div
        className="animate-pulse rounded-full"
        style={{
          width: CONTAINER_WIDTH,
          height: CONTAINER_HEIGHT,
          background: "linear-gradient(to bottom, var(--color-btn-bg), var(--color-canvas-subtle))",
        }}
        aria-hidden="true"
      />
    );
  }

  return (
    <div
      role="radiogroup"
      aria-label="Theme selection"
      className="relative inline-flex items-center rounded-full"
      style={{
        width: CONTAINER_WIDTH,
        height: CONTAINER_HEIGHT,
        padding: SIZES.containerPadding,
        background: "linear-gradient(to bottom, var(--color-btn-bg), var(--color-canvas-subtle))",
        boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.05), 0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)",
        border: "1px solid var(--color-border-subtle)",
      }}
    >
      {/* Animated sliding indicator */}
      <motion.div
        className="absolute rounded-full"
        style={{
          top: SIZES.containerPadding,
          bottom: SIZES.containerPadding,
          width: SIZES.buttonSize,
          backgroundColor: "var(--color-card-bg)",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06), 0 0 0 1px var(--color-border-subtle)",
        }}
        initial={false}
        animate={{ x: indicatorX }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      />

      {themes.map(({ value, label, icon: Icon }) => {
        const isActive = theme === value;

        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={isActive}
            aria-label={label}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onThemeChange(value)}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight" || e.key === "ArrowDown") {
                e.preventDefault();
                const nextIndex = (activeIndex + 1) % themes.length;
                onThemeChange(themes[nextIndex].value);
              } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
                e.preventDefault();
                const prevIndex = (activeIndex - 1 + themes.length) % themes.length;
                onThemeChange(themes[prevIndex].value);
              }
            }}
            className="relative z-10 flex items-center justify-center rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            style={{
              width: SIZES.buttonSize,
              height: SIZES.buttonSize,
              color: isActive ? "var(--color-fg-default)" : "var(--color-fg-muted)",
            }}
          >
            <Icon
              size={SIZES.iconSize}
              strokeWidth={isActive ? 2.5 : 2}
              className="transition-all duration-200"
            />
          </button>
        );
      })}
    </div>
  );
}
