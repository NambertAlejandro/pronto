import { Confirmation } from '@/components/tempus/mvp/booking';
export default async function Page({ params }: { params: Promise<{ token: string }> }) { const { token } = await params; return <Confirmation token={token} />; }
