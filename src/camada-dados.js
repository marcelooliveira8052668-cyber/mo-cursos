// =============================================
// CAMADA DE DADOS
// =============================================

// Eu concentro aqui todas as leituras e gravações do app.
// Hoje tudo mora no navegador (demonstração sem servidor).
// Com o Supabase (guia no README), o corpo destas funções vai para
// a nuvem — os nomes continuam iguais e o resto do site não muda.

import { CHAVES, ler, guardar } from './armazenamento'
import { gerarId, hashSenha, todasAsAulas } from './utilitarios'
import { CURSO_DEMO } from './dados/demo'

/* ---------- Usuários e sessão ---------- */

// Eu garanto as contas de teste e o curso de exemplo na 1ª abertura.
export function garantirUsuariosDemo() {
  const usuarios = ler(CHAVES.usuarios, [])
  if (usuarios.length > 0) return
  guardar(CHAVES.usuarios, [
    {
      id: 'u-prof-demo',
      nome: 'Professor Demo',
      email: 'professor@demo.com',
      senha: hashSenha('demo123'),
      papel: 'professor',
      criadoEm: new Date().toISOString(),
    },
    {
      id: 'u-aluno-demo',
      nome: 'Aluno Demo',
      email: 'aluno@demo.com',
      senha: hashSenha('demo123'),
      papel: 'aluno',
      criadoEm: new Date().toISOString(),
    },
  ])
  guardar(CHAVES.cursos, [CURSO_DEMO])
}

// Eu crio a conta de um novo usuário (professor ou aluno).
export function cadastrar({ nome, email, senha, papel }) {
  const usuarios = ler(CHAVES.usuarios, [])
  const emailLimpo = email.trim().toLowerCase()
  if (usuarios.some((u) => u.email === emailLimpo)) {
    return { erro: 'Já existe uma conta com este e-mail.' }
  }
  const usuario = {
    id: gerarId('u-'),
    nome: nome.trim(),
    email: emailLimpo,
    senha: hashSenha(senha),
    papel,
    criadoEm: new Date().toISOString(),
  }
  guardar(CHAVES.usuarios, [...usuarios, usuario])
  return { usuario }
}

// Eu valido e-mail + senha e abro a sessão.
export function entrar(email, senha) {
  const usuarios = ler(CHAVES.usuarios, [])
  const usuario = usuarios.find(
    (u) => u.email === email.trim().toLowerCase() && u.senha === hashSenha(senha)
  )
  if (!usuario) return { erro: 'E-mail ou senha incorretos.' }
  guardar(CHAVES.sessao, usuario.id)
  return { usuario }
}

// Eu leio e encerro a sessão.
export function obterSessao() {
  return ler(CHAVES.sessao, null)
}
export function definirSessao(id) {
  guardar(CHAVES.sessao, id)
}
export function obterUsuario(id) {
  return ler(CHAVES.usuarios, []).find((u) => u.id === id) ?? null
}
export function nomeDoProfessor(id) {
  return obterUsuario(id)?.nome ?? 'Professor(a)'
}

/* ---------- Cursos ---------- */

export function listarCursos() {
  return ler(CHAVES.cursos, [])
}
export function obterCurso(id) {
  return listarCursos().find((c) => c.id === id) ?? null
}
export function listarCursosDoProfessor(professorId) {
  return listarCursos().filter((c) => c.professorId === professorId)
}

// Eu gravo um curso (novo ou editado).
export function salvarCurso(curso) {
  const cursos = listarCursos()
  const indice = cursos.findIndex((c) => c.id === curso.id)
  if (indice >= 0) cursos[indice] = curso
  else cursos.push(curso)
  guardar(CHAVES.cursos, cursos)
}

// Eu crio um curso já com o primeiro módulo.
export function criarCurso(dados, professorId) {
  const curso = {
    id: gerarId('c-'),
    professorId,
    criadoEm: new Date().toISOString(),
    modulos: [{ id: gerarId('m-'), titulo: 'Módulo 1', aulas: [] }],
    ...dados,
  }
  salvarCurso(curso)
  return curso
}

