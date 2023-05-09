const network = require('../fabric/network');
const apiResponse = require('../utils/apiResponse');
const authenticateUtil = require('../utils/authenticate');


exports.signup = async (isManufacturer, isMiddlemen, isConsumer, information) => {
    const {userType, address, name, email, password , id } = information;

    const networkObj = await network.connect(isManufacturer, isMiddlemen, isConsumer);
    const contractRes = await network.invoke(networkObj, 'createUser', name, email, userType, address, password);
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
    const { Name, User_Type } = contractRes.success;
    const accessToken = authenticateUtil.generateAccessToken({ id, User_Type, Name });
    return apiResponse.createModelRes(200, 'Success', { id, User_Type, Name, accessToken });
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
