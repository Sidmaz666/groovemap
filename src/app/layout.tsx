import type { Metadata, Viewport } from "next";
import NextTopLoader from "nextjs-toploader";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SonnerToaster } from "@/components/atlas/SonnerToaster";
import { PATTERNS, FAMILY_LIST } from "@/lib/atlas/patterns";
import { vagueCount } from "@/lib/atlas/vague";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Groovemap — Every Beat in the World, Drawn & Playable",
  description: `${vagueCount(PATTERNS.length)} authentic drum patterns across ${FAMILY_LIST.length} style families — hear every groove instantly with real recorded drums, read it as grid, tab, staff or Indian bols, watch a 3D kit play it, edit it in the browser Groove Lab, and export MIDI, WAV, stems or DAW projects. Runs 100% in your browser.`,
  keywords: [
    "drum patterns", "groove", "beat encyclopedia", "step sequencer", "drum machine",
    "rhythm learning", "MIDI export", "euclidean rhythms", "swing", "breaks", "drum notation",
  ],
  openGraph: {
    title: "Groovemap",
    description: "See it. Hear it. Play it. Take it — every beat in the world, drawn & playable.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#09090b",
  width: "device-width",
  initialScale: 1,
};

/* JSON-LD: schema.org DataCatalog + WebSite — makes the catalog legible to
   search engines and LLM crawlers (see also /api/v1, /llms.txt, robots.ts). */
const jsonLd = (() => {
  const genres = new Set(PATTERNS.flatMap((p) => p.genres));
  const meters = new Set(PATTERNS.map((p) => `${p.timeSignature.num}/${p.timeSignature.den}`));
  const bpms = PATTERNS.map((p) => p.bpm);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        name: "Groovemap",
        description:
          "Drum-pattern encyclopedia — every groove drawn, playable and documented: step grid, tab, staff and Indian bols, 3D kit, exports.",
        potentialAction: {
          "@type": "SearchAction",
          target: "/#/explore",
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "DataCatalog",
        name: "Groovemap API v1",
        description: `Machine-readable catalog of ${PATTERNS.length} drum patterns across ${FAMILY_LIST.length} style families, ${genres.size} genre tags and ${meters.size} meters (BPM ${Math.min(...bpms)}–${Math.max(...bpms)}), readable via REST (/api/v1), an MCP server (/mcp?XTransformPort=3121) and llms.txt.`,
        url: "/api/v1",
        license: "https://creativecommons.org/licenses/by/4.0/",
        usageInfo: "/api/v1/README.md",
        isAccessibleForFree: true,
        dataset: FAMILY_LIST.map((f) => ({
          "@type": "Dataset",
          name: `${f.label} drum patterns`,
          description: `Drum pattern study grooves in the ${f.label} style family — step-event grids with velocities, learning notes and provenance.`,
          url: `/api/v1/families/${f.key}`,
          keywords: ["drum patterns", "grooves", f.label.toLowerCase()],
          variableMeasured: ["bpm", "timeSignature", "difficulty", "swing", "stepEvents"],
        })),
      },
    ],
  };
})();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-zinc-950 text-zinc-200`}
      >
        <NextTopLoader
          color="#a3e635"
          initialPosition={0.25}
          crawlSpeed={220}
          speed={320}
          easing="ease"
          height={2.5}
          showSpinner={false}
          shadow="0 0 10px #a3e635,0 0 5px #a3e635"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
        <SonnerToaster />
      </body>
    </html>
  );
}
