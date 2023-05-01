'use strict';
const { Contract } = require('fabric-contract-api');
class SupplyChain extends Contract {
    async initLedger(ctx) {
    // Initializing Product Counter
        const ProductCounterBytes = await ctx.stub.getState('ProductCounterNO');
        if (ProductCounterBytes.length === 0) {
            const ProductCounter = { Counter: 0 };
            const ProductCounterBytes = Buffer.from(JSON.stringify(ProductCounter));
            await ctx.stub.putState('ProductCounterNO', ProductCounterBytes);
        }
        // Initializing Order Counter
        const OrderCounterBytes = await ctx.stub.getState('OrderCounterNO');
        if (OrderCounterBytes.length === 0) {
            const OrderCounter = { Counter: 0 };
            const OrderCounterBytes = Buffer.from(JSON.stringify(OrderCounter));
            await ctx.stub.putState('OrderCounterNO', OrderCounterBytes);
        }
        // Initializing User Counter
        const UserCounterBytes = await ctx.stub.getState('UserCounterNO');
        if (UserCounterBytes.length === 0) {
            const UserCounter = { Counter: 0 };
            const UserCounterBytes = Buffer.from(JSON.stringify(UserCounter));
            await ctx.stub.putState('UserCounterNO', UserCounterBytes);
        }
        const InvoiceCounterBytes = await ctx.stub.getState('InvoiceCounterNO');
        if (InvoiceCounterBytes.length === 0) {
            const InvoiceCounter = { Counter: 0 };
            const InvoiceCounterBytes = Buffer.from(JSON.stringify(InvoiceCounter));
            await ctx.stub.putState('InvoiceCounterNO', InvoiceCounterBytes);
        }
    }
    // globally needed function
    async  incrementCounter(ctx, AssetType) {
        let counterAsBytes = await ctx.stub.getState(AssetType);
        let counterAsset = JSON.parse(counterAsBytes.toString());
        counterAsset.Counter++;
        counterAsBytes = Buffer.from(JSON.stringify(counterAsset));
        await ctx.stub.putState(AssetType, counterAsBytes);
        console.log(`Success in incrementing counter: ${counterAsset.Counter}`);
        return counterAsset.Counter;
    }
    async getCounter(ctx, AssetType) {
        console.log('AssetType');
        console.log(AssetType);
        let counterAsBytes = await ctx.stub.getState(AssetType);
        console.log(counterAsBytes);
        let counterAsset = JSON.parse(counterAsBytes.toString());
        console.log(`Counter Current Value ${counterAsset.Counter} of Asset Type ${AssetType}`);
        return counterAsset.Counter;
    }

    async getCurrentBlockTimestamp(ctx) {
        const timestamp = ctx.stub.getTxTimestamp().getSeconds();
        return timestamp;
    }

    async createInvoice(ctx, product , to , from , price) {
        if (!product) {
            return { error: 'Name must be provided to create a product' };
        }
        if (!to) {
            return { error: 'Name must be provided to create a product' };
        }
        if (!from) {
            return { error: 'Manufacturer_ID must be provided' };
        }
        if (!price) {
            return { error: 'Price must be non-empty' };
        }
        // get user details from the stub ie. Chaincode stub in network using the user id passed
        const toBytes = await ctx.stub.getState(to);
        if (!toBytes || toBytes.length === 0 ) {
            return { error: 'Cannot Find reciptent' };
        }
        const fromBytes = await ctx.stub.getState(from);
        if (!fromBytes || fromBytes.length === 0) {
            return { error: 'Cannot Find User' };
        }

        //Price conversion - Error handeling
        const i1 = parseFloat(price);
        if (isNaN(i1)) {
            return { error: 'Failed to Convert Price' };
        }
        const invoiceCounter = await this.getCounter(ctx, 'InvoiceCounterNO');
        const newInvoiceID = `Invoice${invoiceCounter + 1}`;
        //To Get the transaction TimeStamp from the Channel Header
        const time = await this.getCurrentBlockTimestamp(ctx);
        // DATES
        const dates = { invoice_date: { time } };
        const invoice = {
            invoiceNumber: newInvoiceID,
            invoiceDate: dates,
            amount: price,
            sender: from,
            recipient: to,
            status: 'created',
        };
        const newInvoiceBytes = Buffer.from(JSON.stringify(invoice));
        await ctx.stub.putState(newInvoiceID, newInvoiceBytes);
        //TO Increment the Product Counter
        await this.incrementCounter(ctx, 'InvoiceCounterNO');
        console.log(`Success in creating Invoice Asset ${newInvoiceID}`);
        return newInvoiceID;
    }

