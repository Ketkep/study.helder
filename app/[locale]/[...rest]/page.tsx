import { notFound } from "next/navigation";

// Unknown paths under /nl or /en show the translated 404 page.
export default function CatchAll() {
  notFound();
}
