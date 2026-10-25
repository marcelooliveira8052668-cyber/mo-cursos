// =============================================
// ÁREA DO PROFESSOR (painel de cursos e alunos)
// =============================================

import { useState } from 'react'
import {
  listarCursosDoProfessor,
  criarCurso,
  excluirCurso,
  alunosDoCurso,
  progressoDoCurso,
} from '../camada-dados'
import { todasAsAulas, formatarMoeda, formatarData } from '../utilitarios'
import { CATEGORIAS, EMOJIS_CURSO } from '../configuracao'

const FORM_VAZIO = {
  titulo: '',
  resumo: '',
  descricao: '',
  categoria: CATEGORIAS[0],
  emoji: '🎓',
  preco: '',
}

export default function AreaProfessor({ usuario, aoEditar, aoAvisar, aoAtualizar }) {
  const [mostrarForm, setMostrarForm] = useState(false)
  const [form, setForm] = useState(FORM_VAZIO)
  const [alunosDe, setAlunosDe] = useState(null)

  const cursos = listarCursosDoProfessor(usuario.id)
  const totalAlunos = cursos.reduce((soma, curso) => soma + alunosDoCurso(curso.id).length, 0)
  const totalAulas = cursos.reduce((soma, curso) => soma + todasAsAulas(curso).length, 0)

  // Eu crio o curso e já levo o professor para montar as aulas.
  const criar = (evento) => {
    evento.preventDefault()
    if (form.titulo.trim().length < 3) {
      aoAvisar('Dê um título ao curso (mínimo 3 letras).')
      return
    }
    const curso = criarCurso(
      {
        titulo: form.titulo.trim(),
        resumo: form.resumo.trim() || form.titulo.trim(),
        descricao: form.descricao.trim(),
        categoria: form.categoria,
        emoji: form.emoji,
        preco: Number(form.preco) || 0,
      },
      usuario.id
    )
    setForm(FORM_VAZIO)
    setMostrarForm(false)
    aoAvisar('Curso criado! Agora adicione as aulas ✓')
    aoAtualizar()
    aoEditar(curso.id)
  }

  // Eu confirmo e apago o curso inteiro.
  const excluir = (curso) => {
    const confirmado = window.confirm(`Excluir “${curso.titulo}” e todo o conteúdo dele?`)
    if (!confirmado) return
    excluirCurso(curso.id)
    aoAvisar('Curso excluído.')
    aoAtualizar()
  }

  const set = (campo) => (evento) => setForm({ ...form, [campo]: evento.target.value })

  return (
    <div className="pagina">
      <section className="cabecalho-pagina linha">
        <div>
          <h1>Área do Professor</h1>
          <p>Olá, {usuario.nome.split(' ')[0]}! Gerencie seus cursos, aulas e alunos.</p>
        </div>
        <button type="button" className="botao-primario" onClick={() => setMostrarForm(!mostrarForm)}>
          {mostrarForm ? 'Cancelar' : '+ Novo curso'}
        </button>
      </section>

      {/* Painel de números. */}
      <div className="painel-numeros">
        <div>
          <strong>{cursos.length}</strong>
          <span>cursos</span>
        </div>
        <div>
          <strong>{totalAulas}</strong>
          <span>aulas</span>
        </div>
        <div>
          <strong>{totalAlunos}</strong>
          <span>alunos</span>
        </div>
      </div>

      {/* Formulário de novo curso. */}
      {mostrarForm && (
        <form className="form-novo-curso" onSubmit={criar}>
          <h2>Novo curso</h2>

          <label className="campo">
            Título do curso
            <input type="text" value={form.titulo} onChange={set('titulo')} placeholder="Ex.: Inglês do Zero" />
          </label>

          <label className="campo">
            Resumo (aparece no card)
            <input type="text" value={form.resumo} onChange={set('resumo')} placeholder="Uma linha chamativa" />
          </label>

          <label className="campo">
            Descrição completa
            <textarea
              rows="3"
              value={form.descricao}
              onChange={set('descricao')}
              placeholder="O que o aluno vai aprender?"
            />
          </label>

          <div className="linha-form">
            <label className="campo">
              Categoria
              <select value={form.categoria} onChange={set('categoria')}>
                {CATEGORIAS.map((categoria) => (
                  <option key={categoria}>{categoria}</option>
                ))}
              </select>
            </label>

            <label className="campo">
              Preço (R$ — vazio = gratuito)
              <input
                type="number"
                min="0"
                step="1"
                value={form.preco}
                onChange={set('preco')}
                placeholder="0"
              />
            </label>

            <label className="campo">
              Ícone da capa
              <select value={form.emoji} onChange={set('emoji')}>
                {EMOJIS_CURSO.map((emoji) => (
                  <option key={emoji} value={emoji}>
                    {emoji}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <button type="submit" className="botao-primario">
            Criar curso e adicionar aulas
          </button>
        </form>
      )}

      {/* Lista de cursos do professor. */}
      <h2 className="titulo-secao">Meus cursos</h2>

      {cursos.length === 0 && (
        <p className="estado-vazio">Você ainda não criou cursos. Clique em “+ Novo curso”.</p>
      )}

      <div className="lista-cursos-prof">
        {cursos.map((curso) => {
          const aulas = todasAsAulas(curso)
          const alunos = alunosDoCurso(curso.id)
          const aberto = alunosDe === curso.id

          return (
            <article className="item-curso-prof" key={curso.id}>
              <span className="item-emoji">{curso.emoji || '🎓'}</span>

              <div className="item-info">
                <h3>{curso.titulo}</h3>
                <p>
                  {curso.categoria} · {aulas.length} aulas · {alunos.length} aluno(s) ·{' '}
                  {formatarMoeda(curso.preco)}
                </p>
              </div>

              <div className="item-acoes">
                <button type="button" className="botao-primario pequeno" onClick={() => aoEditar(curso.id)}>
                  Gerenciar aulas
                </button>
                <button
                  type="button"
                  className="botao-secundario pequeno"
                  onClick={() => setAlunosDe(aberto ? null : curso.id)}
                >
                  {aberto ? 'Fechar' : 'Alunos'}
                </button>
                <button type="button" className="botao-icone perigo" title="Excluir curso" onClick={() => excluir(curso)}>
                  🗑
                </button>
              </div>

              {/* Tabela de alunos matriculados. */}
              {aberto && (
                <div className="tabela-alunos">
                  {alunos.length === 0 && <p>Nenhum aluno matriculado ainda.</p>}
                  {alunos.length > 0 && (
                    <table>
                      <thead>
                        <tr>
                          <th>Aluno</th>
                          <th>E-mail</th>
                          <th>Matrícula</th>
                          <th>Progresso</th>
                        </tr>
                      </thead>
                      <tbody>
                        {alunos.map(({ matricula, aluno }) => {
                          const progresso = progressoDoCurso(aluno.id, curso)
                          return (
                            <tr key={matricula.alunoId}>
                              <td>{aluno.nome}</td>
                              <td>{aluno.email}</td>
                              <td>{formatarData(matricula.data)}</td>
                              <td>{progresso.percentual}%</td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </article>
          )
        })}
      </div>
    </div>
  )
}
