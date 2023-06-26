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
const product = require('./models/product');
const transact = require('./models/transact');
const router = require('./routes/index.js');

async function main() {

<<<<<<< HEAD
    await network.enrollAdmin(true, false, false);
    await network.enrollAdmin(false,true,false);
    await network.enrollAdmin(false,false,true);
    await user.signup(true, false, false , {userType:'admin', address:'HQ', name:'supplychain management', email:'admin@gmail.com', password:'1234' , id:'admin' });
=======

    // await network.enrollAdmin(true, false, false);
    // await network.enrollAdmin(false,true,false);
    // await network.enrollAdmin(false,false,true);
    // await user.signup(true, false, false , {userType:'admin', address:'HQ', name:'supplychain management', email:'admin@gmail.com', password:'1234' ,profilePic:'QmUc3ptBKAsZdAGBod2pD5RM71nXSzZpRKuLVqwpP6ezRT', id:'admin' });
    // await user.signup(false, true, false , {userType:'adminMiddleman', address:'HQ', name:'supplychain management middleman', email:'adminmiddleman@gmail.com', password:'1234' ,profilePic:'QmUc3ptBKAsZdAGBod2pD5RM71nXSzZpRKuLVqwpP6ezRT', id:'admin' });
    // await user.signup(false, false, true , {userType:'admin', address:'HQ', name:'supplychain management consumer', email:'adminconsumer@gmail.com', password:'1234' ,profilePic:'QmUc3ptBKAsZdAGBod2pD5RM71nXSzZpRKuLVqwpP6ezRT', id:'admin' });
    // await user.signup(true, false,false  , {userType:'manufacturer', address:'ghy', name:'Dip jyoti kashyap', email:'dip@gmail.com', password:'1234' ,profilePic:'QmUc3ptBKAsZdAGBod2pD5RM71nXSzZpRKuLVqwpP6ezRT', id:'admin' });
    // await user.signup(true, false,  false, {userType:'exporter', address:'golaghat', name:'Hema Gohain', email:'hema@gmail.com', password:'1234' ,profilePic:'QmUc3ptBKAsZdAGBod2pD5RM71nXSzZpRKuLVqwpP6ezRT', id:'admin' });
    // await user.signup(false, true,  false, {userType:'importer', address:'jorhat', name:'tajkiratul', email:'tajkiratul@gmail.com', password:'1234' ,profilePic:'QmUc3ptBKAsZdAGBod2pD5RM71nXSzZpRKuLVqwpP6ezRT', id:'admin' });
    // await user.signup(false, true,  false, {userType:'retailer', address:'Tihu', name:'Jivan', email:'jivan@gmail.com', password:'1234' ,profilePic:'QmUc3ptBKAsZdAGBod2pD5RM71nXSzZpRKuLVqwpP6ezRT', id:'admin' });
    // await user.signup(false, true,  false, {userType:'logistic', address:'kolkata', name:'fedex', email:'fedex@gmail.com', password:'1234' ,profilePic:'QmUc3ptBKAsZdAGBod2pD5RM71nXSzZpRKuLVqwpP6ezRT', id:'admin' });
    // await product.createRawProduct({ id:'User1', name:'Pumpkin Seed', price:'20' ,  quantity:'100' , image:'QmWdpvMnBr6aVTKsu5hTPALmnbMpANZfsBTicCdfEcucti' , description:'Best Quality Pumpkin Seed'});
    // await product.createRawProduct({ id:'User2', name:'Watermelon Seed', price:'10' ,  quantity:'100' , image:'QmWtskTssiSCfjaavSmuT9Enhonu3zTRxTvsqPP7fDfxsq' , description:'Best Quality Watermelon Seed'});
    // await product.createProduct({ id:'User4', name:'Strawberry', price:'100' ,  quantity:'10'});
    // await transact.listProduct(true, false, false , {productId:'Product3' , loggedUserType:'manufacturer' , id:'User4', climate:'rainy' , soilType:'Moist' , price:300});
    // await transact.sendToExporter({productId:'Product3' ,  userId:'User5'});
    // await transact.listProduct(false, true, false , {productId:'Product3' , loggedUserType:'exporter' , id:'User5', packagingType:'box' , quantityPerPackage:5 , price:300});
>>>>>>> b3ddb7276106ef8bfe6c52713fcfa41f32c02ae3

    const app = express();
    app.use(morgan('combined'));
    app.use(bodyParser.json());
    app.use(cors(
        {
            origin: 'http://localhost:5173',
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


