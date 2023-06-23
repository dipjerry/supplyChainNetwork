const transactRouter = require('express').Router();
const controller = require('../controllers/transact.js');
const authMiddleware = require('../middlewares/auth.js');

// transactRouter.use('/', authMiddleware);

transactRouter.post('/', controller.transactProduct);

// transactRouter.use('/consumer', authMiddleware);

transactRouter.post('/consumer', controller.transactProductConsumer);
transactRouter.post('/buyProduct', controller.buyProduct);
transactRouter.post('/selectLogistic', controller.selectLogistic);
transactRouter.post('/listItem', controller.listProduct);
transactRouter.post('/productPickup', controller.transactProductPickup);
transactRouter.post('/productDelivery', controller.transactProductDeliver);
// transactRouter.post('/inspectProduct', controller.inspectProduct);
module.exports = transactRouter;
