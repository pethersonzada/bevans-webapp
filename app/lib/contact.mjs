export const PLANOS = Object.freeze(['Autônomo', 'Frota', 'Rede']);

export function normalizePlan(value) {
  return PLANOS.includes(value) ? value : '';
}

export function normalizeContactEmail(value) {
  if (typeof value !== 'string') return '';
  const email = value.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254 ? email : '';
}

/** Prepara texto localmente, mesmo quando o canal comercial ainda não foi definido. */
export function buildContactMessage({ name, email, plan, message }) {
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
  return { subject, body };
}

export function buildContactCopy({ recipient, ...fields }) {
  const { subject, body } = buildContactMessage(fields);
  const destination = normalizeContactEmail(recipient);
  return [destination ? 'Para: ' + destination : null,'Assunto: ' + subject,'',body].filter(line => line !== null).join('\n');
}

export function buildContactMailto({ recipient, ...fields }) {
  const destination = normalizeContactEmail(recipient);
  if (!destination) throw new Error('Canal de contato indisponível.');
  const { subject, body } = buildContactMessage(fields);
  return 'mailto:' + destination + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
}