    // user creation and authentication

    async signIn(ctx, userId , password) {
        if (!userId) {
            return { error: 'User ID must be provided' };
        }
        if (!password) {
            return { error: 'Password must be provided' };
        }
        const entityUserBytes = await ctx.stub.getState(userId);
        if (!entityUserBytes) {
            return { error: 'Cannot Find Entity' };
        }

        const entityUser = JSON.parse(entityUserBytes.toString());
        if (entityUser.Password !== password) {
            return { status:400, error: 'Either ID or password is wrong' };
        }
        const user = {
            status:200,
            Address:entityUser.Address,
            Email:entityUser.Email,
            Name:entityUser.Name,
            User_ID:entityUser.User_ID,
            User_Type:entityUser.User_Type
        };

        return { success: user };
    }

    async createUser(ctx, name, userID, email, userType, address, password) {
        console.info('createUser has been invoked');
        const userCounterBytes = await ctx.stub.getState('UserCounterNO');
        const userCounter = JSON.parse(userCounterBytes.toString());
        const user = {
            Name: name,
            User_ID: userID,
            Email: email,
            User_Type: userType,
            Address: address,
            Password: password,
            aadhar:{
                if:'',
                verified:false
            },
            pan:{
                id:'',
                verified:false
            },
            bank:{
                number:'',
                ifsc:false,
                verified:false
            },
            code:''
        };
        // const userKey = 'USER' + userCounter.Counter;
        await ctx.stub.putState(userID, Buffer.from(JSON.stringify(user)));
        userCounter.Counter += 1;
        await ctx.stub.putState('UserCounterNO', Buffer.from(JSON.stringify(userCounter)));
        console.info('createUser execution is completed');
        return JSON.stringify(user);
    }

    async createProduct(ctx, name , mid , price , quantity) {
        if (!name) {
            return { error: 'Name must be provided to create a product' };
        }
        if (!mid) {
            return { error: 'Manufacturer_ID must be provided' };
        }
        if (!price) {
            return { error: 'Price must be non-empty' };
        }
        if (!quantity) {
            return { error: 'quantity must be non-empty' };
        }
        const userBytes = await ctx.stub.getState(mid);
        if (!userBytes || userBytes.length === 0) {
            return { error: 'Cannot Find User' };
        }
        const user = JSON.parse(userBytes.toString());
        if (user.User_Type !== 'manufacturer') {
            return { error: 'User type must be manufacturer' };
        }
        const i1 = parseFloat(price);
        if (isNaN(i1)) {
            return { error: 'Failed to Convert Price' };
        }
        const productCounter = await this.getCounter(ctx, 'ProductCounterNO');
        const newProductID = `Product${productCounter + 1}`;

        const time = await this.getCurrentBlockTimestamp(ctx);
        console.log('time');
        console.log(time);

        const dates = { ManufactureDate: { time } };
        const invoice = await this.createInvoice(ctx, 'raw Material' , mid , 'raw material provider' , price);
        const newProduct = {
            id: newProductID,
            name: name,
            status: 'Available',
            product: {
                type: '',
                origin: '',
                owner: mid,
                quantity: quantity,
                price: '',
                production_date: dates,
                expiration_date: '',
                availablefor: 'exporter',
            },
            producer: {
                id: mid,
                production_data: {
                    climate: '',
                    soil_type: ''
                }
            },
            exporter: {
                id: '',
                export_data: {
                    shipping_method: '',
                    export_date: ''
                }
            },
            inspector: {
                id: '',
                inspection_data: {
                    quality_grade: '',
                    inspection_date: ''
                }
            },
            importer: {
                id: '',
                import_data: {
                    import_order_id: '',
                    import_date: ''
                }
            },
            logistics: {
                id: '',
                logistics_data: {
                    transport_method: '',
                    tracking_id: '',
                    delivery_date: ''
                }
            },
            payment: {
                producer_amount: i1,
                inspector_amount: 0,
                exporter_amount: 0,
                logistics_amount: 0,
                importer_amount: 0,
                retail_amount: 0,
                total_amount: 0, // mrp
            },
            invoice: {
                producer_invoice: invoice, //producer buy raw material
                inspector_invoice: '', // inspection
                exporter_invoice: '', // exporter buy from producer invoice
                logistics_invoice: '', // transport and other invocie
                importer_invoice: '',  // importer buy from importer invoice
                retail_invoice: '', // retailer buy from importer invoice
                customer_invoice: '', // customer buy from retailer invoice
            },
        };
        const newProductBytes = Buffer.from(JSON.stringify(newProduct));
        await ctx.stub.putState(newProductID, newProductBytes);
        //TO Increment the Product Counter
        await this.incrementCounter(ctx, 'ProductCounterNO');
        console.log(`Success in creating Product Asset ${newProductID}`);
        return { success: newProduct };
    }


