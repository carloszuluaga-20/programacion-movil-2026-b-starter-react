# Screen — Product list

- **Route:** `/productos`
- **Feature:** [Product catalog](../features/productos.md)
- **Design reference:** Layout specification in the UI regions table below. No external mockup is provided.

---

## Purpose

Allow users to browse the product catalog, search by name, filter by category, open product details and navigate to the creation form.

---

## UI regions

| Region | Component | Notes |
|--------|-----------|-------|
| Header | IonHeader, IonToolbar, IonTitle | Display the title "Products". |
| Search | IonSearchbar | Search product names without case sensitivity. |
| Category filters | Five IonButton components | Todas, Bebidas, Snacks, Aseo and Hogar. Indicate the selected filter. |
| Body | ProductCard components | Show each product's name, category, formatted price and stock label. Use typed props. |
| Feedback | IonSpinner, EmptyState, IonText | Display loading, empty, no-results and error states. |
| Primary action | IonButton | "New product" navigates to `/productos/nuevo`. |

---

## States

| State | Trigger | UI |
|-------|---------|-----|
| Loading | Product request is pending | Show a spinner and loading message. |
| Loaded | Products are available and match the filters | Show matching ProductCard components. |
| Empty | The API returns an empty array | Show "No products yet" with a creation action. |
| No results | The catalog has products but none match the filters | Show "No matching products" with a clear-filters action. |
| Error | The API request fails | Show the error message and a "Retry" button. |
| Offline | A network request fails because connectivity is unavailable | Show a connection error and a retry action. No cached offline catalog is available. |

---

## Actions

| User action | Result | Use case / event |
|-------------|--------|------------------|
| Open the page | Request the product catalog | getProducts |
| Enter search text | Filter the loaded list by name | filterProducts |
| Select a category | Combine category and name filters | filterProducts |
| Select Todas | Remove the category restriction | Update category filter |
| Clear filters | Reset search text and category | Reset filters |
| Open a product card | Navigate to `/productos/:id` | View product details |
| Select New product | Navigate to `/productos/nuevo` | Create product |
| Select Retry | Repeat the failed catalog request | getProducts |
| Return after creating, editing or deleting | Refresh the catalog to show current API data | getProducts |

Search and category filtering are combined through the domain function
`filterProducts`. The page stores request state and filter values locally.

---

## Accessibility

The following requirements will be checked during UI verification.

- [ ] All interactive elements have accessible labels.
- [ ] Touch targets are at least 48 × 48 CSS pixels.
- [ ] Text remains readable when the browser font size or zoom increases.
- [ ] Text and controls meet WCAG AA contrast requirements.
- [ ] The selected category is indicated by more than color alone.
- [ ] Loading and error feedback is available to assistive technologies.
- [ ] Search, filters and navigation work with a keyboard.