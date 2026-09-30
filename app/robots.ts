import type { MetadataRoute } from "next";
import { isPubliclyLaunched } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  // Nothing is indexed before launch on the real domain (previews, test deployments, local).
  if (!isPubliclyLaunched()) {
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