    async updateProduct(ctx, pid , uid , pname , pprice) {
        // parameter null check
        if (!pid) {
            return { error: 'Product Id must be provided' };
        }
        if (uid) {
            return { error: 'User Id must be provided' };
        }
        if (pname) {
            return { error: 'Product Name must be provided' };
        }
        if (pprice) {
            return { error: 'Product Price must be provided' };
        }
        // get user details from the stub ie. Chaincode stub in network using the user id passed
        let userBytes = await ctx.stub.getState(uid);
        if (!userBytes || userBytes.length === 0) {
            return { error: 'Cannot Find User' };
        }
        let user = JSON.parse(userBytes.toString());
        // User type check for the function
        if (user.User_Type === 'consumer') {
            return { error: 'User type cannot be Consumer' };
        }
        // get product details from the stub ie. Chaincode stub in network using the product id passed
        let productBytes = await ctx.stub.getState(pid);
        if (!productBytes || productBytes.length === 0) {
            return { error: 'Cannot Find Product' };
        }
        let product = JSON.parse(productBytes.toString());
        //Price conversion - Error handling
        let price = parseFloat(pprice);
        if (isNaN(price)) {
            return { error: 'Failed to Convert Price' };
        }
        // Updating the product values with the new values
        product.Name = pname; // product name from UI for the update
        product.Price = price; // product value from UI for the update
        let updatedProductAsBytes = Buffer.from(JSON.stringify(product));
        try {
            await ctx.stub.putState(product.Product_ID, updatedProductAsBytes);
        } catch (err) {
            return { error: `Failed to Sell To Cosumer : ${product.Product_ID}` };
        }
        console.log(`Success in updating Product ${product.Product_ID}`);
        return {success:updatedProductAsBytes};
    }


    async sendToInspector(ctx, pId , iId , price , grade) {
        if (!pId) {
            return { error: 'Product Id must be provided' };
        }
        if (!iId) {
            return { error: 'Inspector Id must be provided' };
        }
        if (!price) {
            return { error: 'price must be provided' };
        }
        if (!grade) {
            return { error: 'quality grade must be provided' };
        }
        const productId = pId;
        const inspectorId = iId;
        const userBytes = await ctx.stub.getState(inspectorId);
        if (!userBytes || userBytes.length === 0) {
            return { error: 'Cannot Find inspector user' };
        }
        const user = JSON.parse(userBytes.toString());
        if (user.User_Type !== 'inspectorId') {
            return { error: 'User type must be inspector'};
        }
        const productBytes = await ctx.stub.getState(productId);
        if (!productBytes || productBytes.length === 0) {
            return { error: 'Cannot Find Product' };
        }
        const product = JSON.parse(productBytes.toString());
        if (product.inspector.id !== '') {
            return { error: 'Product is already inspected' };
        }
        const i1 = parseFloat(price);
        if (isNaN(i1)) {
            return { error: 'Failed to Convert Price' };
        }
        const txTimestamp = ctx.getTxTimestamp();
        product.inspector.id = user.User_ID;
        product.inspector.inspection_data.quality_grade = txTimestamp.seconds;
        product.inspector.inspection_data.inspection_date = txTimestamp.seconds;
        product.inspector.inspection_data.quality_grade = grade;
        const updatedProductAsBytes = Buffer.from(JSON.stringify(product));
        await ctx.stub.putState(product.Product_ID, updatedProductAsBytes);
        console.log('Success in inspection by  ', product.Product_ID);
        return {success:updatedProductAsBytes};
    }

