import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://signalsuite.kinetic1.chatgpt.site"),
  title: "SignalSuite — Relationship Command",
  description:
    "A private command surface for correspondence, contacts, commitments, and relationship memory.",
  openGraph: {
    title: "SignalSuite",
    description: "Correspondence, contacts, commitments—one command surface.",
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "SignalSuite relationship command" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "SignalSuite",
    description: "Correspondence, contacts, commitments—one command surface.",
    images: ["/og.png"],
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
