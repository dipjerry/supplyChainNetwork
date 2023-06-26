const authModel = require('../models/user.js');
const apiResponse = require('../utils/apiResponse.js');
const ipfs = require('../script/addToIpfs.js');

exports.signup = async (req, res) => {
    const { id, userType, address, name, email, password} = req.body;
    // const { role } = req.params;
    const { file } = req.files;
    let role;

    if ((!id || !userType || !address || !name  || !email || !password)) {
        console.log('1');
        return apiResponse.badRequest(res);
    }
    const profilePic = await ipfs.addToIpfs(req.files[0].buffer);
    console.log('profilePic');
    console.log(profilePic);

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

    let modelRes;
    console.log(role);
    console.log("role");
    console.log(role);
    if (role === 'manufacturer') {
        modelRes = await authModel.signup(true, false, false, {  id, userType, address, email, name, profilePic, password });
    } else if (role === 'middlemen') {
        modelRes = await authModel.signup(false, true, false, {  id, userType, address, name, email, profilePic,password });
    } else if (role === 'consumer') {
        modelRes = await authModel.signup(false, false, true, {  id, userType, address, name, email, profilePic,password  });
    } else {
        return apiResponse.badRequest(res);
    }

    return apiResponse.send(res, modelRes);
};


exports.inventory = async (req, res) => {
    // const { id, userType} = req.body;
    const { id, userType } = req.query;
    let role;

    if ((!id || !userType)) {
        console.log('1');
        return apiResponse.badRequest(res);
    }


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

    let modelRes;
    console.log(role);
    if (role === 'manufacturer') {
        modelRes = await authModel.inventory(true, false, false, {  id});
    } else if (role === 'middlemen') {
        modelRes = await authModel.inventory(false, true, false, {  id});
    } else if (role === 'consumer') {
        modelRes = await authModel.inventory(false, false, true, {  id});
    } else {
        return apiResponse.badRequest(res);
    }

    return apiResponse.send(res, modelRes);
};

exports.userByType = async (req, res) => {
    console.log(req.query);
    // const { id, userType} = req.body;
    const { id, userType , type } = req.query;
    let role;

    if ((!id || !userType)) {
        console.log('1');
        return apiResponse.badRequest(res);
    }


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

    let modelRes;
    console.log(role);
    if (role === 'manufacturer' || role === 'admin') {
        modelRes = await authModel.userByType(true, false, false, {  id , type });
    } else if (role === 'middlemen') {
        modelRes = await authModel.userByType(false, true, false, {  id , type });
    } else if (role === 'consumer') {
        modelRes = await authModel.userByType(false, false, true, {  id , type });
    } else {
        return apiResponse.badRequest(res);
    }

    return apiResponse.send(res, modelRes);
};

exports.userById = async (req, res) => {
    console.log('req.query');
    console.log(req.query);
    // const { id, userType} = req.body;
    const { id, userType} = req.query;
    let role;

    if ((!id || !userType)) {
        console.log('1');
        return apiResponse.badRequest(res);
    }


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

    let modelRes;
    console.log(role);
    if (role === 'manufacturer' || role === 'admin') {
        modelRes = await authModel.userById(true, false, false, {  id });
    } else if (role === 'middlemen') {
        modelRes = await authModel.userById(false, true, false, {  id });
    } else if (role === 'consumer') {
        modelRes = await authModel.userById(false, false, true, {  id });
    } else {
        return apiResponse.badRequest(res);
    }

    return apiResponse.send(res, modelRes);
};

exports.signin = async (req, res) => {
    const { id, password } = req.body;
    const { role } = req.params;

    // console.log(req.body);
    console.log("🚀 ~ file: user.js:179 ~ exports.signin= ~ req.body:", req.body)
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

exports.verify_and_add_aadhar = async (req, res) => {
    const { id, userType, aadhar} = req.body;
    // const { role } = req.params;
    let modelRes;
    if (userType === 'manufacturer') {
        modelRes = await authModel.verify_and_add_aadhar(true, false, false, {  id, userType, aadhar });
    } else if (userType === 'importer' || userType === 'exporter' ||
    userType === 'logistic' || userType === 'retailer') {
        modelRes = await authModel.verify_and_add_aadhar(false, true, false, {  id, userType, aadhar });
    } else if (userType === 'consumer') {
        modelRes = await authModel.verify_and_add_aadhar(false, false, true, {  id, userType, aadhar });
    } else {
        return apiResponse.badRequest(res);
    }

    return apiResponse.send(res, modelRes);
};
exports.verify_and_add_pan = async (req, res) => {
    const { id, userType, panNo , name} = req.body;
    if ((!id || !userType || !panNo || !name)) {
        console.log('1');
        return apiResponse.badRequest(res);
    }


    let modelRes;
    if (userType === 'manufacturer') {
        modelRes = await authModel.verify_and_add_pan(true, false, false, {  id, userType, panNo , name });
    } else if (userType === 'importer' || userType === 'exporter' ||
    userType === 'logistic' || userType === 'retailer') {
        modelRes = await authModel.verify_and_add_pan(false, true, false, {  id, userType, panNo , name });
    } else if (userType === 'consumer') {
        modelRes = await authModel.verify_and_add_pan(false, false, true, {  id, userType, panNo , name });
    } else {
        return apiResponse.badRequest(res);
    }

    return apiResponse.send(res, modelRes);
};

exports.profile = async (req, res) => {



    const {Name, address, city, country, email,id,pincode ,state, userType , mobile} = req.body;
    console.log("🚀 ~ file: user.js:264 ~ exports.profile= ~ req.body:", req.body)
    if ((!Name|| !address || !city || !country || !email|| !id|| !pincode  || !mobile || !userType)) {
        console.log('here');
        console.log('1');
        return apiResponse.badRequest(res);
    }


    let modelRes;
    if (userType === 'manufacturer') {
        modelRes = await authModel.add_profile(true, false, false, { Name, address, city, country, email,id,pincode ,state, mobile,userType });
    } else if (userType === 'importer' || userType === 'exporter' ||
    userType === 'logistic' || userType === 'retailer') {
        modelRes = await authModel.add_profile(false, true, false, { Name, address, city, country, email,id,pincode ,state,mobile, userType });
    } else if (userType === 'consumer') {
        modelRes = await authModel.add_profile(false, false, true, { Name, address, city, country, email,id,pincode ,state, mobile, userType });
    } else {
        return apiResponse.badRequest(res);
    }

    return apiResponse.send(res, modelRes);
};
