const network = require('../fabric/network');
const apiResponse = require('../utils/apiResponse');

exports.sendToExporter = async information => {
    const { productId , userId , id } = information;

    const networkObj = await network.connect(true, false, false, id);
    const contractRes = await network.invoke(networkObj, 'sendToWholesaler', productId , userId );

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
