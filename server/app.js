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

function createApp() {
  const app = express();

  // Supplied middleware: development CORS and JSON body parsing.
  app.use(cors({ origin: ['http://localhost:5173', 'http://127.0.0.1:5173'] }));
  app.use(express.json());

  // Each application instance starts with a fresh copy of the seed.
  const products = seedProducts.map((item) => ({ ...item }));

  // Temporary handler for the routes implemented in the next step.
  const notImplemented = (_req, res) => {
    res.status(501).json({
      error: 'Not implemented',
      details: [],
    });
  };

  // List products with optional combined search and category filters.
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

  // Get one product using the supplied id parser.
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

  // TODO: create a product with validation and an incremental id.
  app.post('/api/products', notImplemented);

  // TODO: update an existing product with validation.
  app.put('/api/products/:id', notImplemented);

  // TODO: delete an existing product and return 204 without a body.
  app.delete('/api/products/:id', notImplemented);

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