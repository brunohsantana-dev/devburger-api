# DevBurger API

[English](README.md) | [Português](README.pt-BR.md)

**Um app de hamburgueria, começando pelo que ninguém vê.**

Uma interface bonita é só parte do trabalho. Por trás do cardápio, existe um sistema cuidando de usuários, produtos, imagens e pedidos.

É isso que estou construindo aqui.

O DevBurger é um projeto Full Stack que estou desenvolvendo durante minha formação na DevClub. Este repositório reúne o backend da aplicação, utilizando Node.js, Express, PostgreSQL e MongoDB.

**Progresso atual:** os dois módulos de backend do curso foram concluídos. O projeto Full Stack continua em desenvolvimento. A próxima etapa é o frontend com React.

## O que já funciona

Usuários podem se cadastrar, fazer login, consultar produtos e categorias e criar pedidos. Envie `Authorization: Bearer <token>` para acessar as rotas protegidas. O cadastro público sempre cria um usuário comum, mesmo que seja enviado `admin: true`. Não há rota pública para conceder privilégios administrativos.

Apenas administradores podem cadastrar ou atualizar produtos e categorias e alterar o status dos pedidos. Clientes consultam somente seus próprios pedidos; administradores consultam todos. Preços, nomes e categorias dos itens vêm do catálogo no servidor, e a identificação do cliente vem da autenticação. Pedidos vazios, IDs de produtos repetidos, produtos inexistentes e quantidades que não sejam inteiros positivos são rejeitados.

As categorias agrupam os itens do cardápio. O campo `offer` marca um produto como oferta; ele não calcula descontos. Atualizações de produtos e categorias preservam a imagem atual quando nenhum arquivo novo é enviado e retornam uma mensagem de sucesso. Novos cadastros exigem imagem. Os uploads aceitam tipos declarados JPEG, PNG ou WebP de até 5 MB, com nomes gerados pelo servidor. A validação confere o MIME declarado, não o conteúdo do arquivo.

## Tecnologias

| Área | Tecnologias |
| --- | --- |
| Backend | Node.js 24+, Express 5 |
| Usuários e catálogo | PostgreSQL, Sequelize, Sequelize CLI |
| Pedidos | MongoDB, Mongoose |
| Validação e segurança | Yup, bcrypt, JWT (jsonwebtoken) |
| Upload de arquivos | Multer, UUID |
| Ferramentas | Docker para os bancos locais, pnpm, Biome |

**Fluxo de uma requisição:**

`Requisição → Rota → Autenticação/autorização → Controller → Model → Banco`

O PostgreSQL armazena usuários, produtos, categorias e os vínculos entre produtos e categorias. O MongoDB armazena cada pedido com uma cópia dos itens e preços no momento da compra, identificação do cliente, status e datas. Alterações posteriores no catálogo não reescrevem um pedido existente. Pagamentos não estão implementados.

## Estrutura

```text
src/
  app/controllers/   # Cadastro, sessões, catálogo e pedidos
  app/middlewares/   # Autenticação JWT e autorização administrativa
  app/models/        # Sequelize: User, Product e Category
  app/schemas/       # Mongoose: Order
  config/            # Banco, uploads, arquivos estáticos (.cjs) e JWT
  database/          # Conexões e migrations do PostgreSQL (.cjs)
  app.js             # Express, CORS e respostas de erro em JSON
  routes.js          # Rotas públicas e protegidas da API
  server.js          # Inicialização na porta 3001
tests/               # Testes pontuais com o runner nativo do Node
uploads/             # Imagens locais (conteúdo ignorado pelo Git)
```

As rotas encaminham as requisições aos controllers, que validam os dados e usam Sequelize ou Mongoose para consultar e gravar nos bancos. A autenticação identifica o usuário; o middleware administrativo restringe alterações no catálogo e no status dos pedidos.

## Rotas da API

| Método | Rota | Descrição |
| --- | --- | --- |
| POST | `/users` | Pública: `name`, `email`, `password` (mínimo de 6 caracteres); retorna `id`, `name`, `email`, `admin: false` |
| POST | `/sessions` | Pública: login com e-mail/senha; retorna `message`, `id`, `name`, `email`, `admin` e JWT `token` válido por um dia |
| POST | `/products` | Admin: multipart/form-data com `name`, `price` inteiro ≥ 0, `category_id` existente, booleano `offer` opcional e imagem em `file` |
| PUT | `/products/:id` | Admin: atualização parcial desses campos; nova imagem opcional; 404 quando o produto não existe |
| GET | `/products` | Autenticada: lista de produtos com URL da imagem e ID/nome da categoria |
| POST | `/categories` | Admin: `name` (mínimo de 2 caracteres) e imagem em `file`; rejeita nomes duplicados |
| PUT | `/categories/:id` | Admin: atualiza nome e/ou imagem; verifica existência e nomes duplicados |
| GET | `/categories` | Autenticada: lista de categorias com URLs das imagens |
| POST | `/orders` | Autenticada: cria pedido com `products: [{ id, quantity }]`; retorna o pedido salvo com `_id` |
| GET | `/orders` | Autenticada: pedidos do próprio cliente ou todos os pedidos para administradores |
| PUT | `/orders/:id` | Admin: JSON `{ "status": "preparing" }`; exige ID válido do MongoDB e pedido existente |
| GET | `/product-file/:arquivo` | Pública: imagem enviada |
| GET | `/category-file/:arquivo` | Pública: imagem enviada |

