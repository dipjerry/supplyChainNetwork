const network = require('../fabric/network');
const apiResponse = require('../utils/apiResponse');
const authenticateUtil = require('../utils/authenticate');
const ekyc = require('./service/ekyc');


exports.signup = async (isManufacturer, isMiddlemen, isConsumer, information) => {
    const {userType, address, name, email, password , id , profilePic } = information;
    const networkObj = await network.connect(isManufacturer, isMiddlemen, isConsumer);
    console.log('profilePic');
    console.log(profilePic);
    const contractRes = await network.invoke(networkObj, 'createUser', name, email, userType, address, password , profilePic);
    console.log('contractRes');
    console.log(contractRes.User_ID);
    console.log('5');
    const walletRes = await network.registerUser(isManufacturer, isMiddlemen, isConsumer, contractRes.User_ID , id);
    const error = walletRes.error || networkObj.error || contractRes.error;
    if (error) {
        const status = walletRes.status || networkObj.status || contractRes.status;
        return apiResponse.createModelRes(status, error);
    }
    return apiResponse.createModelRes(200 , 'Success', contractRes);
};

exports.signin = async (isManufacturer, isMiddlemen, isConsumer, information) => {
    const { id, password } = information;
    const networkObj = await network.connect(isManufacturer, isMiddlemen, isConsumer, id);
    // let contractRes;
    const contractRes = await network.invoke(networkObj, 'signIn', id, password);
    const error = networkObj.error || contractRes.error;
    if (error) {
        const status = networkObj.status || contractRes.status;
        return apiResponse.createModelRes(status, error);
    }
    console.log(contractRes.success);
    const { Name, User_Type , profilePic } = contractRes.success;
    const accessToken = authenticateUtil.generateAccessToken({ id, User_Type, Name });
    return apiResponse.createModelRes(200, 'Success', { id, User_Type, Name,profilePic, accessToken });
};

exports.verify_and_add_aadhar = async (isManufacturer, isMiddlemen, isConsumer, information) => {
    const { id, aadhar } = information;
    const networkObj = await network.connect(isManufacturer, isMiddlemen, isConsumer, id);
    // let contractRes;
    const data = {
        number:aadhar,
        type:'Aadhaar',
    };
    const kycreq = await ekyc.aadharVerify(data);
    // const contractRes = await network.invoke(networkObj, 'signIn', id);
    const userRes = await network.invoke(networkObj, 'userById', id);
    console.log('🚀 ~ file: user.js:51 ~ exports.verify_and_add_aadhar= ~ contractRes:', userRes.success.Name);
    console.log("🚀 ~ file: user.js:54 ~ exports.verify_and_add_aadhar= ~ kycreq:", kycreq)
    if (kycreq.statusCode === 2011) {
        console.log('Success');
    } else if ([503, 2005, 2013].includes(kycreq.statusCode)) {
        const message = {
            102: kycreq.data.message,
            103: kycreq.data.message,
            104: kycreq.data.message,
        }[kycreq.statusCode];
        apiResponse.createModelRes(kycreq.statusCode
            , 'failed' ,{ message});
    } else {
        return apiResponse.createModelRes(400, 'Fail', {  message: 'Internal server error' });
    }




    console.log('🚀 ~ file: user.js:47 ~ exports.verify_and_add_aadhar= ~ kycreq:', kycreq);
    // const error = networkObj.error || contractRes.error;
    // if (error) {
    //     const status = networkObj.status || contractRes.status;
    //     return apiResponse.createModelRes(status, error);
    // }
    // console.log(contractRes.success);
    // const { Name, User_Type , profilePic } = contractRes.success;
    // const accessToken = authenticateUtil.generateAccessToken({ id, User_Type, Name });
    return apiResponse.createModelRes(200, 'Success', { id, kycreq });
};

