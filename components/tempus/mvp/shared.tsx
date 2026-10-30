'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useCallback, useEffect, useRef, useState, type ReactNode, type ButtonHTMLAttributes } from 'react';
import { useRouter } from 'next/navigation';
import { X, LoaderCircle } from 'lucide-react';
import type { Snapshot } from '@/lib/tempus/mvp/types';
import logo from '@/public/brand/tempus-logo-horizontal.webp';

export function Brand() { return <Link className="tm-brand" href="/" aria-label="Tempus, início"><Image src={logo} alt="TEMPUS" priority sizes="200px" /></Link>; }
export function Button({ secondary, className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { secondary?: boolean }) { return <button {...props} className={`${secondary ? 'tm-secondary' : 'tm-primary'} ${className}`} />; }
export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) { return <div className="tm-field"><label className="tm-field"><span>{label}</span>{children}</label>{hint && <small>{hint}</small>}</div>; }
export function Message({ children, success }: { children: ReactNode; success?: boolean }) { return children ? <p className={`tm-message ${success ? 'tm-success' : ''}`} role={success ? 'status' : 'alert'}>{children}</p> : null; }
export function Loading() { return <div className="tm tm-loading" role="status"><LoaderCircle className="tm-spin" /> Carregando seu espaço…</div>; }
export function Empty({ title, children }: { title: string; children?: ReactNode }) { return <div className="tm-empty"><span className="tm-orbit" aria-hidden="true" /><h3>{title}</h3>{children}</div>; }
export function Modal({ title, children, close }: { title: string; children: ReactNode; close: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { const prior = document.activeElement as HTMLElement; const dialog = ref.current; dialog?.showModal(); return () => { dialog?.close(); prior?.focus(); }; }, []);
  return <dialog className="tm tm-modal" ref={ref} aria-label={title} onCancel={close} onClick={e => { if (e.target === e.currentTarget) close(); }}><div className="tm-modal-inner"><div className="tm-row"><h2>{title}</h2><button className="tm-icon" onClick={close} aria-label="Fechar"><X /></button></div>{children}</div></dialog>;
}
export async function api<T>(operation: string, method = 'GET', body?: unknown): Promise<T> {
  const response = await fetch(`/api/tempus/${operation}`, { method, credentials: 'same-origin', cache: 'no-store', headers: body ? { 'Content-Type': 'application/json' } : undefined, body: body ? JSON.stringify(body) : undefined });
  const value = await response.json();
  if (!response.ok) throw Object.assign(new Error(value.error || 'Não foi possível concluir. Tente novamente.'), { status: response.status });
  return value;
}
export type Save = (action: string, data: unknown) => Promise<Snapshot>;
export function useWorkspace() {
  const [data, setData] = useState<Snapshot | null>(null), [error, setError] = useState(''); const router = useRouter();
  const refresh = useCallback(async () => { try { setData(await api<Snapshot>('state')); setError(''); } catch (e) { if ((e as { status?: number }).status === 401) router.replace('/entrar'); else setError((e as Error).message); } }, [router]);
  useEffect(() => { void refresh(); }, [refresh]);
  const save: Save = async (action, value) => { const result = await api<Snapshot>('state', 'PATCH', { action, data: value }); setData(result); return result; };
  return { data, error, refresh, save };
}
export function SectionTitle({ eyebrow, title, children, action }: { eyebrow: string; title: string; children?: ReactNode; action?: ReactNode }) { return <div className="tm-section-title"><div><p className="tm-eyebrow">{eyebrow}</p><h1>{title}</h1>{children && <p className="tm-muted">{children}</p>}</div>{action}</div>; }
