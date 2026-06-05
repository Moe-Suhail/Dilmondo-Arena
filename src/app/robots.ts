import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/hall-of-fame",
          "/admin",
          "/admin/",
          "/admin/*",
          "/api/admin",
          "/api/admin/*",
          "/api/sync",
        ],
      },
    ],
    host: siteUrl,
  };
}
