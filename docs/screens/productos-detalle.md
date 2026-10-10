# Screen — Product detail

- **Route:** `/productos/:id`
- **Feature:** [Product catalog](../features/productos.md)
- **Design reference:** Layout specification below. No external mockup is provided.

## Purpose

Display the selected product and allow users to open its edit form or delete it after confirmation.

## UI regions

| Region | Component | Notes |
|---|---|---|
| Header | IonHeader, IonToolbar, IonTitle, IonBackButton | Show the detail title and provide navigation back to `/productos`. |
| Product information | Heading, description list and IonBadge | Show ID, name, formatted price, category, stock quantity and stock label. |
| Feedback | IonSpinner and EmptyState | Display loading, not-found and request-error states. |
| Actions | IonButton | Edit opens the form; Delete displays confirmation. |
| Delete confirmation | Inline text and IonButton components | Show "Confirm deletion" and "Cancel". |
| Deletion error | Error message | Keep the product visible if deletion fails. |

`toProductView` provides the trimmed name, formatted price, stock label and stock flags.

## States

| State | Trigger | UI |
|---|---|---|
| Loading | The product request is pending | Show a spinner and loading message. |
| Loaded | The API returns the product | Show product information and actions. |
| Not found | The API returns 404 | Show a not-found message and a back-to-list action. |
| Invalid ID | The route identifier fails local validation | Show an error; the header provides navigation back to the list. |
| Loading error | Loading fails for another reason | Show the error and a retry action. |
| Connection failure | The API cannot be reached | Show a connection error. |
| Confirming deletion | The user selects Delete | Show confirmation without sending DELETE yet. |
| Deleting | The confirmed request is pending | Disable confirmation actions and prevent repeated deletion requests. |
| Delete failed | DELETE fails | Keep the product and confirmation visible, and display the error. |
| Delete succeeded | DELETE returns 204 | Return to `/productos`. |

There is no persistent offline cache.

## Actions

| User action | Result | Use case / event |
|---|---|---|
| Open the page | Validate the route ID and request the product | getProduct |
| Select Retry | Repeat the product load | getProduct |
| Select Edit | Navigate to `/productos/:id/editar` | Edit product |
| Return to this page | Refresh the selected product | getProduct |
| Select Delete | Display inline confirmation | Open delete confirmation |
| Select Cancel | Hide confirmation and keep the product | Cancel deletion |
| Select Confirm deletion | Send DELETE to the API | deleteProduct |
| Complete deletion successfully | Return to the product list | Navigate to `/productos` |
| Select Back | Navigate back, with `/productos` as the fallback | Back navigation |

Successful editing returns to the product list. Cancelling the edit form returns to the product detail page.

`ApiError.status` distinguishes a missing product from other failures. `getErrorMessage` provides a connection message for network errors.

## State management

The page uses local React state and refreshes through `useEffect` and `useIonViewWillEnter`.

A request-version ref prevents outdated load responses from replacing current state. A separate ref prevents repeated deletion requests.

## Accessibility

Verify the following before marking them complete:

- [ ] All interactive elements have accessible labels.
- [ ] Touch targets are at least 48 × 48 CSS pixels.
- [ ] Text remains readable when browser font size or zoom increases.
- [ ] Text and controls meet WCAG AA contrast requirements.
- [ ] Delete confirmation clearly describes the action.
- [ ] Loading and error feedback is available to assistive technologies.
- [ ] Navigation and confirmation actions work with a keyboard.