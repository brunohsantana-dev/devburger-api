# DevBurger API

[English](README.md) | [Português](README.pt-BR.md)

**Um app de hamburgueria, começando pelo que ninguém vê.**

Uma interface bonita é só parte do trabalho. Por trás do cardápio, existe um sistema cuidando de usuários, produtos, imagens e dados.

É isso que estou construindo aqui.

O DevBurger é um projeto Full Stack que estou desenvolvendo durante minha formação na DevClub. Este repositório reúne o back-end da aplicação, utilizando Node.js, Express e PostgreSQL.

**Progresso atual:** Backend Node.js — Parte 1 concluída. Projeto em desenvolvimento.

## O que já funciona

- **Cadastro de usuários** — Validação dos dados, verificação de e-mails duplicados e proteção de senhas com bcrypt.
- **Login** — Verificação das credenciais com comparação de hashes de senha.
- **Gestão de produtos** — Cadastro e listagem de produtos com nome, valor, categoria e imagem.
- **Upload de imagens** — Recebimento de arquivos com Multer, armazenamento local e disponibilização por URL.
- **Banco de dados** — PostgreSQL com models e migrations gerenciados pelo Sequelize.

A API segue uma estrutura inspirada no padrão MVC, separando rotas, controllers e models para organizar melhor as responsabilidades.

## Tecnologias

| Área | Tecnologias |
| --- | --- |
| Back-end | Node.js, Express |
| Banco de dados | PostgreSQL, Sequelize |
| Validação e segurança | Yup, bcrypt |
| Upload de arquivos | Multer |
| Ferramentas | Docker, pnpm, Biome |

**Fluxo de uma requisição:**

`Requisição → Rota → Controller → Model → PostgreSQL`

## Rotas da API

| Método | Endpoint | Função |
| --- | --- | --- |
| POST | `/users` | Cadastrar usuários |
| POST | `/session` | Validar credenciais de login |
| POST | `/products` | Cadastrar produtos com imagem |
| GET | `/products` | Listar produtos cadastrados |
| GET | `/product-file/:filename` | Acessar imagens enviadas |

As rotas foram testadas localmente utilizando Insomnia, com os registros do banco conferidos pelo Beekeeper Studio.

## Rodando o projeto

**Pré-requisitos:** Node.js 24+, pnpm e PostgreSQL.

Instale as dependências:

```bash
pnpm install --frozen-lockfile
```

Copie o arquivo `.env.example` para `.env` e configure suas credenciais do PostgreSQL.

Confira e execute as migrations pendentes:

```bash
pnpm exec sequelize-cli db:migrate:status
pnpm exec sequelize-cli db:migrate
```

Inicie o servidor:

```bash
pnpm dev
```

A API estará disponível em `http://localhost:3001`.

As imagens enviadas são armazenadas localmente na pasta `uploads/`.

## Próximos passos

Concluímos a primeira etapa do back-end, mas o projeto ainda tem bastante coisa pela frente.

A autenticação com JWT, a proteção das rotas, o controle adequado de permissões e validações mais rígidas de uploads ainda não foram implementados. Por enquanto, a API é destinada ao ambiente local de desenvolvimento, não à produção.

A ideia é continuar evoluindo o sistema conforme avanço na formação Full Stack.

---

Desenvolvido por [Bruno Santana](https://github.com/brunohsantana-dev).

**Primeiro módulo concluído. Ainda tem muita coisa pela frente.**
