# 🎓 MO Cursos — Plataforma de cursos online

**Onde cada professor monta a própria escola.**
Plataforma completa com **login e senha para professores e alunos**, videoaulas, atividades com entrega, exercícios com correção automática e certificado de conclusão.

> Site pronto para o cliente usar: o professor entra, cria seus cursos, anexa seus vídeos e tarefas; o aluno se cadastra, matricula-se, assiste, entrega e ganha o certificado.

---

## 📱 O que a plataforma faz

### Área do Professor
- **Conta com e-mail e senha** (cadastro na própria plataforma)
- **Criar cursos**: título, descrição, categoria, preço (ou gratuito) e ícone da capa
- **Organizar em módulos e aulas** (arrasta do jeito que quiser: adicionar, renomear, excluir)
- **Anexar vídeos** de duas formas:
  - **Link do YouTube** (recomendado — funciona em qualquer aparelho, é grátis)
  - **Arquivo do computador** (MP4/WebM, fica guardado no navegador do professor)
- **Atividades / tarefas**: descrição + material anexado (PDF, imagem, documento)
- **Exercícios**: perguntas de múltipla escolha com alternativa correta marcada
- **Ver os alunos** matriculados com data da matrícula e progresso de cada um

### Área do Aluno
- **Conta com e-mail e senha**
- **Catálogo** com busca visual por categoria, preço e carga horária
- **Matrícula** em um clique
- **Sala de aula**: vídeo, resumo, “marcar como concluída”, navegação entre aulas
- **Entrega de tarefa**: envia o arquivo direto pelo celular ou computador
- **Exercícios** com correção automática, gabarito e possibilidade de refazer
- **Acompanhamento**: barra de progresso e “Minhas aulas”
- **Certificado** com nome do aluno, carga horária, data e código verificador — salva em PDF com um clique (Imprimir → Salvar como PDF)

---

## 🔑 Contas de teste (demonstração)

Na primeira abertura a plataforma já nasce com:

| Perfil | E-mail | Senha |
|---|---|---|
| Professor | `professor@demo.com` | `demo123` |
| Aluno | `aluno@demo.com` | `demo123` |

O professor de teste já tem um curso completo publicado (6 aulas, vídeos, atividades e exercícios) para demonstrar tudo.

---

## 💾 Como os dados funcionam hoje (modo demonstração sem servidor)

Tudo é gravado **no próprio navegador do usuário** — nada vai para a internet:

| O que | Onde fica |
|---|---|
| Contas (nome, e-mail, senha com hash) | `localStorage` `mocursos:usuarios` |
| Cursos, módulos, aulas, atividades, exercícios | `localStorage` `mocursos:cursos` |
| Matrículas, progresso, notas, entregas, certificados | `localStorage` `mocursos:*` |
| **Vídeos e anexos enviados** (arquivos grandes) | **IndexedDB** `mocursos-arquivos` |

**Consequências honestas deste modo:**
- ✅ Site 100% funcional e gratuito, sem backend nenhum
- ✅ Perfeito para demonstração ao cliente, testes e uso no mesmo computador
- ⚠️ As contas e o conteúdo de um usuário **não aparecem em outro aparelho** (cada navegador tem seu próprio “banco”)
- ⚠️ Vídeos por **arquivo** ficam no aparelho do professor → para alunos em outros aparelhos, use **link do YouTube**
- ⚠️ A senha usa hash simples (djb2) — proteção de demonstração, não de produção

### 🔧 Ativar a versão com nuvem (para uso real entre aparelhos)

Quando quiser que professor e alunos usem de qualquer lugar, conecte o **Supabase** (grátis). O código já está preparado: toda a leitura/gravação passa pela `src/camada-dados.js`, então é só trocar o corpo das funções por chamadas do Supabase — **o resto do site não muda**.

1. Crie a conta grátis em [supabase.com](https://supabase.com) → New Project
2. Copie `.env.example` para `.env` e preencha `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`
3. Substitua no SQL Editor as tabelas equivalentes (`usuarios`, `cursos`, `matriculas`, `progresso`, `certificados`) e ative o **Supabase Auth** para login de verdade
4. Vídeos e anexos → **Supabase Storage** (1 GB grátis) ou mantenha YouTube

---

## 🚀 Como rodar localmente

```bash
npm install
npm run dev      # desenvolvimento
npm run lint     # verifica o código
npm run build    # gera a versão de produção em dist/
```

## 🌐 Publicação

O workflow `.github/workflows/deploy.yml` publica no **GitHub Pages** a cada `git push` na `main`.

---

## 🎨 Personalização (entrega ao cliente)

- **Nome e marca**: `src/configuracao.js` (`NOME_PLATAFORMA`, `SLOGAN`, `EMAIL_CONTATO`, categorias e ícones)
- **Curso de demonstração**: `src/dados/demo.js` — apague o arquivo e o array `CURSO_DEMO` referenciado em `src/camada-dados.js` para o cliente começar do zero
- **Cores do tema**: variáveis no topo de `src/App.css` (`--primaria`, `--destaque`, `--fundo`)

## 🗺️ Próximas passos sugeridos (fase 2)

1. **Supabase Auth + banco na nuvem** (guia acima) — uso real entre aparelhos
2. **Mercado Pago** (Pix + cartão) — cobrar pelos cursos com preço
3. **Área pública de cursos** (catálogo sem login) com matrícula paga
4. **Upload de vídeos na nuvem** para o professor não depender do YouTube

---

Feito com React 19 + Vite. © {ano} MO Cursos.
