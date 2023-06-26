const network = require('../fabric/network');
const apiResponse = require('../utils/apiResponse');
const helper = require('../helpers/helper_functions');



// helper.sendMail('kaxyapdip@gmail.com', "emailSubject", "Welcome to supply chain")
//     .then(response => {
//         console.log('Email sent successfully:', response);
//     })
//     .catch(error => {
//         console.log('Error sending email:', error);
//     });


exports.sendToExporter = async information => {
    console.log('information');
    console.log(information);
    const { productId , userId } = information;

    const networkObj = await network.connect(false, true, false, userId);
    const contractRes = await network.invoke(networkObj, 'sendToExporter', productId , userId );

    const error = networkObj.error || contractRes.error;
    if (error) {
        const status = networkObj.status || contractRes.status;
        return apiResponse.createModelRes(status, error);
    }
    return apiResponse.createModelRes(200, 'Success', contractRes);
};
exports.sendToImporter = async information => {
    console.log('information');
    console.log(information);
    const { productId , userId } = information;

    const networkObj = await network.connect(false, true, false, userId);
    const contractRes = await network.invoke(networkObj, 'sendToImporter', productId , userId );

    const error = networkObj.error || contractRes.error;
    if (error) {
        const status = networkObj.status || contractRes.status;
        return apiResponse.createModelRes(status, error);
    }
    return apiResponse.createModelRes(200, 'Success', contractRes);
};

exports.sendToLogistic = async ( isManufacturer, isMiddlemen, isConsumer ,information ) => {
    const { id,   productId , logistic ,  preferredDeliveryDate , deliveryType} = information;
    console.log('🚀 ~ file: transact.js:37 ~ logistic:', logistic);

    const networkObj = await network.connect(isManufacturer, isMiddlemen, isConsumer, id);
    const contractRes = await network.invoke(networkObj, 'sendToLogistic' , productId , logistic, id , 200 ,  preferredDeliveryDate , deliveryType );

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

exports.pickupbyLogistic = async information => {
    const { productId , id } = information;

    const networkObj = await network.connect(false, true, false, id);
    const contractRes = await network.invoke(networkObj, 'pickupLogistic', productId , id );
    const error = networkObj.error || contractRes.error;
    if (error) {
        const status = networkObj.status || contractRes.status;
        return apiResponse.createModelRes(status, error);
    }
    return apiResponse.createModelRes(200, 'Success', contractRes);
};

exports.deliverToImporter = async information => {
    const { productId ,  id } = information;

    const networkObj = await network.connect(false, true, false, id);
    const contractRes = await network.invoke(networkObj, 'deliveryLogistic', productId , id );

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
exports.listProduct = async ( isManufacturer, isMiddlemen, isConsumer ,information ) => {
    const { productId , loggedUserType , id} = information;
    console.log(information);
    const networkObj = await network.connect(isManufacturer, isMiddlemen, isConsumer, id);
    let contractRes;
    if(loggedUserType === 'manufacturer')
    {
        const {climate , soilType , price } = information;
        contractRes = await network.invoke(networkObj, 'updateProductFarmer', productId, id , price , climate , soilType);
    }
    else if(loggedUserType === 'exporter')
    {
        const {packagingType , quantityPerPackage , price } = information;
        contractRes = await network.invoke(networkObj, 'updateProductExporter', productId, id , price , packagingType , quantityPerPackage);
    }
    else if(loggedUserType === 'importer')
    {
        const { price } = information;
        contractRes = await network.invoke(networkObj, 'updateProductImporter', productId, id , price);
    }
    const error = networkObj.error || contractRes.error;
    if (error) {
        const status = networkObj.status || contractRes.status;
        return apiResponse.createModelRes(status, error);
    }
    console.log('list product');
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
