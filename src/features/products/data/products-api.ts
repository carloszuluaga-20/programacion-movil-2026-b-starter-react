/**
 * Product data layer: HTTP client.
 *
 * Uses the supplied request helper, ApiError and API_URL.
 */
import type { Product, ProductInput } from '../domain/product';
import { ApiError } from './api-error';
import { API_URL } from './config';

/**
 * Supplied request helper:
 * - Network failures become ApiError with a null status.
 * - HTTP errors preserve the status, message and server details.
 * - A 204 response returns undefined without parsing JSON.
 */
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_URL}${path}`, init);
  } catch {
    throw new ApiError('No fue posible conectar con el servidor.', null);
  }

  if (!response.ok) {
    const body = await response.json().catch(() => null);

    throw new ApiError(
      body?.error ?? `Error ${response.status}`,
      response.status,
      body?.details ?? [],
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export interface ProductQuery {
  search?: string;
  category?: string;
}

// Supplied example: list products with optional query parameters.
export async function getProducts(
  query: ProductQuery = {},
): Promise<Product[]> {
  const params = new URLSearchParams();

  if (query.search) params.set('search', query.search);
  if (query.category) params.set('category', query.category);

  const queryString = params.toString();

  return request<Product[]>(
    `/api/products${queryString ? `?${queryString}` : ''}`,
  );
}

export async function getProduct(id: number): Promise<Product> {
  return request<Product>(`/api/products/${id}`);
}

export async function createProduct(
  input: ProductInput,
): Promise<Product> {
  return request<Product>('/api/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
}

export async function updateProduct(
  id: number,
  input: ProductInput,
): Promise<Product> {
  return request<Product>(`/api/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
}

export async function deleteProduct(id: number): Promise<void> {
  return request<void>(`/api/products/${id}`, {
    method: 'DELETE',
  });
}