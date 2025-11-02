import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Consultoria - Gestão Organizacional',
  description: 'Plataforma de gestão organizacional com agentes de IA',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
