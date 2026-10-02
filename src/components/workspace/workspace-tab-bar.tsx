"use client";

import { Liquid } from "liquid-gooey";
import { cn } from "cn";

export interface WorkspaceTabBarItem<T extends string> {
  value: T;
  label: string;
}

export function WorkspaceTabBar<T extends string>({
  items,
  active,
  onChange,
  className,
}: {
  items: WorkspaceTabBarItem<T>[];
  active: T;
  onChange: (value: T) => void;
  className?: string;
}) {
  const activeIndex = Math.max(
    0,
    items.findIndex((item) => item.value === active)
  );

  return (
    <div className={cn("relative flex border-b border-border", className)} role="tablist">
      {items.map((item) => (
        <button
          key={item.value}
          role="tab"
          aria-selected={active === item.value}
          onClick={() => onChange(item.value)}
          className={cn(
            "flex-1 py-2.5 text-sm font-medium transition-colors",
            active === item.value
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {item.label}
        </button>
      ))}

      {/*
       * Liquid's "move" effect: the underline trails and stretches as it
       * slides between tabs, instead of just flipping to the new one.
       * Liquid sets `position: relative` via its own inline style, which
       * beats a Tailwind class — position it with a `style` prop instead so
       * it actually overlays the row rather than becoming a 4th flex item.
       */}
      <Liquid
        fill="var(--primary)"
        blur={1.5}
        className="pointer-events-none"
        style={{ position: "absolute", inset: "auto 0 0 0", height: 3 }}
      >
        <Liquid.Item effect="move" move={{ stretch: 0.6, trail: 0.35 }}>
          <div
            style={{
              height: 3,
              width: `${100 / items.length}%`,
              transform: `translateX(${activeIndex * 100}%)`,
              transition: "transform 320ms cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          />
        </Liquid.Item>
      </Liquid>
    </div>
  );
}
