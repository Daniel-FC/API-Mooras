const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const util = require('util');

const app = express();
const promisify = util.promisify;
const exists = promisify(fs.exists);
const writeFile = promisify(fs.writeFile);

const PORT  = process.env.PORT || 3000;
global.fileName = 'src/database/users.json';

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

require('./app/controllers/index')(app);

app.listen(PORT, async () => {
    try {
        const fileExists = await exists(global.fileName);
        if (!fileExists){
            const initialJson = {
                nextId: 1,
                users: []
            };
            await writeFile(global.fileName , JSON.stringify(initialJson));
        }
    } catch (err) {
        console.log(err);
    }
    console.log("API started!");
})
