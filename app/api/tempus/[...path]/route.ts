import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { AppError } from '@/lib/tempus/mvp/domain';
import { authenticate, getUser, logout, mutate, publicBook, publicView, reservation, snapshot } from '@/lib/tempus/mvp/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const COOKIE = 'tempus_session';
function json(data: unknown, status = 200) { return NextResponse.json(data, { status, headers: { 'Cache-Control':'no-store, private', 'X-Content-Type-Options':'nosniff', 'Referrer-Policy':'no-referrer' } }); }
async function handle(request: NextRequest) {
  try {
    const operation = request.nextUrl.pathname.replace('/api/tempus/', '');
    const token = request.cookies.get(COOKIE)?.value;
    if (request.method !== 'GET') {
      const origin = request.headers.get('origin');
      // Next may normalize the internal URL to localhost even when the browser uses 127.0.0.1.
      // Host is the incoming request authority; do not trust arbitrary forwarded-host headers.
      const expectedOrigin = process.env.TEMPUS_APP_ORIGIN || `${request.nextUrl.protocol}//${request.headers.get('host')}`;
      if ((origin && origin !== expectedOrigin) || request.headers.get('sec-fetch-site') === 'cross-site') throw new AppError('Origem da requisição não autorizada.', 403);
    }
    let body: unknown = {};
    if (request.method !== 'GET') {
      const content = await request.text();
      if (Buffer.byteLength(content) > 65536) throw new AppError('Solicitação muito grande.',413);
      try { body = content ? JSON.parse(content) : {}; } catch { throw new AppError('JSON inválido.'); }
    }
    if ((operation === 'login' || operation === 'register') && request.method === 'POST') {
      const result = authenticate(operation, body);
      const response = json(result.snapshot, operation === 'register' ? 201 : 200);
      response.cookies.set(COOKIE,result.token,{ httpOnly:true,sameSite:'lax',secure:request.nextUrl.protocol==='https:',path:'/',maxAge:7*86400 });
      return response;
    }
    if (operation === 'logout' && request.method === 'POST') { logout(token); const response=json({ok:true});response.cookies.set(COOKIE,'',{httpOnly:true,path:'/',maxAge:0});return response; }
    if (operation === 'public' && request.method === 'GET') {
      const q=request.nextUrl.searchParams; return json(publicView(q.get('slug')||'',q.get('date')||'',q.get('serviceId')||'',q.get('staffId')||''));
    }
    if (operation === 'public' && request.method === 'POST') return json(publicBook(body),201);
    if (operation === 'reservation' && request.method === 'GET') return json(reservation(request.nextUrl.searchParams.get('token')||''));
    if (operation === 'reservation' && request.method === 'POST') return json(reservation(typeof body==='object' && body && 'token' in body ? String(body.token) : '',true));
    const user = getUser(token);
    if (!user) throw new AppError('Entre na sua conta para continuar.',401);
    if (operation === 'state' && request.method === 'GET') return json(snapshot(user));
    if (operation === 'state' && request.method === 'PATCH') return json(mutate(user,body));
    throw new AppError('Rota não encontrada.',404);
  } catch (error) {
    if (error instanceof ZodError) return json({error:error.issues[0]?.message || 'Revise os dados informados.'},400);
    if (error instanceof AppError) return json({error:error.message},error.status);
    console.error('[TEMPUS]',error instanceof Error ? error.message : 'Erro inesperado');
    return json({error:'Não foi possível concluir. Tente novamente.'},500);
  }
}
export const GET=handle;
export const POST=handle;
export const PATCH=handle;
