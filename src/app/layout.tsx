import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CredoCatholica — Catholic Digital Platform",
  description: "Global Catholic digital platform comprising Daily Liturgical Companion, Permanent Reference Library, and Structured Formation Pathways.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