    async orderProductBulk(ctx, cId , pId) {
    // parameter null check
        if (!cId) {
            return { error: 'Consumer Id must be provided' };
        }
        if (!pId) {
            return { error: 'Product Id must be provided' };
        }
        const userBytes = await ctx.stub.getState(cId);
        if (!userBytes || userBytes.length === 0) {
            return { error: 'Cannot Find Consumer' };
        }
        const productBytes = await ctx.stub.getState(pId);
        if (!productBytes || productBytes.length === 0) {
            return { error: 'Cannot Find Product' };
        }

        const user = JSON.parse(userBytes.toString());
        const product = JSON.parse(productBytes.toString());
        // User type check for the function
        if (user.User_Type!==product.product.availablefor) {
            return { error: `You must be  ${product.product.availablefor} to buy this productg`};
        }

        const orderCounter = await this.getCounter(ctx, 'OrderCounterNO');
        let txTimeAsPtr;
        try {
            // To Get the transaction TimeStamp from the Channel Header
            const txTimestamp = await ctx.getTxTimestamp();
            txTimeAsPtr = {
                seconds: txTimestamp.seconds.toNumber(),
                nanos: txTimestamp.nanos,
            };
        } catch (err) {
            return { error: 'Returning error in Transaction TimeStamp' };
        }
        product.importer.import_data.import_order_id = 'Order' + (orderCounter + 1);
        product.importer.id = user.User_ID;
        product.Status = 'Ordered';
        product.Date.OrderedDate = txTimeAsPtr;
        const updatedProductAsBytes = Buffer.from(JSON.stringify(product));
        await this.incrementCounter(ctx, 'OrderCounterNO');
        try {
            await ctx.stub.putState(product.Product_ID, updatedProductAsBytes);
        } catch (err) {
            return { error: `Failed to place the order: ${product.Product_ID}` };
        }
        console.log(`Order placed successfully ${product.Product_ID}`);
        return {success:updatedProductAsBytes};
    }






    async sendToExporter(ctx, pId , eId) {
    // if (args.length != 2) {
    //   return { "error": "Less no of arguments provided" };
    // }
        if (!pId) {
            return { error: 'Product Id must be provided' };
        }
        if (!eId) {
            return { error: 'exporter Id must be provided' };
        }
        const productId = pId;
        const exporterId = eId;
        const userBytes = await ctx.stub.getState(exporterId);
        if (!userBytes || userBytes.length === 0) {
            return { error: 'Cannot Find exporter user' };
        }
        const user = JSON.parse(userBytes.toString());
        if (user.User_Type !== 'exporter') {
            return { error: 'User type must be exporter' };
        }
        const productBytes = await ctx.stub.getState(productId);
        if (!productBytes || productBytes.length === 0) {
            return { error: 'Cannot Find Product' };
        }
        const product = JSON.parse(productBytes.toString());
        if (product.exporter.id !== '') {
            return { error: 'Product is send to exporter already' };
        }
        const txTimestamp = ctx.getTxTimestamp();
        product.exporter.id = user.User_ID;
        product.exporter.export_data.export_date = txTimestamp.seconds;
        product.product.owner = eId;
        product.product.availablefor = 'importer';
        const updatedProductAsBytes = Buffer.from(JSON.stringify(product));
        await ctx.stub.putState(product.Product_ID, updatedProductAsBytes);
        console.log('Success in sending Product ', product.Product_ID);
        return {success:updatedProductAsBytes};
    }


