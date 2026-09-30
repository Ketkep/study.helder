import { extendTailwindMerge } from "tailwind-merge";

// Teach tailwind-merge our custom font sizes (app/globals.css), so that e.g.
// "text-reading" counts as a size and doesn't replace "text-ink" (a color).
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: ["reading", "heading", "title", "display"],
      radius: ["sm", "md", "lg"],
      shadow: ["float", "raise"],
    },
  },
});

/**
 * Joins class names, skipping falsy values. When two classes set the same
 * property (e.g. "inline-flex" and "hidden"), the later one wins.
 */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return twMerge(classes.filter(Boolean).join(" "));
}
