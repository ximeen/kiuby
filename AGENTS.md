# Padrões do Projeto Kiuby

## Estrutura do Projeto

- **Arquitetura:** Clean Architecture (Domain, Application, Infrastructure)
- **API:** Fastify para REST API
- **ORM:** Drizzle
- **Validação:** Zod com fastify-type-provider-zod
- **Testes:** Vitest

## Padrões de Código

- **Linter/Format:** Biome
- **Linguagem:** TypeScript estrito
- **Nomenclatura:** inglês para código, português para mensagens de erro
- **Entities:** Estendem classe `Entity` do domain
- **Value Objects:** Estendem classe `ValueObject` do domain

## Documentação de Rotas (IMPORTANTE)

**SEMPRE usar schemas Zod diretamente** - NÃO usar schemas JSON nativos:

```typescript
// ✅ CORRETO
app.post("/products", {
  schema: {
    tags: ["PRODUCTS"],
    description: "Rota para criar produto",
    body: createProductSchema,  // Schema Zod direto
  },
  preHandler: [authMiddleware],
}, controller.create.bind(controller))

// ❌ ERRADO - Não usar schemas JSON nativos
app.post("/products", {
  schema: {
    body: {
      type: "object",
      properties: { ... }
    }
  }
})
```

### Padrão obrigatório para rotas:
- `tags` - agrupamento na documentação
- `description` - descrição do endpoint
- `body` / `params` / `querystring` - usar schemas Zod
- `preHandler` - authMiddleware + requiredPermission

## Testes

- **Framework:** Vitest
- **Padrão de entidades:** `Parameters<typeof Entity.create>[0]`
- **Localização:** mesmo diretório do arquivo testado com extensão `.test.ts`

```typescript
describe("EntityName", () => {
  let validProps: Parameters<typeof EntityName.create>[0];
  // ...
})
```

## Permissões

```typescript
enum Permission {
  MANAGE_USERS = "manage_users"
  MANAGE_PRODUCTS = "manage_products"
  MANAGE_CUSTOMERS = "manage_customers"
  MANAGE_STOCK = "manage_stock"
  CREATE_SALE = "create_sale"
  APPROVE_SALE = "approve_sale"
  VIEW_REPORTS = "view_reports"
}
```

## Estrutura de Diretórios

```
src/
├── domain/
│   ├── entities/          # Entities e Value Objects
│   │   ├── customers/
│   │   ├── product/
│   │   ├── sale/
│   │   ├── stock/
│   │   └── user/
│   └── shared/            # Entity base, ValueObject base
├── application/
│   └── use_cases/        # Casos de uso
├── infrastructure/
│   ├── http/fastify/     # Controllers, Routes, Middlewares
│   └── database/         # Repositories, Tables
└── shared/
    ├── constants/
    ├── container/
    ├── errors/
    └── validators/       # Zod validators
```

---

**Nota:** Este arquivo deve ser lido automaticamente no início de cada sessão para entender os padrões do projeto.
