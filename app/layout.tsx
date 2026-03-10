import "./globals.css";
import { ReactNode } from "react";

export const metadata = {
  title: "ResumeAI — Match. Rewrite. Ship.",
  description: "AI-powered resume enhancer that rewrites your resume to match job descriptions without inventing facts.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
