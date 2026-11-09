# DevBurger API

API desenvolvida durante o curso da DevClub, no módulo **Backend Node.js Parte 1**. O projeto continua em desenvolvimento e esta etapa destina-se ao ambiente local de estudo.

## Tecnologias

Node.js 24+, Express 5, PostgreSQL, Sequelize e Sequelize CLI, Yup, bcrypt, UUID e Multer. Gerenciamento de pacotes com pnpm e análise de código com Biome.

## Estrutura

```text
src/
  app/controllers/   # Cadastro, sessão e produtos
  app/models/        # Modelos User e Product
  config/            # Banco, uploads e arquivos estáticos (.cjs)
  database/          # Conexão e migrations (.cjs)
  app.js             # Configuração do Express
  routes.js          # Rotas da API
  server.js          # Inicialização na porta 3001
uploads/             # Imagens locais (conteúdo ignorado pelo Git)
```

## Instalação e execução

Pré-requisitos: Node.js 24 ou superior, pnpm 12.18.0 e uma instância PostgreSQL acessível com banco e usuário já criados.

```sh
pnpm install --frozen-lockfile
```

Copie `.env.example` para `.env` e preencha `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` e `DB_NAME` com os dados do seu PostgreSQL. Não publique o `.env`. Variáveis já definidas no ambiente têm prioridade. O carregamento usa o suporte nativo do Node.js, compartilhado pela aplicação e pelo Sequelize CLI.

Para um banco novo, aplique as migrations após conferir o banco de destino:

```sh
pnpm exec sequelize-cli db:migrate:status
pnpm exec sequelize-cli db:migrate
```

Em um banco existente, confira o estado das migrations antes de aplicar alterações. A configuração mantém ES Modules na aplicação e CommonJS nos arquivos `.cjs` e no `.sequelizerc`.

```sh
pnpm dev       # Desenvolvimento com reinicialização automática
pnpm start     # Execução sem watch
pnpm lint      # Análise estática
pnpm check     # Análise, formatação e organização de imports
```

A API atende em `http://localhost:3001`. Mantenha a pasta `uploads/` disponível e com permissão de escrita. As imagens enviadas ficam apenas no ambiente local; preserve-as junto com os dados do banco. As URLs de imagem desta etapa usam `localhost:3001`.

## Funcionalidades implementadas

| Método | Rota | Descrição |
| --- | --- | --- |
| POST | `/users` | Cadastro com nome, e-mail, senha e campo `admin`; hash da senha com bcrypt |
| POST | `/session` | Validação de e-mail e senha; retorno dos dados básicos do usuário |
| POST | `/products` | Cadastro via multipart/form-data com `name`, `price`, `category` e imagem no campo `file` |
| GET | `/products` | Listagem dos produtos com URL da imagem |
| GET | `/product-file/:arquivo` | Acesso às imagens de `uploads/` |

Esta etapa ainda não emite tokens nem protege as rotas por autenticação/autorização. O cadastro aceita o campo `admin` informado pelo cliente. Não disponibilize a API como serviço público antes de implementar esses controles. A validação de arquivo ausente e as restrições de tipo/tamanho dos uploads também precisam ser aprimoradas.

Não há suíte automatizada de testes configurada. As operações de cadastro exigem PostgreSQL disponível e as migrations aplicadas. Não há funcionalidades de pedidos ou pagamentos implementadas nesta etapa.
