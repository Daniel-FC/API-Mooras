const express = require('express');
const fs = require('fs');
const util = require('util');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const authConfig = require('../../config/auth');

const router = express.Router();
const promisify = util.promisify;
const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);

function genereteToken(params = {}){
  return jwt.sign(params, authConfig.secret, {
    expiresIn: 86400,
  })
}

router.get('/list', async (req, res) => {
  try {
    const data = JSON.parse(await readFile(global.fileName, 'utf8'));
    users = data.users;

    return res.send({ users });
  } catch(err) {
    return res.status(400).send({ error: 'Error loading users' });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { email } = req.body;
    if(!req.body.name || !req.body.email || !req.body.password)
      return res.status(400).send({ error: 'Registration failed'});

    const data = JSON.parse(await readFile(global.fileName, 'utf8'));
    if(!!data.users.find(user => user.email === email))
      return res.status(400).send({ error: 'User already exists'})

    let user = await req.body;
    const hash = await bcrypt.hash(user.password, 10);
    user.password = hash;

    user = { id: data.nextId++, ...user, timestamp: new Date() };
    data.users.push(user);
    await writeFile(global.fileName, JSON.stringify(data));

    user.password = undefined;
    return res.send({ 
      user, 
      token: genereteToken({ id: user.id }),
    });
  } catch (err) {
    return res.status(400).send({ error: 'Registration failed'});
  }
});

router.post('/authenticate', async (req, res) => {
  const { email, password } = req.body;

  const data = JSON.parse(await readFile(global.fileName, 'utf8'));
  const user = data.users.find(user => user.email === email);
  
  if(!user)
    return res.status(400).send({ error: 'User not found' });

  if(!await bcrypt.compare(password, user.password))
    return res.status(400).send({ error: 'Invalid password' });
  
  user.password = undefined;
  res.send({ 
    user,
    token: genereteToken({ id: user.id }),
  });
});

router.delete('/:id', async (req, res) => {
  try {
    const data = JSON.parse(await readFile(global.fileName, 'utf8'));
    data.users = data.users.filter(user => user.id !== parseInt(req.params.id, 10));
    await writeFile(global.fileName, JSON.stringify(data));

    return res.send({ deleted: true });
  } catch(err) {
    return res.status(400).send({ error: 'Error deleting user' });
  }
});

module.exports = app => app.use('/auth', router);
