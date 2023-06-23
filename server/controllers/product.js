const productModel = require('../models/product.js');
const apiResponse = require('../utils/apiResponse.js');

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

exports.updateProduct = async (req, res) => {
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

