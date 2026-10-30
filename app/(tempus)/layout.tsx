import type { Metadata } from 'next';
import '@/components/tempus/mvp/mvp.css';
export const metadata: Metadata = { title: 'TEMPUS | Seu tempo. Seu negócio.', description: 'Agenda, clientes, serviços e equipe em um só lugar.', robots: { index: false, follow: false }, referrer: 'no-referrer', icons: { icon: '/brand/tempus-icon.png' }, openGraph: { images: [] }, twitter: { images: [] } };
export default function Layout({ children }: { children: React.ReactNode }) { return children; }
