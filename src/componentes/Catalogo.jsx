// =============================================
// CATÁLOGO DE CURSOS (e "Minhas aulas")
// =============================================

import {
  listarCursos,
  ehMatriculado,
  matricular,
  progressoDoCurso,
  nomeDoProfessor,
} from '../camada-dados'
import { todasAsAulas, cargaHoraria, formatarMoeda, formatarDuracao, gradienteDoCurso } from '../utilitarios'

export default function Catalogo({
  usuario,
  filtro,
  aoAbrirSala,
  aoGerenciar,
  aoAvisar,
  aoAtualizar,
}) {
  const ehProfessor = usuario.papel === 'professor'
  let cursos = listarCursos()
  if (filtro === 'matriculados') {
    cursos = cursos.filter((curso) => ehMatriculado(usuario.id, curso.id))
  }

  // Eu faço a matrícula e já levo o aluno para a primeira aula.
  const matricularESeguir = (curso) => {
    matricular(usuario.id, curso.id)
    aoAtualizar()
    aoAvisar(`Matrícula confirmada em “${curso.titulo}” ✓`)
    aoAbrirSala(curso.id, null)
  }

  const titulo =
    filtro === 'matriculados' ? 'Minhas aulas' : ehProfessor ? 'Cursos disponíveis' : 'Cursos disponíveis'
  const subtitulo =
    filtro === 'matriculados'
      ? 'Continue de onde você parou.'
      : 'Escolha um curso e comece hoje mesmo.'

  return (
    <div className="pagina">
      <section className="cabecalho-pagina">
        <h1>{titulo}</h1>
        <p>{subtitulo}</p>
      </section>

      {cursos.length === 0 && (
        <p className="estado-vazio">
          {filtro === 'matriculados'
            ? 'Você ainda não tem matrículas — escolha um curso no catálogo.'
            : 'Nenhum curso publicado ainda.'}
        </p>
      )}

      <div className="grade-cursos">
        {cursos.map((curso) => {
          const matriculado = ehMatriculado(usuario.id, curso.id)
          const progresso = matriculado ? progressoDoCurso(usuario.id, curso) : null
          const aulas = todasAsAulas(curso)
          const ehMeu = curso.professorId === usuario.id

          return (
            <article className="card-curso" key={curso.id}>
              <div className="capa-curso" style={{ background: gradienteDoCurso(curso) }}>
                <span className="capa-emoji">{curso.emoji || '🎓'}</span>
                {progresso && progresso.concluidas > 0 && (
                  <span className="selo-progresso">{progresso.percentual}% concluído</span>
                )}
              </div>

              <div className="card-corpo">
                <span className="card-categoria">{curso.categoria}</span>
                <h3>{curso.titulo}</h3>
                <p>{curso.resumo}</p>
                <span className="card-professor">com {nomeDoProfessor(curso.professorId)}</span>

                <div className="card-dados">
                  <span>▶ {aulas.length} aulas</span>
                  <span>🕒 {formatarDuracao(cargaHoraria(curso))}</span>
                </div>

                {progresso && progresso.concluidas > 0 && (
                  <div className="barra-progresso mini">
                    <div style={{ width: `${progresso.percentual}%` }} />
                  </div>
                )}

                <div className="card-rodape">
                  <strong>{formatarMoeda(curso.preco)}</strong>

                  {ehMeu ? (
                    <button
                      type="button"
                      className="botao-secundario pequeno"
                      onClick={() => aoGerenciar(curso.id)}
                    >
                      Gerenciar
                    </button>
                  ) : matriculado ? (
                    <button
                      type="button"
                      className="botao-primario pequeno"
                      onClick={() => aoAbrirSala(curso.id, null)}
                    >
                      {progresso && progresso.concluidas > 0 ? 'Continuar' : 'Começar'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="botao-primario pequeno"
                      onClick={() => matricularESeguir(curso)}
                    >
                      Matricular-se
                    </button>
                  )}
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}
