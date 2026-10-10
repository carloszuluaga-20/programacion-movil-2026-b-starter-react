/**
 * Product API (Express).
 *
 * createApp() builds the application without starting the server.
 * server/index.js starts it, and tests use an available port.
 *
 * API contract: docs/api/products-endpoints.md
 * Error format: { error: "message", details: ["..."] }
 */
const express = require('express');
const cors = require('cors');
const seedProducts = require('./data/products.json');

const CATEGORIES = ['Bebidas', 'Snacks', 'Aseo', 'Hogar'];

/**
 * Supplied utility: converts a digits-only id to a number.
 * Returns null for invalid values such as "abc", "1.5" or "-2".
 */
function parseId(rawId) {
  return /^\d+$/.test(rawId) ? Number(rawId) : null;
}

// Collect all field errors before rejecting a request.
function validateProduct(body) {
  const details = [];
  const { name, price, category, stock } = body ?? {};

  if (typeof name !== 'string' || name.trim().length === 0) {
    details.push('Name is required and must be a non-empty string.');
  } else if (name.length > 60) {
    details.push('Name must contain at most 60 characters.');
  }

  if (
    typeof price !== 'number' ||
    !Number.isFinite(price) ||
    price <= 0
  ) {
    details.push('Price must be a number greater than zero.');
  }

  if (!CATEGORIES.includes(category)) {
    details.push('Category must be Bebidas, Snacks, Aseo or Hogar.');
  }

  if (!Number.isInteger(stock) || stock < 0) {
    details.push('Stock must be an integer greater than or equal to zero.');
  }

  return details;
}

function createApp() {
  const app = express();

  // Supplied middleware: development CORS and JSON body parsing.
  app.use(cors({ origin: ['http://localhost:5173', 'http://127.0.0.1:5173'] }));
  app.use(express.json());

  // Each application instance starts with a fresh copy of the seed.
  const products = seedProducts.map((item) => ({ ...item }));

  // Keep increasing the id even when a product is deleted.
  let nextId = Math.max(0, ...products.map((product) => product.id)) + 1;

  app.get('/api/products', (req, res) => {
    const search =
      typeof req.query.search === 'string'
        ? req.query.search.toLowerCase()
        : '';

    const category =
      typeof req.query.category === 'string'
        ? req.query.category
        : '';

    const filteredProducts = products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(search);
      const matchesCategory = !category || product.category === category;

      return matchesSearch && matchesCategory;
    });

    return res.status(200).json(filteredProducts);
  });

  app.get('/api/products/:id', (req, res) => {
    const id = parseId(req.params.id);

    if (id === null) {
      return res.status(400).json({
        error: 'Invalid product id',
        details: ['The product id must contain only digits.'],
      });
    }

    const product = products.find((item) => item.id === id);

    if (!product) {
      return res.status(404).json({
        error: 'Product not found',
        details: [`No product exists with id ${id}.`],
      });
    }

    return res.status(200).json(product);
  });

  app.post('/api/products', (req, res) => {
    const details = validateProduct(req.body);

    if (details.length > 0) {
      return res.status(400).json({
        error: 'Invalid product data',
        details,
      });
    }

    const { name, price, category, stock } = req.body;
    const product = {
      id: nextId++,
      name: name.trim(),
      price,
      category,
      stock,
    };

    products.push(product);

    return res.status(201).json(product);
  });

  app.put('/api/products/:id', (req, res) => {
    const id = parseId(req.params.id);

    if (id === null) {
      return res.status(400).json({
        error: 'Invalid product id',
        details: ['The product id must contain only digits.'],
      });
    }

    const index = products.findIndex((item) => item.id === id);

    if (index === -1) {
      return res.status(404).json({
        error: 'Product not found',
        details: [`No product exists with id ${id}.`],
      });
    }

    const details = validateProduct(req.body);

    if (details.length > 0) {
      return res.status(400).json({
        error: 'Invalid product data',
        details,
      });
    }

    const { name, price, category, stock } = req.body;
    const product = {
      id,
      name: name.trim(),
      price,
      category,
      stock,
    };

    products[index] = product;

    return res.status(200).json(product);
  });

  app.delete('/api/products/:id', (req, res) => {
    const id = parseId(req.params.id);

    if (id === null) {
      return res.status(400).json({
        error: 'Invalid product id',
        details: ['The product id must contain only digits.'],
      });
    }

    const index = products.findIndex((item) => item.id === id);

    if (index === -1) {
      return res.status(404).json({
        error: 'Product not found',
        details: [`No product exists with id ${id}.`],
      });
    }

    products.splice(index, 1);

    return res.status(204).end();
  });

  // YA DADO: ruta desconocida → 404 con el formato de error uniforme.
  app.use((req, res) => {
    res.status(404).json({
      error: 'Ruta no encontrada',
      details: [`${req.method} ${req.originalUrl}`],
    });
  });

  // YA DADO: manejador de errores central (se reconoce por tener CUATRO parámetros).
  // Express lo ejecuta cuando una ruta lanza una excepción o llama a next(error).
  // eslint-disable-next-line no-unused-vars -- Express exige los 4 parámetros para reconocerlo.
  app.use((err, _req, res, _next) => {
    if (err && err.type === 'entity.parse.failed') {
      // JSON malformado en el cuerpo: es un error de quien llama, no del servidor.
      return res.status(400).json({
        error: 'El cuerpo no es un JSON válido',
        details: [],
      });
    }

    console.error(err);
    return res.status(500).json({
      error: 'Error interno del servidor',
      details: [],
    });
  });

  return app;
}

module.exports = { createApp, CATEGORIES, parseId };