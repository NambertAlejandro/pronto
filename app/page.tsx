import type { Metadata } from 'next';
import Landing from '@/components/tempus/mvp/landing';
import '@/components/tempus/mvp/mvp.css';
import '@/components/tempus/mvp/landing.css';
export const metadata: Metadata = { title: 'TEMPUS | Seu tempo. Seu negócio.', description: 'Agendamentos, clientes, equipe e gestão em um só lugar.', icons: { icon: '/brand/tempus-icon.png' }, openGraph: { title: 'TEMPUS | Seu tempo. Seu negócio.', images: [] }, twitter: { images: [] } };
export default function Page() { return <Landing />; }
