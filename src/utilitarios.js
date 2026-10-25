// =============================================
// UTILITÁRIOS
// =============================================

// Eu gero identificadores únicos simples.
export function gerarId(prefixo = '') {
  return `${prefixo}${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

// Eu faço um hash simples da senha (djb2) para a demonstração local.
// ATENÇÃO: isto NÃO é segurança de produção — a versão com servidor
// usa o Supabase Auth de verdade (guia no README).
export function hashSenha(texto) {
  let h = 5381
  for (let i = 0; i < texto.length; i += 1) h = ((h << 5) + h + texto.charCodeAt(i)) | 0
  return (h >>> 0).toString(16)
}

// Eu formato valores em reais (0 = Gratuito).
export function formatarMoeda(valor) {
  if (!valor || Number(valor) <= 0) return 'Gratuito'
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(valor))
}

// Eu formato a duração total em "1h 20min".
export function formatarDuracao(minutos) {
  const total = Number(minutos) || 0
  if (total < 60) return `${total}min`
  const horas = Math.floor(total / 60)
  const resto = total % 60
  return resto > 0 ? `${horas}h ${resto}min` : `${horas}h`
}

// Eu formato datas no padrão brasileiro.
export function formatarData(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('pt-BR')
}

// Eu extraio o ID do vídeo de qualquer link do YouTube.
export function extrairIdYoutube(url) {
  if (!url) return null
  const limpo = String(url).trim()
  const padroes = [
    /(?:youtube\.com\/watch\?v=)([\w-]{6,})/,
    /(?:youtu\.be\/)([\w-]{6,})/,
    /(?:youtube\.com\/shorts\/)([\w-]{6,})/,
    /(?:youtube\.com\/embed\/)([\w-]{6,})/,
  ]
  for (const padrao of padroes) {
    const achado = limpo.match(padrao)
    if (achado) return achado[1]
  }
  // Eu aceito também o ID puro, colado direto.
  if (/^[\w-]{6,}$/.test(limpo)) return limpo
  return null
}

// Eu devolvo as aulas do curso em lista única.
export function todasAsAulas(curso) {
  return (curso?.modulos ?? []).flatMap((modulo) => modulo.aulas)
}

// Eu calculo a carga horária do curso em minutos.
export function cargaHoraria(curso) {
  return todasAsAulas(curso).reduce((soma, aula) => soma + (Number(aula.minutos) || 0), 0)
}

// Eu devolvo um gradiente estável para a capa, pela categoria.
export function gradienteDoCurso(curso) {
  const base = curso?.categoria ?? curso?.titulo ?? 'curso'
  let soma = 0
  for (let i = 0; i < base.length; i += 1) soma += base.charCodeAt(i)
  const gradientes = [
    'linear-gradient(135deg, #6366F1, #8B5CF6)',
    'linear-gradient(135deg, #0EA5E9, #6366F1)',
    'linear-gradient(135deg, #F59E0B, #EF4444)',
    'linear-gradient(135deg, #10B981, #0EA5E9)',
    'linear-gradient(135deg, #EC4899, #8B5CF6)',
  ]
  return gradientes[soma % gradientes.length]
}
