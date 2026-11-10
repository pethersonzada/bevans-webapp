export const PLANOS = Object.freeze(['Autônomo', 'Frota', 'Rede']);

export function normalizePlan(value) {
  return PLANOS.includes(value) ? value : '';
}

export function normalizeContactEmail(value) {
  if (typeof value !== 'string') return '';
  const email = value.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254 ? email : '';
}

export function buildContactMailto({ recipient, name, email, plan, message }) {
  const destination = normalizeContactEmail(recipient);
  if (!destination) throw new Error('Canal de contato indisponível.');

  const cleanName = String(name ?? '').trim();
  const cleanEmail = normalizeContactEmail(email);
  const cleanMessage = String(message ?? '').trim();
  const cleanPlan = normalizePlan(plan);

  if (cleanName.length < 2 || cleanName.length > 100 || !cleanEmail || cleanMessage.length < 10 || cleanMessage.length > 1200) {
    throw new Error('Confira os campos antes de continuar.');
  }

  const subject = 'Contato comercial BeVans - ' + (cleanPlan || 'Geral');
  const body = [
    'Olá! Gostaria de saber mais sobre o BeVans.',
    '',
    'Nome: ' + cleanName,
    'E-mail: ' + cleanEmail,
    'Plano: ' + (cleanPlan || 'Ainda não sei'),
    '',
    'Mensagem:',
    cleanMessage,
  ].join('\n');

  return 'mailto:' + destination + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
}
