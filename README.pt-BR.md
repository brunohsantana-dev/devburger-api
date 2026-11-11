# DevBurger API

[English](README.md)

Backend para o cardápio de uma hamburgueria, desenvolvido por Bruno Santana durante o curso Full Stack da DevClub, no módulo **Backend Node.js Parte 1**. Reúne produtos, categorias e ofertas, com login e permissões para controlar quem pode alterar o cardápio.

O projeto continua em desenvolvimento e é voltado ao estudo em ambiente local. Esta etapa coloca em prática rotas de API, validação de dados, autenticação e modelagem de banco relacional.

## Tecnologias

Node.js 24+, Express 5, PostgreSQL, Sequelize e Sequelize CLI, Yup, bcrypt, UUID, Multer e JSON Web Tokens (jsonwebtoken). Gerenciamento de pacotes com pnpm e análise de código com Biome.

## Estrutura

```text
src/
  app/controllers/   # Cadastro, sessão, produtos e categorias
  app/models/        # Modelos User, Product e Category
  config/            # Banco, uploads, arquivos estáticos (.cjs) e JWT
  database/          # Conexão e migrations (.cjs)
  middlewares/       # Autenticação JWT e autorização administrativa
  app.js             # Configuração do Express
  routes.js          # Rotas da API
  server.js          # Inicialização na porta 3001
tests/               # Testes pontuais de regressão dos controllers
uploads/             # Imagens locais (conteúdo ignorado pelo Git)
```

As rotas encaminham as requisições aos controllers, que validam os dados e usam os modelos do Sequelize para consultar e gravar no PostgreSQL. Os produtos pertencem a categorias, organizando o cardápio sem repetir o nome da categoria em cada produto.

## Instalação e execução

Pré-requisitos: Node.js 24 ou superior, pnpm 12.18.0 e uma instância PostgreSQL acessível com banco e usuário já criados.

```sh
pnpm install --frozen-lockfile
```

Copie `.env.example` para `.env` e preencha `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` e `DB_NAME` com os dados do seu PostgreSQL. Defina `JWT_SECRET` com um segredo próprio, longo e aleatório. Não publique o `.env`. Variáveis já definidas no ambiente têm prioridade. O carregamento usa o suporte nativo do Node.js na aplicação e no Sequelize CLI.

Para um banco novo, aplique as migrations após conferir o banco de destino:

```sh
pnpm exec sequelize-cli db:migrate:status
pnpm exec sequelize-cli db:migrate
```

Em um banco existente, confira o estado das migrations e faça backup dos dados antes de aplicar alterações. A migration que remove a antiga coluna `category` dos produtos descarta seus valores de texto; ela não os transfere para `category_id`. Revise os vínculos dos produtos existentes com as categorias separadamente. A aplicação usa ES Modules, enquanto os arquivos `.cjs` e o `.sequelizerc` usam CommonJS.

```sh
pnpm dev       # Desenvolvimento com reinicialização automática
pnpm start     # Execução sem watch
pnpm lint      # Análise estática
pnpm check     # Análise, formatação e organização de imports
node --test    # Testes pontuais sem conexão com banco
```

A API atende em `http://localhost:3001`. Mantenha a pasta `uploads/` disponível e com permissão de escrita. As imagens enviadas ficam apenas no ambiente local; preserve-as junto com os dados do banco. As URLs de imagem desta etapa usam `localhost:3001`.

## Funcionalidades implementadas

| Método | Rota | Descrição |
| --- | --- | --- |
| POST | `/users` | Cadastro público com nome, e-mail e senha; hash com bcrypt; novos usuários sempre recebem `admin: false` |
| POST | `/session` | Login com e-mail e senha; retorna dados básicos do usuário e JWT válido por um dia |
| POST | `/products` | Apenas administradores: multipart/form-data com `name`, `price`, `category_id`, `offer` opcional e imagem no campo `file` |
| PUT | `/products/:id` | Apenas administradores: atualiza os campos do produto; o envio de uma nova imagem é opcional |
| GET | `/products` | Listagem autenticada dos produtos com URL da imagem, ID e nome da categoria |
| POST | `/categories` | Apenas administradores: cria categoria com `name` e imagem em `file`; verifica nomes duplicados |
| PUT | `/categories/:id` | Apenas administradores: atualiza nome e/ou imagem; verifica se a categoria existe e se o nome já pertence a outra categoria |
| GET | `/categories` | Listagem autenticada das categorias com URLs das imagens |
| GET | `/product-file/:arquivo` | Acesso público às imagens de `uploads/` |
| GET | `/category-file/:arquivo` | Acesso público às imagens de `uploads/` |

Envie `Authorization: Bearer <token>` para acessar as rotas de produtos e categorias. Usuários autenticados podem consultar o cardápio; apenas administradores podem cadastrar ou atualizar seus itens. O cadastro público ignora qualquer valor enviado em `admin`. Administradores existentes mantêm o acesso; não há rota pública para conceder privilégios administrativos.

As categorias agrupam os itens do cardápio, enquanto o campo `offer` identifica produtos marcados como ofertas. Ele não calcula descontos nem altera preços automaticamente. As atualizações de produtos e categorias mantêm a imagem atual quando nenhum novo arquivo é enviado e retornam uma mensagem de sucesso.

Os testes pontuais cobrem os privilégios no cadastro público, o login de um administrador existente e as respostas das atualizações com e sem imagens. Eles substituem as operações de banco e não validam a integração real com PostgreSQL. Pedidos, pagamentos e MongoDB não estão implementados nesta etapa.

## Revisão ao final do módulo de backend

- Validar arquivos ausentes e restringir tipos e tamanhos dos uploads.
- Revisar a validação de ID/categoria dos produtos e a resposta ao atualizar um produto inexistente.
- Revisar a normalização dos nomes de categorias e o tratamento de duplicidade em requisições simultâneas.
- Revisar mudanças nas permissões administrativas enquanto um JWT permanece válido.
- Adicionar cobertura de integração com banco e alinhar formatação e imports ao Biome (`pnpm check` atualmente aponta questões de estilo).
