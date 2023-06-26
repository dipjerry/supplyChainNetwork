const transactModel = require('../models/transact.js');
const apiResponse = require('../utils/apiResponse.js');

exports.listProduct = async (req, res) => {
    console.log('🚀 ~ file: transact.js:5 ~ exports.listProduct= ~ req:', req.body);
    // find who initiates this event by decoding the token and getting the user type

    const { loggedUserType , productId , id ,price } = req.body;
    if ( !id || !loggedUserType || !productId  || !price ) {
        return apiResponse.badRequest(res);
    }
    let modelRes;
    if(loggedUserType === 'manufacturer')
    {
        const { climate , soilType } = req.body;
        modelRes= await transactModel.listProduct(true , false , false , {loggedUserType, productId , id , climate , soilType , price });
    }
    else if(loggedUserType === 'exporter')
    {
        const { packagingType , quantityPerPackage} = req.body;
        modelRes = await transactModel.listProduct(false , true , false , {loggedUserType, productId , id , packagingType , quantityPerPackage , price });
    }
    else if(loggedUserType === 'importer')
    {
        modelRes = await transactModel.listProduct(false , true , false ,{loggedUserType, productId , id , price  });
    }
    else if(loggedUserType === 'retailer')
    {
        const { packagingType , quantityPerPackage} = req.body;
        modelRes = await transactModel.sendToLogistic({ productId , id , packagingType , quantityPerPackage  });
    }
    else {
        return apiResponse.badRequest(res);
    }
    console.log('3');
    return apiResponse.send(res, modelRes);
};
exports.transactProduct = async (req, res) => {
    // find who initiates this event by decoding the token and getting the user type
    const { id, loggedUserType , productId , userId } = req.body;
    console.log('1');
    if ( !userId || !loggedUserType || !productId || !id) {
        return apiResponse.badRequest(res);
    }
    console.log('2');
    let modelRes;
    if(loggedUserType === 'manufacturer')
    {
        // call send to Wholesaler
        modelRes= await transactModel.sendToExporter({ productId , userId , id });
    }
    else if(loggedUserType === 'exporter' || loggedUserType === 'importer')
    {
        // call send to Distributor
        modelRes = await transactModel.sendToLogistic({ productId , userId , id });
    }
    else {
        return apiResponse.badRequest(res);
    }
    console.log('3');
    return apiResponse.send(res, modelRes);
};

exports.transactProductOrder = async (req, res) => {
    // find who initiates this event by decoding the token and getting the user type
    const { id, loggedUserType, name , productId , userId } = req.body;
    console.log('1');
    if (!name || !userId || !loggedUserType || !productId || !id) {
        return apiResponse.badRequest(res);
    }
    console.log('2');
    let modelRes;
    if(loggedUserType === 'importer' || loggedUserType === 'retailer' || loggedUserType === 'consumer') {
        modelRes= await transactModel.orderProduct({ productId , id });
    } else {
        return apiResponse.badRequest(res);
    }

    console.log('3');
    return apiResponse.send(res, modelRes);
};

exports.transactProductConsumer = async (req, res) => {
    // find who initiates this event by decoding the token and getting the user type
    const { id, loggedUserType, name , productId , userId } = req.body;
    console.log('1');
    if (!name || !userId || !loggedUserType || !productId || !id) {
        return apiResponse.badRequest(res);
    }
    console.log('2');
    let modelRes;
    if(loggedUserType === 'retailer') {
        modelRes= await transactModel.sellToConsumer({ productId , id });
    } else {
        return apiResponse.badRequest(res);
    }

    console.log('3');
    return apiResponse.send(res, modelRes);
};


exports.transactProductDeliver = async (req, res) => {
    const { id, loggedUserType,  productId , shipmentDelivery } = req.body;
    console.log("🚀 ~ file: transact.js:164 ~ exports.transactProductDelivered= ~ req.body:", req.body)
    console.log('1');
    if (!id || !loggedUserType || !productId ||  !shipmentDelivery) {
        return apiResponse.badRequest(res);
    }
    let modelRes;
    if(loggedUserType === 'logistic') {
        modelRes= await transactModel.deliverToImporter({ productId , id });
    } else {
        return apiResponse.badRequest(res);
    }

    console.log('3');
    return apiResponse.send(res, modelRes);
};

exports.transactProductPickup = async (req, res) => {
    // find who initiates this event by decoding the token and getting the user type
    const { id, loggedUserType,  productId , shipmentPickup } = req.body;
    console.log('1');
    if (!id || !loggedUserType || !productId || !productId || !shipmentPickup) {
        return apiResponse.badRequest(res);
    }
    console.log('2');
    let modelRes;
    if(loggedUserType === 'logistic') {
        modelRes= await transactModel.pickupbyLogistic({ productId , id });
    } else {
        return apiResponse.badRequest(res);
    }

    console.log('3');
    return apiResponse.send(res, modelRes);
};

