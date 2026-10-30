import type { State, Service, DayHours, Appointment } from './types';

export class AppError extends Error { constructor(message: string, public status = 400) { super(message); } }
export const minutes = (time: string) => Number(time.slice(0, 2)) * 60 + Number(time.slice(3));
export const timeLabel = (value: number) => `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`;
export function validTime(time: string) { return /^([01]\d|2[0-3]):[0-5]\d$/.test(time); }
export function validDate(date: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(date) && Number.isFinite(Date.parse(`${date}T12:00:00Z`)) && new Date(`${date}T12:00:00Z`).toISOString().slice(0, 10) === date;
}
export function today(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now);
  return `${parts.find(p => p.type === 'year')!.value}-${parts.find(p => p.type === 'month')!.value}-${parts.find(p => p.type === 'day')!.value}`;
}
// The MVP supports only São Paulo, UTC-03 with no current daylight saving. Expand explicitly before adding other zones.
export function appointmentTimestamp(date: string, time: string) { return new Date(`${date}T${time}:00-03:00`).getTime(); }
export function validateHours(hours: DayHours[]) {
  if (!Array.isArray(hours) || hours.length !== 7) throw new AppError('Informe os horários dos sete dias da semana.');
  for (const h of hours) {
    if (typeof h.enabled !== 'boolean' || !validTime(h.start) || !validTime(h.end) || minutes(h.end) <= minutes(h.start)) throw new AppError('O fechamento deve ser depois da abertura.');
    if (h.breakStart || h.breakEnd) {
      if (!validTime(h.breakStart) || !validTime(h.breakEnd) || minutes(h.breakStart) < minutes(h.start) || minutes(h.breakEnd) > minutes(h.end) || minutes(h.breakStart) >= minutes(h.breakEnd)) throw new AppError('O intervalo deve estar dentro do expediente, com início antes do fim.');
    }
  }
}
export function availableSlots(state: State, date: string, service: Service, staffId: string, ignoreId?: string, now = Date.now()) {
  if (!validDate(date) || !service.active || !state.staff.some(p => p.id === staffId && p.active) || (service.staffIds.length && !service.staffIds.includes(staffId))) return [];
  const h = state.business.hours[new Date(`${date}T12:00:00Z`).getUTCDay()];
  if (!h?.enabled) return [];
  const slots: string[] = [];
  const relevant = state.appointments.filter(a => a.id !== ignoreId && a.staffId === staffId && a.date === date && a.status !== 'cancelled');
  for (let start = minutes(h.start); start + service.duration <= minutes(h.end); start += 15) {
    const end = start + service.duration;
    if (h.breakStart && start < minutes(h.breakEnd) && end > minutes(h.breakStart)) continue;
    if (appointmentTimestamp(date, timeLabel(start)) <= now) continue;
    if (relevant.some(a => start < minutes(a.time) + a.duration && end > minutes(a.time))) continue;
    slots.push(timeLabel(start));
  }
  return slots;
}
export function assertAppointment(state: State, a: Pick<Appointment, 'id'|'staffId'|'serviceId'|'date'|'time'>) {
  const service = state.services.find(s => s.id === a.serviceId && s.active);
  if (!service) throw new AppError('Selecione um serviço ativo.');
  const maxDate = new Date(); maxDate.setDate(maxDate.getDate() + 365);
  if (!validDate(a.date) || a.date > today(maxDate)) throw new AppError('Escolha uma data válida nos próximos 12 meses.');
  if (!availableSlots(state, a.date, service, a.staffId, a.id).includes(a.time)) throw new AppError('Esse horário não está mais disponível. Escolha outro horário.', 409);
  return service;
}
