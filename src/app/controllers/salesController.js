const express = require('express');
const fs = require('fs');
const util = require('util');
const authMiddlewares = require('../middlewares/auth');

const router = express.Router();
const promisify = util.promisify;
const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);

const salesDatabase = 'src/database/sales.json';

router.use(authMiddlewares);

router.get('/', async (req, res) => {
  try {
    const data = JSON.parse(await readFile(salesDatabase, 'utf8'));
    sales = data.sales;

    return res.send({ sales });
  } catch(err) {
    return res.status(400).send({ error: 'Error loading sales' });
  }
});

router.get('/:saleId', async (req, res) => {
  try {
    const data = JSON.parse(await readFile(salesDatabase, 'utf8'));
    sale = data.sales.find(sale => sale.id === parseInt(req.params.saleId, 10));

    return res.send({ sale });
  } catch(err) {
    return res.status(400).send({ error: 'Error loading sale' });
  }
});

router.post('/', async (req, res) => {
  try {
    const data = JSON.parse(await readFile(salesDatabase, 'utf8'));
    let sale = await req.body;
    
    sale = { id: data.nextId++, ...sale, user: req.userId };
    data.sales.push(sale);
    await writeFile(salesDatabase, JSON.stringify(data));

   return res.send({ sale });
  } catch(err) {
    return res.status(400).send({ error: 'Error creating new sale' });
  }
});

router.put('/:saleId', async (req, res) => {
  try {
    let newSale = req.body;
    const data = JSON.parse(await readFile(salesDatabase, 'utf8'));
    let oldSaleIndex = data.sales.findIndex(sale => sale.id === parseInt(req.params.saleId, 10));
    
    sale = data.sales[oldSaleIndex];
    newSale = { id: sale.id, ...newSale, user: sale.user };

    data.sales[oldSaleIndex] = newSale;
    await writeFile(salesDatabase, JSON.stringify(data));

    return res.send({ newSale });
  } catch(err) {
    return res.status(400).send({ error: 'Error updating sale' });
  }
});

router.delete('/:saleId', async (req, res) => {
  try {
    const data = JSON.parse(await readFile(salesDatabase, 'utf8'));
    data.sales = data.sales.filter(sale => sale.id !== parseInt(req.params.saleId, 10));
    await writeFile(salesDatabase, JSON.stringify(data));

    return res.send({ deleted: true });
  } catch(err) {
    return res.status(400).send({ error: 'Error deleting sale' });
  }
});

module.exports = app => app.use('/sales', router);
