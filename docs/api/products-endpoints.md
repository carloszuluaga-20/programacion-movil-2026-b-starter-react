# Endpoint Integration — Products

- **Feature:** [Product catalog](../features/productos.md)
- **Resource:** `/api/products`
- **Development base URL:** `http://localhost:3000`
- **Auth required:** No
- **Implementation status:** Implemented

---

## Shared contract

A Product contains `id`, `name`, `price`, `category` and `stock`.

POST and PUT require all four editable fields:

| Field | Type | Validation |
|---|---|---|
| name | string | Required, not blank, maximum 60 characters |
| price | number | Finite number greater than zero |
| category | string | Bebidas, Snacks, Aseo or Hogar |
| stock | number | Integer greater than or equal to zero |

The API generates incremental IDs and preserves the existing ID during updates.
Deleted IDs are not reused within the same server session.
Product names are trimmed before storage.

Errors use this structure:

```json
{
  "error": "Invalid product data",
  "details": [
    "Name is required and must be a non-empty string.",
    "Price must be a number greater than zero."
  ]
}
```

Validation collects all detected problems and includes one details entry
per problem. The example above represents an invalid name and price
with otherwise valid fields.

The supplied fallback and central error handlers retain their starter messages.

---

## GET /api/products — List products

- **Method + path:** `GET /api/products`
- **Client function:** `getProducts`
- **Auth required:** No

### Request

| Param | In | Type | Required | Notes |
|---|---|---|---|---|
| search | query | string | No | Name contains the text, without case sensitivity |
| category | query | string | No | Exact category match |

Both filters can be combined. No request body is required.

Example:

```text
GET /api/products?search=agua&category=Bebidas
```

### Response

**Success: 200 OK**

Example response with the initial seed data:

```json
[
  {
    "id": 1,
    "name": "Agua mineral 600 ml",
    "price": 1800,
    "category": "Bebidas",
    "stock": 120
  }
]
```

An empty catalog or filters with no matches return `[]` with status 200.

### Errors

No endpoint-specific errors are defined for listing products.
Unexpected server failures use the central error handler.

The app displays an error with a retry action if loading fails.

### Caching / offline

No persistent offline cache is used.
The page keeps the loaded array in local React state.

The app applies its search and category controls through `filterProducts`.
Returning to the list refreshes the catalog from the API.

---

## GET /api/products/:id — Retrieve a product

- **Method + path:** `GET /api/products/:id`
- **Client function:** `getProduct`
- **Auth required:** No

### Request

| Param | In | Type | Required | Notes |
|---|---|---|---|---|
| id | path | string of digits | Yes | Converted to a number by the supplied parseId utility |

No request body is required.

Example:

```text
GET /api/products/1
```

### Response

**Success: 200 OK**

Example response with the initial seed data:

```json
{
  "id": 1,
  "name": "Agua mineral 600 ml",
  "price": 1800,
  "category": "Bebidas",
  "stock": 120
}
```

### Errors

| Status | Meaning | App behavior |
|---|---|---|
| 400 | Invalid identifier | Display an error; back navigation remains available |
| 404 | Product does not exist | Display a not-found state with a back-to-list action |
| 500 | Unexpected server error | Display an error with a retry action |

Invalid identifier example:

```json
{
  "error": "Invalid product id",
  "details": [
    "The product id must contain only digits."
  ]
}
```

Missing product example:

```json
{
  "error": "Product not found",
  "details": [
    "No product exists with id 999."
  ]
}
```

The detail page also validates the route identifier before sending a request.

### Caching / offline

Product data is kept in page state.
The page refreshes when it becomes active again.

No persistent offline cache is used.
Connection failures display an error message.

---

## POST /api/products — Create a product

- **Method + path:** `POST /api/products`
- **Client function:** `createProduct`
- **Auth required:** No

### Request

No path or query parameters are required.
Send `Content-Type: application/json`.

**Body:**

```json
{
  "name": "Example beverage",
  "price": 2500,
  "category": "Bebidas",
  "stock": 8
}
```

### Response

**Success: 201 Created**

The API returns the complete created product, including its generated ID.

```json
{
  "id": 9,
  "name": "Example beverage",
  "price": 2500,
  "category": "Bebidas",
  "stock": 8
}
```

The example ID assumes this is the first creation after loading the
initial eight products.

### Errors

| Status | Meaning | App behavior |
|---|---|---|
| 400 | Invalid product data or malformed JSON | Preserve input and display the error and available details |
| 500 | Unexpected server error | Preserve input and display an error |

The form runs `validateProduct` before sending the request.
Invalid local input displays field errors without calling the API.

### Caching / offline

