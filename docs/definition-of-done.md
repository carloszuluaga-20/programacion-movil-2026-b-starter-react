# Definition of Done — Product Catalog

This checklist records the implemented requirements and verified results.
Unchecked items remain pending.

## Documentation

- [x] Product feature, three screen specifications, two ADRs, five endpoints and Product entity documented.
- [x] Documentation-only commit recorded before the first implementation commit.
- [x] Documentation reviewed against the implemented behavior.
- [x] Starter templates and framework license retained.

## Express API

- [x] All five CRUD endpoints implemented with the required success codes.
- [x] Case-insensitive name search and exact category filtering work together.
- [x] Invalid identifiers return 400 and missing products return 404.
- [x] POST and PUT validate all editable fields and collect error details.
- [x] Creation generates incremental IDs; updating preserves IDs.
- [x] DELETE returns 204 without a response body.
- [x] Supplied JSON, CORS, identifier and error handlers are reused.
- [x] Runtime changes reset to the eight seed products after restarting the API.

## Ionic React application

- [x] Data, domain and presentation responsibilities are separated.
- [x] Product validation, filtering and display mapping are implemented.
- [x] The HTTP client implements all CRUD operations and handles empty 204 responses.
- [x] Pages use local React state and Ionic lifecycle refreshes.
- [x] ProductCard has typed props and a selection callback.
- [x] Search and five category buttons work, including combined filters.
- [x] Loading, empty, no-results, error and not-found states are implemented.
- [x] Detail displays product information and provides editing.
- [x] Inline deletion confirmation supports cancellation and successful deletion.
- [x] One form supports creating and editing with field validation.
- [x] Failed saves preserve entered values.
- [x] Saving and deleting prevent repeated submissions.
- [x] Connection failures display feedback and the list provides Retry.
- [x] Successful creation, editing and deletion return to the list.

## Kotlin

- [x] Product defines the required fields, including nullable stock.
- [x] val and var reflect property mutability.
- [x] stockLabel handles null and stock categories.
- [x] applyDiscount calculates percentage discounts.
- [x] main prints three products with a 10 percent discount.
- [x] The file runs successfully in Kotlin Playground.

## Verification

- [x] 34 domain tests and 25 API tests pass, with no pending tests.
- [x] API tests use startTestServer.
- [x] Tests verify the supplied unknown-route 404 handler and malformed-JSON 400 response.
- [x] Handler behavior is explained in English in the README.
- [x] npm run lint passes without warnings.
- [x] npm run build passes, including TypeScript checks.
- [x] Manual creation, reading, editing and deletion succeed.
- [x] Combined UI filters and the no-results state are verified.
- [x] Empty catalog and connection-error states are verified.
- [x] Invalid form input and preservation after a failed save are verified.
- [x] Keyboard interaction and readability at 200 percent zoom are manually checked.
- [ ] Touch-target dimensions and WCAG AA contrast are measured.
- [ ] Assistive-technology announcements are manually verified.

The production build reports a bundle-size warning but completes successfully.
Server validation responses are covered by API tests; displaying server
validation details in the form is implemented but has not been separately
verified through a manual server-rejection scenario.

## README and English

- [x] Installation, environment configuration and separate API/app terminals are explained.
- [x] Test, lint, build, in-memory storage and Kotlin execution are explained.
- [x] State management decision contains five English sentences.
- [x] API error handling contains five English sentences.
- [x] User-facing connection, not-found and unexpected-error messages are translated into English.

Assignment category values and stock labels retain their required Spanish values.

## Git and submission

- [x] Work is developed on feature/catalogo-productos.
- [x] More than six meaningful Conventional Commits are pushed to the personal fork.
- [x] .env, node_modules and dist are ignored and are not tracked.
- [ ] The final checklist update is committed and pushed.
- [ ] A PR targets main of the personal fork.
- [ ] The PR includes a description and a checklist of verified requirements.
- [ ] The PR URL is submitted to the Moodle activity.

Merging the PR is not required for submission.
Native builds, localization, analytics and offline persistence are outside
the assignment scope.