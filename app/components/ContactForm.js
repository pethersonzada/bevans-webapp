'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { buildContactMailto, normalizeContactEmail, normalizePlan, PLANOS } from '../lib/contact.mjs';

const commercialEmail = normalizeContactEmail(process.env.NEXT_PUBLIC_CONTACT_EMAIL);

export default function ContactForm() {
  const params = useSearchParams();
  const [plan, setPlan] = useState(() => normalizePlan(params.get('plano')));
  const [name, setName] = useState('');
  const [sender, setSender] = useState('');
  const [message, setMessage] = useState(() => {
    const subject = params.get('assunto');
    if (subject === 'excursoes') return 'Quero saber mais sobre o módulo de excursões do BeVans.';
    if (subject === 'Motorista autônomo') return 'Gostaria de conhecer os recursos do aplicativo para motoristas autônomos.';
    if (subject === 'Gestão de frotas') return 'Gostaria de conversar sobre a futura gestão de frotas no BeVans.';
    return '';
  });
  const [error, setError] = useState('');

  function handleSubmit(event) {
    event.preventDefault();
    setError('');
    try {
      const destination = buildContactMailto({ recipient: commercialEmail, name, email: sender, plan, message });
      window.location.assign(destination);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível preparar a mensagem.');
    }
  }

  return (
    <div className="contact-card">
      <h2>Conte um pouco sobre sua operação.</h2>
      <p>Prepare uma mensagem para conversar com a equipe BeVans.</p>
      {!commercialEmail && (
        <div role="status" className="contact-warning">
          O contato por e-mail ainda não foi habilitado. A equipe precisa configurar um endereço comercial para ativar este formulário. Nenhuma mensagem será enviada enquanto isso.
        </div>
      )}
      <form className="contact-form" onSubmit={handleSubmit} noValidate={false}>
        <label htmlFor="contact-name">Seu nome
          <input id="contact-name" autoComplete="name" name="name" required minLength={2} maxLength={100}
            placeholder="Como podemos chamar você?" value={name} onChange={event => setName(event.target.value)} />
        </label>
        <label htmlFor="contact-email">Seu e-mail
          <input id="contact-email" type="email" autoComplete="email" name="email" required maxLength={160}
            placeholder="voce@exemplo.com" value={sender} onChange={event => setSender(event.target.value)} />
        </label>
        <label htmlFor="contact-plan">Plano de interesse
          <select id="contact-plan" name="plan" value={plan} onChange={event => setPlan(event.target.value)}>
            <option value="">Ainda não sei</option>
            {PLANOS.map(item => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
        <label htmlFor="contact-message">O que você precisa?
          <textarea id="contact-message" name="message" maxLength={1200} required minLength={10}
            placeholder="Conte quantas vans você tem e o que gostaria de melhorar..."
            value={message} onChange={event => setMessage(event.target.value)} />
        </label>
        {error && <p className="contact-warning" role="alert">{error}</p>}
        <button className="button button-yellow" type="submit" disabled={!commercialEmail}>
          Abrir mensagem no meu e-mail <span aria-hidden="true">↗</span>
        </button>
        <p className="form-hint">
          O botão abre seu aplicativo de e-mail. Você precisará confirmar o envio nele. Nenhuma mensagem é enviada diretamente pelo site.
          Consulte nossa <Link className="underline" href="/privacidade">Política de Privacidade</Link>.
        </p>
      </form>
    </div>
  );
}
