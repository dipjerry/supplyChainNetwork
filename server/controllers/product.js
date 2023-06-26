const productModel = require('../models/product.js');
const apiResponse = require('../utils/apiResponse.js');

const multer = require('multer');
const ipfs = require('../script/addToIpfs.js');
// const path = require('path');

const uploadDueFile = multer({
    storage: multer.diskStorage({
        destination : (req, file, cb)=> {
            cb(null, './');
        },
        filename: (req, file, cb) => {
            cb(null, new Date().toISOString().replace(/:/g, '-') + '-' +
        file.originalname.replace(/\s/g, '_'));
        },
        fileSize: (process.env.MAX_PHOTO_SIZE || 10) * 1024 * 1024, // 10MB limit
    }),
});


exports.createProduct = async (req, res) => {
    const { id, name, price , loggedUserType , quantity } = req.body;
    console.log('1');

    if (!name || !id || !price || !quantity  || !loggedUserType) {
        return apiResponse.badRequest(res);
    }
    console.log('2');
    console.log(req.body);

    if (loggedUserType !== 'manufacturer' ) {
        return apiResponse.badRequest(res);
    }
    console.log('3');

    const modelRes = await productModel.createProduct({ name, id, price , quantity });
    return apiResponse.send(res, modelRes);
};



exports.createRawProduct = async (req, res) => {
    const { id, name, price , loggedUserType , quantity , image , description } = req.body;
    console.log('1');

    if (!name || !id || !price || !quantity  || !loggedUserType || !image || !description) {
        return apiResponse.badRequest(res);
    }
    console.log('2');
    console.log(req.body);

    // if (loggedUserType !== 'manufacturer' ) {
    //     return apiResponse.badRequest(res);
    // }
    // console.log('3');

    const modelRes = await productModel.createRawProduct({ id, name, price ,  quantity , image , description });
    return apiResponse.send(res, modelRes);
};
exports.storeProduct =  async (req, res) => {
    const {peds , item } = req.body;
    console.log("🚀 ~ file: product.js:63 ~ exports.storeProduct= ~ item:", item)
    console.log("🚀 ~ file: product.js:63 ~ exports.storeProduct= ~ peds:", peds)
    console.log("🚀 ~ file: product.js:45 ~ exports.storeImage= ~ req.body:", req.body);
    console.log('1');

    // Add your middleware logic here
    // Example:

    // if (!req.body.name || !req.body.id || !req.body.price || !req.body.quantity || !req.body.loggedUserType || !req.body.image || !req.body.description) {
    //   return apiResponse.badRequest(res);
    // }

    const { file } = req.files;
    console.log("🚀 ~ file: product.js:73 ~ exports.storeProduct= ~ file:", file)
    const profilePic = await ipfs.addToIpfs(req.files);
    // console.log('profilePic');
    // console.log(profilePic);
    console.log("🚀 ~ file: product.js:76 ~ exports.storeProduct= ~ profilePic:", profilePic)
    // ... Add more middleware checks as needed

    // Continue with the rest of your code
    // console.log('2');
    // console.log(req.body);

    // const modelRes = await productModel.createRawProduct({ id, name, price ,  quantity , image , description });
    return apiResponse.send(res, { message: 'success' });
  };


exports.updateProduct = async (req, res)   => {
    const { id, name, price , loggedUserType } = req.body;
    const { role, productId } = req.params;
    console.log('1');

    if (!productId || !name || !id || !price || !loggedUserType || !role) {
        return apiResponse.badRequest(res);
    }
    console.log('2');

    if (loggedUserType === 'consumer' ) {
        return apiResponse.badRequest(res);
    }
    console.log('3');

    let modelRes;
    if( role === 'manufacturer' ) {
        modelRes = await productModel.updateProduct(true, false,false, { productId, id, name, price });
    } else if( role === 'middlemen' ) {
        modelRes = await productModel.updateProduct(false, true, false, { productId, id, name, price });
    } else {
        return apiResponse.badRequest(res);
    }
    return apiResponse.send(res, modelRes);
};

exports.getProductbyId = async (req, res) => {
    const { id } = req.body;
    const { productId, role } = req.params;

    console.log('1');

    if (!productId || !id || !role ) {
        return apiResponse.badRequest(res);
    }
    console.log('2');
    console.log('3');
    let modelRes;
    if( role === 'manufacturer' ) {
        modelRes = await productModel.getProductById(true, false, false, { productId, id });
    } else if( role === 'middlemen' ) {
        modelRes = await productModel.getProductById(false, true, false,{ productId, id });
    } else if( role === 'consumer' ) {
        modelRes = await productModel.getProductById(false, false, true, { productId, id });
    } else {
        return apiResponse.badRequest(res);
    }
    return apiResponse.send(res, modelRes);
};

exports.getAllProducts = async (req, res) => {

    console.log(req.params);
    const { role , id } = req.query;

    console.log('1');

    if (!id || !role ) {
        return apiResponse.badRequest(res);
    }
    console.log('2');
    console.log('3');
    let modelRes;
    if( role === 'manufacturer' ) {
        modelRes = await productModel.getAllProducts(true, false, false, { id });
    } else if( role === 'middlemen' ) {
        modelRes = await productModel.getAllProducts(false, true, false,{ id });
    } else if( role === 'consumer' ) {
        modelRes = await productModel.getAllProducts(false, false, true, { id });
    } else if( role === 'admin' ) {
        modelRes = await productModel.getAllProducts(true, false, false, { id });
    }
    else {
        return apiResponse.badRequest(res);
    }
    return apiResponse.send(res, modelRes);
};

exports.getAllRawProducts = async (req, res) => {
    console.log(req.params);
    const { role , id } = req.query;
    console.log('1');
    if (!id || !role ) {
        return apiResponse.badRequest(res);
    }
    console.log('2');
    console.log('3');
    let modelRes;
    if( role === 'manufacturer' ) {
        modelRes = await productModel.getAllRawProducts({ id });
    }
    else {
        return apiResponse.badRequest(res);
    }
    return apiResponse.send(res, modelRes);
};

exports.getProductsByRole = async (req, res) => {
    console.log("req.params");
    console.log(req.query);
    const { key ,role , id } = req.query;

    if (!id || !role || !key) {
        return apiResponse.badRequest(res);
    }
    let modelRes;
    if( role === 'manufacturer' ) {
        modelRes = await productModel.getProductByRole(true, false, false, { id , key});
    } else if( role === 'exporter' ||  role === 'importer' || role === 'logistic'  ) {
        modelRes = await productModel.getProductByRole(false, true, false,{ id , key });
    } else if( role === 'consumer' ) {
        modelRes = await productModel.getProductByRole(false, false, true, { id , key});
    }
    else {
        return apiResponse.badRequest(res);
    }
    return apiResponse.send(res, modelRes);
};

exports.getshopProduct = async (req, res) => {
    console.log('req.params');
    console.log(req.query);
    const {role , id , userType } = req.query;
    if (!id || !role || !userType) {
        return apiResponse.badRequest(res);
    }
    console.log("Here is the role" + role);
    let modelRes;
    if( role === 'manufacturer' ) {
        modelRes = await productModel.getShopProduct(true, false, false, { id , userType});
    } else if( role === 'middlemen' ) {
        modelRes = await productModel.getShopProduct(false, true, false,{ id , userType});
    } else if( role === 'consumer' ) {
        modelRes = await productModel.getShopProduct(false, false, true, { id , userType});
    }
    else {
        return apiResponse.badRequest(res);
    }
    return apiResponse.send(res, modelRes);
};

