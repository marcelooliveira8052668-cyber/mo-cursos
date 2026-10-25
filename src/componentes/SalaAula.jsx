// =============================================
// SALA DE AULA (aluno assiste, entrega tarefa e faz o exercício)
// =============================================

import { useEffect, useState } from 'react'
import {
  obterCurso,
  ehMatriculado,
  matricular,
  obterProgresso,
  alternarConclusao,
  salvarNota,
  registrarEntrega,
  progressoDoCurso,
  nomeDoProfessor,
} from '../camada-dados'
import { lerArquivo, salvarArquivo } from '../armazenamento'
import { todasAsAulas, cargaHoraria, formatarDuracao } from '../utilitarios'

export default function SalaAula({
  usuario,
  cursoId,
  aulaId,
  aoTrocarAula,
  aoVoltar,
  aoCertificado,
  aoAvisar,
  aoAtualizar,
}) {
  const curso = obterCurso(cursoId)
  const aulas = todasAsAulas(curso)
  const aula = aulas.find((item) => item.id === aulaId) ?? aulas[0] ?? null
  const [videoLocal, setVideoLocal] = useState({ aulaId: null, url: null })

  // Eu carrego o blob quando o vídeo é um arquivo local.
  useEffect(() => {
    let url = null
    let ativo = true
    if (aula?.video?.tipo === 'arquivo' && aula.video.arquivoId) {
      lerArquivo(aula.video.arquivoId)
        .then((registro) => {
          if (ativo && registro?.blob) {
            url = URL.createObjectURL(registro.blob)
            setVideoLocal({ aulaId: aula.id, url })
          }
        })
        .catch(() => {})
    }
    return () => {
      ativo = false
      if (url) URL.revokeObjectURL(url)
    }
    // Eu recarrego somente quando a aula muda.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aula?.id])

  // Eu só mostro a URL se ela pertence à aula atual.
  const urlVideo = videoLocal.aulaId === aula?.id ? videoLocal.url : null

  if (!curso) {
    return (
      <div className="pagina">
        <p className="estado-vazio">Curso não encontrado.</p>
        <button type="button" className="botao-secundario" onClick={aoVoltar}>
          ← Voltar aos cursos
        </button>
      </div>
    )
  }

  const ehProfessor = usuario.papel === 'professor'
  const matriculado = ehProfessor || ehMatriculado(usuario.id, curso.id)

  // Portão de matrícula: o aluno entra pagando (ou gratuitamente).
  if (!matriculado) {
    return (
      <div className="pagina">
        <section className="portao-matricula">
          <span className="portao-icone">{curso.emoji || '🎓'}</span>
          <h1>{curso.titulo}</h1>
          <p>{curso.resumo}</p>
          <p className="portao-prof">
            com {nomeDoProfessor(curso.professorId)} · {aulas.length} aulas ·{' '}
            {formatarDuracao(cargaHoraria(curso))}
          </p>
          <div className="portao-acoes">
            <button
              type="button"
              className="botao-primario grande"
              onClick={() => {
                matricular(usuario.id, curso.id)
                aoAtualizar()
                aoAvisar('Matrícula confirmada ✓')
              }}
            >
              Fazer matrícula e começar
            </button>
            <button type="button" className="botao-secundario" onClick={aoVoltar}>
              ← Voltar aos cursos
            </button>
          </div>
        </section>
      </div>
    )
  }

  if (!aula) {
    return (
      <div className="pagina">
        <p className="estado-vazio">Este curso ainda não tem aulas.</p>
        <button type="button" className="botao-secundario" onClick={aoVoltar}>
          ← Voltar aos cursos
        </button>
      </div>
    )
  }

  const progresso = progressoDoCurso(usuario.id, curso)
  const situacao = obterProgresso(usuario.id, aula.id)
  const marcada = situacao.concluida
  const entrega = situacao.entrega
  const indice = aulas.findIndex((item) => item.id === aula.id)
  const anterior = aulas[indice - 1] ?? null
  const proxima = aulas[indice + 1] ?? null

  // Eu marco/desmarco a aula como concluída.
  const concluir = () => {
    alternarConclusao(usuario.id, aula.id)
    aoAtualizar()
    aoAvisar(marcada ? 'Aula desmarcada.' : 'Aula concluída ✓')
  }

  const trocar = (id) => {
    aoTrocarAula(id)
    window.scrollTo({ top: 0 })
  }

  // Eu recebo o arquivo da tarefa entregue pelo aluno.
  const entregarArquivo = async (evento) => {
    const arquivo = evento.target.files?.[0]
    if (!arquivo) return
    try {
      const arquivoId = await salvarArquivo(arquivo)
      registrarEntrega(usuario.id, aula.id, arquivoId, arquivo.name)
      aoAtualizar()
      aoAvisar('Tarefa entregue ✓')
    } catch {
      aoAvisar('Não foi possível enviar (espaço do navegador cheio?).')
    }
    evento.target.value = ''
  }

  // Eu baixo o material que o professor anexou à atividade.
  const baixarMaterial = async () => {
    try {
      const registro = await lerArquivo(aula.atividade.arquivoId)
      if (!registro?.blob) {
        aoAvisar('Arquivo indisponível.')
        return
      }
      const url = URL.createObjectURL(registro.blob)
      const link = document.createElement('a')
      link.href = url
      link.download = registro.nome
      link.click()
      URL.revokeObjectURL(url)
    } catch {
      aoAvisar('Não foi possível baixar o material.')
    }
  }

  return (
    <div className="pagina sala">
      <button type="button" className="link-voltar" onClick={aoVoltar}>
        ← Voltar aos cursos
      </button>

      <div className="sala-colunas">
        {/* Coluna principal: vídeo + ações. */}
        <div className="sala-principal">
          <div className="video-embutido">
            {aula.video?.tipo === 'youtube' && (
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${aula.video.url}?rel=0&modestbranding=1`}
                title={aula.titulo}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}
            {aula.video?.tipo === 'arquivo' &&
              (urlVideo ? (
                <video src={urlVideo} controls playsInline />
              ) : (
                <p className="video-carregando">Carregando vídeo…</p>
              ))}
            {!aula.video && <p className="video-carregando">Esta aula ainda não tem vídeo.</p>}
          </div>

          <div className="cabecalho-aula">
            <h1>{aula.titulo}</h1>
            <span className="badge">{aula.minutos} min</span>
          </div>
          {aula.resumo && <p className="resumo-aula">{aula.resumo}</p>}

          {/* Ações da aula. */}
          <div className="acoes-aula">
            <button
              type="button"
              className={`botao-concluir ${marcada ? 'feito' : ''}`}
              onClick={concluir}
            >
              {marcada ? '✓ Aula concluída' : 'Marcar como concluída'}
            </button>

            <div className="navegacao-aula">
              {anterior && (
                <button type="button" className="botao-secundario" onClick={() => trocar(anterior.id)}>
                  ← Aula anterior
                </button>
              )}
              {proxima && (
                <button type="button" className="botao-primario pequeno" onClick={() => trocar(proxima.id)}>
                  Próxima aula →
                </button>
              )}
            </div>
          </div>

          {/* Atividade / tarefa. */}
          {aula.atividade && (
            <section className="bloco-tarefa">
              <h3>📝 {aula.atividade.titulo}</h3>
              <p>{aula.atividade.descricao}</p>

              {aula.atividade.arquivoId && (
                <button type="button" className="botao-secundario pequeno" onClick={baixarMaterial}>
                  ⬇ Baixar material do professor
                </button>
              )}

              {entrega ? (
                <div className="entrega-feita">
                  <strong>✓ Tarefa entregue</strong>
                  <small>
                    {entrega.nomeArquivo} · substitua quando quiser enviando outro arquivo abaixo.
                  </small>
                </div>
              ) : (
                <p className="entrega-pendente">Pendente — envie seu arquivo abaixo.</p>
              )}

              <label className="campo-arquivo destaque">
                {entrega ? '📎 Enviar nova versão da tarefa' : '📎 Enviar minha tarefa'}
                <input type="file" onChange={entregarArquivo} />
              </label>
            </section>
          )}

          {/* Exercício. */}
          <Exercicio key={aula.id} aula={aula} alunoId={usuario.id} aoAvisar={aoAvisar} aoAtualizar={aoAtualizar} />
        </div>

        {/* Lateral: conteúdo do curso. */}
        <aside className="sala-lateral">
          <div className="lateral-topo">
            <h2>{curso.titulo}</h2>
            <div className="barra-progresso">
              <div style={{ width: `${progresso.percentual}%` }} />
            </div>
            <small>
              {progresso.concluidas} de {progresso.total} aulas · {progresso.percentual}%
            </small>
          </div>

          <nav className="lateral-aulas">
            {curso.modulos.map((modulo) => (
              <div className="grupo-lateral" key={modulo.id}>
                <h3>{modulo.titulo}</h3>
                {modulo.aulas.map((aulaItem) => {
                  const feita = obterProgresso(usuario.id, aulaItem.id).concluida
                  const ativa = aulaItem.id === aula.id
                  return (
                    <button
                      type="button"
                      key={aulaItem.id}
                      className={`item-aula ${ativa ? 'ativa' : ''} ${feita ? 'feita' : ''}`}
                      onClick={() => trocar(aulaItem.id)}
                    >
                      <span className="marcador">{feita ? '✓' : ativa ? '▶' : '○'}</span>
                      <span className="item-aula-titulo">{aulaItem.titulo}</span>
                      <small>{aulaItem.minutos} min</small>
                    </button>
                  )
                })}
              </div>
            ))}
          </nav>

          {progresso.percentual === 100 && (
            <button type="button" className="botao-primario cert-bt" onClick={() => aoCertificado(curso.id)}>
              🏆 Ver meu certificado
            </button>
          )}
        </aside>
      </div>
    </div>
  )
}

// =============================================
// EXERCÍCIO COM CORREÇÃO AUTOMÁTICA
// =============================================

function Exercicio({ aula, alunoId, aoAvisar, aoAtualizar }) {
  const [respostas, setRespostas] = useState({})
  const [corrigido, setCorrigido] = useState(false)
  const perguntas = aula.exercicio?.perguntas ?? []

  if (perguntas.length === 0) return null

  const total = perguntas.length

  // Eu comparo as respostas e guardo a nota.
  const corrigir = () => {
    let acertos = 0
    perguntas.forEach((pergunta) => {
      if (respostas[pergunta.id] === pergunta.correta) acertos += 1
    })
    salvarNota(alunoId, aula.id, acertos, total)
    setCorrigido(true)
    aoAtualizar()
    aoAvisar(`Exercício corrigido: ${acertos} de ${total} ✓`)
  }

  const refazer = () => {
    setRespostas({})
    setCorrigido(false)
  }

  return (
    <section className="bloco-exercicio">
      <h3>✅ Exercício da aula</h3>
      <p className="exercicio-nota">Marque a alternativa certa e clique em corrigir.</p>

      {perguntas.map((pergunta, indice) => (
        <article className="pergunta" key={pergunta.id}>
          <strong>
            {indice + 1}. {pergunta.enunciado}
          </strong>

          <div className="alternativas">
            {pergunta.alternativas.map((alternativa, i) => {
              const escolhida = respostas[pergunta.id] === i
              const certa = i === pergunta.correta
              let classe = 'alternativa'
              if (corrigido && certa) classe += ' correta'
              else if (corrigido && escolhida && !certa) classe += ' errada'
              else if (escolhida) classe += ' escolhida'

              return (
                <label className={classe} key={`${pergunta.id}-${i}`}>
                  <input
                    type="radio"
                    name={pergunta.id}
                    checked={escolhida}
                    disabled={corrigido}
                    onChange={() => setRespostas({ ...respostas, [pergunta.id]: i })}
                  />
                  <span>{alternativa}</span>
                </label>
              )
            })}
          </div>

          {corrigido && (
            <small className="gabarito">
              {respostas[pergunta.id] === pergunta.correta ? '✓ Você acertou!' : `Resposta certa: ${pergunta.alternativas[pergunta.correta]}`}
            </small>
          )}
        </article>
      ))}

      <div className="exercicio-acoes">
        {!corrigido ? (
          <button
            type="button"
            className="botao-primario"
            onClick={corrigir}
            disabled={Object.keys(respostas).length < perguntas.length}
          >
            Corrigir exercício
          </button>
        ) : (
          <button type="button" className="botao-secundario" onClick={refazer}>
            Refazer exercício
          </button>
        )}
        {Object.keys(respostas).length < perguntas.length && !corrigido && (
          <small>Responda todas as perguntas para corrigir.</small>
        )}
      </div>
    </section>
  )
}
