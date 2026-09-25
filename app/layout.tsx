import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HMS · Hospital Management System",
  description: "Minimal hospital management system — patients, doctors and appointments.",
};

const links = [
  { href: "/", label: "Dashboard", icon: "◧" },
  { href: "/patients", label: "Patients", icon: "♡" },
  { href: "/doctors", label: "Doctors", icon: "✚" },
  { href: "/appointments", label: "Appointments", icon: "◷" },
];

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <div className="flex min-h-screen bg-slate-100">
          <aside className="fixed inset-y-0 left-0 z-20 flex w-60 flex-col border-r border-slate-200 bg-white">
            <div className="flex items-center gap-2 px-6 py-6">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-teal-600 text-lg font-black text-white">
                +
              </div>
              <div>
                <p className="text-sm font-extrabold tracking-tight text-slate-900">HMS</p>
                <p className="text-[11px] text-slate-400">Hospital Management</p>
              </div>
            </div>
            <nav className="mt-2 flex-1 space-y-1 px-3">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-teal-50 hover:text-teal-700"
                >
                  <span className="text-base text-teal-600">{l.icon}</span>
                  {l.label}
                </Link>
              ))}
            </nav>
            <div className="border-t border-slate-100 px-6 py-4">
              <p className="text-[11px] text-slate-400">© {new Date().getFullYear()} HMS · MVP</p>
            </div>
          </aside>
          <main className="ml-60 min-h-screen flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}