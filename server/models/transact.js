const network = require('../fabric/network');
const apiResponse = require('../utils/apiResponse');

exports.sendToExporter = async information => {
    console.log('information')
    console.log(information)
    const { productId , userId } = information;

    const networkObj = await network.connect(true, false, false, userId);
    const contractRes = await network.invoke(networkObj, 'sendToExporter', productId , userId );

    const error = networkObj.error || contractRes.error;
    if (error) {
        const status = networkObj.status || contractRes.status;
        return apiResponse.createModelRes(status, error);
    }
    return apiResponse.createModelRes(200, 'Success', contractRes);
};

exports.sendToLogistic = async information => {
    const { productId , userId , id } = information;

    const networkObj = await network.connect(false, true, false, id);
    const contractRes = await network.invoke(networkObj, 'sendToDistributer', productId , userId );

    const error = networkObj.error || contractRes.error;
    if (error) {
        const status = networkObj.status || contractRes.status;
        return apiResponse.createModelRes(status, error);
    }
    return apiResponse.createModelRes(200, 'Success', contractRes);
};

exports.deliverToRetailer = async information => {
    const { productId , userId , id } = information;

    const networkObj = await network.connect(false, true, false, id);
    const contractRes = await network.invoke(networkObj, 'sendToRetailer', productId , userId );

    const error = networkObj.error || contractRes.error;
    if (error) {
        const status = networkObj.status || contractRes.status;
        return apiResponse.createModelRes(status, error);
    }
    return apiResponse.createModelRes(200, 'Success', contractRes);
};

exports.deliverToImporter = async information => {
    const { productId , userId , id } = information;

    const networkObj = await network.connect(false, true, false, id);
    const contractRes = await network.invoke(networkObj, 'sendToRetailer', productId , userId );

    const error = networkObj.error || contractRes.error;
    if (error) {
        const status = networkObj.status || contractRes.status;
        return apiResponse.createModelRes(status, error);
    }
    return apiResponse.createModelRes(200, 'Success', contractRes);
};

exports.deliverToConsumer = async information => {
    const { productId , userId , id } = information;

    const networkObj = await network.connect(false, true, false, id);
    const contractRes = await network.invoke(networkObj, 'sendToRetailer', productId , userId );

    const error = networkObj.error || contractRes.error;
    if (error) {
        const status = networkObj.status || contractRes.status;
        return apiResponse.createModelRes(status, error);
    }
    return apiResponse.createModelRes(200, 'Success', contractRes);
};

exports.sellToConsumer = async information => {
    const { productId , id } = information;

    const networkObj = await network.connect(false, true, false, id);
    const contractRes = await network.invoke(networkObj, 'sellToConsumer', productId );

    const error = networkObj.error || contractRes.error;
    if (error) {
        const status = networkObj.status || contractRes.status;
        return apiResponse.createModelRes(status, error);
    }
    return apiResponse.createModelRes(200, 'Success', contractRes);
};


exports.buyProduct = async information => {
    const { items , id } = information;
    console.log(information);
    console.log(items);
    const networkObj = await network.connect(true, false, false, id);
    const contractRes = await network.invoke(networkObj, 'buyRawProduct', id, JSON.stringify(items) , 'add');

    const error = networkObj.error || contractRes.error;
    if (error) {
        const status = networkObj.status || contractRes.status;
        return apiResponse.createModelRes(status, error);
    }
    return apiResponse.createModelRes(200, 'Success', contractRes);
};
exports.listProduct = async information => {
    const { productId , id , climate , soilType , price } = information;
    console.log(information);
    const networkObj = await network.connect(true, false, false, id);
    const contractRes = await network.invoke(networkObj, 'updateProductFarmer', productId, id , price , climate , soilType);

    const error = networkObj.error || contractRes.error;
    if (error) {
        const status = networkObj.status || contractRes.status;
        return apiResponse.createModelRes(status, error);
    }
    console.log("list product");
    console.log(contractRes);
    return apiResponse.createModelRes(200, 'Success', contractRes);
};

exports.getInvoice = async ( isManufacturer, isMiddlemen, isConsumer ,information )=> {
    const { id } = information;
    const networkObj = await network.connect(isManufacturer, isMiddlemen, isConsumer, id);
    const contractRes = await network.invoke(networkObj, 'queryInvoice',id);
    const error = networkObj.error || contractRes.error;
    if (error) {
        const status = networkObj.status || contractRes.status;
        return apiResponse.createModelRes(status, error);
    }
    return apiResponse.createModelRes(200, 'Success', contractRes);
};
exports.getInvoiceAdmin = async ( information )=> {
    const { id } = information;
    const networkObj = await network.connect(true, false, false, id);
    const contractRes = await network.invoke(networkObj, 'queryAll','Invoice');
    const error = networkObj.error || contractRes.error;
    if (error) {
        const status = networkObj.status || contractRes.status;
        return apiResponse.createModelRes(status, error);
    }
    return apiResponse.createModelRes(200, 'Success', contractRes);
};
