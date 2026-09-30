import type { MetadataRoute } from "next";
import { isProductionDeployment } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  // Previews and local builds are never indexed.
  if (!isProductionDeployment()) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/nl", "/en"],
        disallow: [
          "/*/dashboard",
          "/*/subjects",
          "/*/flashcards",
          "/*/progress",
          "/*/settings",
          "/*/styleguide",
          "/auth/",
          "/api/",
        ],
      },
    ],
  };
}
