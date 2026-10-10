# Screen — Product form

- **Routes:** `/productos/nuevo` and `/productos/:id/editar`
- **Feature:** [Product catalog](../features/productos.md)
- **Design reference:** Layout specification below. No external mockup is provided.

## Purpose

Allow users to create or edit a product through one shared form. Validate input before submission and display errors returned by the API.

## UI regions

| Region | Component | Notes |
|---|---|---|
| Header | IonHeader, IonToolbar, IonTitle, IonBackButton | Display "New product" or "Edit product". |
| Name | IonInput | Required text, maximum 60 characters validated on submission. |
| Price | IonInput | Numeric input in COP, greater than zero. |
| Category | IonButton inside a fieldset | One button for each category: Bebidas, Snacks, Aseo and Hogar. |
| Stock | IonInput | Integer greater than or equal to zero. |
| Field feedback | Paragraphs with alert roles | Display validation messages associated with each field. |
| Request feedback | IonSpinner and error messages | Display loading progress and request failures. |
| Primary action | IonButton | "Create product", "Save changes" or "Saving…". |
| Secondary action | IonButton | Cancel and return to the list or product detail. |

The API generates the ID. The form does not allow users to edit it.

## States

| State | Trigger | UI |
|---|---|---|
| Create | The creation route opens | Show empty fields without initial validation errors. |
| Loading | Edit mode requests the product | Show a spinner before displaying the form. |
| Ready | Product data is loaded or create mode is initialized | Show editable fields. |
| Invalid input | Submission fails domain validation | Show inline errors and prevent the API request. |
| Saving | A valid POST or PUT request is pending | Disable fields and form actions to prevent repeated submissions. |
| Server rejection | The API rejects submitted data | Preserve values and display the error and its details. |
| Not found | Loading returns 404 | Show a not-found message and a back-to-list action. |
| Invalid ID | The edit route contains an invalid identifier | Show an error with a retry action; the header provides navigation back to the list. |
| Loading error | Loading fails | Show the error and a retry action. |
| Saving error | Saving fails | Preserve input and allow resubmission. |
| Connection failure | The API cannot be reached | Show a connection message; preserve input if saving fails. |
| Success | Creation or editing succeeds | Navigate to `/productos`. |

There is no local cache or offline write queue. Products are stored in API memory.

## Actions

| User action | Result | Use case / event |
|---|---|---|
| Open the creation route | Initialize an empty form | Initialize create mode |
| Open the edit route | Load the product and populate fields | getProduct |
| Change a field | Update local form state | Input change |
| Select a category | Update the selected category | Category selection |
| Submit invalid values | Display inline errors without sending a request | validateProduct |
| Submit valid values in create mode | Create the product and return to the list | createProduct |
| Submit valid values in edit mode | Update the product and return to the list | updateProduct |
| Receive an API rejection | Display the error and ApiError.details while preserving input | Handle API error |
| Select Retry after a loading failure | Request the product again | getProduct |
| Select Cancel in create mode | Return to `/productos` | Cancel creation |
| Select Cancel in edit mode | Return to `/productos/:id` | Cancel editing |

Validation runs on submission. Changing a field updates its value; it does not immediately rerun validation.

## Validation

The form uses `validateProduct` with the same rules as the API:

- Name must be a nonblank string with at most 60 characters.
- Price must be a finite number greater than zero.
- Category must be Bebidas, Snacks, Aseo or Hogar.
- Stock must be an integer greater than or equal to zero.

Blank numeric fields are converted to an invalid numeric value before validation, so they cannot silently become zero.

## Accessibility

Implemented support includes field labels, selected-category indicators through `aria-pressed`, and field errors connected through `aria-describedby`.

The following checks must be verified before marking them complete:

- [ ] All fields and buttons have accessible labels.
- [ ] Validation messages are associated with their fields.
- [ ] Touch targets are at least 48 × 48 CSS pixels.
- [ ] Text remains readable when browser font size or zoom increases.
- [ ] Text and controls meet WCAG AA contrast requirements.
- [ ] Required fields and errors are indicated by more than color alone.
- [ ] Loading, saving and error feedback is available to assistive technologies.
- [ ] The form works with a keyboard.