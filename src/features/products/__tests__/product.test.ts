import { describe, expect, it } from 'vitest';
import seedProducts from '../../../../server/data/products.json';
import {
  CATEGORIES,
  filterProducts,
  formatCOP,
  LOW_STOCK_THRESHOLD,
  toProductView,
  validateProduct,
} from '../domain/product';
import type { Product, ProductInput } from '../domain/product';

const validInput: ProductInput = {
  name: 'Test beverage',
  price: 3500,
  category: 'Bebidas',
  stock: 10,
};

describe('API seed data', () => {
  it('contains eight products with ids from 1 to 8', () => {
    expect(seedProducts).toHaveLength(8);
    expect(seedProducts.map((item) => item.id)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8,
    ]);
  });

  it('uses allowed categories and nonnegative integer stock', () => {
    for (const item of seedProducts) {
      expect(CATEGORIES).toContain(item.category);
      expect(Number.isInteger(item.stock)).toBe(true);
      expect(item.stock).toBeGreaterThanOrEqual(0);
    }
  });

  it('includes out-of-stock and low-stock products', () => {
    expect(seedProducts.some((item) => item.stock === 0)).toBe(true);
    expect(
      seedProducts.some(
        (item) => item.stock > 0 && item.stock < LOW_STOCK_THRESHOLD,
      ),
    ).toBe(true);
  });
});

describe('formatCOP', () => {
  it('uses dot separators and the peso symbol', () => {
    expect(formatCOP(1250000)).toBe('$ 1.250.000');
    expect(formatCOP(8500)).toBe('$ 8.500');
    expect(formatCOP(950)).toBe('$ 950');
  });
});

describe('validateProduct', () => {
  it('accepts valid product data', () => {
    expect(validateProduct(validInput)).toEqual({
      isValid: true,
      errors: {},
    });
  });

  it('reports every invalid field', () => {
    const result = validateProduct({
      name: '   ',
      price: 0,
      category: 'Invalid',
      stock: -1,
    });

    expect(result.isValid).toBe(false);
    expect(result.errors).toEqual({
      name: expect.any(String),
      price: expect.any(String),
      category: expect.any(String),
      stock: expect.any(String),
    });
  });

  it('accepts a 60-character name and rejects 61 characters', () => {
    expect(
      validateProduct({ ...validInput, name: 'x'.repeat(60) }).isValid,
    ).toBe(true);

    const result = validateProduct({
      ...validInput,
      name: 'x'.repeat(61),
    });

    expect(result.isValid).toBe(false);
    expect(result.errors.name).toEqual(expect.any(String));
  });

  it.each([0, -1, Number.NaN, Infinity, -Infinity])(
    'rejects an invalid price: %s',
    (price) => {
      const result = validateProduct({ ...validInput, price });

      expect(result.isValid).toBe(false);
      expect(result.errors.price).toEqual(expect.any(String));
    },
  );

  it.each([-1, 1.5, Number.NaN, Infinity])(
    'rejects invalid stock: %s',
    (stock) => {
      const result = validateProduct({ ...validInput, stock });

      expect(result.isValid).toBe(false);
      expect(result.errors.stock).toEqual(expect.any(String));
    },
  );

  it('accepts zero stock and a positive decimal price', () => {
    expect(
      validateProduct({
        ...validInput,
        stock: 0,
        price: 3500.5,
      }),
    ).toEqual({ isValid: true, errors: {} });
  });

  it.each(CATEGORIES)('accepts the category %s', (category) => {
    expect(validateProduct({ ...validInput, category }).isValid).toBe(true);
  });

  it('rejects a category with incorrect capitalization', () => {
    const result = validateProduct({
      ...validInput,
      category: 'bebidas',
    });

    expect(result.isValid).toBe(false);
    expect(result.errors.category).toEqual(expect.any(String));
  });

  it('does not modify the input', () => {
    const input = { ...validInput };
    const original = { ...input };

    validateProduct(input);

    expect(input).toEqual(original);
  });
});

describe('toProductView', () => {
  it('trims the name and formats the price without changing the product', () => {
    const product: Product = {
      id: 20,
      name: '  Test beverage  ',
      price: 1250000,
      category: 'Bebidas',
      stock: 10,
    };
    const original = { ...product };

    expect(toProductView(product)).toEqual({
      id: 20,
      name: 'Test beverage',
      priceLabel: '$ 1.250.000',
      category: 'Bebidas',
      stock: 10,
      stockLabel: 'Disponible',
      isLowStock: false,
      isOutOfStock: false,
    });
    expect(product).toEqual(original);
  });

  it.each([
    {
      stock: 0,
      label: 'Agotado',
      low: false,
      out: true,
    },
    {
      stock: 1,
      label: 'Pocas unidades',
      low: true,
      out: false,
    },
    {
      stock: 4,
      label: 'Pocas unidades',
      low: true,
      out: false,
    },
    {
      stock: 5,
      label: 'Disponible',
      low: false,
      out: false,
    },
  ])('uses consistent labels and flags for stock $stock', (testCase) => {
    const view = toProductView({
      id: 1,
      ...validInput,
      stock: testCase.stock,
    });

    expect(view.stock).toBe(testCase.stock);
    expect(view.stockLabel).toBe(testCase.label);
    expect(view.isLowStock).toBe(testCase.low);
    expect(view.isOutOfStock).toBe(testCase.out);
  });
});

describe('filterProducts', () => {
  it('matches a name substring without case sensitivity', () => {
    const result = filterProducts(seedProducts, {
      search: 'MINERAL',
      category: '',
    });

    expect(result.map((product) => product.id)).toEqual([1]);
  });

  it('filters by exact category', () => {
    const result = filterProducts(seedProducts, {
      search: '',
      category: 'Aseo',
    });

    expect(result.map((product) => product.id)).toEqual([6, 7]);
    expect(
      filterProducts(seedProducts, {
        search: '',
        category: 'aseo',
      }),
    ).toEqual([]);
  });

  it('combines search and category filters', () => {
    expect(
      filterProducts(seedProducts, {
        search: 'AGUA',
        category: 'Bebidas',
      }).map((product) => product.id),
    ).toEqual([1]);

    expect(
      filterProducts(seedProducts, {
        search: 'AGUA',
        category: 'Hogar',
      }),
    ).toEqual([]);
  });

  it('ignores surrounding search spaces', () => {
    const result = filterProducts(seedProducts, {
      search: '  agua  ',
      category: '',
    });

    expect(result.map((product) => product.id)).toEqual([1]);
  });

  it('returns a new array without modifying the original', () => {
    const original = seedProducts.map((product) => ({ ...product }));
    const result = filterProducts(seedProducts, {
      search: '   ',
      category: '',
    });

    expect(result).toEqual(original);
    expect(result).not.toBe(seedProducts);
    expect(seedProducts).toEqual(original);
  });

  it('returns an empty array when no product matches', () => {
    expect(
      filterProducts(seedProducts, {
        search: 'nonexistent product',
        category: '',
      }),
    ).toEqual([]);
  });
});