// =============================================
// ARMAZENAMENTO LOCAL (demonstração sem servidor)
// =============================================

// Eu guardo os dados pequenos no localStorage, com prefixo do site.
// Quando o Supabase entrar (guia no README), esta camada sai de cena.

const PREFIXO = 'mocursos:'

export const CHAVES = {
  usuarios: `${PREFIXO}usuarios`,
  sessao: `${PREFIXO}sessao`,
  cursos: `${PREFIXO}cursos`,
  matriculas: `${PREFIXO}matriculas`,
  progresso: `${PREFIXO}progresso`,
  certificados: `${PREFIXO}certificados`,
}

// Eu leio um valor com segurança (nunca quebra o app).
export function ler(chave, padrao) {
  try {
    const texto = window.localStorage.getItem(chave)
    return texto ? JSON.parse(texto) : padrao
  } catch {
    return padrao
  }
}

// Eu gravo um valor no armazenamento.
export function guardar(chave, valor) {
  try {
    window.localStorage.setItem(chave, JSON.stringify(valor))
  } catch {
    // Eu ignoro cota cheia: a demonstração segue sem gravar.
  }
}

// ----- Arquivos grandes (vídeos e anexos) no IndexedDB -----

// Eu abro o banco de arquivos do site.
function abrirBanco() {
  return new Promise((resolver, rejeitar) => {
    const pedido = window.indexedDB.open('mocursos-arquivos', 1)
    pedido.onupgradeneeded = () => {
      const banco = pedido.result
      if (!banco.objectStoreNames.contains('arquivos')) {
        banco.createObjectStore('arquivos', { keyPath: 'id' })
      }
    }
    pedido.onsuccess = () => resolver(pedido.result)
    pedido.onerror = () => rejeitar(pedido.error)
  })
}

// Eu salvo um arquivo (vídeo, PDF, imagem...) e devolvo o id.
export async function salvarArquivo(arquivo) {
  const id = `arq-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
  const banco = await abrirBanco()
  await new Promise((resolver, rejeitar) => {
    const transacao = banco.transaction('arquivos', 'readwrite')
    transacao.objectStore('arquivos').put({
      id,
      nome: arquivo.name,
      tipo: arquivo.type,
      tamanho: arquivo.size,
      blob: arquivo,
      data: new Date().toISOString(),
    })
    transacao.oncomplete = () => resolver()
    transacao.onerror = () => rejeitar(transacao.error)
  })
  banco.close()
  return id
}

// Eu leio um arquivo salvo (metadados + conteúdo).
export async function lerArquivo(id) {
  const banco = await abrirBanco()
  const registro = await new Promise((resolver, rejeitar) => {
    const transacao = banco.transaction('arquivos', 'readonly')
    const pedido = transacao.objectStore('arquivos').get(id)
    pedido.onsuccess = () => resolver(pedido.result ?? null)
    pedido.onerror = () => rejeitar(pedido.error)
  })
  banco.close()
  return registro
}

// Eu apago um arquivo salvo.
export async function excluirArquivo(id) {
  const banco = await abrirBanco()
  await new Promise((resolver) => {
    const transacao = banco.transaction('arquivos', 'readwrite')
    transacao.objectStore('arquivos').delete(id)
    transacao.oncomplete = () => resolver()
    transacao.onerror = () => resolver()
  })
  banco.close()
}
