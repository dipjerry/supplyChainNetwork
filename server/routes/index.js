const router = require('express').Router();

const userRouter = require('./user.js');
const productRouter = require('./product.js');
const transactRouter = require('./transact.js');


router.use('/user', userRouter);
router.use('/product', productRouter);
router.use('/transact', transactRouter);

router.get('/', function(req, res) {
    const data = {
      title: 'Suppy chain',
      message: 'Welcome to the Supplychain API',
      postmanDocumentation: 'Hello, world!',
    };
    res.render('sample', data);
  });

module.exports = router;
