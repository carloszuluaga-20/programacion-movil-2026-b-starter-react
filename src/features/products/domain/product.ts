/**
 * Product domain layer.
 *
 * Contains types, constants and pure functions.
 * It does not depend on HTTP, React or Ionic.
 */

export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  stock: number;
}

export interface ProductInput {
  name: string;
  price: number;
  category: string;
  stock: number;
}

export interface ProductView {
  id: number;
  name: string;
  priceLabel: string;
  category: string;
  stock: number;
  stockLabel: string;
  isLowStock: boolean;
  isOutOfStock: boolean;
}

export type ProductField = 'name' | 'price' | 'category' | 'stock';

export interface ValidationResult {
  isValid: boolean;
  errors: Partial<Record<ProductField, string>>;
}

export interface ProductFilters {
  search: string;
  category: string;
}

export const CATEGORIES = ['Bebidas', 'Snacks', 'Aseo', 'Hogar'] as const;

export const NAME_MAX_LENGTH = 60;

export const LOW_STOCK_THRESHOLD = 5;

/**
 * Supplied utility: formats Colombian pesos with dot separators.
 * Example: formatCOP(1250000) returns "$ 1.250.000".
 */
export function formatCOP(value: number): string {
  const digits = Math.round(value).toString();
  return `$ ${digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
}

// Prepare display values without changing the original product.
export function toProductView(product: Product): ProductView {
  const isOutOfStock = product.stock === 0;
  const isLowStock =
    product.stock > 0 && product.stock < LOW_STOCK_THRESHOLD;

  const stockLabel = isOutOfStock
    ? 'Agotado'
    : isLowStock
      ? 'Pocas unidades'
      : 'Disponible';

  return {
    id: product.id,
    name: product.name.trim(),
    priceLabel: formatCOP(product.price),
    category: product.category,
    stock: product.stock,
    stockLabel,
    isLowStock,
    isOutOfStock,
  };
}

// Use the same field validation rules as the API.
export function validateProduct(input: ProductInput): ValidationResult {
  const errors: ValidationResult['errors'] = {};

  if (typeof input.name !== 'string' || input.name.trim().length === 0) {
    errors.name = 'Name is required and must be a non-empty string.';
  } else if (input.name.length > NAME_MAX_LENGTH) {
    errors.name = `Name must contain at most ${NAME_MAX_LENGTH} characters.`;
  }

  if (
    typeof input.price !== 'number' ||
    !Number.isFinite(input.price) ||
    input.price <= 0
  ) {
    errors.price = 'Price must be a number greater than zero.';
  }

  if (!CATEGORIES.some((category) => category === input.category)) {
    errors.category = 'Category must be Bebidas, Snacks, Aseo or Hogar.';
  }

  if (!Number.isInteger(input.stock) || input.stock < 0) {
    errors.stock =
      'Stock must be an integer greater than or equal to zero.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

// Return a new array with combined text and category filters.
export function filterProducts(
  products: Product[],
  filters: ProductFilters,
): Product[] {
  const search = filters.search.trim().toLowerCase();

  return products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(search);
    const matchesCategory =
      !filters.category || product.category === filters.category;

    return matchesSearch && matchesCategory;
  });
}