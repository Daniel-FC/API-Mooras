const express = require('express');
const fs = require('fs');
const util = require('util');
const authMiddlewares = require('../middlewares/auth');

const router = express.Router();
const promisify = util.promisify;
const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);

const productsDatabase = 'src/database/products.json';

router.use(authMiddlewares);

router.get('/', async (req, res) => {
  try {
    const data = JSON.parse(await readFile(productsDatabase, 'utf8'));
    products = data.products;

    return res.send({ products });
  } catch(err) {
    return res.status(400).send({ error: 'Error loading products' });
  }
});

router.get('/:productId', async (req, res) => {
  try {
    const data = JSON.parse(await readFile(productsDatabase, 'utf8'));
    product = data.products.find(product => product.id === parseInt(req.params.productId, 10));

    return res.send({ product });
  } catch(err) {
    return res.status(400).send({ error: 'Error loading product' });
  }
});

router.post('/', async (req, res) => {
  try {
    const data = JSON.parse(await readFile(productsDatabase, 'utf8'));
    let product = await req.body;
    
    product = { id: data.nextId++, ...product, user: req.userId };
    data.products.push(product);
    await writeFile(productsDatabase, JSON.stringify(data));

   return res.send({ product });
  } catch(err) {
    return res.status(400).send({ error: 'Error creating new product' });
  }
});

router.put('/:productId', async (req, res) => {
  try {
    let newProduct = req.body;
    const data = JSON.parse(await readFile(productsDatabase, 'utf8'));
    let oldProductIndex = data.products.findIndex(product => product.id === parseInt(req.params.productId, 10));
    
    product = data.products[oldProductIndex];
    newProduct = { id: product.id, ...newProduct, user: product.user };

    data.products[oldProductIndex] = newProduct;
    await writeFile(productsDatabase, JSON.stringify(data));

    return res.send({ newProduct });
  } catch(err) {
    return res.status(400).send({ error: 'Error updating product' });
  }
});

router.delete('/:productId', async (req, res) => {
  try {
    const data = JSON.parse(await readFile(productsDatabase, 'utf8'));
    data.products = data.products.filter(product => product.id !== parseInt(req.params.productId, 10));
    await writeFile(productsDatabase, JSON.stringify(data));

    return res.send({ deleted: true });
  } catch(err) {
    return res.status(400).send({ error: 'Error deleting product' });
  }
});

module.exports = app => app.use('/products', router);
