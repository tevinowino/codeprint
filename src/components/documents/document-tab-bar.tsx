"use client";

import { useEffect, useRef, useState } from "react";
import { Liquid } from "liquid-gooey";
import { cn } from "cn";

/**
 * The document file-tab row. Deliberately not built on shadcn's Tabs
 * primitive: that component's own active-tab border/indicator logic doesn't
 * fully suppress under every theme + variant combination, and produced a
 * stray border artifact when switching tabs. This is a plain, measured
 * button row instead — simpler to reason about and guaranteed to lay out
 * horizontally — with the same liquid sliding indicator used by
 * WorkspaceTabBar, sized to each tab's actual (variable) width.
 */
export function DocumentTabBar({
  titles,
  active,
  onChange,
}: {
  titles: string[];
  active: string;
  onChange: (title: string) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });
  const [overflowing, setOverflowing] = useState(false);
  // The Liquid group's own box has to span every position the indicator can
  // translate to, or the goo layer clips/misrenders once the transform moves
  // the shape outside the group's shrink-to-fit width (unlike WorkspaceTabBar,
  // tabs here have variable widths, so that width isn't knowable up front).
  const [contentWidth, setContentWidth] = useState(0);

  useEffect(() => {
    const button = buttonRefs.current.get(active);
    if (button) {
      setIndicator({ left: button.offsetLeft, width: button.offsetWidth });
    }
  }, [active, titles]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    const measure = () => {
      setOverflowing(container.scrollWidth > container.clientWidth + 1);
      setContentWidth(container.scrollWidth);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    return () => observer.disconnect();
  }, [titles]);

  return (
    <div className="relative min-w-0 flex-1">
      <div
        ref={scrollRef}
        role="tablist"
        className="relative flex gap-1 overflow-x-auto pb-1.5"
      >
        {titles.map((title) => (
          <button
            key={title}
            ref={(el) => {
              if (el) buttonRefs.current.set(title, el);
              else buttonRefs.current.delete(title);
            }}
            role="tab"
            aria-selected={active === title}
            onClick={() => onChange(title)}
            className={cn(
              "shrink-0 rounded-md px-1.5 py-1 font-mono text-sm font-medium transition-colors",
              active === title ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {title}
          </button>
        ))}

        {/*
         * Same liquid "move" indicator as WorkspaceTabBar, but positioned from
         * measured button rects instead of an equal-width assumption, since
         * file names vary in length. Pinned to `bottom-0` of this scrolling
         * container (not below it, e.g. bottom:-4) — `overflow-x-auto` forces
         * the container's vertical overflow to clip too, so anything sitting
         * outside its own box here is invisible, not just cropped.
         */}
        <Liquid
          fill="var(--primary)"
          blur={1.5}
          className="pointer-events-none"
          style={{ position: "absolute", left: 0, bottom: 0, height: 3, width: contentWidth }}
        >
          <Liquid.Item effect="move" move={{ stretch: 0.6, trail: 0.35 }}>
            <div
              style={{
                height: 3,
                width: indicator.width,
                transform: `translateX(${indicator.left}px)`,
                transition:
                  "transform 320ms cubic-bezier(0.4, 0, 0.2, 1), width 320ms cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            />
          </Liquid.Item>
        </Liquid>
      </div>

      {/* Scroll affordance: fade + soften whatever's cut off at the right edge,
          rather than an abrupt clip, when the tabs don't all fit. */}
      {overflowing && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-background via-background/70 to-transparent backdrop-blur-[1px]"
        />
      )}
    </div>
  );
}
