import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "ClassArena | Next Gen Classroom Activity Platform",
  description: "Experience premium Apple-inspired random student picker, podium leaderboard, team generator, and live activity tracker.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full scroll-smooth antialiased">
      <body className={`${plusJakartaSans.className} h-full bg-[#F8FAFC] text-slate-800 selection:bg-violet-500 selection:text-white`}>
        {children}
      </body>
    </html>
  );
}
