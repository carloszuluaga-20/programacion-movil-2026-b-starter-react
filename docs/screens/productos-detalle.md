# Screen — Product detail

- **Route:** `/productos/:id`
- **Feature:** [Product catalog](../features/productos.md)
- **Design reference:** Layout specification in the UI regions table below. No external mockup is provided.

---

## Purpose

Display all fields of a selected product and allow users to edit it or delete it after confirmation.

---

## UI regions

| Region | Component | Notes |
|--------|-----------|-------|
| Header | IonHeader, IonToolbar, IonTitle, IonBackButton | Display "Product details" and provide navigation back to `/productos`. |
| Body | IonCard, IonCardContent, IonText | Show id, name, formatted price, category, stock quantity and stock label. |
| Feedback | IonSpinner, EmptyState, IonText | Display loading, not-found and request-error states. |
| Actions | IonButton | "Edit" opens the edit form. "Delete" displays confirmation. |
| Delete confirmation | IonText and IonButton components | Show an inline confirmation with "Confirm deletion" and "Cancel". |

The domain function `toProductView` provides the formatted price and stock
label. The original product supplies the remaining fields.

---

## States

| State | Trigger | UI |
|-------|---------|-----|
| Loading | The product request is pending | Show a spinner and loading message. |
| Loaded | The API returns the product | Show all fields and the edit and delete actions. |
| Empty / not found | The API returns 404 for the product | Show "Product not found" and a back-to-list action. |
| Invalid ID | The route ID is not valid | Show an invalid-identifier message and a back-to-list action. |
| Error | The product request fails for another reason | Show the error message and a retry action. |
| Offline | A network request fails because connectivity is unavailable | Show a connection error and a retry action. No cached product is available. |
| Confirming deletion | The user selects Delete | Show inline confirmation without sending a deletion request yet. |
| Deleting | The confirmed DELETE request is pending | Show progress and disable repeated deletion actions. |
| Delete failed | The DELETE request fails | Keep the user on the detail page and show the error. |

---

## Actions

| User action | Result | Use case / event |
|-------------|--------|------------------|
| Open the page | Read the route ID and request the product | getProduct |
| Select Retry | Repeat the failed product request | getProduct |
| Select Edit | Navigate to `/productos/:id/editar` | Edit product |
| Return after editing | Request the current product data | getProduct |
| Select Delete | Display inline confirmation | Open delete confirmation |
| Select Cancel | Hide confirmation and keep the product | Cancel deletion |
| Select Confirm deletion | Send `DELETE /api/products/:id` | deleteProduct |
| Complete deletion successfully | Return to `/productos`, where the list refreshes | Navigate to product list |
| Select Back | Return to `/productos` | Navigate to product list |

Use `ApiError.status` to distinguish a missing product from other HTTP
failures. Network failures receive a connection message.

---

## Accessibility

The following requirements will be checked during UI verification.

- [ ] All interactive elements have accessible labels.
- [ ] Touch targets are at least 48 × 48 CSS pixels.
- [ ] Text remains readable when the browser font size or zoom increases.
- [ ] Text and controls meet WCAG AA contrast requirements.
- [ ] Delete confirmation clearly describes the action.
- [ ] Loading and error feedback is available to assistive technologies.
- [ ] Navigation and confirmation actions work with a keyboard.