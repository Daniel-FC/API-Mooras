const express = require('express');
const fs = require('fs');
const util = require('util');
const authMiddlewares = require('../middlewares/auth');

const router = express.Router();
const promisify = util.promisify;
const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);

const tagsDatabase = 'src/database/tags.json';

router.use(authMiddlewares);

router.get('/', async (req, res) => {
  try {
    const data = JSON.parse(await readFile(tagsDatabase, 'utf8'));
    tags = data.tags;

    return res.send({ tags });
  } catch(err) {
    return res.status(400).send({ error: 'Error loading tags' });
  }
});

router.get('/:tagId', async (req, res) => {
  try {
    const data = JSON.parse(await readFile(tagsDatabase, 'utf8'));
    tag = data.tags.find(tag => tag.id === parseInt(req.params.tagId, 10));

    return res.send({ tag });
  } catch(err) {
    return res.status(400).send({ error: 'Error loading tag' });
  }
});

router.post('/', async (req, res) => {
  try {
    const data = JSON.parse(await readFile(tagsDatabase, 'utf8'));
    let tag = await req.body;
    
    tag = { id: data.nextId++, ...tag, user: req.userId };
    data.tags.push(tag);
    await writeFile(tagsDatabase, JSON.stringify(data));

    return res.send({ tag });
  } catch(err) {
    return res.status(400).send({ error: 'Error creating new tag' });
  }
});

router.put('/:tagId', async (req, res) => {
  try {
    let newTag = req.body;
    const data = JSON.parse(await readFile(tagsDatabase, 'utf8'));
    let oldTagIndex = data.tags.findIndex(tag => tag.id === parseInt(req.params.tagId, 10));
    
    tag = data.tags[oldTagIndex];
    newTag = { id: tag.id, ...newTag, user: tag.user };

    data.tags[oldTagIndex] = newTag;
    await writeFile(tagsDatabase, JSON.stringify(data));

    return res.send({ newTag });
  } catch(err) {
    return res.status(400).send({ error: 'Error updating tag' });
  }
});

router.delete('/:tagId', async (req, res) => {
  try {
    const data = JSON.parse(await readFile(tagsDatabase, 'utf8'));
    data.tags = data.tags.filter(tag => tag.id !== parseInt(req.params.tagId, 10));
    await writeFile(tagsDatabase, JSON.stringify(data));

    return res.send({ deleted: true });
  } catch(err) {
    return res.status(400).send({ error: 'Error deleting tag' });
  }
});

module.exports = app => app.use('/tags', router);
