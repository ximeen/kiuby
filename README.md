# Kiuby API

Sistema de gestão comercial (ERP) com arquitetura limpa, construido com TypeScript e Fastify.

## Stack

- **Runtime:** Node.js 22+
- **Linguagem:** TypeScript (strict mode)
- **Framework:** Fastify 5
- **ORM:** Drizzle ORM
- **Validação:** Zod + fastify-type-provider-zod
- **Database:** PostgreSQL
- **Cache:** Redis
- **Testes:** Vitest
- **Linting:** Biome

## Estrutura do Projeto

```
kiuby/
├── src/
│   ├── domain/                    # Camada de domínio
│   │   ├── entities/              # Entidades e Value Objects
│   │   │   ├── auth/
│   │   │   ├── customers/
│   │   │   ├── fiscal_document/
│   │   │   ├── product/
│   │   │   ├── sale/
│   │   │   ├── stock/
│   │   │   ├── user/
│   │   │   └── warehouses/
│   │   └── shared/                # Classes base (Entity, ValueObject)
│   │
│   ├── application/               # Casos de uso
│   │   └── use_cases/
│   │
│   ├── infrastructure/            # Implementações externas
│   │   ├── database/              # Repositórios, tabelas, seeds
│   │   └── http/
│   │       └── fastify/
│   │           ├── app.ts         # Configuração do Fastify
│   │           ├── controllers/   # Controladores
│   │           ├── middlewares/    # Middlewares (auth, permissions)
│   │           ├── plugins/        # Plugins Fastify
│   │           └── routes/         # Definição de rotas
│   │
│   └── shared/                    # Código compartilhado
│       ├── constants/
│       ├── container/             # Inversão de controle
│       ├── errors/                # Classes de erro
│       ├── helpers/
│       ├── types/
│       ├── utils/
│       └── validators/            # Schemas Zod
│
├── drizzle/                       # Migrações Drizzle
├── docker-compose.yml            # PostgreSQL + Redis
├── package.json
├── tsconfig.json
├── vitest.config.ts
└── biome.json                     # Configuração Biome
```

## Configuração

### 1. Variáveis de Ambiente

Copie o arquivo de exemplo:

```bash
cp .env.example .env
```

Configure as variáveis no `.env`:

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
REDIS_PASSWORD=redis123
CORS_ORIGIN=http://localhost:3000,http://localhost:5173
JWT_SECRET=sua_chave_secreta
```

### 2. Docker

Suba os containers do banco de dados:

```bash
docker compose up -d
```

### 3. Instalação

```bash
pnpm install
```

### 4. Banco de Dados

```bash
# Gerar migrações
pnpm db:generate

# Aplicar migrações
pnpm db:migrate

# Seed de dados (opcional)
pnpm seed:products
pnpm seed:user
```

## Scripts

| Comando | Descrição |
|---------|-----------|
| `pnpm dev` | Iniciar servidor em modo desenvolvimento |
| `pnpm build` | Build de produção |
| `pnpm start` | Iniciar servidor em produção |
| `pnpm test` | Executar testes |
| `pnpm test:ui` | Executar testes com interface visual |
| `pnpm lint` | Verificar código com Biome |
| `pnpm lint:fix` | Corrigir problemas de lint automaticamente |
| `pnpm format` | Formatar código com Biome |
| `pnpm db:generate` | Gerar migrações Drizzle |
| `pnpm db:migrate` | Aplicar migrações |
| `pnpm db:studio` | Abrir Drizzle Studio |

## Documentação da API

Acesse a documentação interativa da API em:

```
http://localhost:3000/docs
```

A documentação é gerada automaticamente via Scalar API Reference a partir dos schemas Zod definidos nas rotas.

### Rotas Disponíveis

- **Users** - `src/infrastructure/http/fastify/routes/user_routes.ts`
- **Customers** - `src/infrastructure/http/fastify/routes/customer_routes.ts`
- **Products** - `src/infrastructure/http/fastify/routes/product_routes.ts`
- **Sales** - `src/infrastructure/http/fastify/routes/sale_routes.ts`
- **Stock** - `src/infrastructure/http/fastify/routes/stock_routes.ts`
- **Warehouses** - `src/infrastructure/http/fastify/routes/warehouses_routes.ts`

### Health Check

```
GET /health
```

## Padrões de Código

### Entities

Entidades estendem a classe base `Entity` e seguem o padrão de criação com método estático `create`:

```typescript
export class User extends Entity<UserProps> {
  private constructor(props: UserProps, id?: UniqueEntityId) {
    super(props, id);
  }

  static create(props: UserProps): User {
    // lógica de validação
    return new User(props);
  }
}
```

### Value Objects

Value Objects estendem a classe base `ValueObject`:

```typescript
export class Email extends ValueObject<EmailProps> {
  private constructor(props: EmailProps) {
    super(props);
  }

  static create(email: string): Email {
    // validação com Zod
    return new Email({ value: email });
  }
}
```

### Rotas

Schemas Zod são usados diretamente no `schema` das rotas:

```typescript
app.post("/users", {
  schema: {
    tags: ["USERS"],
    description: "Criar novo usuário",
    body: createUserSchema,  // Schema Zod direto
  },
  preHandler: [authMiddleware, requiredPermission(Permission.MANAGE_USERS)],
}, controller.create.bind(controller));
```

## Testes

Os testes seguem o padrão Vitest e são localizados no mesmo diretório do arquivo testado:

```
src/domain/entities/user/
├── user_entity.ts
└── user_entity.test.ts
```

Exemplo de estrutura de teste:

```typescript
describe("User", () => {
  let validProps: Parameters<typeof User.create>[0];
  
  beforeEach(() => {
    validProps = {
      name: "John Doe",
      email: "john@example.com",
    };
  });

  it("should create a valid user", () => {
    const user = User.create(validProps);
    expect(user.name).toBe("John Doe");
  });
});
```

## Segurança

- **Rate Limiting:** 100 requests/minuto por IP
- **CORS:** Configurável via variável de ambiente
- **Helmet:** Headers de segurança HTTP
- **JWT:** Autenticação via tokens
- **Permissions:** Sistema de permissões granulares

### Permissões Disponíveis

```typescript
enum Permission {
  MANAGE_USERS = "manage_users",
  MANAGE_PRODUCTS = "manage_products",
  MANAGE_CUSTOMERS = "manage_customers",
  MANAGE_STOCK = "manage_stock",
  CREATE_SALE = "create_sale",
  APPROVE_SALE = "approve_sale",
  VIEW_REPORTS = "view_reports"
}
```

## Licença

MIT
