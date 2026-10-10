# ADR-002 — API consumption and error handling

- **ID:** ADR-002
- **Date:** 2026-10-10
- **Status:** Accepted
- **Authors:** carloszuluaga-20

---

## Context

The Ionic React application must consume an Express API to list, retrieve,
create, update and delete products. Requests can fail because of invalid
input, invalid identifiers, missing resources, unexpected server errors
or network problems.

The starter already provides API_URL, ApiError and getProducts as an
HTTP client example. It also provides express.json(), CORS, parseId,
a fallback 404 handler and a 500 error handler.

**Known constraints:**

- The API resource is /api/products.
- API errors use the structure { "error": "message", "details": ["..."] }.
- POST and PUT validation must collect all detected problems.
- A successful DELETE returns 204 without a response body.
- The supplied starter utilities must be reused and understood.
- Configuration belongs in .env, which must remain ignored by Git.

---

## Decision

**We decided:** Centralize API requests in the data layer using fetch,
the supplied API_URL and ApiError, following the existing getProducts example.

**Justification:**

The supplied client establishes a consistent approach without requiring
another HTTP library. Pages call data-layer functions instead of building
requests directly. The client checks HTTP response status and preserves
the API message and details in ApiError. Pages distinguish HTTP failures
from network failures and present feedback appropriate to each screen.

---

## Evaluated alternatives

| Alternative | Pros | Cons | Reason for discarding |
|-------------|------|------|-----------------------|
| Data-layer fetch client — chosen | Reuses the starter and centralizes HTTP behavior | Requires explicit status and response-body handling | Chosen |
| fetch calls inside each page | Quick for an isolated request | Duplicates request and error logic; mixes responsibilities | Conflicts with the required layer separation |
| Axios client | Provides convenient request helpers | Adds a dependency and changes the starter approach | Existing fetch utilities are sufficient |

---

## Consequences

**Positive:**

- HTTP logic remains separate from presentation and domain rules.
- All CRUD operations follow the same error-handling approach.
- ApiError exposes the HTTP status and server validation details.
- The client can be extended without changing the screen contracts.

**Negative / Trade-offs:**

- fetch does not throw automatically for unsuccessful HTTP statuses.
- JSON responses must be parsed explicitly.
- DELETE must handle an empty 204 response without attempting JSON parsing.
- Network failures do not provide an HTTP status or API details.
- In-memory server changes are lost when the server restarts.

**Impact on the system:**

- Data functions: getProducts, getProduct, createProduct, updateProduct and deleteProduct.
- POST and PUT send JSON with Content-Type: application/json.
- Pages display ApiError.details when the server rejects submitted input.
- A product-specific 404 produces a not-found state.
- Network failures produce a connection message.
- Failed list requests offer a retry action.
- Documents to update: endpoint contract, screen specifications and the README section API error handling.

---

## Supplied server utilities

- express.json() parses JSON request bodies before endpoint handlers.
- CORS allows the separate development frontend to access the API.
- parseId validates route identifiers; its supplied behavior will be retained.
- The fallback 404 handler handles requests that do not match any route.
- The 500 handler handles unexpected errors forwarded through Express.
- The supplied handlers will be used as provided.

An integration test will request an unknown route and verify that the
fallback handler returns 404 with the expected error structure.
The README will explain this behavior in English.

---

## References

- [Product catalog](../features/productos.md)
- [Product endpoints](../api/products-endpoints.md)
- [Product entity](../api/product-entity.md)
- Related to: [ADR-001 — Local page state](ADR-001-estado.md)