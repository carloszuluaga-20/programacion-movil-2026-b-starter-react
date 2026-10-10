# Definition of Done — Product Catalog

The catalog is ready for submission when all assignment requirements below
have been implemented and verified.

Unchecked items are pending. Mark items only after verification.

---

## Documentation before implementation

- [ ] Product feature specification completed.
- [ ] List, detail and shared form screen specifications completed.
- [ ] ADR-001 explains local page state management.
- [ ] ADR-002 explains API consumption and supplied starter utilities.
- [ ] All five endpoints and the Product entity documented.
- [ ] This checklist adapted to the assignment.
- [ ] Documentation-only commit recorded before the first implementation commit.
- [ ] Starter templates and framework license retained.
- [ ] Documentation links and implementation agree.

---

## Express API

- [ ] GET /api/products returns 200 with an array.
- [ ] Search matches part of the name without case sensitivity.
- [ ] Category filtering uses an exact match.
- [ ] Search and category filters work together.
- [ ] GET /api/products/:id returns 200 with the requested product.
- [ ] POST creates a product with an incremental ID and returns 201.
- [ ] PUT updates all editable fields, preserves the ID and returns 200.
- [ ] DELETE removes a product and returns 204 without a body.
- [ ] Invalid identifiers return 400 according to the supplied parseId utility.
- [ ] Missing products return 404.
- [ ] POST and PUT enforce all required validation rules.
- [ ] Validation accumulates all detected problems in details.
- [ ] Errors use the error and details response structure.
- [ ] Supplied JSON, CORS, identifier and error-handling utilities are reused.
- [ ] Runtime changes remain in memory and reset when the server restarts.

---

## Ionic React application

- [ ] Data, domain and presentation responsibilities remain separated.
- [ ] Product type and validateProduct are implemented.
- [ ] toProductView formats prices with formatCOP and derives stock labels.
- [ ] filterProducts combines name search and category filtering.
- [ ] HTTP client implements getProduct, createProduct, updateProduct and deleteProduct.
- [ ] Successful DELETE responses are handled without JSON parsing.
- [ ] Pages manage local state with useState and useEffect.
- [ ] Cached Ionic pages refresh data when required after mutations.
- [ ] ProductCard has typed props and receives display data and callbacks.
- [ ] List shows loading, empty, no-results and error states.
- [ ] List provides a Retry action after a failed request.
- [ ] List provides search and five category buttons.
- [ ] Detail displays all product fields and handles missing products.
- [ ] Detail provides Edit and inline delete confirmation.
- [ ] Successful deletion returns to the refreshed list.
- [ ] One form supports both creation and editing.
- [ ] Form validates inline with the same rules as the API.
- [ ] Server details messages are displayed when submission is rejected.
- [ ] Failed saves preserve entered values.
- [ ] Saving and deleting prevent repeated submissions.
- [ ] Routes match the documented list, detail, create and edit paths.
- [ ] Network failures receive clear feedback.
- [ ] Documented accessibility requirements are manually verified.

---

## Kotlin

- [ ] kotlin/Product.kt defines Product with id, name, price, category and nullable stock.
- [ ] val and var are used according to whether each property should change.
- [ ] stockLabel handles null, zero, low stock and available stock.
- [ ] applyDiscount calculates the discounted price.
- [ ] main prints three products with stock labels and a 10 percent discount.
- [ ] The complete file compiles and runs in Kotlin Playground.

---

## Tests and manual verification

- [ ] At least two new domain unit tests pass.
- [ ] At least two new API integration tests use startTestServer and pass.
- [ ] A test triggers the supplied fallback 404 handler or the 500 handler.
- [ ] The tested handler behavior is explained in English.
- [ ] npm test passes with no remaining assignment TODO tests.
- [ ] npm run lint passes.
- [ ] npm run build passes.
- [ ] Manual create, read, update and delete flow succeeds.
- [ ] Search and combined category filtering work in the UI.
- [ ] Invalid form values and server rejection messages are verified.
- [ ] Loading, empty, no-results, not-found and retry behavior are verified.

---

## README and English

- [ ] README explains installation and environment configuration.
- [ ] README explains npm run server and npm run dev in separate terminals.
- [ ] README explains test, lint and build commands.
- [ ] README explains in-memory storage and Kotlin execution.
- [ ] State management decision contains 3 to 5 English sentences with justification.
- [ ] API error handling contains 3 to 5 English sentences explaining API responses and ApiError.

---

## Git and submission

- [ ] Work is committed on feature/catalogo-productos.
- [ ] At least six meaningful commits use Conventional Commits.
- [ ] .env is ignored and .env.example is present.
- [ ] node_modules and generated build files are excluded from Git.
- [ ] No secrets or credentials are committed.
- [ ] The branch is pushed to the personal fork.
- [ ] A PR targets main of the personal fork.
- [ ] The PR includes a description and the verified checklist.
- [ ] The PR URL is submitted as online text in the Moodle activity before the deadline.

Merging the PR is not a submission requirement stated in the assignment.
Native Android/iOS builds, localization, analytics and offline persistence
are outside this assignment's scope.