    async sendToLogistic(ctx, pId , eId , lId , iId , date) {
        if (!pId) {
            return { error: 'Product Id must be provided' };
        }
        if (!lId) {
            return { error: 'logistic partner id must be provided' };
        }
        if (!iId) {
            return { error: 'reciever Id must be provided' };
        }
        if (!eId) {
            return { error: 'exporter Id must be provided' };
        }
        if (!date) {
            return { error: 'date must be provided' };
        }
        const importerBytes = await ctx.stub.getState(iId);
        if (!importerBytes || importerBytes.length === 0) {
            return { error: 'Cannot find Importer' };
        }

        const logisticBytes = await ctx.stub.getState(lId);
        if (!logisticBytes || logisticBytes.length === 0) {
            return { error: 'Cannot find logistic partner' };
        }

        const exporterBytes = await ctx.stub.getState(eId);
        if (!exporterBytes || exporterBytes.length === 0) {
            return { error: 'Cannot find logistic partner' };
        }

        const exporter = JSON.parse(exporterBytes.toString());
        if (exporter.User_Type !== 'exporter') {
            return { error: 'User type must be exporter' };
        }

        const productBytes = await ctx.stub.getState(pId);
        if (!productBytes || productBytes.length === 0) {
            return { error: 'Cannot find Product' };
        }
        const product = JSON.parse(productBytes.toString());
        if (product.logistics.id !== '') {
            return { error: 'Product is already sent assigned to a logistic partner' };
        }
        const importer = JSON.parse(importerBytes.toString());
        // To get the transaction timestamp from the channel header
        const txTimestamp = (await ctx.getTxTimestamp()).seconds.toNumber();
        product.status = 'sold';
        product.logistics.id = importer.User_ID;
        product.logistics.logistics_data.date = txTimestamp;
        product.logistics.logistics_data.expected_delivery_date = date;
        const updatedProductAsBytes = Buffer.from(JSON.stringify(product));
        try {
            await ctx.stub.putState(product.Product_ID, updatedProductAsBytes);
            console.log('Success in sending Product', product.Product_ID);
            return { success: updatedProductAsBytes };
        } catch (err) {
            return { error: `Failed to Send to Distributor: ${product.Product_ID}` };
        }
    }


    async deliveredProduct(ctx, pId) {
        if (!pId) {
            return { error: 'Product Id must be provided' };
        }
        const productBytes = await ctx.stub.getState(pId);
        if (productBytes === null) {
            return { error: 'Cannot Find Product' };
        }
        const product = JSON.parse(productBytes.toString());
        if (product.status !== 'sold') {
            return { error: 'Product is not sold yet' };
        }
        const { seconds, nanos } = ctx.getTxTimestamp();
        const deliveredDate = new Date(seconds * 1000 + Math.round(nanos / 1000000));
        product.logistics.logistics_data.delivery_date = deliveredDate;
        product.Status = 'Delivered';
        const updatedProductAsBytes = Buffer.from(JSON.stringify(product));
        await ctx.stub.putState(pId, updatedProductAsBytes);
        console.log(`Success in delivering Product ${product.Product_ID}`);
        return {success:updatedProductAsBytes};
    }




    async sendToRetailer(ctx, pId , rId) {
    // if (args.length != 2) {
    //   return { "error": "Less no of arguments provided" };
    // }
        if (!pId) {
            return { error: 'ProductId must be specified' };
        }
        if (!rId) {
            return { error: 'RetailerId must be specified' };
        }
        const userBytes = await ctx.stub.getState(rId);
        if (!userBytes || userBytes.length === 0) {
            return { error: 'Could not find the retailer' };
        }
        const user = JSON.parse(userBytes.toString());
        if (user.User_Type !== 'retailer') {
            return { error: 'User must be a retailer' };
        }
        const productBytes = await ctx.stub.getState(pId);
        if (!productBytes || productBytes.length === 0) {
            return { error: 'Could not find the product' };
        }
        const product = JSON.parse(productBytes.toString());
        if (product.Retailer_ID !== '') {
            return { error: 'Product has already been sent to retailer' };
        }
        //To Get the transaction TimeStamp from the Channel Header
        const txTimestamp = await ctx.getTxTimestamp();
        const txTimeAsPtr = {
            seconds: txTimestamp.seconds.low,
            nanos: txTimestamp.nanos,
        };
        product.Retailer_ID = user.User_ID;
        product.Date.SendToRetailerDate = txTimeAsPtr;
        const updatedProductAsBytes = Buffer.from(JSON.stringify(product));
        try {
            await ctx.stub.putState(product.Product_ID, updatedProductAsBytes);
        } catch (errPut) {
            return { error: `Failed to send to retailer: ${product.Product_ID}` };
        }
        console.log(`Sent product ${product.Product_ID} to retailer successfully`);
        return {success:updatedProductAsBytes};
    }

