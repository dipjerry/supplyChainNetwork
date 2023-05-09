const authModel = require('../models/user.js');
const apiResponse = require('../utils/apiResponse.js');

exports.signup = async (req, res) => {
    const { id, userType, address, name, email, password} = req.body;
    // const { role } = req.params;
    // const { file } = req.files;
    let role;
    console.log(req.body);
    console.log(req.files);
    // console.log(role);
    // console.log(file);

    if ((!id || !userType || !address || !name  || !email || !password)) {
        console.log('1');
        return apiResponse.badRequest(res);
    }

    if(userType === 'Farmer'){
        role = 'manufacturer';
    }
    else if(userType === 'Importer' || userType === 'Exporter' ||
      userType === 'Logistic' || userType === 'Retailer'){
        role = 'middleman';
    }
    else if(userType === 'customer'){
        role = 'cunsumer';
    }
    else{
        role = 'admin';
    }

    let modelRes;

    if (role === 'manufacturer') {
        modelRes = await authModel.signup(true, false, false, {  id, userType, address, email, name,  password });
    } else if (role === 'middlemen') {
        modelRes = await authModel.signup(false, true, false, {  id, userType, address, name, email, password });
    } else if (role === 'consumer') {
        modelRes = await authModel.signup(false, false, true, {  id, userType, address, name, email, password  });
    } else {
        return apiResponse.badRequest(res);
    }

    return apiResponse.send(res, modelRes);
};

exports.signin = async (req, res) => {
    const { id, password } = req.body;
    const { role } = req.params;

    console.log(req.body);
    console.log(req.params);
    if (!id || !password || !role) {
        return apiResponse.badRequest(res);
    }

    let modelRes;
    if (role === 'manufacturer' || role === 'admin') {
        modelRes = await authModel.signin(true, false, false, { id, password });
    } else if (role === 'middlemen') {
        modelRes = await authModel.signin(false, true, false, { id, password });
    } else if (role === 'consumer') {
        modelRes = await authModel.signin(false, false, true, { id, password });
    } else {
        return apiResponse.badRequest(res);
    }

    return apiResponse.send(res, modelRes);
};

exports.getAllUser = async (req, res) => {
    // const { id } = req.body;
    const { id , role } = req.query;

    let modelRes;
    if (role === 'manufacturer') {
        modelRes = await authModel.getAllUser(true, false, false, {id});
    } else if (role === 'middlemen') {
        modelRes = await authModel.getAllUser(false, true, false, {id});
    } else if (role === 'consumer') {
        modelRes = await authModel.getAllUser(false, false, true, {id});
    } else if (role === 'admin') {
        modelRes = await authModel.getAllUser(true, false, false, {id});
    }
    else {
        return apiResponse.badRequest(res);
    }
    return apiResponse.send(res, modelRes);
};
