import 'server-only';
import { DatabaseSync } from 'node:sqlite';
import { randomBytes, randomUUID, scryptSync, timingSafeEqual, createHash } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { z } from 'zod';
import { AppError, assertAppointment, availableSlots, appointmentTimestamp, validateHours } from './domain';
import { emptyState, type State, type User, type Snapshot, type Appointment } from './types';

type Row = { id: string; name: string; email: string; password: string };
type BusinessRow = { user_id: string; slug: string; state: string };
const databasePath = process.env.TEMPUS_DB_PATH || path.join(process.cwd(), '.data', 'tempus.sqlite');
mkdirSync(path.dirname(databasePath), { recursive: true });
const db = new DatabaseSync(databasePath);
db.exec(`PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;
 CREATE TABLE IF NOT EXISTS users(id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT UNIQUE NOT NULL, password TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS businesses(user_id TEXT PRIMARY KEY REFERENCES users(id), slug TEXT UNIQUE NOT NULL, state TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS sessions(token TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id), expires INTEGER NOT NULL);
 CREATE TABLE IF NOT EXISTS attempts(key TEXT PRIMARY KEY, count INTEGER NOT NULL, expires INTEGER NOT NULL);
 CREATE TABLE IF NOT EXISTS reservations(token TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id), appointment_id TEXT NOT NULL);
`);
const hash = (text: string) => createHash('sha256').update(text).digest('hex');
const userView = (row: Row): User => ({ id: row.id, name: row.name, email: row.email });
function transact<T>(fn: () => T): T {
  db.exec('BEGIN IMMEDIATE');
  try { const result = fn(); db.exec('COMMIT'); return result; }
  catch (error) { db.exec('ROLLBACK'); throw error; }
}
function throttle(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const result = db.prepare(`INSERT INTO attempts(key,count,expires) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET count=CASE WHEN expires < ? THEN 1 ELSE count+1 END, expires=CASE WHEN expires < ? THEN ? ELSE expires END RETURNING count`).get(hash(key), now + windowMs, now, now, now + windowMs) as { count: number };
  if (result.count > limit) throw new AppError('Muitas tentativas. Aguarde alguns minutos e tente novamente.', 429);
}
const loginSchema = z.object({ email: z.string().trim().email().max(254).transform(s => s.toLowerCase()), password: z.string().min(10, 'Use pelo menos 10 caracteres na senha.').max(128), name: z.string().trim().min(2).max(100).optional() });
export function authenticate(action: 'login'|'register', input: unknown) {
  const data = loginSchema.parse(input);
  throttle(`auth:${data.email}`, 20, 15 * 60_000);
  let user: Row;
  if (action === 'register') {
    if (!data.name) throw new AppError('Informe seu nome.');
    const salt = randomBytes(16).toString('hex');
    const password = `${salt}:${scryptSync(data.password, salt, 64).toString('hex')}`;
    user = { id: randomUUID(), name: data.name, email: data.email, password };
    transact(() => {
      if (db.prepare('SELECT id FROM users WHERE email=?').get(data.email)) throw new AppError('Não foi possível criar a conta com esse e-mail. Tente entrar.', 409);
      db.prepare('INSERT INTO users(id,name,email,password) VALUES(?,?,?,?)').run(user.id, user.name, user.email, user.password);
      const slug = `barbearia-${randomBytes(5).toString('hex')}`;
      db.prepare('INSERT INTO businesses(user_id,slug,state) VALUES(?,?,?)').run(user.id, slug, JSON.stringify(emptyState(slug)));
    });
  } else {
    const row = db.prepare('SELECT * FROM users WHERE email=?').get(data.email) as Row | undefined;
    const [salt, expected] = row?.password.split(':') ?? ['invalid-user-padding', '0'.repeat(128)];
    const actual = scryptSync(data.password, salt, 64);
    if (!row || !timingSafeEqual(actual, Buffer.from(expected, 'hex'))) throw new AppError('E-mail ou senha incorretos.', 401);
    user = row;
  }
  const token = randomBytes(32).toString('hex');
  db.prepare('DELETE FROM sessions WHERE expires < ?').run(Date.now());
  db.prepare('DELETE FROM attempts WHERE expires < ?').run(Date.now());
  db.prepare('INSERT INTO sessions(token,user_id,expires) VALUES(?,?,?)').run(hash(token), user.id, Date.now() + 7 * 86400_000);
  return { token, snapshot: snapshot(userView(user)) };
}
export function getUser(token?: string): User | null {
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
  const row = db.prepare('SELECT u.* FROM users u JOIN sessions s ON u.id=s.user_id WHERE s.token=? AND s.expires>?').get(hash(token), Date.now()) as Row | undefined;
  return row ? userView(row) : null;
}
export function logout(token?: string) { if (token) db.prepare('DELETE FROM sessions WHERE token=?').run(hash(token)); }
function stateOf(userId: string) {
  const row = db.prepare('SELECT * FROM businesses WHERE user_id=?').get(userId) as BusinessRow | undefined;
  if (!row) throw new AppError('Negócio não encontrado.', 404);
  return JSON.parse(row.state) as State;
}
function writeState(userId: string, state: State) {
  state.revision += 1;
  db.prepare('UPDATE businesses SET slug=?,state=? WHERE user_id=?').run(state.business.slug, JSON.stringify(state), userId);
}
function withoutSecrets(state: State): State { return { ...state, appointments: state.appointments.map(({ cancellationHash: _hash, ...a }) => a) }; }
export function snapshot(user: User): Snapshot { return { user, state: withoutSecrets(stateOf(user.id)) }; }
const text = (min = 0, max = 120) => z.string().trim().min(min).max(max);
const id = z.string().uuid();
const serviceSchema = z.object({ id: id.optional(), name: text(2), duration: z.number().int().min(15).max(480).multipleOf(15), price: z.number().int().min(0).max(100_000_000), staffIds: z.array(id).max(100), active: z.boolean().default(true) });
const staffSchema = z.object({ id: id.optional(), name: text(2), role: text(0, 80), active: z.boolean().default(true) });
const clientSchema = z.object({ id: id.optional(), name: text(2), phone: z.string().trim().regex(/^[\d\s()+-]{8,25}$/, 'Informe um telefone válido.'), email: z.union([z.string().trim().email().max(254), z.literal('')]), notes: text(0, 1000) });
const hoursSchema = z.array(z.object({ enabled: z.boolean(), start: text(), end: text(), breakStart: text(), breakEnd: text() })).length(7);
const businessSchema = z.object({ name: text(2), slug: z.string().min(3).max(60).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use letras minúsculas, números e hífens no endereço.'), phone: text(0, 25), address: text(0, 250), description: text(0, 500), cancellationHours: z.number().int().min(0).max(168), hours: hoursSchema });
export function mutate(user: User, raw: unknown): Snapshot {
  const { action, data } = z.object({ action: z.string(), data: z.unknown() }).parse(raw);
  transact(() => {
    const s = stateOf(user.id);
    if (action === 'settings') {
      const value = businessSchema.parse(data); validateHours(value.hours);
      const other = db.prepare('SELECT user_id FROM businesses WHERE slug=? AND user_id<>?').get(value.slug, user.id);
      if (other) throw new AppError('Esse endereço de reserva já está em uso.', 409);
      if (s.ready && !value.hours.some(h => h.enabled)) throw new AppError('Mantenha pelo menos um dia de atendimento.');
      s.business = { ...value, timezone: 'America/Sao_Paulo' };
    } else if (action === 'profile') {
      const value = z.object({ name: text(2,100) }).parse(data);
      db.prepare('UPDATE users SET name=? WHERE id=?').run(value.name, user.id); user.name = value.name;
    } else if (action === 'onboarding') {
      const { step, finish } = z.object({ step: z.number().int().min(0).max(4), finish: z.boolean().optional() }).parse(data);
      if (finish) {
        if (!s.business.name || !s.staff.some(p => p.active) || !s.services.some(p => p.active) || !s.business.hours.some(h => h.enabled)) throw new AppError('Cadastre o negócio, um profissional, um serviço e os horários antes de concluir.');
        for (const service of s.services.filter(x => x.active)) if (service.staffIds.length && !s.staff.some(p => p.active && service.staffIds.includes(p.id))) throw new AppError('Cada serviço ativo precisa de um profissional disponível.');
        s.ready = true;
      }
      s.onboardingStep = step;
    } else if (action === 'service') {
      const value = serviceSchema.parse(data);
      if (value.staffIds.some(ref => !s.staff.some(p => p.id === ref && p.active))) throw new AppError('Selecione profissionais ativos deste negócio.');
      if (value.id) { const i = s.services.findIndex(x => x.id === value.id); if (i < 0) throw new AppError('Serviço não encontrado.', 404); s.services[i] = { ...value, id: value.id }; }
      else { if (s.services.length >= 500) throw new AppError('Limite de serviços do MVP atingido.'); s.services.push({ ...value, id: randomUUID() }); }
    } else if (action === 'staff') {
      const value = staffSchema.parse(data);
      if (value.id) { const i = s.staff.findIndex(x => x.id === value.id); if (i < 0) throw new AppError('Profissional não encontrado.', 404); s.staff[i] = { ...value, id: value.id }; }
      else { if (s.staff.length >= 100) throw new AppError('Limite de profissionais do MVP atingido.'); s.staff.push({ ...value, id: randomUUID() }); }
    } else if (action === 'client') {
      const value = clientSchema.parse(data);
      if (value.id) { const i = s.clients.findIndex(x => x.id === value.id); if (i < 0) throw new AppError('Cliente não encontrado.', 404); s.clients[i] = { ...value, id: value.id }; }
      else { if (s.clients.length >= 10_000) throw new AppError('Limite de clientes do MVP atingido.'); s.clients.push({ ...value, id: randomUUID() }); }
    } else if (action === 'archive') {
      const value = z.object({ kind: z.enum(['staff','services']), id }).parse(data);
      const item = s[value.kind].find(x => x.id === value.id); if (!item) throw new AppError('Registro não encontrado.', 404);
      if (value.kind === 'staff' && s.appointments.some(a => a.staffId === value.id && a.status === 'scheduled' && appointmentTimestamp(a.date,a.time) > Date.now())) throw new AppError('Reagende ou cancele os próximos atendimentos desse profissional antes de arquivar.');
      item.active = false;
    } else if (action === 'delete-client') {
      const value = z.object({ id }).parse(data);
      if (!s.clients.some(c => c.id === value.id)) throw new AppError('Cliente não encontrado.', 404);
      if (s.appointments.some(a => a.clientId === value.id)) throw new AppError('Este cliente tem histórico de agendamentos e não pode ser excluído.');
      s.clients = s.clients.filter(c => c.id !== value.id);
    } else if (action === 'appointment') {
      const value = z.object({ id: id.optional(), clientId: id, staffId: id, serviceId: id, date: text(), time: text(), notes: text(0, 1000).default('') }).parse(data);
      if (!s.ready) throw new AppError('Conclua a configuração antes de agendar.');
      if (!s.clients.some(c => c.id === value.clientId)) throw new AppError('Selecione um cliente deste negócio.');
      const prior = value.id ? s.appointments.find(a => a.id === value.id) : undefined;
      if (value.id && (!prior || prior.status !== 'scheduled')) throw new AppError('Somente agendamentos ativos podem ser reagendados.');
      const service = assertAppointment(s, { ...value, id: value.id ?? '' });
      const appointment: Appointment = { ...prior, ...value, id: value.id || randomUUID(), duration: service.duration, price: service.price, serviceName: service.name, status: 'scheduled', createdAt: prior?.createdAt ?? new Date().toISOString() };
      if (prior) s.appointments[s.appointments.indexOf(prior)] = appointment; else s.appointments.push(appointment);
    } else if (action === 'status') {
      const value = z.object({ id, status: z.enum(['completed','cancelled','no_show']) }).parse(data);
      const appointment = s.appointments.find(a => a.id === value.id);
      if (!appointment) throw new AppError('Agendamento não encontrado.', 404);
      if (appointment.status !== 'scheduled') throw new AppError('Esse agendamento já foi finalizado. Atualize a agenda.', 409);
      if (value.status !== 'cancelled' && appointmentTimestamp(appointment.date, appointment.time) > Date.now()) throw new AppError('Aguarde o horário do atendimento para concluir ou marcar ausência.');
      appointment.status = value.status;
    } else throw new AppError('Operação inválida.');
    writeState(user.id, s);
  });
  return snapshot(user);
}
function publicBusiness(slug: string) {
  const row = db.prepare('SELECT * FROM businesses WHERE slug=?').get(slug) as BusinessRow | undefined;
  if (!row) throw new AppError('Página de agendamento não encontrada.', 404);
  const state = JSON.parse(row.state) as State;
  if (!state.ready) throw new AppError('Este negócio ainda está preparando a agenda.', 404);
  return { userId: row.user_id, state };
}
export function publicView(slug: string, date: string, serviceId: string, staffId: string) {
  const { state } = publicBusiness(slug);
  const service = state.services.find(s => s.id === serviceId && s.active);
  return { business: state.business, staff: state.staff.filter(p => p.active), services: state.services.filter(s => s.active), slots: service ? availableSlots(state, date, service, staffId) : [] };
}
export function publicBook(raw: unknown) {
  const data = z.object({ slug: text(3,60), name: text(2), phone: clientSchema.shape.phone, email: clientSchema.shape.email, serviceId: id, staffId: id, date: text(), time: text() }).parse(raw);
  throttle(`booking:${data.slug}`, 60, 15 * 60_000);
  return transact(() => {
    const { userId, state } = publicBusiness(data.slug);
    const service = assertAppointment(state, { ...data, id: '' });
    // Public requests never overwrite an existing customer's private record by claiming their phone number.
    const clientId = randomUUID();
    state.clients.push({ id: clientId, name: data.name, phone: data.phone, email: data.email, notes: '' });
    const token = randomBytes(32).toString('hex');
    const appointment: Appointment = { id: randomUUID(), clientId, staffId: data.staffId, serviceId: service.id, date: data.date, time: data.time, duration: service.duration, price: service.price, serviceName: service.name, status: 'scheduled', notes: '', createdAt: new Date().toISOString() };
    state.appointments.push(appointment);
    db.prepare('INSERT INTO reservations(token,user_id,appointment_id) VALUES(?,?,?)').run(hash(token),userId,appointment.id);
    writeState(userId, state);
    return { token };
  });
}
export function reservation(token: string, cancel = false) {
  if (!/^[a-f0-9]{64}$/.test(token)) throw new AppError('Link de reserva inválido.', 404);
  return transact(() => {
    const ref = db.prepare('SELECT user_id,appointment_id FROM reservations WHERE token=?').get(hash(token)) as { user_id: string; appointment_id: string } | undefined;
    if (!ref) throw new AppError('Reserva não encontrada.', 404);
    const s = stateOf(ref.user_id);
    const a = s.appointments.find(x => x.id === ref.appointment_id)!;
    const canCancel = a.status === 'scheduled' && appointmentTimestamp(a.date,a.time) - Date.now() > s.business.cancellationHours * 3600_000;
    if (cancel) {
      if (!canCancel) throw new AppError('O prazo para cancelamento online encerrou. Entre em contato com o estabelecimento.',409);
      a.status = 'cancelled'; writeState(ref.user_id,s);
    }
    return { business: { name:s.business.name, phone:s.business.phone, address:s.business.address, slug:s.business.slug, cancellationHours:s.business.cancellationHours }, appointment: { date:a.date,time:a.time,duration:a.duration,price:a.price,serviceName:a.serviceName,status:a.status }, professional:s.staff.find(p=>p.id===a.staffId)?.name, canCancel:canCancel && !cancel };
  });
}
