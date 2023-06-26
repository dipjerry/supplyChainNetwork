const authRouter = require('express').Router();
const controller = require('../controllers/user.js');
const multer = require('multer');
const upload = multer();

const authMiddleware = require('../middlewares/auth.js');
const roleMiddleware = require('../middlewares/checkRole.js');

// authRouter.use('/signup/:role', authMiddleware);
// authRouter.use('/signup/:role', roleMiddleware);


authRouter.post('/signup',upload.any(), controller.signup);
authRouter.get('/all', controller.getAllUser);
authRouter.post('/signin/:role', controller.signin);
authRouter.get('/inventory', controller.inventory);
authRouter.get('/userbytype', controller.userByType);
// authRouter.get('/user/:role/userId/:userId', controller.getUser);
authRouter.get('/userbyid', controller.userById);
authRouter.post('/kyc/verify_and_add_aadhar', controller.verify_and_add_aadhar);
authRouter.get('/kyc/verify_and_add_pan', controller.verify_and_add_pan);
// authRouter.post('/kyc/verify_and_add_bank', controller.verify_and_add_bank);

module.exports = authRouter;
