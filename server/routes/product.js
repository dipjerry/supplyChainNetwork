const productRouter = require('express').Router();
const controller = require('../controllers/product.js');
const authMiddleware = require('../middlewares/auth.js');
const roleMiddleware = require('../middlewares/checkRole.js');

// const fs = require('fs');
// const mkdirp = require('mkdirp');


// productRouter.use('/', authMiddleware);
productRouter.use('/order', authMiddleware);
productRouter.use('/delivered', authMiddleware);

// productRouter.post('/tes', controller.testing);

productRouter.post('/testing',controller.storeProduct);
productRouter.post('/', controller.createProduct);
productRouter.put('/:productId/:role', controller.updateProduct);
productRouter.get('/:productId/:role', controller.getProductbyId);
productRouter.get('/products', controller.getAllProducts);
productRouter.get('/raw_products', controller.getAllRawProducts);
productRouter.get('/productsbyRole', controller.getProductsByRole);
productRouter.get('/shopProduct', controller.getshopProduct);



// productRouter.get('/getinvoice/:invoiceid', controller.getAllProducts);
// productRouter.post('/order', controller.createOrder);
// productRouter.post('/delivered', controller.isDelivered);

module.exports = productRouter;