export function excluirCurso(id) {
  guardar(
    CHAVES.cursos,
    listarCursos().filter((c) => c.id !== id)
  )
}

/* ---------- Matrículas ---------- */

export function matricular(alunoId, cursoId) {
  const matriculas = ler(CHAVES.matriculas, [])
  if (matriculas.some((m) => m.alunoId === alunoId && m.cursoId === cursoId)) return
  guardar(CHAVES.matriculas, [
    ...matriculas,
    { alunoId, cursoId, data: new Date().toISOString() },
  ])
}

export function ehMatriculado(alunoId, cursoId) {
  return ler(CHAVES.matriculas, []).some(
    (m) => m.alunoId === alunoId && m.cursoId === cursoId
  )
}

export function matriculasDoAluno(alunoId) {
  return ler(CHAVES.matriculas, []).filter((m) => m.alunoId === alunoId)
}

// Eu devolvo os alunos matriculados em um curso (com o usuário).
export function alunosDoCurso(cursoId) {
  return ler(CHAVES.matriculas, [])
    .filter((m) => m.cursoId === cursoId)
    .map((m) => ({ matricula: m, aluno: obterUsuario(m.alunoId) }))
    .filter((registro) => registro.aluno)
}

/* ---------- Progresso do aluno ---------- */

function chaveProgresso(alunoId, aulaId) {
  return `${alunoId}|${aulaId}`
}

export function obterProgresso(alunoId, aulaId) {
  const tudo = ler(CHAVES.progresso, {})
  return tudo[chaveProgresso(alunoId, aulaId)] ?? { concluida: false, nota: null, entrega: null }
}

export function alternarConclusao(alunoId, aulaId) {
  const tudo = ler(CHAVES.progresso, {})
  const chave = chaveProgresso(alunoId, aulaId)
  const atual = tudo[chave] ?? { concluida: false, nota: null, entrega: null }
  tudo[chave] = { ...atual, concluida: !atual.concluida }
  guardar(CHAVES.progresso, tudo)
}

export function salvarNota(alunoId, aulaId, acertos, total) {
  const tudo = ler(CHAVES.progresso, {})
  const chave = chaveProgresso(alunoId, aulaId)
  const atual = tudo[chave] ?? { concluida: false, nota: null, entrega: null }
  tudo[chave] = { ...atual, nota: { acertos, total, em: new Date().toISOString() } }
  guardar(CHAVES.progresso, tudo)
}

export function registrarEntrega(alunoId, aulaId, arquivoId, nomeArquivo) {
  const tudo = ler(CHAVES.progresso, {})
  const chave = chaveProgresso(alunoId, aulaId)
  const atual = tudo[chave] ?? { concluida: false, nota: null, entrega: null }
  tudo[chave] = {
    ...atual,
    entrega: { arquivoId, nomeArquivo, data: new Date().toISOString() },
  }
  guardar(CHAVES.progresso, tudo)
}

// Eu resumo o progresso do aluno em um curso.
export function progressoDoCurso(alunoId, curso) {
  const aulas = todasAsAulas(curso)
  const concluidas = aulas.filter((a) => obterProgresso(alunoId, a.id).concluida).length
  return {
    total: aulas.length,
    concluidas,
    percentual: aulas.length ? Math.round((concluidas / aulas.length) * 100) : 0,
  }
}

/* ---------- Certificados ---------- */

// Eu emito (na primeira vez) o certificado de conclusão.
export function obterCertificado(alunoId, curso) {
  const certificados = ler(CHAVES.certificados, {})
  const chave = `${alunoId}|${curso.id}`
  if (certificados[chave]) return certificados[chave]

  const aluno = obterUsuario(alunoId)
  const base = `${chave}:${aluno?.email ?? ''}`
  let soma = 0
  for (let i = 0; i < base.length; i += 1) soma = (soma * 31 + base.charCodeAt(i)) % 1000000
  const certificado = {
    codigo: `MOC-${String(soma).padStart(6, '0')}`,
    data: new Date().toISOString(),
  }
  certificados[chave] = certificado
  guardar(CHAVES.certificados, certificados)
  return certificado
}
