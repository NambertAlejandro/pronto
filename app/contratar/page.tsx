import type { Metadata } from 'next';
import Checkout from '@/components/tempus/checkout';
import './tempus.css';
import './plans.css';
export const metadata: Metadata = { title:'Tempus | Seu tempo. Seu negócio.', description:'Prévia do fluxo de contratação Tempus para barbearias.', robots:{index:false,follow:false}, icons:{icon:'/brand/tempus-icon.png',apple:'/brand/tempus-icon.png'} };
export default function Page() { return <Checkout />; }
