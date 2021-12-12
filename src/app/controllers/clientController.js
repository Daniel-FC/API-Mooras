const express = require('express');
const fs = require('fs');
const util = require('util');
const authMiddlewares = require('../middlewares/auth');

const router = express.Router();
const promisify = util.promisify;
const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);

const clientsDatabase = 'src/database/clients.json';

router.use(authMiddlewares);

router.get('/', async (req, res) => {
  try {
    const data = JSON.parse(await readFile(clientsDatabase, 'utf8'));
    clients = data.clients;

    return res.send({ clients });
  } catch(err) {
    return res.status(400).send({ error: 'Error loading clients' });
  }
});

router.get('/:clientId', async (req, res) => {
  try {
    const data = JSON.parse(await readFile(clientsDatabase, 'utf8'));
    client = data.clients.find(client => client.id === parseInt(req.params.clientId, 10));

    return res.send({ client });
  } catch(err) {
    return res.status(400).send({ error: 'Error loading client' });
  }
});

router.post('/', async (req, res) => {
  try {
    const data = JSON.parse(await readFile(clientsDatabase, 'utf8'));
    let client = await req.body;
    
    client = { id: data.nextId++, ...client, user: req.userId };
    data.clients.push(client);
    await writeFile(clientsDatabase, JSON.stringify(data));

   return res.send({ client });
  } catch(err) {
    return res.status(400).send({ error: 'Error creating new client' });
  }
});

router.put('/:clientId', async (req, res) => {
  try {
    let newClient = req.body;
    const data = JSON.parse(await readFile(clientsDatabase, 'utf8'));
    let oldClientIndex = data.clients.findIndex(client => client.id === parseInt(req.params.clientId, 10));
    
    client = data.clients[oldClientIndex];
    newClient = { id: client.id, ...newClient, user: client.user };

    data.clients[oldClientIndex] = newClient;
    await writeFile(clientsDatabase, JSON.stringify(data));

    return res.send({ newClient });
  } catch(err) {
    return res.status(400).send({ error: 'Error updating client' });
  }
});

router.delete('/:clientId', async (req, res) => {
  try {
    const data = JSON.parse(await readFile(clientsDatabase, 'utf8'));
    data.clients = data.clients.filter(client => client.id !== parseInt(req.params.clientId, 10));
    await writeFile(clientsDatabase, JSON.stringify(data));

    return res.send({ deleted: true });
  } catch(err) {
    return res.status(400).send({ error: 'Error deleting client' });
  }
});

module.exports = app => app.use('/clients', router);
