/* eslint-disable linebreak-style */
/* eslint-disable strict */
/* eslint-disable linebreak-style */
// --------------- Import ---------------
require('dotenv').config();
const authRouter = require('express').Router();

const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');
const morgan = require('morgan');

// const apiResponse = require('./utils/apiResponse.js');
const network = require('./fabric/network.js');
const user = require('./models/user');
const router = require('./routes/index.js');

async function main() {

    // await network.enrollAdmin(true, false, false);
    // await network.enrollAdmin(false,true,false);
    // await network.enrollAdmin(false,false,true);
    // await user.signup(true, false, false , {id:'0001', userType:'admin', address:'HQ', name:'supplychain management', email:'admin@gmail.com', password:'1234' });

    const app = express();
    app.use(morgan('combined'));
    app.use(bodyParser.json());
    app.use(cors(
        {
            origin: 'http://127.0.0.1:5173',
            methods: 'GET,POST,PUT,DELETE',
            credentials: true,
        }
    ));

    app.use('/', router);
    // app.use((_req, res) => {
    //     return apiResponse.notFound(res);
    // });
    app.listen(process.env.PORT);
}

main();


