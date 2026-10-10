# Screen — Product list

- **Route:** `/productos`
- **Feature:** [Product catalog](../features/productos.md)
- **Design reference:** Layout specification below. No external mockup is provided.

## Purpose

Allow users to browse products, search by name, filter by category, open product details and navigate to the creation form.

## UI regions

| Region | Component | Notes |
|---|---|---|
| Header | IonHeader, IonToolbar, IonTitle | Display "Product catalog". |
| Search | IonInput | Search product names without case sensitivity. |
| Category filters | Five IonButton components | Todas, Bebidas, Snacks, Aseo and Hogar. Indicate the selected filter. |
| Body | IonList and ProductCard | Show name, category, formatted price, stock quantity and stock label. |
| Feedback | IonSpinner and EmptyState | Display loading, empty, no-results and error states. |
| Result count | Text with a status role | Display the number of matching products. |
| Primary action | IonButton | "New product" opens `/productos/nuevo`. |

ProductCard receives a typed ProductView and an optional selection callback. It uses an Ionic item with button behavior for navigation and a badge for the stock label.

## States

| State | Trigger | UI |
|---|---|---|
| Loading | The catalog request is pending | Show a spinner and loading message. |
| Loaded | Products match the filters | Show matching product cards and the result count. |
| Empty | The API returns an empty array | Show an empty-catalog message with a creation action. |
| No results | Products exist but none match the filters | Show a no-results message with a clear-filters action. |
| Error | Loading fails | Show the error message and a retry action. |
| Connection failure | The API cannot be reached | Show a connection error and a retry action. |

There is no persistent offline cache. The page displays a request error when loading fails.

## Actions

| User action | Result | Use case / event |
|---|---|---|
| Open the page | Request the catalog | getProducts |
| Enter search text | Filter the loaded list by name | filterProducts |
| Select a category | Combine category and name filters | filterProducts |
| Select Todas | Remove the category restriction | Update category filter |
| Clear filters | Reset search text and category | Reset filters |
| Select a product card | Navigate to `/productos/:id` | View product details |
| Select New product | Navigate to `/productos/nuevo` | Create product |
| Select Retry | Repeat the catalog request | getProducts |
| Return to the page | Refresh products from the API | getProducts |

Search and category filters are combined through `filterProducts`. Filtering happens locally on the loaded array.

The page uses local React state. `useEffect` performs the initial load, and `useIonViewWillEnter` refreshes the catalog when the page becomes active again. A ref prevents overlapping catalog requests.

## Accessibility

Implemented support includes a search label, product-card labels, selected-category indicators through `aria-pressed`, and status or alert roles for feedback.

Verify the following before marking them complete:

- [ ] All interactive elements have accessible labels.
- [ ] Touch targets are at least 48 × 48 CSS pixels.
- [ ] Text remains readable when browser font size or zoom increases.
- [ ] Text and controls meet WCAG AA contrast requirements.
- [ ] The selected category is indicated by more than color alone.
- [ ] Loading and error feedback is available to assistive technologies.
- [ ] Search, filters and navigation work with a keyboard.