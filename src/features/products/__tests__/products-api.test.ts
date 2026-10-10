// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { startTestServer } from './test-server';

let baseUrl = '';
let close: () => Promise<void>;

beforeEach(async () => {
  ({ baseUrl, close } = await startTestServer());
});

afterEach(async () => {
  await close();
});

const validProduct = {
  name: 'Test beverage',
  price: 3500,
  category: 'Bebidas',
  stock: 10,
};

function jsonRequest(method: string, body: unknown) {
  return {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
}

describe('Supplied error handlers', () => {
  // Based on the supplied example: exercise the existing fallback handler.
  it('returns 404 with the error format for an unknown route', async () => {
    const response = await fetch(`${baseUrl}/api/no-existe`);
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body).toEqual({
      error: expect.any(String),
      details: expect.any(Array),
    });
    expect(body.details).toEqual(['GET /api/no-existe']);
  });

  it('returns 400 for malformed JSON', async () => {
    const response = await fetch(`${baseUrl}/api/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{"name":',
    });

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      error: expect.any(String),
      details: [],
    });
  });
});

describe('GET /api/products', () => {
  it('returns the eight seed products', async () => {
    const response = await fetch(`${baseUrl}/api/products`);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toHaveLength(8);
    expect(body[0]).toMatchObject({
      id: 1,
      name: 'Agua mineral 600 ml',
    });
  });

  it('matches a name substring without case sensitivity', async () => {
    const response = await fetch(`${baseUrl}/api/products?search=MINERAL`);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual([
      expect.objectContaining({ id: 1 }),
    ]);
  });

  it('combines search and category filters', async () => {
    const match = await fetch(
      `${baseUrl}/api/products?search=AGUA&category=Bebidas`,
    );
    const mismatch = await fetch(
      `${baseUrl}/api/products?search=AGUA&category=Hogar`,
    );

    expect(match.status).toBe(200);
    expect(await match.json()).toEqual([
      expect.objectContaining({ id: 1, category: 'Bebidas' }),
    ]);
    expect(mismatch.status).toBe(200);
    expect(await mismatch.json()).toEqual([]);
  });

  it('requires an exact category match', async () => {
    const response = await fetch(`${baseUrl}/api/products?category=bebidas`);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual([]);
  });
});

describe('GET /api/products/:id', () => {
  it('returns an existing product', async () => {
    const response = await fetch(`${baseUrl}/api/products/1`);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      id: 1,
      name: 'Agua mineral 600 ml',
      price: 1800,
      category: 'Bebidas',
      stock: 120,
    });
  });

  it('returns 404 when the product does not exist', async () => {
    const response = await fetch(`${baseUrl}/api/products/999`);

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({
      error: 'Product not found',
      details: expect.any(Array),
    });
  });
});

describe('Invalid product ids', () => {
  it.each(['GET', 'PUT', 'DELETE'])(
    '%s returns 400 for a nonnumeric id',
    async (method) => {
      const response = await fetch(`${baseUrl}/api/products/abc`, {
        method,
      });

      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({
        error: 'Invalid product id',
        details: expect.any(Array),
      });
    },
  );
});

describe('POST /api/products', () => {
  it('creates a product with status 201 and an incremental id', async () => {
    const response = await fetch(
      `${baseUrl}/api/products`,
      jsonRequest('POST', validProduct),
    );
    const product = await response.json();

    expect(response.status).toBe(201);
    expect(product).toEqual({ id: 9, ...validProduct });

    const read = await fetch(`${baseUrl}/api/products/9`);
    expect(read.status).toBe(200);
    expect(await read.json()).toEqual(product);
  });

  it('accumulates all validation errors without creating a product', async () => {
    const response = await fetch(
      `${baseUrl}/api/products`,
      jsonRequest('POST', {
        name: ' ',
        price: 0,
        category: 'Invalid',
        stock: -1,
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe('Invalid product data');
    expect(body.details).toHaveLength(4);
    expect(body.details).toEqual([
      expect.stringContaining('Name'),
      expect.stringContaining('Price'),
      expect.stringContaining('Category'),
      expect.stringContaining('Stock'),
    ]);

    const list = await fetch(`${baseUrl}/api/products`);
    expect(await list.json()).toHaveLength(8);
  });

  it.each([
    { name: 'x'.repeat(61) },
    { name: 123 },
    { price: '3500' },
    { stock: 1.5 },
    { stock: null },
  ])('rejects invalid field values: %j', async (invalidFields) => {
    const response = await fetch(
      `${baseUrl}/api/products`,
      jsonRequest('POST', { ...validProduct, ...invalidFields }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.details).toHaveLength(1);
  });

  it('accepts a 60-character name and zero stock', async () => {
    const product = {
      ...validProduct,
      name: 'x'.repeat(60),
      stock: 0,
    };
    const response = await fetch(
      `${baseUrl}/api/products`,
      jsonRequest('POST', product),
    );

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({ id: 9, ...product });
  });
});

describe('PUT /api/products/:id', () => {
  it('updates the product while preserving its id', async () => {
    const response = await fetch(
      `${baseUrl}/api/products/1`,
      jsonRequest('PUT', { ...validProduct, id: 999 }),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ id: 1, ...validProduct });

    const read = await fetch(`${baseUrl}/api/products/1`);
    expect(await read.json()).toEqual({ id: 1, ...validProduct });
  });

  it('rejects invalid updates without changing the product', async () => {
    const before = await fetch(`${baseUrl}/api/products/1`);
    const original = await before.json();

    const response = await fetch(
      `${baseUrl}/api/products/1`,
      jsonRequest('PUT', {
        name: '',
        price: -1,
        category: 'Invalid',
        stock: 1.5,
      }),
    );

    expect(response.status).toBe(400);
    expect((await response.json()).details).toHaveLength(4);

    const after = await fetch(`${baseUrl}/api/products/1`);
    expect(await after.json()).toEqual(original);
  });

  it('returns 404 for a missing product', async () => {
    const response = await fetch(
      `${baseUrl}/api/products/999`,
      jsonRequest('PUT', validProduct),
    );

    expect(response.status).toBe(404);
    expect((await response.json()).error).toBe('Product not found');
  });
});

describe('DELETE /api/products/:id', () => {
  it('returns 204 with an empty body and removes the product', async () => {
    const response = await fetch(`${baseUrl}/api/products/1`, {
      method: 'DELETE',
    });

    expect(response.status).toBe(204);
    expect(await response.text()).toBe('');

    const read = await fetch(`${baseUrl}/api/products/1`);
    expect(read.status).toBe(404);

    const list = await fetch(`${baseUrl}/api/products`);
    expect(await list.json()).toHaveLength(7);
  });

  it('returns 404 for a missing product', async () => {
    const response = await fetch(`${baseUrl}/api/products/999`, {
      method: 'DELETE',
    });

    expect(response.status).toBe(404);
    expect((await response.json()).error).toBe('Product not found');
  });

  it('does not reuse the id of a deleted product', async () => {
    const first = await fetch(
      `${baseUrl}/api/products`,
      jsonRequest('POST', validProduct),
    );
    expect((await first.json()).id).toBe(9);

    const deleted = await fetch(`${baseUrl}/api/products/9`, {
      method: 'DELETE',
    });
    expect(deleted.status).toBe(204);

    const second = await fetch(
      `${baseUrl}/api/products`,
      jsonRequest('POST', validProduct),
    );

    expect(second.status).toBe(201);
    expect((await second.json()).id).toBe(10);
  });
});