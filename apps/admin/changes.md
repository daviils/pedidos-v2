# Correção de Warnings no @apps/admin

## Warnings Resolvidos

### 1. TypeScript compiler options 'module' não suportado

**Arquivo:** `tsconfig.base.json`

**Causa:** O `module` padrão do TypeScript (`CommonJS`) não é compatível com o build do Angular.

**Correção:** Adicionado `"module": "ES2022"` nas `compilerOptions`.

### 2. NG8107 — Optional chain desnecessário em `product.component.html`

**Arquivo:** `apps/admin/src/app/modules/product/product.component.html:80`

**Antes:**
```html
<td>{{ product.category?.title ?? '-' }}</td>
```

**Depois:**
```html
<td>{{ product.category.title }}</td>
```

**Motivo:** O tipo gerado pelo GraphQL define `category` como `{ title: string }` (não-nulo), tornando o `?.` e o `??` desnecessários.

### 3. NG8107 — Optional chain desnecessário em `table-session.component.html`

**Arquivo:** `apps/admin/src/app/modules/table-session/table-session.component.html:66`

**Antes:**
```html
<td class="fw-semibold">{{ session.table?.name }}</td>
```

**Depois:**
```html
<td class="fw-semibold">{{ session.table.name }}</td>
```

**Motivo:** O tipo gerado pelo GraphQL define `table` como `{ id: string, name: string }` (não-nulo), tornando o `?.` desnecessário.

## Resultado Final

Build do `@apps/admin` concluído sem warnings.
