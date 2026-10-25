// =============================================
// CERTIFICADO DE CONCLUSÃO (imprimível em PDF)
// =============================================

import { obterCurso, progressoDoCurso, obterCertificado, nomeDoProfessor } from '../camada-dados'
import { cargaHoraria, formatarDuracao, formatarData } from '../utilitarios'
import { NOME_PLATAFORMA } from '../configuracao'

export default function Certificado({ usuario, cursoId, aoVoltar }) {
  const curso = obterCurso(cursoId)

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

  const progresso = progressoDoCurso(usuario.id, curso)

  // Eu só emito o certificado com todas as aulas concluídas.
  if (progresso.percentual < 100) {
    return (
      <div className="pagina">
        <section className="portao-matricula">
          <span className="portao-icone">🔒</span>
          <h1>Certificado ainda bloqueado</h1>
          <p>
            Conclua todas as aulas do curso para liberar. Você está em {progresso.percentual}% (
            {progresso.concluidas} de {progresso.total}).
          </p>
          <button type="button" className="botao-primario" onClick={aoVoltar}>
            ← Voltar às aulas
          </button>
        </section>
      </div>
    )
  }

  const certificado = obterCertificado(usuario.id, curso)

  return (
    <div className="pagina-certificado">
      {/* Ferramentas ficam escondidas na impressão. */}
      <div className="ferramentas-certificado">
        <button type="button" className="botao-primario" onClick={() => window.print()}>
          🖨️ Salvar em PDF / Imprimir
        </button>
        <button type="button" className="botao-secundario" onClick={aoVoltar}>
          ← Voltar às aulas
        </button>
        <small>No celular: imprimir → “Salvar como PDF”.</small>
      </div>

      <article className="certificado">
        <header className="cert-topo">
          <span className="cert-marca">🎓 {NOME_PLATAFORMA}</span>
          <span className="cert-codigo">Nº {certificado.codigo}</span>
        </header>

        <h1>Certificado de Conclusão</h1>
        <p className="cert-em">Certificamos que</p>
        <p className="cert-nome">{usuario.nome}</p>
        <p className="cert-texto">concluiu integralmente o curso</p>
        <p className="cert-curso">“{curso.titulo}”</p>
        <p className="cert-texto">
          com carga horária de {formatarDuracao(cargaHoraria(curso))} e aproveitamento de 100% das
          aulas.
        </p>

        <footer className="cert-rodape">
          <div>
            <strong>{formatarData(certificado.data)}</strong>
            <span>Data de emissão</span>
          </div>
          <div className="cert-selo">🏆</div>
          <div>
            <strong>{nomeDoProfessor(curso.professorId)}</strong>
            <span>Instrutor(a)</span>
          </div>
        </footer>
      </article>
    </div>
  )
}
