# Product Catalog — Ionic React

Mobile Programming practical exam, second assessment period — CORHUILA 2026-B.

This project implements a product catalog with an Express API, an Ionic React application, and a standalone Kotlin exercise. The application supports searching, filtering, viewing, creating, updating, and deleting products.

Project documentation was committed before the first implementation commit, using templates from the [Mobile Governance Framework](https://github.com/jesusarielgb-works/mobile-governance-framework).

## Requirements

- Node.js 22.12 or later.
- npm.
- A browser.
- Kotlin Playground for the standalone Kotlin exercise.

## Run locally

Install dependencies:

```bash
npm install
```

Copy `.env.example` to `.env`.

Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Start the API:

```bash
npm run server
```

The API runs at `http://localhost:3000`.

In another terminal, start the application:

```bash
npm run dev
```

Open `http://localhost:5173/productos`.

Keep both terminals running. The application reads the API base URL from `VITE_API_URL`, with `http://localhost:3000` as the default.

Products are stored in server memory. Restarting the API restores the eight seed products and removes changes made during the previous session.

## Application routes

| Route | Purpose |
|---|---|
| `/productos` | Product list, name search, and category filters |
| `/productos/nuevo` | Create a product |
| `/productos/:id` | Product details and deletion confirmation |
| `/productos/:id/editar` | Edit an existing product |

The list distinguishes loading, request errors, an empty catalog, and filters with no results. Product cards display the name, category, formatted price, stock quantity, and stock label.

The detail page provides editing and an inline deletion confirmation. The shared form validates each field and displays API error details when a request is rejected. Successful creation, editing, or deletion returns to the product list.

Stock labels follow the assignment contract:

- `Agotado`: zero units.
- `Pocas unidades`: one to four units.
- `Disponible`: five or more units.

Prices use Colombian peso formatting, for example `$ 1.250.000`.

## Architecture

The product feature is organized into three layers:

| Layer | Responsibility |
|---|---|
| `domain` | Product types, validation, filtering, and display mapping |
| `data` | API configuration, HTTP requests, and `ApiError` |
| `presentation` | Ionic pages, reusable components, and screen state |

Presentation uses the domain functions and API client. Data depends on domain types. Domain functions do not import React, Ionic, or HTTP code.

## State management decision

We use local React state with `useState` because each screen manages a small amount of product data and UI state.
`useEffect` loads the data needed by a screen when it is mounted.
`useIonViewWillEnter` refreshes data when a user returns to a page that Ionic keeps in memory.
Pure domain functions handle validation, filtering, and product display mapping outside the UI components.
We did not add a global store because the API remains the source of truth and the current screens do not require shared client state.

## API contract

A product contains these fields:

```json
{
  "id": 1,
  "name": "Agua mineral 600 ml",
  "price": 1800,
  "category": "Bebidas",
  "stock": 120
}
```

| Method and path | Success | Expected errors |
|---|---|---|
| `GET /api/products?search=&category=` | `200`, product array | — |
| `GET /api/products/:id` | `200`, product object | `400`, invalid ID; `404`, missing product |
| `POST /api/products` | `201`, created product | `400`, invalid input |
| `PUT /api/products/:id` | `200`, updated product | `400`, invalid ID or input; `404`, missing product |
| `DELETE /api/products/:id` | `204`, no response body | `400`, invalid ID; `404`, missing product |

The name search is case-insensitive and matches part of a product name. The category filter requires an exact match. Both API filters can be combined.

Creation and editing require:

- A non-empty string name with at most 60 characters.
- A finite numeric price greater than zero.
- A category from `Bebidas`, `Snacks`, `Aseo`, or `Hogar`.
- An integer stock greater than or equal to zero.

The server assigns IDs on creation and preserves them during editing. Deleted IDs are not reused during the same server session.

Errors use this response structure:

```json
{
  "error": "Invalid product data",
  "details": [
    "Price must be a number greater than zero."
  ]
}
```

## API error handling

`express.json()` parses JSON request bodies, and `cors()` allows requests from the configured local development origins.
`parseId()` rejects IDs that contain characters other than digits, while the routes return validation errors as `400` and missing products as `404`, using the `{ error, details }` format.
The supplied fallback handler returns `404` for unknown routes, and the central error handler returns `400` for malformed JSON or `500` for unexpected server errors.
The HTTP client converts failed responses into `ApiError` with a status code and details, while connection failures produce an `ApiError` with a null status.
The UI uses `getErrorMessage()` and `ApiError` to distinguish connection problems, missing products, and other failures, and the form preserves entered values when saving fails.

## Error-handler verification

The API test suite requests an unknown route and checks that it returns `404` with an error message and a details array.

To reproduce this manually, open:

```text
http://localhost:3000/api/no-existe
```

No product route matches this URL, so Express reaches the supplied fallback handler. This demonstrates the unknown-route handler separately from a missing product returned by `GET /api/products/:id`.

The test suite also sends malformed JSON and checks that the supplied central error handler returns `400`.

## Quality checks

Run these commands from the repository root:

```bash
npm test
npm run lint
npm run build
```

The tests cover domain validation, product display mapping, filtering, and API behavior, including CRUD operations and error responses.

API tests use `startTestServer()` to create a fresh server instance for each test. Domain tests run without HTTP requests or UI components.

The production build checks TypeScript types before generating the application bundle.

## Kotlin exercise

Open `kotlin/Product.kt`, copy its content into [Kotlin Playground](https://play.kotlinlang.org), and run it.

The exercise includes:

- A `Product` class with an immutable ID and editable catalog fields.
- Nullable stock represented by `Int?`.
- `stockLabel()` with safe null handling.
- `applyDiscount()` for percentage discounts.
- Three example products printed with a 10% discount.

Expected output:

```text
Mineral water | Stock: Sin dato | Price with 10% discount: 1620.0 COP
Oat cookies | Stock: Agotado | Price with 10% discount: 2430.0 COP
Hand soap | Stock: Pocas unidades | Price with 10% discount: 6210.0 COP
```

The Kotlin exercise does not require an Android project.

## Documentation

| Document | Purpose |
|---|---|
| [Product feature](docs/features/productos.md) | Feature scope and behavior |
| [Product list](docs/screens/productos-lista.md) | List screen specification |
| [Product detail](docs/screens/productos-detalle.md) | Detail screen specification |
| [Product form](docs/screens/productos-formulario.md) | Create and edit screen specification |
| [ADR-001](docs/decisions/ADR-001-estado.md) | State management decision |
| [ADR-002](docs/decisions/ADR-002-consumo-api.md) | API consumption and error handling |
| [API endpoints](docs/api/products-endpoints.md) | Five endpoint contracts |
| [Product entity](docs/api/product-entity.md) | Data model and in-memory storage |
| [Definition of Done](docs/definition-of-done.md) | Delivery checklist |

## Git and submission

Work is developed on `feature/catalogo-productos` with meaningful Conventional Commits.

The documentation commit precedes the implementation commits. The delivery Pull Request must target `main` in this same fork:

```text
carloszuluaga-20/programacion-movil-2026-b-starter-react
```

The Pull Request description includes the completed work and a checklist of verified requirements. Submit its URL in the Moodle activity before the official deadline.

Do not commit `.env` or `node_modules`.

## Attribution

Documentation templates come from the Mobile Governance Framework under the MIT license. See `docs/LICENSE-mobile-governance-framework.txt`.