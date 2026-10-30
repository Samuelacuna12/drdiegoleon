export const pair = (es, en) => ({es, en});
export const textOf = (value, lang = 'es') => typeof value === 'object' && value ? (value[lang] ?? value.es ?? '') : String(value ?? '');
export const todayISO = () => new Intl.DateTimeFormat('en-CA', {timeZone:'America/Bogota',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
export function addDays(base, days) { const d = new Date(`${base}T12:00:00Z`); d.setUTCDate(d.getUTCDate()+days); return d.toISOString().slice(0,10); }
export function dayGap(date, today = todayISO()) { return Math.floor((Date.parse(`${today}T12:00:00Z`)-Date.parse(`${date}T12:00:00Z`))/86400000); }
const stage = (id, es, en, ruleEs, ruleEn, tone='slate') => ({id,name:pair(es,en),rule:pair(ruleEs,ruleEn),tone});
export const PIPELINES = {
  tasks: {name:pair('Tareas del equipo','Team tasks'),singular:pair('tarea','task'),description:pair('Cada pendiente, un responsable. Cada entrega, un siguiente paso.','Every task has an owner. Every handoff has a next step.'),stages:[
    stage('todo','Por hacer','To do','Responsable, fecha y resultado esperado definidos.','Owner, due date and expected result are defined.'),
    stage('doing','En progreso','In progress','El responsable inició el trabajo.','The assigned person has started the work.','blue'),
    stage('review','En revisión','In review','La entrega está lista para validar.','The work is ready for review.','amber'),
    stage('done','Terminada','Done','Todas las subtareas están completas.','All checklist items are complete.','green')
  ]},
  clients: {name:pair('CRM comercial','Client CRM'),singular:pair('cliente','client'),description:pair('De la primera conversación a una decisión, sin perder el contexto.','From the first conversation to a decision, with every detail in view.'),stages:[
    stage('new','Nuevo contacto','New lead','Registrar origen, contacto y responsable.','Record source, contact and owner.'),
    stage('contacted','Contactado','Contacted','Contacto registrado y próxima acción definida.','Contact details recorded and next action defined.','blue'),
    stage('scheduled','Valoración agendada','Consultation booked','Fecha de valoración registrada.','A consultation date is recorded.','blue'),
    stage('proposal','Propuesta compartida','Proposal shared','Conversación pendiente de decisión.','The client is considering the proposal.','amber'),
    stage('won','Confirmado','Confirmed','El cliente confirmó continuar.','The client confirmed the next step.','green'),
    stage('lost','No continúa','Not continuing','Cerrar el seguimiento comercial.','Close the commercial follow-up.')
  ]},
  campaigns: {name:pair('Remarketing','Remarketing'),singular:pair('campaña','campaign'),description:pair('Reconecta con intención. Audiencias claras, mensajes relevantes.','Reconnect with intent. Clear audiences, relevant messages.'),stages:[
    stage('draft','Borrador','Draft','Definir segmento, canal y responsable.','Define segment, channel and owner.'),
    stage('validated','Audiencia validada','Audience validated','Al menos un contacto elegible con permiso para el canal.','At least one eligible contact with channel permission.','blue'),
    stage('ready','Lista para activar','Ready','Audiencia elegible y mensaje preparado. No envía mensajes.','Eligible audience and prepared message. No messages are sent.','amber'),
    stage('followup','En seguimiento','Follow-up','Registrar respuestas y próximas acciones manualmente.','Record responses and next actions manually.','blue'),
    stage('closed','Cerrada','Closed','Registrar el aprendizaje y cerrar el plan.','Record learnings and close the plan.','green')
  ]},
  referrals: {name:pair('Referidos','Referrals'),singular:pair('referido','referral'),description:pair('Cada recomendación tiene un origen. Cada relación, un seguimiento.','Every referral has a source. Every relationship has a follow-up.'),stages:[
    stage('received','Recibido','Received','Registrar cliente referido y quién lo recomendó.','Record the referred client and the person who referred them.'),
    stage('authorized','Contacto autorizado','Contact authorized','El referido autorizó que lo contacten.','The referred person authorized contact.','blue'),
    stage('scheduled','Valoración agendada','Consultation booked','Autorización y fecha de valoración registradas.','Authorization and consultation date recorded.','amber'),
    stage('converted','Convertido','Converted','Confirmar que el referido decidió continuar.','Confirm that the referral decided to proceed.','green'),
    stage('thanked','Agradecimiento','Acknowledged','Registrar el agradecimiento al recomendador.','Record an acknowledgment to the referrer.','green')
  ]},
  partners: {name:pair('Aliados & afiliación','Partners & affiliates'),singular:pair('aliado','partner'),description:pair('Construye una red de aliados con atribución y acuerdos claros.','Build a partner network with clear attribution and agreements.'),stages:[
    stage('prospect','Prospecto','Prospect','Identificar encaje y responsable.','Identify fit and an owner.'),
    stage('conversation','Conversación','Conversation','Registrar la propuesta de colaboración.','Record the collaboration proposal.','blue'),
    stage('agreement','Acuerdo por revisar','Agreement review','Revisar condiciones y responsabilidades.','Review terms and responsibilities.','amber'),
    stage('active','Activo','Active','Acuerdo revisado y código de atribución único.','Reviewed agreement and a unique attribution code.','green'),
    stage('paused','En pausa','Paused','Detener nuevas acciones hasta una revisión.','Pause new actions until review.')
  ]}
};
export const SEGMENTS = [
  {id:'quiet',name:pair('Sin respuesta · 14+ días','No response · 14+ days'),description:pair('Contactos abiertos sin conversación en 14 días o más.','Open contacts with no conversation in at least 14 days.')},
  {id:'proposal',name:pair('Propuesta pendiente','Pending proposal'),description:pair('Propuestas compartidas que aún no tienen decisión.','Shared proposals still awaiting a decision.')},
  {id:'confirmed',name:pair('Clientes confirmados','Confirmed clients'),description:pair('Relaciones confirmadas para cuidar la experiencia y solicitar recomendaciones.','Confirmed relationships for experience follow-up and referral invitations.')}
];
export const active = records => records.filter(x => !x.archived);
export function segmentClients(state, segment, today = todayISO()) {
  return active(state.clients).filter(c => segment === 'quiet' ? !['won','lost'].includes(c.stage) && dayGap(c.lastContact,today)>=14 : segment === 'proposal' ? c.stage==='proposal' : segment === 'confirmed' ? c.stage==='won' : false);
}
export function audience(state, campaign, today = todayISO()) {
  const candidates = segmentClients(state,campaign.segment,today);
  const included = candidates.filter(c => !c.optOut && c.permissions?.[campaign.channel] === true && (campaign.channel==='email' ? Boolean(c.email?.trim()) : Boolean(c.phone?.trim())));
  return {candidates,included,excluded:candidates.filter(c=>!included.includes(c))};
}
export function transitionError(kind, record, next, state, lang='es') {
  const say=(es,en)=>lang==='es'?es:en;
  if (!PIPELINES[kind]?.stages.some(s=>s.id===next)) return say('Selecciona una etapa válida.','Select a valid stage.');
  if (!record.owner || !state.team.some(p=>p.id===record.owner&&!p.archived)) return say('Asigna un responsable del equipo.','Assign an active team member.');
  if (kind==='tasks' && next==='done' && record.checklist?.some(item=>!item.done)) return say('Completa las subtareas antes de terminar.','Complete the checklist before marking this task done.');
  if (kind==='clients' && !['new','lost'].includes(next) && !(record.email?.trim()||record.phone?.trim())) return say('Registra un correo o teléfono de ejemplo.','Add a sample email or phone number.');
  if (kind==='clients' && next==='scheduled' && !record.appointment) return say('Registra la fecha de valoración.','Add the consultation date.');
  if (kind==='campaigns' && ['validated','ready','followup'].includes(next)) {
    if (!audience(state,record).included.length) return say('No hay contactos elegibles con permiso para este canal.','No eligible contacts have permission for this channel.');
    if (['ready','followup'].includes(next) && textOf(record.message,lang).trim().length<10) return say('Prepara el mensaje de la campaña antes de avanzar.','Prepare the campaign message before continuing.');
  }
  if (kind==='referrals') {
    const client=state.clients.find(c=>c.id===record.clientId&&!c.archived);
    if(!client) return say('Selecciona un cliente activo en el CRM.','Select an active CRM client.');
    if(next!=='received'&&!record.authorized) return say('Confirma la autorización del referido para ser contactado.','Confirm the referred person authorized contact.');
    if(next==='scheduled'&&!record.appointment) return say('Registra la fecha de valoración del referido.','Record the referral consultation date.');
  }
  if (kind==='partners' && next==='active' && (!record.agreementReviewed||!record.code?.trim())) return say('Revisa el acuerdo y asigna un código de atribución.','Review the agreement and assign an attribution code.');
  return '';
}
export function seedState(today=todayISO()) {
  const d=n=>addDays(today,n);
  const team=[
    {id:'e1',name:'Valentina Rojas',role:pair('Coordinación','Coordination'),initials:'VR',tone:'navy'},
    {id:'e2',name:'Mateo Ruiz',role:pair('Marketing & alianzas','Marketing & partnerships'),initials:'MR',tone:'blue'},
    {id:'e3',name:'Sofía Morales',role:pair('Atención al cliente','Client experience'),initials:'SM',tone:'sand'},
    {id:'e4',name:'Camila Torres',role:pair('Operaciones','Operations'),initials:'CT',tone:'mint'}
  ];
  const names=['Laura Méndez','James Wilson','Isabella Costa','Andrés Vega','Emma Clark','Daniel Romero','Mariana López','Oliver Martin','Lucía Torres','Gabriel Silva'];
  const stages=['new','contacted','scheduled','proposal','won','proposal','contacted','won','lost','new'];
  const countries=['Colombia','United States','Brazil','Colombia','Canada','Colombia','Mexico','United States','Colombia','Colombia'];
  const channels=['Instagram','Website','WhatsApp','Referral','Instagram','Website','WhatsApp','Partner','Referral','Instagram'];
  const clients=names.map((name,i)=>({id:`c${i+1}`,name,email:`cliente${i+1}@example.com`,phone:i%2?'000 000 0000':'',country:countries[i],source:channels[i],owner:i%2?'e3':'e1',stage:stages[i],nextDate:d(i%4-1),nextAction:pair(['Presentar la primera conversación','Confirmar disponibilidad','Preparar la valoración','Resolver preguntas de la propuesta'][i%4],['Introduce the first conversation','Confirm availability','Prepare the consultation','Answer proposal questions'][i%4]),interest:pair(i%2?'Atención internacional':'Valoración inicial',i%2?'International care':'Initial consultation'),lastContact:d([-1,-20,-2,-17,-40,-21,-25,-60,-10,-1][i]),appointment:stages[i]==='scheduled'?d(3):'',permissions:{email:![2,6,8].includes(i),whatsapp:[1,3,5,7].includes(i)},optOut:i===6,notes:[],archived:false}));
  const titles=[
    pair('Confirmar agenda de valoraciones','Confirm consultation schedule'),pair('Preparar bienvenida internacional','Prepare international welcome'),pair('Revisar propuesta de Laura','Review Laura’s proposal'),pair('Actualizar guía de atención','Update the care guide'),pair('Diseñar seguimiento de propuestas','Design proposal follow-up'),pair('Contactar aliado de alojamiento','Contact accommodation partner'),pair('Validar campaña de reactivación','Review reactivation campaign'),pair('Revisar origen de nuevos contactos','Review new contact sources'),pair('Organizar próximos seguimientos','Organize upcoming follow-ups'),pair('Preparar reunión semanal','Prepare weekly meeting'),pair('Verificar material de bienvenida','Check welcome material'),pair('Cerrar pendientes de la semana','Close weekly outstanding tasks')
  ];
  const taskStages=['todo','todo','todo','doing','doing','doing','review','review','review','done','done','done'];
  const tasks=titles.map((title,i)=>({id:`t${i+1}`,title,owner:`e${i%4+1}`,stage:taskStages[i],priority:i%4===0?'high':i%3===0?'low':'normal',dueDate:d([0,1,-1,0,2,1,0,-1,3,-1,-2,0][i]),clientId:i<3?['c3','c2','c1'][i]:'',description:pair('Coordinar el próximo paso y dejar el resultado registrado para el equipo.','Coordinate the next step and record the outcome for the team.'),checklist:[{id:`q${i}a`,title:pair('Revisar contexto','Review context'),done:i>=3},{id:`q${i}b`,title:pair('Registrar resultado','Record outcome'),done:i>=9}],notes:[],archived:false}));
  const campaigns=[
    {id:'m1',title:pair('Volvamos a conversar','Let’s reconnect'),segment:'quiet',channel:'email',stage:'draft',owner:'e2',nextDate:d(2),message:pair('Hola, ¿te gustaría retomar la conversación con nuestro equipo? Podemos ayudarte a resolver tus dudas y definir el siguiente paso.','Hello, would you like to continue your conversation with our team? We can answer your questions and discuss the next step.'),notes:[]},
    {id:'m2',title:pair('Tu siguiente paso','Your next step'),segment:'proposal',channel:'email',stage:'validated',owner:'e3',nextDate:d(1),message:pair('Hola, queremos saber si tienes alguna pregunta sobre la propuesta que conversamos. Estamos para ayudarte.','Hello, we wanted to check whether you have any questions about the proposal we discussed. We are here to help.'),notes:[]},
    {id:'m3',title:pair('Una experiencia para compartir','An experience to share'),segment:'confirmed',channel:'email',stage:'ready',owner:'e2',nextDate:d(3),message:pair('Gracias por confiar en nuestro equipo. Si conoces a alguien que quiera conversar con nosotros, puedes compartir nuestro contacto.','Thank you for trusting our team. If you know someone who would like to speak with us, you can share our contact information.'),notes:[]},
    {id:'m4',title:pair('Seguimiento cercano','A personal follow-up'),segment:'proposal',channel:'whatsapp',stage:'followup',owner:'e3',nextDate:d(0),message:pair('Hola, ¿cómo estás? Nuestro equipo está disponible para resolver las dudas que tengas sobre los próximos pasos.','Hello, how are you? Our team is available to answer any questions about the next steps.'),notes:[]}
  ];
  const partners=[
    {id:'p1',name:'Casa Norte · Demo',type:'hospitality',email:'casanorte@example.com',owner:'e2',stage:'active',code:'DL-CASA',agreementReviewed:true,nextDate:d(7),nextAction:pair('Revisar nuevos referidos','Review new referrals'),notes:[]},
    {id:'p2',name:'Travel Collective · Demo',type:'agency',email:'travel@example.com',owner:'e2',stage:'agreement',code:'DL-TRAVEL',agreementReviewed:false,nextDate:d(2),nextAction:pair('Revisar propuesta de colaboración','Review collaboration proposal'),notes:[]},
    {id:'p3',name:'Andrea Studio · Demo',type:'creator',email:'studio@example.com',owner:'e1',stage:'conversation',code:'DL-ANDREA',agreementReviewed:false,nextDate:d(1),nextAction:pair('Compartir presentación','Share presentation'),notes:[]},
    {id:'p4',name:'Comunidad Bienestar · Demo',type:'community',email:'comunidad@example.com',owner:'e2',stage:'prospect',code:'DL-COMUNIDAD',agreementReviewed:false,nextDate:d(4),nextAction:pair('Explorar afinidad de la alianza','Explore partnership fit'),notes:[]}
  ];
  const referrals=[
    {id:'r1',clientId:'c4',referrerType:'client',referrerId:'c5',owner:'e3',stage:'received',authorized:false,appointment:'',nextDate:d(0),nextAction:pair('Esperar autorización del referido','Wait for the referral’s authorization'),notes:[]},
    {id:'r2',clientId:'c3',referrerType:'partner',referrerId:'p1',owner:'e1',stage:'scheduled',authorized:true,appointment:d(3),nextDate:d(2),nextAction:pair('Confirmar detalles de la valoración','Confirm consultation details'),notes:[]},
    {id:'r3',clientId:'c8',referrerType:'partner',referrerId:'p1',owner:'e3',stage:'converted',authorized:true,appointment:d(-4),nextDate:d(1),nextAction:pair('Registrar agradecimiento al aliado','Record acknowledgment to the partner'),notes:[]},
    {id:'r4',clientId:'c10',referrerType:'client',referrerId:'c8',owner:'e1',stage:'authorized',authorized:true,appointment:'',nextDate:d(1),nextAction:pair('Proponer primera conversación','Suggest an introductory conversation'),notes:[]}
  ];
  const activity=[
    {id:'a1',kind:'clients',recordId:'c3',label:pair('Isabella Costa pasó a valoración agendada','Isabella Costa moved to consultation booked'),at:new Date(`${today}T14:20:00Z`).toISOString()},
    {id:'a2',kind:'tasks',recordId:'t10',label:pair('Preparar reunión semanal · tarea terminada','Prepare weekly meeting · task completed'),at:new Date(`${today}T14:00:00Z`).toISOString()},
    {id:'a3',kind:'campaigns',recordId:'m3',label:pair('Una experiencia para compartir · lista para activar','An experience to share · ready'),at:new Date(`${today}T13:40:00Z`).toISOString()}
  ];
  return {version:1,language:'es',team,clients,tasks,campaigns,referrals,partners,activity};
}