Criações retornam 201, listagens/atualizações bem-sucedidas retornam 200, dados inválidos retornam 400, autenticação ausente/inválida retorna 401, acesso administrativo negado retorna 403 e alvos de atualização inexistentes retornam 404. Uploads acima do limite retornam 413. Falhas inesperadas retornam erro genérico em JSON, sem detalhes internos dos bancos. Erros de validação podem trazer um array em `error`; os demais trazem uma string em `error`. A resposta de e-mail duplicado usa `message`.

## Rodando o projeto

Pré-requisitos: Node.js 24 ou superior, pnpm 12.18.0, PostgreSQL com banco/usuário já criados e MongoDB. Os bancos podem rodar no Docker; este repositório não inclui arquivo Compose. Mantenha os dois serviços ativos durante o uso da API.

```sh
pnpm install --frozen-lockfile
```

Copie `.env.example` para `.env`. Preencha `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` e `DB_NAME`. Defina `JWT_SECRET` com um segredo próprio, longo e aleatório. Configure `MONGO_URL` (padrão: `mongodb://localhost:27017/devburger`) e `FRONTEND_URL` (padrão: `http://localhost:5173`). Variáveis já definidas no ambiente têm prioridade. O carregamento usa o suporte nativo do Node.js na aplicação e no Sequelize CLI. Nunca publique o `.env`.

Para um banco PostgreSQL novo, confira o destino e aplique as migrations:

```sh
pnpm exec sequelize-cli db:migrate:status
pnpm exec sequelize-cli db:migrate
```

Em um banco existente, confira o estado das migrations e faça backup antes de aplicar alterações. A migration que remove a antiga coluna `category` dos produtos descarta seus valores de texto; ela não os transfere para `category_id`. Revise os vínculos dos produtos existentes com as categorias separadamente. Os pedidos no MongoDB usam um schema Mongoose e não utilizam essas migrations SQL. A aplicação usa ES Modules; os arquivos `.cjs` e o `.sequelizerc` usam CommonJS.

```sh
pnpm dev       # Desenvolvimento com reinicialização automática
pnpm start     # Execução sem watch
pnpm lint      # Análise estática
pnpm check     # Análise, formatação e organização de imports
node --test    # Testes pontuais sem conexão com banco
```

A API atende em `http://localhost:3001`. Mantenha `uploads/` disponível e com permissão de escrita e preserve seu conteúdo junto com os backups dos bancos. O Git ignora imagens locais, dependências, arquivos de ambiente, logs e arquivos temporários. As URLs de imagem usam `localhost:3001` nesta etapa. O servidor permite CORS para a única origem definida em `FRONTEND_URL`, incluindo preflight e o header Authorization.

## Testando a API

1. Crie um usuário de teste com `POST /users` e faça login em `POST /sessions` com o mesmo e-mail e senha.
2. Copie o `token` retornado para `Authorization: Bearer <token>`. Consulte `/categories` e `/products` para obter IDs existentes.
3. Com uma conta administrativa existente, cadastre categorias e produtos usando multipart/form-data e o campo `file`. O cadastro público não cria administradores.
4. Como cliente, envie o JSON abaixo para `POST /orders`, substituindo `1` por um ID real de produto. Consulte `/orders` e confira que aparecem apenas os pedidos desse cliente.
5. Como administrador, liste os pedidos e atualize um deles com `PUT /orders/<_id>` e `{ "status": "preparing" }`. Tente alterar catálogo/status como cliente para conferir a resposta 403.

```json
{ "products": [{ "id": 1, "quantity": 2 }] }
```

Atualizações de produtos/categorias retornam `{ "message": "Product updated successfully" }` ou `{ "message": "Category updated successfully" }`. Atualizações de pedidos retornam `{ "message": "status updated" }`; consulte a listagem novamente para obter os dados atualizados. Os preços dos produtos são inteiros; o schema existente dos pedidos serializa o preço de cada item como string. O status aceita uma string não vazia, com `order made` como valor inicial. O frontend React deve considerar esses contratos.

Para testar com segurança, use bancos de desenvolvimento separados e usuários fictícios. Os testes do checkpoint substituem as operações de banco e exercitam privilégios no cadastro, login administrativo, atualizações parciais, validação/privacidade de pedidos, proteção de rotas, CORS e erros JSON. A revisão final também conferiu conexões, estado das migrations e listagens GET nos bancos locais sem alterar seus dados. Escritas nos bancos reais e o fluxo completo de compra não foram testados nessa revisão. Não há script de build. `pnpm lint` passa; `pnpm check` ainda aponta problemas anteriores de formatação/imports em arquivos não alterados.

## Próximos passos

A próxima etapa do curso é o frontend com React: conectar login, cardápio e pedidos a esta API.

Antes de ampliar o uso, revisar a revogação de privilégios enquanto um JWT de um dia continua válido, inspecionar o conteúdo real das imagens, limpar arquivos deixados por uploads rejeitados ou substituídos e adicionar cobertura de integração com os bancos. Alinhar os valores de status dos pedidos com o frontend. O tratamento de disponibilidade dos bancos na inicialização e URLs de imagem fora do ambiente local também ficam como melhorias futuras.

---

Desenvolvido por [Bruno Santana](https://github.com/brunohsantana-dev).

**Dois módulos de backend concluídos. O próximo passo é React.**
