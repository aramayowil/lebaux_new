# Open2D2 — Migración React

Sistema de presupuestación para carpintería de aluminio.  
Migrado desde Microsoft Access a React + Vite + TypeScript.

## Stack

| Capa | Tecnología |
|------|-----------|
| Framework | React 18 + Vite |
| Lenguaje | TypeScript 5 |
| Estilos | Tailwind CSS v3 |
| Componentes UI | HeroUI v2 |
| Canvas / Dibujo | react-konva + Konva.js |
| Estado global | Zustand (con persistencia localStorage) |
| Motor de fórmulas | mathjs (reemplaza `reemplazoN()` VBA + Eval) |
| Routing | React Router v6 |

## Instalación

```bash
npm install
npm run dev
```

> Requiere Node.js ≥ 18

## Estructura

```
src/
├── components/
│   ├── layout/       AppLayout (sidebar + topbar)
│   ├── catalogs/     Tabs de perfiles, accesorios, vidrios, tratamientos
│   └── canvas/       TipologiaCanvas (Konva)
├── pages/            Páginas principales (Obras, Catálogos, etc.)
├── store/            Zustand: catalogosStore, obrasStore
├── types/            Tipos TypeScript (espejo del schema Access)
├── lib/
│   └── calculoDespiece.ts   Motor de cálculo (reemplaza VBA reemplazoN)
└── hooks/
    └── useTheme.ts   Dark mode
```

## Módulos pendientes

- [ ] Editor de Productos (jerarquía Marco → Hoja → Interior → Cruces)
- [ ] Fórmulas de Despiece por producto (Despiece perfiles / accesorios)
- [ ] Motor de cálculo completo (Proceso / Proceso2)
- [ ] Canvas interactivo de tipologías (Konva con hojas, cruces, vidrios)
- [ ] Optimizador de barras (cutting stock)
- [ ] Presupuesto / PDF export

## Motor de cálculo

El módulo `src/lib/calculoDespiece.ts` reimplementa la función VBA `reemplazoN()`:

```typescript
calcularFormula('(ancho - 10) / hojas', {
  ancho: 1200, alto: 1500, hojas: 2, crucesH: 0, crucesV: 0
})
// → 595
```

Variables disponibles: `ancho`, `alto`, `hojas`, `crucesH`, `crucesV`  
Funciones: `Entero()` → `floor()`, operadores estándar `+`, `-`, `*`, `/`, `()`
