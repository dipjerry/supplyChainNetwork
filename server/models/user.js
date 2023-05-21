const network = require('../fabric/network');
const apiResponse = require('../utils/apiResponse');
const authenticateUtil = require('../utils/authenticate');


exports.signup = async (isManufacturer, isMiddlemen, isConsumer, information) => {
    const {userType, address, name, email, password , id , profilePic } = information;
    const networkObj = await network.connect(isManufacturer, isMiddlemen, isConsumer);
    console.log("profilePic");
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
    console.log("contractRes.success");
    console.log(contractRes);
    const { inventory } = contractRes;
    return apiResponse.createModelRes(200, 'Success', { id, inventory });
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
