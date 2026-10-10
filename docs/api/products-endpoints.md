# Endpoint Integration — Products

- **Feature:** [Product catalog](../features/productos.md)
- **Resource:** `/api/products`
- **Development base URL:** `http://localhost:3000`
- **Auth required:** No
- **Implementation status:** Planned

---

## Shared contract

A Product contains `id`, `name`, `price`, `category` and `stock`.

POST and PUT require all four editable fields:

| Field | Type | Validation |
|-------|------|------------|
| name | string | Required, not blank, maximum 60 characters |
| price | number | Greater than zero |
| category | string | Bebidas, Snacks, Aseo or Hogar |
| stock | number | Integer greater than or equal to zero |

The server generates incremental IDs. PUT preserves the existing ID.

Errors use this structure:

```json
{
  "error": "Invalid product data",
  "details": [
    "name is required",
    "price must be greater than zero"
  ]
}
```

Validation collects all detected problems and includes one details entry
per problem. This example illustrates the response structure; supplied
starter handler messages are retained as provided.

---

## GET /api/products — List products

- **Method + path:** `GET /api/products`
- **Client function:** `getProducts`
- **Auth required:** No

### Request

| Param | In | Type | Required | Notes |
|-------|----|------|----------|-------|
| search | query | string | No | Name contains the text, without case sensitivity |
| category | query | string | No | Exact category match |

Both filters can be combined. No request body is required.

Example:

```text
GET /api/products?search=agua&category=Bebidas
```

### Response

**Success: 200 OK**

```json
[
  {
    "id": 1,
    "name": "Example beverage",
    "price": 2500,
    "category": "Bebidas",
    "stock": 8
  }
]
```

An empty catalog or a filter with no matches returns `[]` with status 200.

### Errors

No endpoint-specific errors are defined for listing products.
Unexpected failures use the supplied server error handler.

The app shows a request error with a retry action when loading fails.

### Caching / offline

Online-only. The page keeps the loaded array in local state.
The app applies its search and category controls through `filterProducts`.
Returning after a mutation refreshes the catalog from the API.

---

## GET /api/products/:id — Retrieve a product

- **Method + path:** `GET /api/products/:id`
- **Client function:** `getProduct`
- **Auth required:** No

### Request

| Param | In | Type | Required | Notes |
|-------|----|------|----------|-------|
| id | path | number | Yes | Product identifier, checked by the supplied parseId utility |

No request body is required.

### Response

**Success: 200 OK**

```json
{
  "id": 1,
  "name": "Example beverage",
  "price": 2500,
  "category": "Bebidas",
  "stock": 8
}
```

### Errors

| Status | Meaning | App behavior |
|--------|---------|--------------|
| 400 | Invalid identifier | Show an invalid-ID message and back navigation |
| 404 | Product does not exist | Show Product not found and back navigation |
| 500 | Unexpected server error | Show an error with a retry action |

### Caching / offline

Online-only. Product data remains in page state while the page is active.
Refresh when returning from editing. No persistent offline cache is used.

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

Return the complete created Product, including its generated ID.

```json
{
  "id": 9,
  "name": "Example beverage",
  "price": 2500,
  "category": "Bebidas",
  "stock": 8
}
```

The example ID assumes the initial maximum ID is 8.

### Errors

| Status | Meaning | App behavior |
|--------|---------|--------------|
| 400 | Product validation failed | Preserve input and display error details |
| 500 | Unexpected server error | Preserve input and display an error |

### Caching / offline

No offline creation or queued requests.
On success, navigate to the returned product's detail.
Refresh the list when it becomes active again.

---

## PUT /api/products/:id — Update a product

- **Method + path:** `PUT /api/products/:id`
- **Client function:** `updateProduct`
- **Auth required:** No

### Request

| Param | In | Type | Required | Notes |
|-------|----|------|----------|-------|
| id | path | number | Yes | Existing product identifier |

Send `Content-Type: application/json`.
All editable fields are required; this endpoint does not perform a partial update.

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

### Errors

| Status | Meaning | App behavior |
|--------|---------|--------------|
| 400 | Invalid identifier or product data | Display the message and validation details |
| 404 | Product does not exist | Show a not-found message and back navigation |
| 500 | Unexpected server error | Preserve input and display an error |

### Caching / offline

No offline updates.
On success, navigate to the product detail and refresh its data.
Refresh the list when it becomes active again.

---

## DELETE /api/products/:id — Delete a product

- **Method + path:** `DELETE /api/products/:id`
- **Client function:** `deleteProduct`
- **Auth required:** No

### Request

| Param | In | Type | Required | Notes |
|-------|----|------|----------|-------|
| id | path | number | Yes | Existing product identifier |

No request body is required.
The app asks for inline confirmation before sending the request.

### Response

**Success: 204 No Content**

The response has no body. The client must not attempt to parse JSON
for this successful response.

### Errors

| Status | Meaning | App behavior |
|--------|---------|--------------|
| 400 | Invalid identifier | Show the error on the detail page |
| 404 | Product does not exist | Show a not-found message |
| 500 | Unexpected server error | Keep the detail page and show the error |

### Caching / offline

No offline deletion.
On success, return to `/productos` and refresh the catalog.

---

## DTO → domain mapping

The JSON Product maps directly to the domain Product type.

| DTO field | Domain field | Transform |
|-----------|--------------|-----------|
| id | id | None |
| name | name | None |
| price | price | Preserve numeric value; formatCOP is used only for display |
| category | category | Preserve the required category value |
| stock | stock | Preserve integer quantity; toProductView derives the stock label |

---

## Shared error handling

The data layer checks response.ok because fetch does not throw
automatically for HTTP error statuses.

HTTP failures are represented by the supplied ApiError, preserving
the status, error message and details. Network failures have no HTTP
response and are shown as connection errors.

The supplied fallback 404 handler handles unknown routes.
The supplied 500 handler handles unexpected errors.
An integration test will verify the fallback 404 response.

---

## Storage and verification

Products are stored in server memory and initialized from
`server/data/products.json`. Changes disappear when the server restarts.

Planned integration tests cover CRUD, combined filters, validation,
invalid identifiers, missing products, empty DELETE responses and
the supplied fallback 404 handler.