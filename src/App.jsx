// =============================================
// APP MO CURSOS — estrutura geral e navegação
// =============================================

import { useEffect, useState } from 'react'
import './App.css'
import { NOME_PLATAFORMA, SLOGAN, EMAIL_CONTATO } from './configuracao'
import { garantirUsuariosDemo, obterSessao, obterUsuario, definirSessao } from './camada-dados'
import Login from './componentes/Login'
import Catalogo from './componentes/Catalogo'
import AreaProfessor from './componentes/AreaProfessor'
import EditorCurso from './componentes/EditorCurso'
import SalaAula from './componentes/SalaAula'
import Certificado from './componentes/Certificado'

export default function App() {
  // Eu preparo as contas de teste na primeira abertura.
  const [sessaoId, setSessaoId] = useState(() => {
    garantirUsuariosDemo()
    return obterSessao()
  })
  const usuario = sessaoId ? obterUsuario(sessaoId) : null

  const [tela, setTela] = useState('catalogo')
  const [cursoId, setCursoId] = useState(null)
  const [aulaId, setAulaId] = useState(null)
  const [aviso, setAviso] = useState('')
  const [, forcarAtualizacao] = useState(0)

  useEffect(() => {
    document.title = `${NOME_PLATAFORMA} — Cursos online`
  }, [])

  // Eu faço o aviso sumir sozinho depois de 4 segundos.
  useEffect(() => {
    if (!aviso) return undefined
    const tempo = window.setTimeout(() => setAviso(''), 4000)
    return () => window.clearTimeout(tempo)
  }, [aviso])

  // Eu releio os dados das telas depois de qualquer mudança.
  const atualizar = () => forcarAtualizacao((n) => n + 1)

  const entrar = (u) => {
    setSessaoId(u.id)
    setTela(u.papel === 'professor' ? 'professor' : 'catalogo')
    setAviso(`Bem-vindo(a), ${u.nome.split(' ')[0]}!`)
  }

  const sair = () => {
    definirSessao(null)
    setSessaoId(null)
    setTela('catalogo')
    setCursoId(null)
    setAulaId(null)
    setAviso('Sessão encerrada')
  }

  const irPara = (novaTela) => {
    setTela(novaTela)
    window.scrollTo({ top: 0 })
  }

  const abrirSala = (idCurso, idAula = null) => {
    setCursoId(idCurso)
    setAulaId(idAula)
    irPara('sala')
  }
  const abrirEditor = (idCurso) => {
    setCursoId(idCurso)
    irPara('editar')
  }
  const abrirCertificado = (idCurso) => {
    setCursoId(idCurso)
    irPara('certificado')
  }

  const ehProfessor = usuario?.papel === 'professor'

  return (
    <div className="app">
      {/* Cabeçalho. */}
      <header className="topo">
        <button
          type="button"
          className="marca"
          onClick={() => irPara(ehProfessor ? 'professor' : 'catalogo')}
        >
          <span className="marca-icone">🎓</span>
          <span className="marca-nome">{NOME_PLATAFORMA}</span>
        </button>

        {usuario && (
          <nav className="topo-nav">
            {!ehProfessor && (
              <>
                <button
                  type="button"
                  className={tela === 'catalogo' || tela === 'sala' ? 'ativo' : ''}
                  onClick={() => irPara('catalogo')}
                >
                  Cursos
                </button>
                <button
                  type="button"
                  className={tela === 'minhas' ? 'ativo' : ''}
                  onClick={() => irPara('minhas')}
                >
                  Minhas aulas
                </button>
              </>
            )}
            {ehProfessor && (
              <button
                type="button"
                className={tela === 'professor' || tela === 'editar' ? 'ativo' : ''}
                onClick={() => irPara('professor')}
              >
                Meus cursos
              </button>
            )}
          </nav>
        )}

        <div className="topo-acoes">
          {usuario ? (
            <div className="area-usuario">
              <span className={`chip-usuario papel-${usuario.papel}`}>
                {usuario.nome.split(' ')[0]}
                <small>{ehProfessor ? 'Professor' : 'Aluno'}</small>
              </span>
              <button type="button" className="botao-secundario pequeno" onClick={sair}>
                Sair
              </button>
            </div>
          ) : (
            <span className="topo-frase">{SLOGAN}</span>
          )}
        </div>
      </header>

      {/* Conteúdo. */}
      <main className="conteudo">
        {!usuario && <Login aoEntrar={entrar} aoAvisar={setAviso} />}

        {usuario && tela === 'catalogo' && (
          <Catalogo
            usuario={usuario}
            filtro="todos"
            aoAbrirSala={abrirSala}
            aoGerenciar={abrirEditor}
            aoAvisar={setAviso}
            aoAtualizar={atualizar}
          />
        )}

        {usuario && tela === 'minhas' && (
          <Catalogo
            usuario={usuario}
            filtro="matriculados"
            aoAbrirSala={abrirSala}
            aoGerenciar={abrirEditor}
            aoAvisar={setAviso}
            aoAtualizar={atualizar}
          />
        )}

        {usuario && tela === 'professor' && (
          <AreaProfessor
            usuario={usuario}
            aoEditar={abrirEditor}
            aoAvisar={setAviso}
            aoAtualizar={atualizar}
          />
        )}

        {usuario && tela === 'editar' && (
          <EditorCurso
            key={cursoId}
            cursoId={cursoId}
            aoVoltar={() => irPara('professor')}
            aoAvisar={setAviso}
            aoAtualizar={atualizar}
          />
        )}

        {usuario && tela === 'sala' && (
          <SalaAula
            usuario={usuario}
            cursoId={cursoId}
            aulaId={aulaId}
            aoTrocarAula={(id) => setAulaId(id)}
            aoVoltar={() => irPara('catalogo')}
            aoCertificado={abrirCertificado}
            aoAvisar={setAviso}
            aoAtualizar={atualizar}
          />
        )}

        {usuario && tela === 'certificado' && (
          <Certificado usuario={usuario} cursoId={cursoId} aoVoltar={() => irPara('sala')} />
        )}
      </main>

      {/* Rodapé. */}
      <footer className="rodape">
        <span>
          © {new Date().getFullYear()} {NOME_PLATAFORMA} — {SLOGAN}
        </span>
        <a href={`mailto:${EMAIL_CONTATO}`}>{EMAIL_CONTATO}</a>
      </footer>

      {/* Aviso flutuante. */}
      {aviso && (
        <div className="aviso" role="status">
          {aviso}
        </div>
      )}
    </div>
  )
}
