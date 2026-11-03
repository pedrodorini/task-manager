import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gerenciador de Tarefas",
  description: "Gerenciamento simples de tarefas com Next.js e tRPC",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">
        <main className="mx-auto max-w-2xl p-6">{children}</main>
      </body>
    </html>
  );
}
