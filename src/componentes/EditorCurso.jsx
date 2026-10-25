// =============================================
// EDITOR DE CURSO (professor monta módulos, aulas, vídeos,
// atividades e exercícios)
// =============================================

import { useState } from 'react'
import { obterCurso, salvarCurso } from '../camada-dados'
import { salvarArquivo, excluirArquivo } from '../armazenamento'
import { gerarId, extrairIdYoutube } from '../utilitarios'
import { CATEGORIAS, EMOJIS_CURSO } from '../configuracao'

export default function EditorCurso({ cursoId, aoVoltar, aoAvisar, aoAtualizar }) {
  // Eu inicializo os formulários com os dados atuais do curso.
  const [dados, setDados] = useState(() => {
    const curso = obterCurso(cursoId)
    return {
      titulo: curso?.titulo ?? '',
      resumo: curso?.resumo ?? '',
      descricao: curso?.descricao ?? '',
      categoria: curso?.categoria ?? CATEGORIAS[0],
      emoji: curso?.emoji ?? '🎓',
      preco: String(curso?.preco ?? 0),
    }
  })
  const [tituloModulo, setTituloModulo] = useState('')
  const [aula, setAula] = useState({
    titulo: '',
    minutos: '',
    resumo: '',
    origem: 'youtube',
    url: '',
    arquivo: null,
    moduloId: null,
  })
  const [atividade, setAtividade] = useState({
    titulo: '',
    descricao: '',
    arquivo: null,
    aulaId: null,
    moduloId: null,
  })
  const [pergunta, setPergunta] = useState({
    enunciado: '',
    a: '',
    b: '',
    c: '',
    correta: 'a',
    aulaId: null,
    moduloId: null,
  })
  const [salvando, setSalvando] = useState(false)

  const curso = obterCurso(cursoId)

  // Eu leio o curso do banco a cada gravação para nunca perder nada.
  const atualizarCurso = (mutadora) => {
    const atual = obterCurso(cursoId)
    if (!atual) return
    mutadora(atual)
    salvarCurso(atual)
    aoAtualizar()
  }

  /* ---------- Dados gerais do curso ---------- */
  const salvarDados = (evento) => {
    evento.preventDefault()
    if (dados.titulo.trim().length < 3) {
      aoAvisar('O título precisa de ao menos 3 letras.')
      return
    }
    atualizarCurso((cursoAtual) => {
      cursoAtual.titulo = dados.titulo.trim()
      cursoAtual.resumo = dados.resumo.trim() || dados.titulo.trim()
      cursoAtual.descricao = dados.descricao.trim()
      cursoAtual.categoria = dados.categoria
      cursoAtual.emoji = dados.emoji
      cursoAtual.preco = Number(dados.preco) || 0
    })
    aoAvisar('Dados do curso salvos ✓')
  }

  /* ---------- Módulos ---------- */
  const adicionarModulo = (evento) => {
    evento.preventDefault()
    if (tituloModulo.trim().length < 2) {
      aoAvisar('Dê um nome ao módulo.')
      return
    }
    atualizarCurso((cursoAtual) => {
      cursoAtual.modulos.push({ id: gerarId('m-'), titulo: tituloModulo.trim(), aulas: [] })
    })
    setTituloModulo('')
    aoAvisar('Módulo adicionado ✓')
  }

  const excluirModulo = (modulo) => {
    if (modulo.aulas.length > 0 && !window.confirm(`Excluir o módulo “${modulo.titulo}” com ${modulo.aulas.length} aula(s)?`)) return
    atualizarCurso((cursoAtual) => {
      cursoAtual.modulos = cursoAtual.modulos.filter((m) => m.id !== modulo.id)
    })
    aoAvisar('Módulo excluído.')
  }

  /* ---------- Aulas ---------- */
  const adicionarAula = async (evento) => {
    evento.preventDefault()
    const moduloId = aula.moduloId
    if (!moduloId) {
      aoAvisar('Escolha em qual módulo entra a aula.')
      return
    }
    if (aula.titulo.trim().length < 3) {
      aoAvisar('Dê um título à aula.')
      return
    }

    let video = null
    if (aula.origem === 'youtube') {
      const id = extrairIdYoutube(aula.url)
      if (!id) {
        aoAvisar('Cole um link do YouTube válido (youtu.be/... ou watch?v=...).')
        return
      }
      video = { tipo: 'youtube', url: id }
    } else {
      if (!aula.arquivo) {
        aoAvisar('Escolha o arquivo de vídeo do seu computador.')
        return
      }
      setSalvando(true)
      try {
        const arquivoId = await salvarArquivo(aula.arquivo)
        video = { tipo: 'arquivo', arquivoId }
      } catch {
        setSalvando(false)
        aoAvisar('Não foi possível salvar o vídeo (espaço do navegador cheio?).')
        return
      }
      setSalvando(false)
    }

    atualizarCurso((cursoAtual) => {
      const modulo = cursoAtual.modulos.find((m) => m.id === moduloId)
      modulo.aulas.push({
        id: gerarId('a-'),
        titulo: aula.titulo.trim(),
        minutos: Number(aula.minutos) || 0,
        resumo: aula.resumo.trim(),
        video,
        atividade: null,
        exercicio: { perguntas: [] },
      })
    })
    // Eu mantenho o módulo selecionado para adicionar várias seguidas.
    setAula({ titulo: '', minutos: '', resumo: '', origem: aula.origem, url: '', arquivo: null, moduloId })
    aoAvisar('Aula adicionada ✓')
    return undefined
  }

  const excluirAula = async (moduloId, aulaExcluir) => {
    const confirmado = window.confirm(`Excluir a aula “${aulaExcluir.titulo}”?`)
    if (!confirmado) return
    if (aulaExcluir.video?.tipo === 'arquivo' && aulaExcluir.video.arquivoId) {
      await excluirArquivo(aulaExcluir.video.arquivoId).catch(() => {})
    }
    if (aulaExcluir.atividade?.arquivoId) {
      await excluirArquivo(aulaExcluir.atividade.arquivoId).catch(() => {})
    }
    atualizarCurso((cursoAtual) => {
      const modulo = cursoAtual.modulos.find((m) => m.id === moduloId)
      modulo.aulas = modulo.aulas.filter((a) => a.id !== aulaExcluir.id)
    })
    aoAvisar('Aula excluída.')
    return undefined
  }

  /* ---------- Atividades ---------- */
  // Eu recebo a aula/módulo de destino como garantia, caso o professor
  // clique em salvar sem tocar nos campos.
  const salvarAtividade = async (evento, aulaForcada, moduloForcado) => {
    evento.preventDefault()
    const aulaId = atividade.aulaId ?? aulaForcada
    const moduloId = atividade.moduloId ?? moduloForcado
    if (!aulaId) return undefined
    if (atividade.titulo.trim().length < 3) {
      aoAvisar('Dê um título à atividade.')
      return undefined
    }
    let arquivoId = null
    if (atividade.arquivo) {
      setSalvando(true)
      try {
        arquivoId = await salvarArquivo(atividade.arquivo)
      } catch {
        setSalvando(false)
        aoAvisar('Não foi possível salvar o anexo.')
        return undefined
      }
      setSalvando(false)
    }
    atualizarCurso((cursoAtual) => {
      const modulo = cursoAtual.modulos.find((m) => m.id === moduloId)
      const aulaAlvo = modulo.aulas.find((a) => a.id === aulaId)
      aulaAlvo.atividade = {
        titulo: atividade.titulo.trim(),
        descricao: atividade.descricao.trim(),
        arquivoId: arquivoId ?? aulaAlvo.atividade?.arquivoId ?? null,
      }
    })
    setAtividade({ titulo: '', descricao: '', arquivo: null, aulaId: null, moduloId: null })
    aoAvisar('Atividade salva ✓')
    return undefined
  }

  const removerAtividade = async (moduloId, aulaId) => {
    let arquivoId = null
    atualizarCurso((cursoAtual) => {
      const modulo = cursoAtual.modulos.find((m) => m.id === moduloId)
      const aulaAlvo = modulo.aulas.find((a) => a.id === aulaId)
      arquivoId = aulaAlvo.atividade?.arquivoId ?? null
      aulaAlvo.atividade = null
    })
    if (arquivoId) await excluirArquivo(arquivoId).catch(() => {})
    aoAvisar('Atividade removida.')
    return undefined
  }

  /* ---------- Exercícios ---------- */
  const adicionarPergunta = (evento) => {
    evento.preventDefault()
    if (!pergunta.aulaId) return undefined
    if (pergunta.enunciado.trim().length < 5) {
      aoAvisar('Escreva a pergunta.')
      return undefined
    }
    const alternativas = [pergunta.a, pergunta.b, pergunta.c].map((texto) => texto.trim())
    if (alternativas.some((texto) => !texto)) {
      aoAvisar('Preencha as 3 alternativas.')
      return undefined
    }
    const indiceCorreto = { a: 0, b: 1, c: 2 }[pergunta.correta]
    const { moduloId, aulaId } = pergunta
    atualizarCurso((cursoAtual) => {
      const modulo = cursoAtual.modulos.find((m) => m.id === moduloId)
      const aulaAlvo = modulo.aulas.find((a) => a.id === aulaId)
      if (!aulaAlvo.exercicio) aulaAlvo.exercicio = { perguntas: [] }
      aulaAlvo.exercicio.perguntas.push({
        id: gerarId('p-'),
        enunciado: pergunta.enunciado.trim(),
        alternativas,
        correta: indiceCorreto,
      })
    })
    setPergunta({ enunciado: '', a: '', b: '', c: '', correta: 'a', aulaId, moduloId })
    aoAvisar('Pergunta adicionada ✓')
    return undefined
  }

  const removerPergunta = (moduloId, aulaId, perguntaId) => {
    atualizarCurso((cursoAtual) => {
      const modulo = cursoAtual.modulos.find((m) => m.id === moduloId)
      const aulaAlvo = modulo.aulas.find((a) => a.id === aulaId)
      aulaAlvo.exercicio.perguntas = aulaAlvo.exercicio.perguntas.filter((p) => p.id !== perguntaId)
    })
    aoAvisar('Pergunta removida.')
  }

  /* ---------- Estado sem curso ---------- */
  if (!curso) {
    return (
      <div className="pagina">
        <p className="estado-vazio">Curso não encontrado.</p>
        <button type="button" className="botao-secundario" onClick={aoVoltar}>
          ← Voltar
        </button>
      </div>
    )
  }

  const set = (campo) => (evento) => setDados({ ...dados, [campo]: evento.target.value })
  const setAulaCampo = (campo) => (evento) =>
    setAula({ ...aula, [campo]: evento.target.type === 'file' ? evento.target.files?.[0] ?? null : evento.target.value })

  return (
    <div className="pagina">
      <section className="cabecalho-pagina linha">
        <div>
          <button type="button" className="link-voltar" onClick={aoVoltar}>
            ← Voltar aos meus cursos
          </button>
          <h1>{curso.titulo}</h1>
          <p>
            {curso.categoria} · {curso.emoji} · Edite os dados, módulos, aulas, atividades e
            exercícios.
          </p>
        </div>
      </section>

      {/* Dados gerais. */}
      <details className="bloco-editor">
        <summary>⚙️ Dados do curso (título, preço, categoria)</summary>
        <form onSubmit={salvarDados} className="form-interno">
          <label className="campo">
            Título
            <input type="text" value={dados.titulo} onChange={set('titulo')} />
          </label>
          <label className="campo">
            Resumo (card)
            <input type="text" value={dados.resumo} onChange={set('resumo')} />
          </label>
          <label className="campo">
            Descrição completa
            <textarea rows="3" value={dados.descricao} onChange={set('descricao')} />
          </label>
          <div className="linha-form">
            <label className="campo">
              Categoria
              <select value={dados.categoria} onChange={set('categoria')}>
                {CATEGORIAS.map((categoria) => (
                  <option key={categoria}>{categoria}</option>
                ))}
              </select>
            </label>
            <label className="campo">
              Preço (R$)
              <input type="number" min="0" step="1" value={dados.preco} onChange={set('preco')} />
            </label>
            <label className="campo">
              Ícone
              <select value={dados.emoji} onChange={set('emoji')}>
                {EMOJIS_CURSO.map((emoji) => (
                  <option key={emoji} value={emoji}>
                    {emoji}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <button type="submit" className="botao-primario">
            Salvar dados
          </button>
        </form>
      </details>

      {/* Módulos e aulas. */}
      <h2 className="titulo-secao">Conteúdo do curso</h2>

      {curso.modulos.map((modulo, indiceModulo) => (
        <section className="bloco-modulo" key={modulo.id}>
          <header className="modulo-topo">
            <h3>
              Módulo {indiceModulo + 1} — {modulo.titulo}
            </h3>
            <div className="modulo-acoes">
              <span className="badge">{modulo.aulas.length} aula(s)</span>
              <button
                type="button"
                className="botao-icone perigo"
                title="Excluir módulo"
                onClick={() => excluirModulo(modulo)}
              >
                🗑
              </button>
            </div>
          </header>

          {/* Lista das aulas do módulo. */}
          <div className="lista-aulas-edit">
            {modulo.aulas.length === 0 && <p className="vazio-mini">Nenhuma aula ainda.</p>}
            {modulo.aulas.map((aulaItem) => {
              const numeroPerguntas = aulaItem.exercicio?.perguntas?.length ?? 0
              const detalheAberto =
                atividade.aulaId === aulaItem.id || pergunta.aulaId === aulaItem.id

              return (
                <details className="aula-edit" key={aulaItem.id} open={detalheAberto}>
                  <summary>
                    <span className="aula-edit-titulo">▶ {aulaItem.titulo}</span>
                    <span className="aula-edit-badges">
                      <span className="badge">{aulaItem.minutos} min</span>
                      <span className="badge">{aulaItem.video?.tipo === 'arquivo' ? '📁 arquivo' : '▶ vídeo'}</span>
                      {aulaItem.atividade && <span className="badge destaque">📝 atividade</span>}
                      {numeroPerguntas > 0 && <span className="badge destaque">❓ {numeroPerguntas}</span>}
                    </span>
                  </summary>

                  <div className="aula-edit-corpo">
                    <p className="resumo-mini">{aulaItem.resumo || 'Sem resumo.'}</p>

                    {/* Atividade atual. */}
                    {aulaItem.atividade ? (
                      <div className="atividade-atual">
                        <strong>📝 {aulaItem.atividade.titulo}</strong>
                        <p>{aulaItem.atividade.descricao}</p>
                        <small>
                          {aulaItem.atividade.arquivoId ? 'Com material anexado · ' : 'Sem anexo · '}
                          o aluno entrega a tarefa pela sala de aula.
                        </small>
                        <button
                          type="button"
                          className="botao-secundario pequeno"
                          onClick={() => removerAtividade(modulo.id, aulaItem.id)}
                        >
                          Remover atividade
                        </button>
                      </div>
                    ) : (
                      <form
                        className="form-mini"
                        onSubmit={(evento) => {
                          evento.preventDefault()
                          salvarAtividade(evento, aulaItem.id, modulo.id)
                        }}
                      >
                        <strong>📝 Adicionar atividade / tarefa</strong>
                        <input
                          type="text"
                          placeholder="Título da atividade"
                          value={atividade.aulaId === aulaItem.id ? atividade.titulo : ''}
                          onChange={(evento) =>
                            setAtividade({ ...atividade, titulo: evento.target.value, aulaId: aulaItem.id, moduloId: modulo.id })
                          }
                          onFocus={() => setAtividade({ ...atividade, aulaId: aulaItem.id, moduloId: modulo.id })}
                        />
                        <textarea
                          rows="2"
                          placeholder="O que o aluno deve fazer? (descreva a tarefa)"
                          value={atividade.aulaId === aulaItem.id ? atividade.descricao : ''}
                          onChange={(evento) =>
                            setAtividade({ ...atividade, descricao: evento.target.value, aulaId: aulaItem.id, moduloId: modulo.id })
                          }
                          onFocus={() => setAtividade({ ...atividade, aulaId: aulaItem.id, moduloId: modulo.id })}
                        />
                        <label className="campo-arquivo">
                          {atividade.arquivo && atividade.aulaId === aulaItem.id
                            ? `📎 ${atividade.arquivo.name}`
                            : '📎 Anexar material (PDF, imagem — opcional)'}
                          <input
                            type="file"
                            onChange={(evento) =>
                              setAtividade({
                                ...atividade,
                                arquivo: evento.target.files?.[0] ?? null,
                                aulaId: aulaItem.id,
                                moduloId: modulo.id,
                              })
                            }
                          />
                        </label>
                        <button type="submit" className="botao-primario pequeno">
                          Salvar atividade
                        </button>
                      </form>
                    )}

                    {/* Perguntas do exercício. */}
                    <div className="exercicio-edit">
                      <strong>✅ Exercício ({numeroPerguntas} pergunta(s))</strong>

                      <ul className="perguntas-atuais">
                        {(aulaItem.exercicio?.perguntas ?? []).map((perguntaItem) => (
                          <li key={perguntaItem.id}>
                            <span>{perguntaItem.enunciado}</span>
                            <button
                              type="button"
                              className="botao-icone perigo"
                              title="Remover pergunta"
                              onClick={() => removerPergunta(modulo.id, aulaItem.id, perguntaItem.id)}
                            >
                              ✕
                            </button>
                          </li>
                        ))}
                      </ul>

                      {pergunta.aulaId === aulaItem.id ? (
                        <form
                          className="form-mini"
                          onSubmit={(evento) => {
                            evento.preventDefault()
                            adicionarPergunta(evento)
                          }}
                        >
                          <input
                            type="text"
                            placeholder="Enunciado da pergunta"
                            value={pergunta.enunciado}
                            onChange={(evento) => setPergunta({ ...pergunta, enunciado: evento.target.value })}
                          />
                          {['a', 'b', 'c'].map((letra) => (
                            <div className="linha-alternativa" key={letra}>
                              <label className="alternativa-certa">
                                <input
                                  type="radio"
                                  name={`correta-${aulaItem.id}`}
                                  checked={pergunta.correta === letra}
                                  onChange={() => setPergunta({ ...pergunta, correta: letra })}
                                />
                                ✓
                              </label>
                              <input
                                type="text"
                                placeholder={`Alternativa ${letra.toUpperCase()}`}
                                value={pergunta[letra]}
                                onChange={(evento) => setPergunta({ ...pergunta, [letra]: evento.target.value })}
                              />
                            </div>
                          ))}
                          <div className="form-mini-acoes">
                            <button type="submit" className="botao-primario pequeno">
                              Adicionar pergunta
                            </button>
                            <button
                              type="button"
                              className="botao-secundario pequeno"
                              onClick={() => setPergunta({ ...pergunta, aulaId: null })}
                            >
                              Fechar
                            </button>
                          </div>
                          <small>Marque com ✓ a alternativa correta.</small>
                        </form>
                      ) : (
                        <button
                          type="button"
                          className="botao-secundario pequeno"
                          onClick={() =>
                            setPergunta({ ...pergunta, aulaId: aulaItem.id, moduloId: modulo.id })
                          }
                        >
                          + Adicionar pergunta
                        </button>
                      )}
                    </div>

                    <div className="aula-edit-acoes">
                      <button
                        type="button"
                        className="botao-secundario pequeno"
                        onClick={() =>
                          setAula({
                            titulo: aulaItem.titulo,
                            minutos: String(aulaItem.minutos),
                            resumo: aulaItem.resumo,
                            origem: aulaItem.video?.tipo === 'arquivo' ? 'arquivo' : 'youtube',
                            url: aulaItem.video?.tipo === 'youtube' ? aulaItem.video.url : '',
                            arquivo: null,
                            moduloId: modulo.id,
                          })
                        }
                      >
                        ✏️ Carregar nos campos
                      </button>
                      <button
                        type="button"
                        className="botao-secundario pequeno perigo"
                        onClick={() => excluirAula(modulo.id, aulaItem)}
                      >
                        🗑 Excluir aula
                      </button>
                    </div>
                  </div>
                </details>
              )
            })}
          </div>

          {/* Formulário de nova aula. */}
          <details className="bloco-editor">
            <summary>＋ Adicionar aula neste módulo</summary>
            <form onSubmit={adicionarAula} className="form-interno">
              <div className="linha-form">
                <label className="campo">
                  Módulo de destino
                  <select
                    value={aula.moduloId ?? ''}
                    onChange={(evento) => setAula({ ...aula, moduloId: evento.target.value })}
                  >
                    <option value="">Escolher…</option>
                    {curso.modulos.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.titulo}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="campo">
                  Título da aula
                  <input type="text" value={aula.titulo} onChange={setAulaCampo('titulo')} placeholder="Ex.: Primeiros passos" />
                </label>
                <label className="campo curto">
                  Duração (min)
                  <input type="number" min="0" value={aula.minutos} onChange={setAulaCampo('minutos')} placeholder="10" />
                </label>
              </div>

              <label className="campo">
                Resumo da aula
                <textarea rows="2" value={aula.resumo} onChange={setAulaCampo('resumo')} placeholder="O que é visto nesta aula" />
              </label>

              {/* Origem do vídeo. */}
              <fieldset className="origem-video">
                <legend>Vídeo da aula:</legend>
                <label className={aula.origem === 'youtube' ? 'selecionado' : ''}>
                  <input
                    type="radio"
                    name="origem"
                    checked={aula.origem === 'youtube'}
                    onChange={() => setAula({ ...aula, origem: 'youtube' })}
                  />
                  ▶ Link do YouTube (recomendado)
                </label>
                <label className={aula.origem === 'arquivo' ? 'selecionado' : ''}>
                  <input
                    type="radio"
                    name="origem"
                    checked={aula.origem === 'arquivo'}
                    onChange={() => setAula({ ...aula, origem: 'arquivo' })}
                  />
                  📁 Enviar arquivo do computador
                </label>
              </fieldset>

              {aula.origem === 'youtube' ? (
                <label className="campo">
                  Link do vídeo
                  <input
                    type="url"
                    value={aula.url}
                    onChange={setAulaCampo('url')}
                    placeholder="https://youtu.be/..."
                  />
                </label>
              ) : (
                <label className="campo">
                  Arquivo de vídeo (MP4, WebM)
                  <input type="file" accept="video/*" onChange={setAulaCampo('arquivo')} />
                  <small>
                    O arquivo fica guardado neste computador. Para alunos em outros aparelhos, use o
                    link do YouTube (guia no README).
                  </small>
                </label>
              )}

              <button type="submit" className="botao-primario" disabled={salvando}>
                {salvando ? 'Salvando…' : '+ Adicionar aula'}
              </button>
            </form>
          </details>
        </section>
      ))}

      {/* Novo módulo. */}
      <form className="form-novo-modulo" onSubmit={adicionarModulo}>
        <input
          type="text"
          value={tituloModulo}
          onChange={(evento) => setTituloModulo(evento.target.value)}
          placeholder="Nome do novo módulo (ex.: Módulo 2 — Prática)"
        />
        <button type="submit" className="botao-secundario">
          + Adicionar módulo
        </button>
      </form>
    </div>
  )
}
