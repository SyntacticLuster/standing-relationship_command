import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://standing.kinetic1.chatgpt.site"),
  title: "Standing — Relationship Command",
  description:
    "A private command surface for correspondence, contacts, commitments, and relationship memory.",
  openGraph: {
    title: "Standing",
    description: "Correspondence, contacts, commitments—one command surface.",
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Standing relationship command" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Standing",
    description: "Correspondence, contacts, commitments—one command surface.",
    images: ["/og.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32", type: "image/x-icon" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
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