    async sellToConsumer(ctx , pId) {
        if (pId) {
            return { error: 'Product Id must be provided' };
        }
        // get product details from the stub ie. Chaincode stub in network using the product id passed
        let productBytes = await ctx.stub.getState(pId);
        if (!productBytes || productBytes.length === 0) {
            return { error: 'Cannot Find Product' };
        }
        let product = JSON.parse(productBytes.toString());
        // check if the product is ordered or not
        if (product.Order_ID === '') {
            return { error: 'Product has not been ordered yet' };
        }
        // check if the product is sold to consumer already
        if (product.Consumer_ID === '') {
            return { error: 'Customer Id shud be set to sell to customer' };
        }
        //To Get the transaction TimeStamp from the Channel Header
        let txTimeAsPtr = await  ctx.stub.getTxTimestamp();
        // Updating the product values to be updated after the function
        product.Date.SellToConsumerDate = txTimeAsPtr;
        product.Status = 'Sold';
        let updatedProductAsBytes = Buffer.from(JSON.stringify(product));
        try {
            await ctx.stub.putState(product.Product_ID, updatedProductAsBytes);
        } catch (error) {
            return { error: `Failed to Sell To Cosumer : ${product.Product_ID}` };
        }
        console.log(`Success in sending Product ${product.Product_ID}`);
        return {success:updatedProductAsBytes};
    }


    // Query asset by ID


    async queryAsset(ctx, query) {
        if (!query) {
            return { error: 'Incorrect number of arguments. Expected 1 argument' };
        }
        const productAsBytes = await ctx.stub.getState(query);
        return productAsBytes.toString() ;
    }

    async queryAll(ctx, type) {
        if (!type) {
            return { error: 'Asset Type must be provided' };
        }
        const assetType = type;
        const assetCounter = parseInt(await this.getCounter(ctx, assetType + 'CounterNO'));
        const startKey = assetType + '1';
        const endKey = assetType + (assetCounter + 1);
        const resultsIterator = await ctx.stub.getStateByRange(startKey, endKey);
        const buffer = [];
        while (true) {
            const res = await resultsIterator.next();
            if (res.value && res.value.value.toString()) {
                const Key = res.value.key;
                let Record;
                try {
                    Record = JSON.parse(res.value.value.toString('utf8'));
                } catch (err) {
                    console.log(err);
                    Record = res.value.value.toString('utf8');
                }
                buffer.push({ Key, Record });
            }
            if (res.done) {
                await resultsIterator.close();
                break;
            }
        }
        console.log(`- queryAllAssets:\n${JSON.stringify(buffer)}`);
        return { success: buffer };
    }


    async querybyFilter(ctx, type, recordElement, recordValue) {
        if (!type) {
            return { error: 'Asset Type must be provided' };
        }
        console.log(recordElement);
        console.log(recordValue);
        const assetType = type;
        const assetCounter = parseInt(await this.getCounter(ctx, assetType + 'CounterNO'));
        const startKey = assetType + '1';
        const endKey = assetType + (assetCounter + 1);
        const resultsIterator = await ctx.stub.getStateByRange(startKey, endKey);
        const buffer = [];
        while (true) {
            const res = await resultsIterator.next();
            if (res.value && res.value.value.toString()) {
                const Key = res.value.key;
                let Record;
                try {
                    Record = JSON.parse(res.value.value.toString('utf8'));
                } catch (err) {
                    console.log(err);
                    Record = res.value.value.toString('utf8');
                }
                if (Record[recordElement] === recordValue) {
                    buffer.push({ Key, Record });
                }
            }
            if (res.done) {
                await resultsIterator.close();
                break;
            }
        }
        console.log(`- queryAllAssets:\n${JSON.stringify(buffer)}`);
        return { success: buffer };
    }

    async queryUser(ctx, userID) {
        const userAsBytes = await ctx.stub.getState(userID); // get the car from chaincode state
        if (!userAsBytes || userAsBytes.length === 0) {
            throw new Error(`${userID} does not exist`);
        }
        console.log(userAsBytes.toString());
        return userAsBytes.toString();
    }
    async queryProduct(ctx, productID) {
        const productAsBytes = await ctx.stub.getState(productID); // get the car from chaincode state
        if (!productAsBytes || productAsBytes.length === 0) {
            throw new Error(`${productID} does not exist`);
        }
        console.log(productAsBytes.toString());
        return productAsBytes.toString();
    }



}

module.exports = SupplyChain;
