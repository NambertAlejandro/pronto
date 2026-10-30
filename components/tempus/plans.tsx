'use client';

import { useRef, useState, type RefObject } from 'react';
import { ArrowRight, Check, ChevronDown, Globe2, Layers3, Scissors, Sparkles, Users } from 'lucide-react';
import { plans, type Cycle } from '@/lib/tempus/checkout';
import { usePlanParallax } from './use-plan-parallax';

type Props = {
  cycle: Cycle;
  onCycleChange: (cycle: Cycle) => void;
  onSelect: (id: string) => void;
  onLogin: () => void;
  headingRef: RefObject<HTMLHeadingElement | null>;
};

const descriptions = [
  'O essencial para cuidar da sua agenda e de cada cliente.',
  'Uma operação organizada. Uma equipe no mesmo ritmo.',
  'Mais possibilidades para a próxima fase do seu negócio.',
];

export function Plans({ cycle, onCycleChange, onSelect, onLogin, headingRef }: Props) {
  const [compare, setCompare] = useState(false);
  const stageRef = usePlanParallax();
  const carouselRef = useRef<HTMLDivElement>(null);
  const [mobilePlan, setMobilePlan] = useState(0);
  const cardStride = (carousel: HTMLDivElement) => {
    const card = carousel.firstElementChild as HTMLElement | null;
    return card ? card.getBoundingClientRect().width + parseFloat(getComputedStyle(carousel).columnGap) : 1;
  };
  const showPlan = (index: number) => {
    const carousel = carouselRef.current;
    if (!carousel) return;
    carousel.scrollTo({ left: cardStride(carousel) * index, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  };
  return (
    <section className="plans-experience" aria-label="Escolha seu plano">
      <div className="plans-intro">
        <span className="section-kicker"><span /> FEITO PARA O SEU PRÓXIMO PASSO</span>
        <h1 ref={headingRef} tabIndex={-1}>Seu talento merece<br /><em>tempo para crescer.</em></h1>
        <p>Menos tarefas entre os atendimentos.<br className="intro-mobile-break" /> Mais espaço para o seu negócio.</p>
      </div>

      <div className="billing-control">
        <div className="billing-tabs" role="group" aria-label="Periodicidade">
          <button type="button" aria-pressed={cycle === 'mensal'} onClick={() => onCycleChange('mensal')}>Mensal</button>
          <button type="button" aria-pressed={cycle === 'anual'} onClick={() => onCycleChange('anual')}>Anual</button>
        </div>
        <span>Escolha o ritmo da sua assinatura</span>
      </div>

      <div className="mobile-plan-switcher" role="group" aria-label="Navegar entre planos">
        {plans.map((plan, index) => <button key={plan.id} type="button" aria-pressed={mobilePlan === index} aria-controls={`plan-${plan.id}`} onClick={() => showPlan(index)}>{plan.name}</button>)}
      </div>
      <div className="plan-stage" ref={stageRef}>
        <div className="plan-ambient" aria-hidden="true" />
        <div className="plan-orbit" aria-hidden="true" />
        <div className="plan-horizon" aria-hidden="true" />
        <div className="premium-plans-grid" ref={carouselRef} role="region" aria-label="Planos disponíveis" onScroll={event => {
          const carousel = event.currentTarget;
          setMobilePlan(Math.min(plans.length - 1, Math.max(0, Math.round(carousel.scrollLeft / cardStride(carousel)))));
        }}>
          {plans.map((plan, index) => {
            const featured = index === 1;
            const Icon = index === 0 ? Scissors : index === 1 ? Users : Layers3;
            return (
              <article id={`plan-${plan.id}`} className={`subscription-card${featured ? ' subscription-card-featured' : ''}`} key={plan.id}>
                {featured && <div className="card-recommendation"><Sparkles size={12} /> PARA CRESCER EM EQUIPE</div>}
                <div className="subscription-topline"><span className="subscription-symbol"><Icon size={21} strokeWidth={1.4} /></span><span className="subscription-edition">0{index + 1}</span></div>
                <div className="subscription-heading"><h2>{plan.name}</h2><p>{descriptions[index]}</p></div>
                <div className="subscription-capacity"><Users size={13} strokeWidth={1.5} />{plan.capacity}</div>
                <div className="subscription-price"><span>ASSINATURA {cycle === 'mensal' ? 'MENSAL' : 'ANUAL'}</span><strong>A definir<span aria-hidden="true">.</span></strong><small>Valores disponíveis no lançamento</small></div>
                <button className="subscription-action" type="button" onClick={() => onSelect(plan.id)}>Escolher {plan.name}<ArrowRight size={16} strokeWidth={1.6} /></button>
                <div className="subscription-features"><span>O QUE ESTÁ PREVISTO</span><ul>{plan.features.map(feature => <li key={feature}><Check size={14} strokeWidth={1.7} /><span>{feature}</span></li>)}</ul></div>
              </article>
            );
          })}
        </div>
        <div className="mobile-swipe-hint"><span>Deslize para comparar</span><span aria-live="polite">0{mobilePlan + 1}<span> / 03</span></span></div>
      </div>

      <div className="plans-footnotes">
        <div className="product-principles"><span><Globe2 size={15} />Direto no navegador</span><span><Users size={15} />Pensado para sua equipe</span><span><Sparkles size={15} />Comece no seu ritmo</span></div>
        <p>Prévia dos planos. Recursos e valores sujeitos à definição antes do lançamento.</p>
        <button className="compare-button" type="button" aria-expanded={compare} aria-controls="plan-comparison" onClick={() => setCompare(!compare)}>Comparar os planos<ChevronDown size={15} className={compare ? 'rotate' : ''} /></button>
      </div>
      {compare && <div id="plan-comparison" className="comparison"><table><caption>Comparação preliminar dos planos</caption><thead><tr><th>Recurso</th>{plans.map(plan => <th key={plan.id}>{plan.name}</th>)}</tr></thead><tbody><tr><th>Profissionais</th><td>Até 2</td><td>Até 5</td><td>A definir</td></tr><tr><th>Agenda e clientes</th><td>Incluído</td><td>Incluído</td><td>Incluído</td></tr><tr><th>Gestão da equipe</th><td>Básica</td><td>Ampliada</td><td>Ampliada</td></tr><tr><th>Preço</th><td>A definir</td><td>A definir</td><td>A definir</td></tr></tbody></table></div>}
      <div className="plans-questions"><div><span className="section-kicker">PODE PERGUNTAR</span><h2>Antes de começar.</h2><p>O próximo passo fica mais simples<br />quando está tudo claro.</p></div><div className="faq">{[
        ['Preciso baixar algum aplicativo?', 'Não. O Tempus será acessado pelo navegador, no celular ou no computador.'],
        ['Já posso contratar um plano?', 'Esta versão é uma prévia navegável. Preços, recursos e condições finais ainda serão definidos.'],
        ['Posso usar com minha equipe?', 'Sim, a proposta contempla acesso individual e permissões por profissional. As integrações serão construídas nas próximas etapas.'],
      ].map(([question, answer]) => <details key={question}><summary>{question}<ChevronDown size={15} /></summary><p>{answer}</p></details>)}</div></div>
      <p className="plans-login">Já tem uma conta? <button className="link" type="button" onClick={onLogin}>Entrar no Tempus <ArrowRight size={13} /></button></p>
    </section>
  );
}
