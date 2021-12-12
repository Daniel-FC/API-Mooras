const express = require('express');
const fs = require('fs');
const util = require('util');
const authMiddlewares = require('../middlewares/auth');

const router = express.Router();
const promisify = util.promisify;
const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);

const categorysDatabase = 'src/database/categorys.json';

router.use(authMiddlewares);

router.get('/', async (req, res) => {
  try {
    const data = JSON.parse(await readFile(categorysDatabase, 'utf8'));
    categorys = data.categorys;

    return res.send({ categorys });
  } catch(err) {
    return res.status(400).send({ error: 'Error loading categorys' });
  }
});

router.get('/:categoryId', async (req, res) => {
  try {
    const data = JSON.parse(await readFile(categorysDatabase, 'utf8'));
    category = data.categorys.find(category => category.id === parseInt(req.params.categoryId, 10));

    return res.send({ category });
  } catch(err) {
    return res.status(400).send({ error: 'Error loading category' });
  }
});

router.post('/', async (req, res) => {
  try {
    const data = JSON.parse(await readFile(categorysDatabase, 'utf8'));
    let category = await req.body;
    
    category = { id: data.nextId++, ...category, user: req.userId };
    data.categorys.push(category);
    await writeFile(categorysDatabase, JSON.stringify(data));

    return res.send({ category });
  } catch(err) {
    return res.status(400).send({ error: 'Error creating new category' });
  }
});

router.put('/:categoryId', async (req, res) => {
  try {
    let newCategory = req.body;
    const data = JSON.parse(await readFile(categorysDatabase, 'utf8'));
    let oldCategoryIndex = data.categorys.findIndex(category => category.id === parseInt(req.params.categoryId, 10));
    
    category = data.categorys[oldCategoryIndex];
    newCategory = { id: category.id, ...newCategory, user: category.user };

    data.categorys[oldCategoryIndex] = newCategory;
    await writeFile(categorysDatabase, JSON.stringify(data));

    return res.send({ newCategory });
  } catch(err) {
    return res.status(400).send({ error: 'Error updating category' });
  }
});

router.delete('/:categoryId', async (req, res) => {
  try {
    const data = JSON.parse(await readFile(categorysDatabase, 'utf8'));
    data.categorys = data.categorys.filter(category => category.id !== parseInt(req.params.categoryId, 10));
    await writeFile(categorysDatabase, JSON.stringify(data));

    return res.send({ deleted: true });
  } catch(err) {
    return res.status(400).send({ error: 'Error deleting category' });
  }
});

module.exports = app => app.use('/categorys', router);
