const network = require('../fabric/network.js');
const apiResponse = require('../utils/apiResponse.js');

exports.createProduct = async information => {
    const { name, id, price , quantity} = information;
    console.log('information');
    console.log(information);
    const networkObj = await network.connect(true, false, false, id);
    const contractRes = await network.invoke(networkObj, 'createProduct', name, id, price , quantity);
    console.log(contractRes);
    const error = networkObj.error || contractRes.error;
    if (error) {
        const status = networkObj.status || contractRes.status;
        return apiResponse.createModelRes(status, error);
    }
    return apiResponse.createModelRes(200, 'Success', contractRes);
};

exports.createRawProduct = async information => {
    const { id, name, price ,  quantity , image , description} = information;
    console.log('information');
    console.log(information);
    const networkObj = await network.connect(true, false, false, id);
    const contractRes = await network.invoke(networkObj, 'createRawMaterial', name , id , price , quantity , image , description);
    console.log(contractRes);
    const error = networkObj.error || contractRes.error;
    if (error) {
        const status = networkObj.status || contractRes.status;
        return apiResponse.createModelRes(status, error);
    }

    return apiResponse.createModelRes(200, 'Success', contractRes);
};

exports.updateProduct = async ( isManufacturer, isMiddlemen, isConsumer ,information ) => {
    const { productId, name, id, price} = information;

    const networkObj = await network.connect(isManufacturer, isMiddlemen, false, id);
    const contractRes = await network.invoke(networkObj, 'updateProduct', productId, id, name, price);

    const error = networkObj.error || contractRes.error;
    if (error) {
        const status = networkObj.status || contractRes.status;
        return apiResponse.createModelRes(status, error);
    }

    return apiResponse.createModelRes(200, 'Success', contractRes);
};

exports.getProductById = async ( isManufacturer, isMiddlemen, isConsumer ,information )=> {
    const { productId, id } = information;

    const networkObj = await network.connect(isManufacturer, isMiddlemen, isConsumer, id);
    const contractRes = await network.invoke(networkObj, 'queryAsset', productId);

    const error = networkObj.error || contractRes.error;
    if (error) {
        const status = networkObj.status || contractRes.status;
        return apiResponse.createModelRes(status, error);
    }

    return apiResponse.createModelRes(200, 'Success', contractRes);
};

exports.getAllProducts = async ( isManufacturer, isMiddlemen, isConsumer ,information )=> {
    const { id } = information;

    const networkObj = await network.connect(isManufacturer, isMiddlemen, isConsumer, id);
    const contractRes = await network.invoke(networkObj, 'queryAll', 'Product');

    const error = networkObj.error || contractRes.error;
    if (error) {
        const status = networkObj.status || contractRes.status;
        return apiResponse.createModelRes(status, error);
    }

    return apiResponse.createModelRes(200, 'Success', contractRes);
};
exports.getAllRawProducts = async information => {
    const { id } = information;
    const networkObj = await network.connect(true, false, false, id);
    const contractRes = await network.invoke(networkObj, 'queryGetRawMaterial', 'Product');
    const error = networkObj.error || contractRes.error;
    if (error) {
        const status = networkObj.status || contractRes.status;
        return apiResponse.createModelRes(status, error);
    }
    return apiResponse.createModelRes(200, 'Success', contractRes);
};

exports.getProductByOwner = async ( isManufacturer, isMiddlemen, isConsumer ,information )=> {
    const { id } = information;
    const networkObj = await network.connect(isManufacturer, isMiddlemen, isConsumer, id);
    const contractRes = await network.invoke(networkObj, 'getProductByOwner', 'ownerId');
    const error = networkObj.error || contractRes.error;
    if (error) {
        const status = networkObj.status || contractRes.status;
        return apiResponse.createModelRes(status, error);
    }
    return apiResponse.createModelRes(200, 'Success', contractRes);
};
exports.getProductByRole = async ( isManufacturer, isMiddlemen, isConsumer ,information )=> {
    const { key ,   id } = information;
    const networkObj = await network.connect(isManufacturer, isMiddlemen, isConsumer, id);
    const contractRes = await network.invoke(networkObj, 'querybyFilter','Product', key , id );
    const error = networkObj.error || contractRes.error;
    if (error) {
        const status = networkObj.status || contractRes.status;
        return apiResponse.createModelRes(status, error);
    }
    return apiResponse.createModelRes(200, 'Success', contractRes);
};

exports.getShopProduct = async ( isManufacturer, isMiddlemen, isConsumer ,information )=> {
    const { id , userType } = information;
    const networkObj = await network.connect(isManufacturer, isMiddlemen, isConsumer, id);
    const contractRes = await network.invoke(networkObj, 'queryShopItem','Product', 't',userType);
    const error = networkObj.error || contractRes.error;
    if (error) {
        const status = networkObj.status || contractRes.status;
        return apiResponse.createModelRes(status, error);
    }
    return apiResponse.createModelRes(200, 'Success', contractRes);
};

exports.createOrder = async information => {
    const { productID, userId, userType , name } = information;

    const networkObj = await network.connect(false, false, true, id);
    const contractRes = await network.invoke(networkObj, 'orderProduct', productID, userId);

    const error = networkObj.error || contractRes.error;
    if (error) {
        const status = networkObj.status || contractRes.status;
        return apiResponse.createModelRes(status, error);
    }

    return apiResponse.createModelRes(200, 'Success', contractRes);
};

exports.isDelivered = async information => {
    const { productId , id } = information;

    const networkObj = await network.connect(false, false, true, id);
    const contractRes = await network.invoke(networkObj, 'deliveredProduct', productId );

    const error = networkObj.error || contractRes.error;
    if (error) {
        const status = networkObj.status || contractRes.status;
        return apiResponse.createModelRes(status, error);
    }
    return apiResponse.createModelRes(200, 'Success', contractRes);
};
