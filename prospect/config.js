// ════════════════════════════════════════════════════════════════
//  Configuração da prospecção — edite à vontade.
// ════════════════════════════════════════════════════════════════

// ─── Cidades-alvo ────────────────────────────────────────────────
// Vale do Paraíba + capital. A busca do Google devolve no máximo 60
// empresas por consulta; para São Paulo capital (que é gigante),
// vale quebrar por bairro: { nome: 'Tatuapé, São Paulo', uf: 'SP' }.
export const CIDADES = [
  { nome: 'São José dos Campos', uf: 'SP' },
  { nome: 'Taubaté',             uf: 'SP' },
  { nome: 'Jacareí',             uf: 'SP' },
  { nome: 'Pindamonhangaba',     uf: 'SP' },
  { nome: 'Caçapava',            uf: 'SP' },
  { nome: 'Guaratinguetá',       uf: 'SP' },
  { nome: 'Lorena',              uf: 'SP' },
  { nome: 'Caraguatatuba',       uf: 'SP' },
  { nome: 'Ubatuba',             uf: 'SP' },
  { nome: 'São Sebastião',       uf: 'SP' },
  { nome: 'Campos do Jordão',    uf: 'SP' },
  { nome: 'São Paulo',           uf: 'SP' },
]

// ─── Nichos / segmentos ──────────────────────────────────────────
// key   = nome curto usado no filtro --nichos
// label = como aparece no CRM (campo "origem")
// query = termo buscado no Google: "{query} em {cidade} {uf}"
export const NICHOS = [
  // Clínicas e saúde
  { key: 'dentista',     label: 'Saúde — Odontologia',   query: 'dentista' },
  { key: 'estetica',     label: 'Saúde — Estética',      query: 'clínica de estética' },
  { key: 'fisio',        label: 'Saúde — Fisioterapia',  query: 'fisioterapia' },
  { key: 'psicologo',    label: 'Saúde — Psicologia',    query: 'psicólogo' },
  { key: 'veterinaria',  label: 'Saúde — Veterinária',   query: 'clínica veterinária' },
  // Alimentação
  { key: 'restaurante',  label: 'Alimentação — Restaurante', query: 'restaurante' },
  { key: 'lanchonete',   label: 'Alimentação — Lanchonete',  query: 'lanchonete' },
  { key: 'cafeteria',    label: 'Alimentação — Cafeteria',   query: 'cafeteria' },
  { key: 'padaria',      label: 'Alimentação — Padaria',     query: 'padaria' },
  { key: 'pizzaria',     label: 'Alimentação — Pizzaria',    query: 'pizzaria' },
  // Varejo e comércio local
  { key: 'moda',         label: 'Varejo — Moda',         query: 'loja de roupas' },
  { key: 'otica',        label: 'Varejo — Ótica',        query: 'ótica' },
  { key: 'petshop',      label: 'Varejo — Pet shop',     query: 'pet shop' },
  { key: 'autopecas',    label: 'Varejo — Autopeças',    query: 'autopeças' },
  { key: 'moveis',       label: 'Varejo — Móveis',       query: 'loja de móveis' },
  // Serviços e profissionais
  { key: 'advocacia',    label: 'Serviços — Advocacia',     query: 'escritório de advocacia' },
  { key: 'contabilidade',label: 'Serviços — Contabilidade', query: 'escritório de contabilidade' },
  { key: 'academia',     label: 'Serviços — Academia',      query: 'academia' },
  { key: 'salao',        label: 'Serviços — Salão de beleza', query: 'salão de beleza' },
  { key: 'barbearia',    label: 'Serviços — Barbearia',     query: 'barbearia' },
  { key: 'oficina',      label: 'Serviços — Oficina mecânica', query: 'oficina mecânica' },
  { key: 'imobiliaria',  label: 'Serviços — Imobiliária',   query: 'imobiliária' },
]

// ─── Pontuação mínima para entrar na lista (0 a 9) ───────────────
// 3 = equilíbrio bom. Suba para 5+ se quiser só os mais "carentes".
export const MIN_SCORE = 3
