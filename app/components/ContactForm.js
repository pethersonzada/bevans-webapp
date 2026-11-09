'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL;

export default function ContactForm() {
  const search = useSearchParams();
  const initialPlan = ['Autônomo','Frota','Rede'].includes(search.get('plano')) ? search.get('plano') : '';
  const [plan, setPlan] = useState(initialPlan);
  const [name, setName] = useState('');
  const [sender, setSender] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!email) return;
    const subject = 'Contato comercial BeVans - ' + (plan || 'Geral');
    const body = ['Olá, gostaria de saber mais sobre o BeVans.','','Nome: '+name,'E-mail: '+sender,'Plano: '+(plan || 'Ainda não sei'),'','Mensagem:',message].join('\n');
    window.location.href = 'mailto:' + email + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
  };

  return <div className="contact-card">
    <h2>Conte um pouco sobre sua operação.</h2>
    <p>Preencha os dados para preparar uma mensagem de contato comercial.</p>
    {!email && <div role="status" className="contact-warning">O canal comercial ainda está sendo configurado. O formulário ficará disponível quando a equipe definir um e-mail de atendimento.</div>}
    <form className="contact-form" onSubmit={handleSubmit}>
      <label htmlFor="contact-name">Seu nome <input id="contact-name" autoComplete="name" name="name" required minLength={2} maxLength={100} placeholder="Como podemos chamar você?" value={name} onChange={(e)=>setName(e.target.value)}/></label>
      <label htmlFor="contact-email">Seu e-mail <input id="contact-email" type="email" autoComplete="email" name="email" required maxLength={160} placeholder="voce@exemplo.com" value={sender} onChange={(e)=>setSender(e.target.value)}/></label>
      <label htmlFor="contact-plan">Plano de interesse <select id="contact-plan" name="plan" value={plan} onChange={(e)=>setPlan(e.target.value)}><option value="">Ainda não sei</option><option value="Autônomo">Autônomo</option><option value="Frota">Frota</option><option value="Rede">Rede</option></select></label>
      <label htmlFor="contact-message">O que você precisa? <textarea id="contact-message" name="message" maxLength={1200} required minLength={10} placeholder="Conte quantas vans você tem e o que gostaria de melhorar..." value={message} onChange={(e)=>setMessage(e.target.value)}/></label>
      <button className="button button-yellow" type="submit" disabled={!email} aria-disabled={!email}>Preparar e-mail de contato <span aria-hidden="true">↗</span></button>
      <p className="form-hint">O botão abre seu aplicativo de e-mail com a mensagem preenchida. O site não armazena os dados deste formulário. Leia os <Link className="underline" href="/termos">termos e informações de privacidade</Link>.</p>
    </form>
  </div>;
}