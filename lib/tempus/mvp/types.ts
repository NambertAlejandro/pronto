export type Staff = { id: string; name: string; role: string; active: boolean };
export type Service = { id: string; name: string; duration: number; price: number; staffIds: string[]; active: boolean };
export type Client = { id: string; name: string; phone: string; email: string; notes: string };
export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled' | 'no_show';
export type Appointment = {
  id: string; clientId: string; staffId: string; serviceId: string; date: string; time: string;
  duration: number; price: number; serviceName: string; status: AppointmentStatus; notes: string;
  createdAt: string; cancellationHash?: string;
};
export type DayHours = { enabled: boolean; start: string; end: string; breakStart: string; breakEnd: string };
export type Business = {
  name: string; slug: string; phone: string; address: string; description: string;
  timezone: 'America/Sao_Paulo'; cancellationHours: number; hours: DayHours[];
};
export type State = {
  business: Business; staff: Staff[]; services: Service[]; clients: Client[]; appointments: Appointment[];
  onboardingStep: number; ready: boolean; revision: number;
};
export type User = { id: string; name: string; email: string };
export type Snapshot = { user: User; state: State };
export const weekdays = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
export const statusLabels: Record<AppointmentStatus, string> = {
  scheduled: 'Agendado', completed: 'Concluído', cancelled: 'Cancelado', no_show: 'Não compareceu',
};
export function emptyState(slug: string): State {
  return {
    business: { name: '', slug, phone: '', address: '', description: '', timezone: 'America/Sao_Paulo', cancellationHours: 0,
      hours: weekdays.map((_, i) => ({ enabled: i > 0, start: '09:00', end: '18:00', breakStart: '12:00', breakEnd: '13:00' })) },
    staff: [], services: [], clients: [], appointments: [], onboardingStep: 0, ready: false, revision: 0,
  };
}
export const money = (value: number) => (value / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
export const dateLabel = (date: string) => date.split('-').reverse().join('/');