exports.verify_and_add_pan = async (isManufacturer, isMiddlemen, isConsumer, information) => {
    const { id, panNo , name } = information;
    const networkObj = await network.connect(isManufacturer, isMiddlemen, isConsumer, id);
    // let contractRes;
    const userRes = await network.invoke(networkObj, 'userById', id);
    console.log("🚀 ~ file: user.js:88 ~ exports.verify_and_add_pan= ~ userRes:", userRes)

    const data = {
        number:panNo,
        name:name,
    };
    const kycreq = await ekyc.panVerification(data);

    console.log('🚀 ~ file: user.js:47 ~ exports.verify_and_add_aadhar= ~ kycreq:', kycreq);
    // const contractRes = await network.invoke(networkObj, 'signIn', id, password);
    // const error = networkObj.error || contractRes.error;
    // if (error) {
    //     const status = networkObj.status || contractRes.status;
    //     return apiResponse.createModelRes(status, error);
    // }
    // console.log(contractRes.success);
    // const { Name, User_Type , profilePic } = contractRes.success;
    // const accessToken = authenticateUtil.generateAccessToken({ id, User_Type, Name });
    return apiResponse.createModelRes(200, 'Success', { id, kycreq });
};
exports.add_profile = async (isManufacturer, isMiddlemen, isConsumer, information) => {
    const { Name, address, city, country, email,id,pincode ,state, mobile, userType } = information;
    const networkObj = await network.connect(isManufacturer, isMiddlemen, isConsumer, id);
    // let contractRes;
    const userRes = await network.invoke(networkObj, 'userById', id);


    const contractRes = await network.invoke(networkObj, 'updateProfile', id, Name, address, city, country, email ,pincode ,state, mobile,userType);
    // const error = networkObj.error || contractRes.error;
    // if (error) {
    //     const status = networkObj.status || contractRes.status;
    //     return apiResponse.createModelRes(status, error);
    // }
    // console.log(contractRes.success);
    // const { Name, User_Type , profilePic } = contractRes.success;
    // const accessToken = authenticateUtil.generateAccessToken({ id, User_Type, Name });
    return apiResponse.createModelRes(200, 'Success', { id  });
};

exports.inventory = async (isManufacturer, isMiddlemen, isConsumer, information) => {
    const { id} = information;
    const networkObj = await network.connect(isManufacturer, isMiddlemen, isConsumer, id);
    // let contractRes;
    const contractRes = await network.invoke(networkObj, 'queryUser', id);
    const error = networkObj.error || contractRes.error;
    if (error) {
        const status = networkObj.status || contractRes.status;
        return apiResponse.createModelRes(status, error);
    }
    console.log('contractRes.success');
    console.log(contractRes);
    const { inventory } = contractRes;
    return apiResponse.createModelRes(200, 'Success', { id, inventory });
};

exports.userByType = async (isManufacturer, isMiddlemen, isConsumer, information) => {
    const { type , id } = information;
    const networkObj = await network.connect(isManufacturer, isMiddlemen, isConsumer, id);
    // let contractRes;
    const contractRes = await network.invoke(networkObj, 'queryUserByType', type);
    const error = networkObj.error || contractRes.error;
    if (error) {
        const status = networkObj.status || contractRes.status;
        return apiResponse.createModelRes(status, error);
    }
    console.log('contractRes.success');
    console.log(contractRes);
    console.log(contractRes.success);
    // const {name,
    //     newUserID,email,address } = contractRes;
    return apiResponse.createModelRes(200, 'Success', contractRes.success);
};

exports.userById = async (isManufacturer, isMiddlemen, isConsumer, information) => {
    const { id } = information;
    const networkObj = await network.connect(isManufacturer, isMiddlemen, isConsumer, id);
    // let contractRes;
    const contractRes = await network.invoke(networkObj, 'userById', id);
    const error = networkObj.error || contractRes.error;
    if (error) {
        const status = networkObj.status || contractRes.status;
        return apiResponse.createModelRes(status, error);
    }
    // const {name,
    //     newUserID,email,address } = contractRes;
    return apiResponse.createModelRes(200, 'Success', contractRes.success);
};

exports.getAllUser = async (isManufacturer, isMiddlemen, isConsumer) => {

    const networkObj = await network.connect(true, false, false, 'admin');
    const contractRes = await network.invoke(networkObj, 'queryAll', 'User');
    const error = networkObj.error || contractRes.error;
    if (error) {
        const status = networkObj.status || contractRes.status;
        return apiResponse.createModelRes(status, error);
    }
    return apiResponse.createModelRes(200, 'Success', contractRes);
};
