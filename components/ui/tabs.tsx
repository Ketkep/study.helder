"use client";

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export type TabItem = { id: string; label: ReactNode; content: ReactNode };

const tabClasses = (active: boolean) =>
  cn(
    "-mb-px min-h-11 cursor-pointer border-b-2 px-0.5 pt-2 pb-2.5 text-[0.9375rem] whitespace-nowrap transition-colors duration-150",
    active ? "border-navy-900 font-semibold text-ink" : "border-transparent text-ink-muted hover:text-ink",
  );

/**
 * In-page tabs following the WAI-ARIA tabs pattern: arrow keys move between
 * tabs, Home/End jump to the first/last tab.
 */
export function Tabs({ items, label, className }: { items: TabItem[]; label: string; className?: string }) {
  const baseId = useId();
  const [activeId, setActiveId] = useState(items[0]?.id);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  function focusTab(index: number) {
    const next = (index + items.length) % items.length;
    setActiveId(items[next].id);
    tabRefs.current[next]?.focus();
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.key === "ArrowRight") focusTab(index + 1);
    else if (event.key === "ArrowLeft") focusTab(index - 1);
    else if (event.key === "Home") focusTab(0);
    else if (event.key === "End") focusTab(items.length - 1);
    else return;
    event.preventDefault();
  }

  return (
    <div className={className}>
      <div role="tablist" aria-label={label} className="flex gap-6 overflow-x-auto border-b border-line">
        {items.map((item, index) => {
          const active = item.id === activeId;
          return (
            <button
              key={item.id}
              ref={(el) => {
                tabRefs.current[index] = el;
              }}
              type="button"
              role="tab"
              id={`${baseId}-tab-${item.id}`}
              aria-selected={active}
              aria-controls={`${baseId}-panel-${item.id}`}
              tabIndex={active ? 0 : -1}
              onClick={() => setActiveId(item.id)}
              onKeyDown={(event) => onKeyDown(event, index)}
              className={tabClasses(active)}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      {items.map((item) => (
        <div
          key={item.id}
          role="tabpanel"
          id={`${baseId}-panel-${item.id}`}
          aria-labelledby={`${baseId}-tab-${item.id}`}
          hidden={item.id !== activeId}
          tabIndex={0}
          className="pt-4"
        >
          {item.content}
        </div>
      ))}
    </div>
  );
}

export { tabClasses };