There is no offline creation or request queue.
Failed saves preserve the current form values for resubmission.

On success, navigate to `/productos`.
The list refreshes when it becomes active again.

---

## PUT /api/products/:id — Update a product

- **Method + path:** `PUT /api/products/:id`
- **Client function:** `updateProduct`
- **Auth required:** No

### Request

| Param | In | Type | Required | Notes |
|---|---|---|---|---|
| id | path | string of digits | Yes | Existing product identifier |

Send `Content-Type: application/json`.

All four editable fields are required.
This endpoint does not perform a partial update.

**Body:**

```json
{
  "name": "Updated beverage",
  "price": 3000,
  "category": "Bebidas",
  "stock": 4
}
```

### Response

**Success: 200 OK**

```json
{
  "id": 1,
  "name": "Updated beverage",
  "price": 3000,
  "category": "Bebidas",
  "stock": 4
}
```

The ID is preserved.
The API replaces the editable fields only after validation succeeds.

### Errors

| Status | Meaning | App behavior |
|---|---|---|
| 400 | Invalid identifier, product data or malformed JSON | Preserve input and display the error and available details |
| 404 | Product does not exist | Display a not-found state during initial loading; display a save error if it disappears before submission |
| 500 | Unexpected server error | Display a loading error with retry, or preserve input when saving fails |

The edit form first loads the existing product with `getProduct`.
It runs `validateProduct` before sending an update.

### Caching / offline

There are no offline updates or queued requests.
Failed saves preserve the current form values.

On success, navigate to `/productos`.
The list refreshes when it becomes active again.

Cancelling editing returns to `/productos/:id`.

---

## DELETE /api/products/:id — Delete a product

- **Method + path:** `DELETE /api/products/:id`
- **Client function:** `deleteProduct`
- **Auth required:** No

### Request

| Param | In | Type | Required | Notes |
|---|---|---|---|---|
| id | path | string of digits | Yes | Existing product identifier |

No request body is required.
The app displays inline confirmation before sending the request.

Selecting Cancel hides the confirmation without sending DELETE.

### Response

**Success: 204 No Content**

The response has no body.
The client returns without attempting to parse JSON.

### Errors

| Status | Meaning | App behavior |
|---|---|---|
| 400 | Invalid identifier | Keep the detail page and display the error |
| 404 | Product no longer exists | Keep the detail page and display a not-found error message |
| 500 | Unexpected server error | Keep the detail page and display the error |

Failed deletion keeps the current product and confirmation visible.
Repeated deletion requests are prevented while a request is pending.

### Caching / offline

There is no offline deletion or request queue.

On success, return to `/productos`.
The list refreshes when it becomes active again.

---

## DTO → domain mapping

The JSON product maps directly to the domain `Product` type.

| DTO field | Domain field | Transform |
|---|---|---|
| id | id | Preserve numeric identifier |
| name | name | Preserve API value; toProductView trims it for display |
| price | price | Preserve numeric value; formatCOP formats it for display |
| category | category | Preserve the exact category value |
| stock | stock | Preserve integer quantity; toProductView derives labels and flags |

`toProductView` produces these stock labels:

| Stock | Label |
|---|---|
| 0 | Agotado |
| 1 to 4 | Pocas unidades |
| 5 or more | Disponible |

The client uses TypeScript types for the response structure.
It does not perform runtime schema validation of successful responses.

---

## Shared error handling

The data layer checks `response.ok` because `fetch` does not throw
automatically for unsuccessful HTTP statuses.

HTTP failures are represented by `ApiError`, preserving the status,
error message and details.

Connection failures produce an `ApiError` with a null status and
`isNetworkError` set to true.
The UI uses `getErrorMessage` to display appropriate feedback.

The supplied fallback handler returns 404 for unknown routes.
The central error handler returns 400 for malformed JSON and
500 for unexpected server errors.

Integration tests verify the unknown-route 404 response and the
malformed-JSON 400 response.

---

## Storage and verification

Products are stored in server memory and initialized from
`server/data/products.json`.

CRUD operations do not rewrite the seed file.
Changes disappear when the server restarts.
Deleted IDs are not reused within the same server session.

Implemented integration tests cover:

- Product listing and combined filters.
- Retrieving existing and missing products.
- Invalid route identifiers.
- Product creation and generated IDs.
- Validation failures and boundary values.
- Updates that preserve the product ID.
- Deletion with an empty 204 response.
- Missing products after deletion.
- Unknown-route 404 responses.
- Malformed-JSON 400 responses.

See [Product entity](product-entity.md) for storage details and
[ADR-002](../decisions/ADR-002-consumo-api.md) for the API consumption decision.