exports.transactProductDeliverToConsumer = async (req, res) => {
    // find who initiates this event by decoding the token and getting the user type
    const { id, loggedUserType, name , productId , userId } = req.body;
    console.log('1');
    if (!name || !userId || !loggedUserType || !productId || !id) {
        return apiResponse.badRequest(res);
    }
    console.log('2');
    let modelRes;
    if(loggedUserType === 'logistic') {
        modelRes= await transactModel.deliverToConsumer({ productId , id });
    } else {
        return apiResponse.badRequest(res);
    }

    console.log('3');
    return apiResponse.send(res, modelRes);
};

exports.transactProductDelivered = async (req, res) => {
    // find who initiates this event by decoding the token and getting the user type
    const { id, loggedUserType,  productId , shipmentDelivery } = req.body;
    console.log("🚀 ~ file: transact.js:164 ~ exports.transactProductDelivered= ~ req.body:", req.body)
    console.log('1');
    if (!id || !loggedUserType || !productId ||  !shipmentDelivery) {
        return apiResponse.badRequest(res);
    }
    let modelRes;
    if(loggedUserType === 'retailer') {
        modelRes= await transactModel.deliverToImporter({ productId , id });
    } else {
        return apiResponse.badRequest(res);
    }

    console.log('3');
    return apiResponse.send(res, modelRes);
};

exports.buyProduct = async (req, res) => {
    const { id, items , userType} = req.body;
    console.log(req.body);
    console.log('1');

    if (!id || !items  || !userType) {
        return apiResponse.badRequest(res);
    }
    console.log('2');
    console.log(req.body);
    let modelRes;
    let role;
    if(userType === 'manufacturer'){
        role = 'manufacturer';
    }
    else if(userType === 'importer' || userType === 'exporter' ||
      userType === 'logistic' || userType === 'retailer'){
        role = 'middlemen';
    }
    else if(userType === 'customer'){
        role = 'consumer';
    }
    else{
        role = 'admin';
    }
    if( role === 'manufacturer' ) {
        modelRes = await transactModel.buyProduct({ items, id});
    }
    else if( userType === 'exporter' ) {
        modelRes = await transactModel.sendToExporter({  productId:items[0].id, userId:id });
    }
    else if( userType === 'importer' ) {
        console.log('here');
        modelRes = await transactModel.sendToImporter({  productId:items[0].id, userId:id });
    }
    else if( userType === 'retailer' ) {
        modelRes = await transactModel.buyProduct(false, true, false, {  items, id });
    }
    else if( role === 'consumer' ) {
        modelRes = await transactModel.buyProduct(false, false, true, {  items, id });
    }else {
        return apiResponse.badRequest(res);
    }
    console.log('3');


    return apiResponse.send(res, modelRes);
};

exports.selectLogistic = async (req, res) => {
    const { id,  userType , productId , logistic ,  preferredDeliveryDate , deliveryType} = req.body;
    console.log(req.body);
    console.log('1');
    if (!id || !userType || !productId || !logistic ||  !preferredDeliveryDate || !deliveryType) {
        console.log('here');
        console.log('here');
        return apiResponse.badRequest(res);
    }
    console.log('2');
    console.log(req.body);
    let modelRes;

    if( userType === 'exporter' ) {
        modelRes = await transactModel.sendToLogistic(false , true , false , {id,  userType , productId , logistic ,  preferredDeliveryDate , deliveryType});
    }
    else if( userType === 'importer' ) {
        console.log('here');
        modelRes = await transactModel.sendToLogistic(false , true , false , {id,  userType , productId , logistic ,  preferredDeliveryDate , deliveryType});
    }
    else if( userType === 'retailer' ) {
        modelRes = await transactModel.buyProduct(false, true, false, {id,  userType , productId , logistic ,  preferredDeliveryDate , deliveryType});
    }
    else {
        return apiResponse.badRequest(res);
    }
    console.log('3');


    return apiResponse.send(res, modelRes);
};


exports.listInvoice = async (req, res) => {
    console.log('req.params');
    console.log(req.query);
    const {role , id} = req.query;
    if (!id || !role ) {
        return apiResponse.badRequest(res);
    }
    // console.log("Here is the role" + role);
    let modelRes;
    if( role === 'manufacturer' ) {
        modelRes = await transactModel.getInvoice(true, false, false, { id});
    } else if( role === 'middlemen' || role === 'exporter' || role === 'importer' || role === 'logistic' || role === 'retailer' ) {
        modelRes = await transactModel.getInvoice(false, true, false,{ id});
    } else if( role === 'consumer' ) {
        modelRes = await transactModel.getInvoice(false, false, true, { id});
    } else if( role === 'admin' ) {
        modelRes = await transactModel.getInvoiceAdmin({ id });
    }
    else {
        return apiResponse.badRequest(res);
    }
    return apiResponse.send(res, modelRes);
};
