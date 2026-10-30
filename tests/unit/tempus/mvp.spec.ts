import { beforeAll, describe, expect, it, vi } from 'vitest';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { availableSlots, today, validDate, validateHours } from '@/lib/tempus/mvp/domain';
import { emptyState, type Snapshot } from '@/lib/tempus/mvp/types';
vi.mock('server-only', () => ({}));
let store: typeof import('@/lib/tempus/mvp/store');
let a: Snapshot, b: Snapshot, session: string;
const date = today(new Date(Date.now() + 7 * 86400000));
beforeAll(async () => {
  process.env.TEMPUS_DB_PATH = path.join(mkdtempSync(path.join(tmpdir(), 'tempus-test-')), 'test.sqlite');
  store = await import('@/lib/tempus/mvp/store');
});
describe('TEMPUS: calendário e limites', () => {
  it('rejeita datas impossíveis e intervalos fora do expediente', () => {
    expect(validDate('2026-02-30')).toBe(false);
    const s = emptyState('teste'); s.business.hours[1].breakEnd = '19:00';
    expect(() => validateHours(s.business.hours)).toThrow();
  });
  it('interpreta a virada do dia em São Paulo', () => { expect(today(new Date('2026-10-31T02:00:00Z'))).toBe('2026-10-30'); });
  it('respeita almoço, duração, encaixe exato e profissional habilitado', () => {
    const s = emptyState('teste'); s.business.hours = s.business.hours.map(h => ({ ...h, enabled: true }));
    s.staff = [{ id: 'p1', name: 'Profissional', role: '', active: true }];
    const service = { id: 's1', name: 'Corte', duration: 30, price: 5000, staffIds: [], active: true };
    s.appointments = [{ id: 'a1', clientId: 'c1', staffId: 'p1', serviceId: 's1', date, time: '09:00', duration: 30, price: 5000, serviceName: 'Corte', status: 'scheduled', notes: '', createdAt: '' }];
    const slots = availableSlots(s, date, service, 'p1');
    expect(slots).not.toContain('09:15'); expect(slots).toContain('09:30'); expect(slots).not.toContain('11:45'); expect(slots).toContain('13:00'); expect(slots).not.toContain('17:45');
    expect(availableSlots(s, date, { ...service, staffIds: ['other'] }, 'p1')).toEqual([]);
  });
});
describe('TEMPUS: persistência, sessão e isolamento', () => {
  it('cria contas isoladas e autentica com senha', () => {
    const result = store.authenticate('register', { name: 'Teste A', email: 'a@example.test', password: 'safe-test-pass-123' }); a = result.snapshot; session = result.token;
    b = store.authenticate('register', { name: 'Teste B', email: 'b@example.test', password: 'safe-test-pass-456' }).snapshot;
    expect(store.getUser(session)?.id).toBe(a.user.id);
    expect(() => store.authenticate('login', { email: a.user.email, password: 'wrong-password' })).toThrow();
    expect(store.authenticate('login', { email: a.user.email, password: 'safe-test-pass-123' }).snapshot.user.id).toBe(a.user.id);
  });
  it('salva configuração e impede referências de outro negócio', () => {
    expect(() => store.mutate(a.user, { action: 'onboarding', data: { step: 4, finish: true } })).toThrow();
    a = store.mutate(a.user, { action: 'settings', data: { ...a.state.business, name: 'Atelier QA', hours: a.state.business.hours.map(h => ({ ...h, enabled: true })) } });
    a = store.mutate(a.user, { action: 'staff', data: { name: 'Alex', role: 'Barbeiro' } });
    a = store.mutate(a.user, { action: 'service', data: { name: 'Corte', duration: 30, price: 5000, staffIds: [] } });
    a = store.mutate(a.user, { action: 'client', data: { name: 'Cliente QA', phone: '11999999999', email: '', notes: 'Privado' } });
    a = store.mutate(a.user, { action: 'onboarding', data: { step: 4, finish: true } });
    expect(store.snapshot(a.user).state.ready).toBe(true);
    expect(store.snapshot(b.user).state.clients).toHaveLength(0);
    expect(() => store.mutate(b.user, { action: 'client', data: { ...a.state.clients[0], name: 'Ataque' } })).toThrow();
    expect(() => store.mutate(b.user, { action: 'settings', data: { ...b.state.business, name: 'Outro', slug: a.state.business.slug } })).toThrow();
  });
  it('bloqueia sobreposição e libera horário somente após cancelamento', () => {
    const booking = { slug: a.state.business.slug, name: 'Visitante', phone: '11988888888', email: '', serviceId: a.state.services[0].id, staffId: a.state.staff[0].id, date, time: '09:00' };
    const result = store.publicBook(booking);
    expect(() => store.publicBook({ ...booking, time: '09:15' })).toThrow(/disponível/);
    expect(store.publicView(booking.slug, date, booking.serviceId, booking.staffId).slots).toContain('09:30');
    const publicData = JSON.stringify(store.publicView(booking.slug, date, booking.serviceId, booking.staffId));
    expect(publicData).not.toContain('Privado'); expect(publicData).not.toContain('11999999999');
    expect(store.reservation(result.token).appointment.status).toBe('scheduled');
    expect(store.reservation(result.token, true).appointment.status).toBe('cancelled');
    expect(store.publicView(booking.slug, date, booking.serviceId, booking.staffId).slots).toContain('09:00');
    expect(() => store.reservation(result.token, true)).toThrow();
  });
  it('preserva histórico de preços e bloqueia remoção de cliente com histórico', () => {
    a = store.snapshot(a.user);
    const customer = a.state.clients.at(-1)!;
    expect(() => store.mutate(a.user, { action: 'delete-client', data: { id: customer.id } })).toThrow(/histórico/);
    a = store.mutate(a.user, { action: 'service', data: { ...a.state.services[0], price: 7000 } });
    expect(a.state.appointments[0].price).toBe(5000);
    store.logout(session); expect(store.getUser(session)).toBeNull();
  });
});
