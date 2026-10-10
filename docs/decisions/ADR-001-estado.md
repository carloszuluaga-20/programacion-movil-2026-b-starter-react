# ADR-001 — Local page state management

- **ID:** ADR-001
- **Date:** 2026-10-10
- **Status:** Accepted
- **Authors:** carloszuluaga-20

---

## Context

The product catalog needs state for API requests, search filters, product
details, form values, validation feedback and deletion confirmation.
A consistent approach must be selected before implementation so that
screen specifications and code follow the same design.

**Known constraints:**

- The application uses the Ionic React starter.
- The assignment requires state to live in each page with useState and useEffect.
- Code must be organized into data, domain and presentation layers.
- The project does not require authentication, offline persistence or a global store.
- Ionic may keep routed pages mounted, so data must refresh when users return after a mutation.

---

## Decision

**We decided:** Manage state locally in each page with React useState,
use useEffect for initial loading and route changes, and refresh API data
when an Ionic page becomes active again.

**Justification:**

Each page owns a small amount of state with a clear purpose.
Local hooks satisfy the assignment and avoid adding dependencies.
Domain functions handle validation, filtering and product presentation,
while the data layer handles HTTP requests.
Presentation components receive typed props and callbacks.
Ionic view lifecycle events supplement useEffect when a cached page
becomes active again.

---

## Evaluated alternatives

| Alternative | Pros | Cons | Reason for discarding |
|-------------|------|------|-----------------------|
| Local useState and useEffect — chosen | Simple, explicit and consistent with the assignment | Pages must refresh data after mutations | Chosen |
| React Context for catalog state | Shares data across pages | Requires shared update and synchronization logic | Shared global state is unnecessary for this scope |
| Redux or another external store | Centralizes complex state transitions | Adds dependencies and setup | Complexity exceeds the needs of this catalog |

---

## Consequences

**Positive:**

- Page state is easy to locate and explain.
- No external state-management dependency is required.
- Pure domain functions can be tested independently.
- Typed props keep ProductCard independent of API access.

**Negative / Trade-offs:**

- Loading and error handling appear in several pages.
- Returning to cached Ionic pages requires explicit data refresh.
- There is no shared cache or offline synchronization.

**Impact on the system:**

- Affected screens: ProductListPage, ProductDetailPage and ProductFormPage.
- State includes loading, errors, products, filters, form values and mutation progress.
- State updates use setters and avoid mutating existing objects or arrays.
- API data is requested again when needed after creating, updating or deleting products.
- Documents to update: product feature, screen specifications and the README section State management decision.

---

## References

- [Product catalog](../features/productos.md)
- [Product list](../screens/productos-lista.md)
- [Product detail](../screens/productos-detalle.md)
- [Product form](../screens/productos-formulario.md)
- Related to: [ADR-002 — API consumption](ADR-002-consumo-api.md)