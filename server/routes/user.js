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
// authRouter.get('/user/:role/userId/:userId', controller.getUser);

module.exports = authRouter;
