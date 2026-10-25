// =============================================
// TELA DE ENTRADA (login e cadastro)
// =============================================

import { useState } from 'react'
import { entrar, cadastrar } from '../camada-dados'
import { NOME_PLATAFORMA, SLOGAN } from '../configuracao'

export default function Login({ aoEntrar, aoAvisar }) {
  const [modo, setModo] = useState('entrar')
  const [papel, setPapel] = useState('aluno')
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')

  // Eu envio o formulário e abro a sessão.
  const enviar = (evento) => {
    evento.preventDefault()
    setErro('')

    if (modo === 'entrar') {
      const resposta = entrar(email, senha)
      if (resposta.erro) return setErro(resposta.erro)
      aoEntrar(resposta.usuario)
      return
    }

    if (nome.trim().length < 2) return setErro('Digite seu nome completo.')
    if (senha.length < 6) return setErro('A senha precisa de ao menos 6 caracteres.')
    const criado = cadastrar({ nome, email, senha, papel })
    if (criado.erro) return setErro(criado.erro)
    const sessao = entrar(email, senha)
    if (sessao.erro) return setErro(sessao.erro)
    aoAvisar('Conta criada com sucesso ✓')
    aoEntrar(sessao.usuario)
    return undefined
  }

  // Eu troco de aba limpando os erros.
  const trocarModo = (novo) => {
    setModo(novo)
    setErro('')
  }

  return (
    <div className="tela-login">
      {/* Lado da marca: o que a plataforma entrega. */}
      <section className="login-marca">
        <span className="login-logo">🎓</span>
        <h1>{NOME_PLATAFORMA}</h1>
        <p className="login-slogan">{SLOGAN}</p>

        <ul className="login-beneficios">
          <li>🎥 Videoaulas e materiais em um só lugar</li>
          <li>📝 Atividades e tarefas com entrega pelo aluno</li>
          <li>✅ Exercícios com correção automática</li>
          <li>🏆 Certificado de conclusão em PDF</li>
          <li>👩‍🏫 Área própria para cada professor</li>
        </ul>
      </section>

      {/* Lado do formulário. */}
      <section className="login-formulario">
        <div className="abas-login">
          <button
            type="button"
            className={modo === 'entrar' ? 'ativo' : ''}
            onClick={() => trocarModo('entrar')}
          >
            Entrar
          </button>
          <button
            type="button"
            className={modo === 'cadastrar' ? 'ativo' : ''}
            onClick={() => trocarModo('cadastrar')}
          >
            Criar conta
          </button>
        </div>

        <form onSubmit={enviar} className="formulario-login">
          <h2>{modo === 'entrar' ? 'Bem-vindo de volta' : 'Criar sua conta'}</h2>

          {modo === 'cadastrar' && (
            <>
              {/* Eu pergunto o papel: professor ou aluno. */}
              <fieldset className="escolha-papel">
                <legend>Sou:</legend>
                <label className={papel === 'aluno' ? 'selecionado' : ''}>
                  <input
                    type="radio"
                    name="papel"
                    value="aluno"
                    checked={papel === 'aluno'}
                    onChange={() => setPapel('aluno')}
                  />
                  <span>🧑‍🎓 Aluno</span>
                </label>
                <label className={papel === 'professor' ? 'selecionado' : ''}>
                  <input
                    type="radio"
                    name="papel"
                    value="professor"
                    checked={papel === 'professor'}
                    onChange={() => setPapel('professor')}
                  />
                  <span>👩‍🏫 Professor</span>
                </label>
              </fieldset>

              <label className="campo">
                Nome completo
                <input
                  type="text"
                  value={nome}
                  onChange={(evento) => setNome(evento.target.value)}
                  placeholder="Seu nome"
                  autoComplete="name"
                />
              </label>
            </>
          )}

          <label className="campo">
            E-mail
            <input
              type="email"
              value={email}
              onChange={(evento) => setEmail(evento.target.value)}
              placeholder="voce@email.com"
              autoComplete="email"
            />
          </label>

          <label className="campo">
            Senha
            <input
              type="password"
              value={senha}
              onChange={(evento) => setSenha(evento.target.value)}
              placeholder={modo === 'cadastrar' ? 'Mínimo 6 caracteres' : 'Sua senha'}
              autoComplete={modo === 'cadastrar' ? 'new-password' : 'current-password'}
            />
          </label>

          {erro && <p className="erro-formulario">{erro}</p>}

          <button type="submit" className="botao-primario grande">
            {modo === 'entrar' ? 'Entrar' : 'Criar conta e entrar'}
          </button>

          {/* Eu ofereço contas de teste para a demonstração. */}
          <p className="nota-demo">
            <strong>Contas de teste:</strong> professor@demo.com · aluno@demo.com — senha{' '}
            <code>demo123</code>
          </p>
        </form>
      </section>
    </div>
  )
}
