export type Screen = 'planos'|'conta'|'codigo'|'dados'|'pagamento'|'processando'|'pix'|'expirado'|'recusado'|'confirmado';
export type Cycle = 'mensal'|'anual';
export type Payment = 'cartao'|'pix';
export type State = { screen: Screen; plan: string; cycle: Cycle; email: string; name: string; account: boolean; method: Payment; order: boolean; deadline: number; };
export const initialState: State = { screen:'planos', plan:'essencial', cycle:'mensal', email:'', name:'', account:false, method:'cartao', order:false, deadline:0 };
export const plans = [
 {id:'essencial',name:'Essencial',capacity:'Até 2 profissionais',label:'PARA COMEÇAR BEM',features:['Agenda online','Cadastro de clientes','Confirmações de agendamento','Visão diária da operação']},
 {id:'profissional',name:'Profissional',capacity:'Até 5 profissionais',label:'MAIS ESPAÇO PARA CRESCER',features:['Tudo do Essencial','Gestão da equipe','Relatórios e estatísticas','Permissões por profissional']},
 {id:'premium',name:'Premium',capacity:'Limite a definir',label:'PARA UMA OPERAÇÃO COMPLETA',features:['Tudo do Profissional','Recursos avançados a definir','Personalização a definir','Atendimento a definir']}
];
export const screenSteps: Record<Screen, number> = {planos:0,conta:1,codigo:2,dados:2,pagamento:3,processando:4,pix:4,expirado:3,recusado:3,confirmado:4};
export function validEmail(value:string) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value); }
export function safeState(raw: unknown): State {
 if (!raw || typeof raw !== 'object') return initialState;
 const s = raw as Partial<State>;
 const validScreens = Object.keys(screenSteps);
 if (!validScreens.includes(s.screen ?? '') || !plans.some(p=>p.id===s.plan)) return initialState;
 return {...initialState, screen:s.screen as Screen, plan:s.plan!, cycle:s.cycle==='anual'?'anual':'mensal', method:s.method==='pix'?'pix':'cartao', order:s.order===true, deadline:typeof s.deadline==='number'?s.deadline:0};
}
export function remaining(deadline:number,now=Date.now()) { return Math.max(0,Math.ceil((deadline-now)/1000)); }
