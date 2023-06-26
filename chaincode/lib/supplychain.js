'use strict';
// const e = require('express');
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
        const currentDate = new Date();
        const currentSeconds = Math.floor(currentDate.getTime() / 1000);
        return currentSeconds;
    }
    async checkProperties(obj) {
        console.log('obj');
        console.log(obj);
        for (let prop in obj) {
            if (!obj[prop]) {
                return { error: `${prop} must be provided` };
            }
        }
        return;
    }


    // helper
    async createInvoice(ctx, products, to, from) {
        if (!products || products.length === 0) {
            return { error: 'At least one product must be provided to create an invoice' };
        }
        if (!to) {
            return { error: 'Name must be provided for the recipient' };
        }
        if (!from) {
            return { error: 'Manufacturer ID must be provided for the sender' };
        }
        // Check if recipient and sender exist
        const toBytes = await ctx.stub.getState(to);
        if (!toBytes || toBytes.length === 0) {
            return { error: 'Cannot find recipient' };
        }
        const fromBytes = await ctx.stub.getState(from);
        if (!fromBytes || fromBytes.length === 0) {
            return { error: 'Cannot find sender' };
        }
        // Calculate total price
        let totalPrice = 0;
        const productsWithPrice = [];
        for (const product of products) {
            if (!product.name || !product.quantity || !product.price) {
                return { error: 'Each product must have a name, quantity, and price' };
            }
            const price = parseFloat(product.price);
            const quantity = parseInt(product.quantity);
            if (isNaN(price) || isNaN(quantity)) {
                return { error: 'Price and quantity must be valid numbers' };
            }
            totalPrice += price * quantity;
            productsWithPrice.push({
                id: product.id,
                name: product.name,
                quantity: quantity,
                price: price
            });
        }
        const invoiceCounter = await this.getCounter(ctx, 'InvoiceCounterNO');
        const newInvoiceID = `Invoice${invoiceCounter + 1}`;
        // Get the transaction timestamp from the channel header
        const time = await this.getCurrentBlockTimestamp(ctx);
        // Create invoice object
        const invoice = {
            invoiceNumber: newInvoiceID,
            invoiceDate: time,
            products: productsWithPrice,
            totalPrice: totalPrice.toFixed(2),
            sender: from,
            recipient: to,
            status: 'created',
        };
        const newInvoiceBytes = Buffer.from(JSON.stringify(invoice));
        await ctx.stub.putState(newInvoiceID, newInvoiceBytes);
        // Increment the invoice counter
        await this.incrementCounter(ctx, 'InvoiceCounterNO');
        console.log(`Success in creating Invoice Asset ${newInvoiceID}`);
        return newInvoiceID;
    }
    async createInvoiceRawMaterial(ctx, product, from) {
        const products = JSON.parse(product);
        console.log('products');
        console.log(products);
        if (!products || products.length === 0) {
            return { error: 'At least one product must be provided to create an invoice' };
        }
        if (!from) {
            return { error: 'Manufacturer ID must be provided for the sender' };
        }
        const sellers = {};
        // Fetch seller id for each product and group by seller
        for (const product of products) {
            console.log('product');
            console.log(product);
            if (!product.id) {
                return { error: 'Product ID must be provided for each product' };
            }
            let productBytes = await ctx.stub.getState(product.id);
            if (!productBytes || productBytes.length === 0) {
                return { error: 'Cannot find product' };
            }
            let productObj = JSON.parse(productBytes.toString());
            const sellerId = productObj.product.owner;
            if (!sellers[sellerId]) {
                sellers[sellerId] = {
                    seller: sellerId,
                    products: []
                };
            }
            // Check if product already exists for the seller, update quantity
            let existingProduct = sellers[sellerId].products.find(p => p.id === product.id);
            if (existingProduct) {
                existingProduct.quantity += parseInt(product.quantity);
            } else {
            // Add new product for the seller
                sellers[sellerId].products.push({
                    id: product.id,
                    quantity: parseInt(product.quantity)
                });
            }
        }
        const invoices = [];
        const invoiceDate = { time: await this.getCurrentBlockTimestamp(ctx) };
        // Create invoice for each seller
        console.log('seller');
        console.log(sellers);
        let invoiceCounter = await this.getCounter(ctx, 'InvoiceCounterNO');
        for (const sellerId in sellers) {
            let newInvoiceID = `Invoice${invoiceCounter + 1}`;

            const seller = sellers[sellerId];
            const products = seller.products;
            let totalPrice = 0;
            for (const p of products) {
                console.log('p');
                console.log(p);
                let productBytes = await ctx.stub.getState(p.id);
                let productObj = JSON.parse(productBytes.toString());
                console.log('productObj');
                console.log(productObj);
                totalPrice += productObj.product.price * p.quantity;
            }
            console.log('totalPrice');
            console.log(totalPrice);
            const invoice = {
                invoiceNumber: newInvoiceID,
                invoiceDate,
                products: seller.products,
                totalPrice: totalPrice.toFixed(2),
                sender: sellerId,
                recipient: from,
                status: 'created',
            };
            const newInvoiceBytes = Buffer.from(JSON.stringify(invoice));
            await ctx.stub.putState(newInvoiceID, newInvoiceBytes);
            invoices.push({
                sellerId,
                productId: seller.products.map(p => p.id),
                invoiceNumber: newInvoiceID
            });
            invoiceCounter++;
            console.log("🚀 ~ file: supplychain.js:216 ~ SupplyChain ~ createInvoiceRawMaterial ~ newInvoiceID:", newInvoiceID)
            await this.incrementCounter(ctx, 'InvoiceCounterNO');
        }
        // Increment the invoice counter
        console.log('Success in creating Invoice Assets');
        return invoices;
    }
    //user registration
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
            User_Type:entityUser.User_Type,
            profilePic:entityUser.profilePic
        };
        return { success: user };
    }

    async createUser(ctx, name, email, userType, address, password , profilePic) {
        const errors = this.checkProperties({
            name, email, userType, address, password , profilePic
        });
        console.log(name, email, userType, address, password , profilePic );
        console.info('Checking Error');
        if (errors && typeof errors === 'object' && Object.keys(errors).length > 0) {
            console.log(`createUser has been invoked with errors: ${JSON.stringify(errors)}`);
            return errors;
        }
        console.info('createUser has been invoked');
        const userCounter = await this.getCounter(ctx, 'UserCounterNO');
        const newUserID = `User${userCounter + 1}`;
        const user = {
            Name: name,
            User_ID: newUserID,
            Email: email,
            Mobile: '',
            User_Type: userType,
            Address: {
                address:address,
                pin:'',
                city:'',
                state:'',
                country:''
            },
            Password: password,
            profilePic: profilePic,
            aadhar:{
                id:'',
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
            code:'',
            cart:[],
            inventory:[],
        };
        await ctx.stub.putState(newUserID, Buffer.from(JSON.stringify(user)));
        await this.incrementCounter(ctx, 'UserCounterNO');
        console.info('createUser execution is completed');
        return JSON.stringify(user);
    }

    async updateAadhar(ctx, aadhar , uid ) {
        // parameter null check
        if (!aadhar) {
            return { error: 'Aadhar no must be provided' };
        }
        if (!uid) {
            return { error: 'User Id must be provided' };
        }
        // get user details from the stub ie. Chaincode stub in network using the user id passed
        let userBytes = await ctx.stub.getState(uid);
        if (!userBytes || userBytes.length === 0) {
            return { error: 'Cannot Find User' };
        }
        let user = JSON.parse(userBytes.toString());
        // User type check for the function
        user.aadhar.id = aadhar; // product value from UI for the update
        user.aadhar.verified = true; // product value from UI for the update
        let updatedUserAsBytes = Buffer.from(JSON.stringify(user));
        try {
            await ctx.stub.putState(user.id, updatedUserAsBytes);
        } catch (err) {
            return { error: `Failed to Update aadhar for user : ${user.id}` };
        }
        console.log(`Success in updating aadhar ${user.id}`);
        return {success:updatedUserAsBytes};
    }

    async updateProfile(ctx, uid , Name, address, city, country, email ,pincode ,state, mobile , userType ) {
        const errors = this.checkProperties({
            uid , Name, address, city, country, email ,pincode ,state , mobile, userType
        });
        console.info('Checking Error');
        if (errors && typeof errors === 'object' && Object.keys(errors).length > 0) {
            console.log(`updateProfile has been invoked with errors: ${JSON.stringify(errors)}`);
            return errors;
        }
        let userBytes = await ctx.stub.getState(uid);
        if (!userBytes || userBytes.length === 0) {
            return { error: 'Cannot Find User' };
        }
        let user = JSON.parse(userBytes.toString());

        user.aadhar.name = Name;
        user.aadhar.mobile = mobile;
        user.Address.address = address;
        user.Address.state = state;
        user.Address.city = city;
        user.Address.pincode = pincode;

        let updatedUserAsBytes = Buffer.from(JSON.stringify(user));
        try {
            await ctx.stub.putState(user.id, updatedUserAsBytes);
        } catch (err) {
            return { error: `Failed to Update aadhar for user : ${user.id}` };
        }
        console.log(`Success in updating aadhar ${user.id}`);
        return {success:updatedUserAsBytes};
    }

    async updatePan(ctx, pan , uid ) {
        if (!pan) {
            return { error: 'Pan no must be provided' };
        }
        if (!uid) {
            return { error: 'User Id must be provided' };
        }
        // get user details from the stub ie. Chaincode stub in network using the user id passed
        let userBytes = await ctx.stub.getState(uid);
        if (!userBytes || userBytes.length === 0) {
            return { error: 'Cannot Find User' };
        }
        let user = JSON.parse(userBytes.toString());
        // User type check for the function
        user.pan.id = pan; // product value from UI for the update
        user.pan.verified = true; // product value from UI for the update
        let updatedUserAsBytes = Buffer.from(JSON.stringify(user));
        try {
            await ctx.stub.putState(user.id, updatedUserAsBytes);
        } catch (err) {
            return { error: `Failed to Update pan for user : ${user.id}` };
        }
        console.log(`Success in updating pan ${user.id}`);
        return {success:updatedUserAsBytes};
    }
    // transactions




    async buyRawProduct(ctx, userId, newItem, action) {
        // Retrieve the user object from the database
        let userBytes = await ctx.stub.getState(userId);
        if (!userBytes || userBytes.length === 0) {
            return { error: 'Cannot Find User' };
        }
        let user = JSON.parse(userBytes.toString());
        // Create a new array based on seller
        const newItems = JSON.parse(newItem);
        switch (action) {
        case 'add': {
            for (const newItem of newItems) {
                const itemToAdd = {
                    id: newItem.id,
                    name: newItem.name,
                    price: newItem.price,
                    quantity: newItem.quantity,
                    index:user.inventory[user.inventory.length - 1]?user.inventory[user.inventory.length - 1].index+1:1
                };
                user.inventory.push(itemToAdd);
            }
            let updatedBuffer = Buffer.from(JSON.stringify(user));
            await ctx.stub.putState(userId, updatedBuffer);
            return await this.createInvoiceRawMaterial(ctx,  newItem , userId);
        }
        case 'remove': {
            const indexToRemove = user.inventory.findIndex((item) => item.index === newItem.index);
            if (indexToRemove === -1) {
                throw new Error(`Item with index ${newItem.index} does not exist in the inventory`);
            }
            user.inventory.splice(indexToRemove, 1);
            const updatedBuffer = Buffer.from(JSON.stringify(user));
            await ctx.stub.putState(userId, updatedBuffer);
            break;
        }
        case 'update': {
            const indexToUpdate = user.inventory.findIndex((item) => item.index === newItem.index);
            if (indexToUpdate === -1) {
                throw new Error(`Item with index ${newItem.index} does not exist in the inventory`);
            }
            const itemToUpdate = user.inventory[indexToUpdate];
            itemToUpdate.name = newItem.name;
            itemToUpdate.price = newItem.price;
            itemToUpdate.quantity = newItem.quantity;
            const updatedBuffer = Buffer.from(JSON.stringify(user));
            await ctx.stub.putState(userId, updatedBuffer);
            break;
        }
        case 'decrement': {
            for (const newItem of newItems) {
                const indexToUpdate = user.inventory.findIndex((item) => item.index === newItem.index);
                if (indexToUpdate === -1) {
                    throw new Error(`Item with index ${newItem.index} does not exist in the inventory`);
                }
                const itemToUpdate = user.inventory[indexToUpdate];
                itemToUpdate.name = newItem.name;
                itemToUpdate.price = itemToUpdate.price - (newItem.price * newItem.quantity);
                itemToUpdate.quantity = itemToUpdate.quantity - newItem.quantity;
                if (itemToUpdate.quantity <= 0) {
                    user.inventory.splice(indexToUpdate, 1);
                }
            }
            const updatedBuffer = Buffer.from(JSON.stringify(user));
            await ctx.stub.putState(userId, updatedBuffer);
            break;
        }
        default:
            throw new Error(`Invalid action: ${action}`);
        }
        // Save the updated user object back to the database
    }
    async createRawMaterial(ctx, name , mid , price , quantity , image , description) {
        const errors = this.checkProperties({
            name , mid , price , quantity
        });
        if (errors && typeof errors === 'object' && Object.keys(errors).length > 0) {
            return errors;
        }
        const userBytes = await ctx.stub.getState(mid);
        if (!userBytes || userBytes.length === 0) {
            return { error: 'Cannot Find User' };
        }
        // const user = JSON.parse(userBytes.toString());
        const i1 = parseFloat(price);
        if (isNaN(i1)) {
            return { error: 'Failed to Convert Price' };
        }
        const productCounter = await this.getCounter(ctx, 'ProductCounterNO');
        const newProductID = `Product${productCounter + 1}`;
        const time = await this.getCurrentBlockTimestamp(ctx);
        console.log('time');
        console.log(time);
        const dates =  time ;
        const newProduct = {
            id: newProductID,
            name: name,
            status: 'Available',
            product: {
                type: 'Raw Material',
                owner: mid,
                quantity: quantity,
                description: description,
                price: i1,
                production_date: dates,
                expiration_date: '',
                image: image,
                availablefor: 'manufacturer',
            },
        };
        const newProductBytes = Buffer.from(JSON.stringify(newProduct));
        await ctx.stub.putState(newProductID, newProductBytes);
        //TO Increment the Product Counter
        await this.incrementCounter(ctx, 'ProductCounterNO');
        console.log(`Success in creating Product Asset ${newProductID}`);
        return { success: newProduct };
    }

    // for farmer
    async createProduct(ctx, name , mid , price , quantity) {
        const errors = this.checkProperties({
            name , mid , price , quantity
        });
        if (errors && typeof errors === 'object' && Object.keys(errors).length > 0) {
            console.log(`createUser has been invoked with errors: ${JSON.stringify(errors)}`);
            return errors;
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
        const dates =  time;
        const invoice = await this.createInvoice(ctx, 'Raw Material' , mid , 'User1' , price);
        const newProduct = {
            id: newProductID,
            name: name,
            status: 'Processing',
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
                name: name,
                production_data: {
                    climate: '',
                    soil_type: ''
                },
                status: 'Processing',
            },
            exporter: {
                id: '',
                name: name,
                export_data: {
                    shipping_method: '',
                    export_date: ''
                },
                status: 'Not Available'
            },
            inspector: {
                id: '',
                name: name,
                inspection_data: {
                    quality_grade: '',
                    inspection_date: ''
                },
                status: 'Not Available'
            },
            importer: {
                id: '',
                name: name,
                import_data: {
                    import_order_id: '',
                    import_date: ''
                },
                status: 'Not Available'
            },
            logistic: {
                id: '',
                name: name,
                logistics_data: {
                    transport_method: '',
                    tracking_id: '',
                    delivery_date: ''
                },
                status: 'Not Available'
            },
            payment: {
                raw_product_amount: i1,
                producer_amount: 0,
                inspector_amount: 0,
                exporter_amount: 0,
                logistics_amount: 0,
                importer_amount: 0,
                retail_amount: 0,
                total_amount: 0,
            },
            invoice: {
                producer_invoice: invoice, //producer buy raw material
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

    async updateProductFarmer(ctx, pid , uid , pprice , climate , soil_type) {
        // parameter null check
        if (!pid) {
            return { error: 'Product Id must be provided' };
        }
        if (!uid) {
            return { error: 'User Id must be provided' };
        }
        if (!pprice) {
            return { error: 'Product Price must be provided' };
        }
        // get user details from the stub ie. Chaincode stub in network using the user id passed
        let userBytes = await ctx.stub.getState(uid);
        if (!userBytes || userBytes.length === 0) {
            return { error: 'Cannot Find User' };
        }
        let user = JSON.parse(userBytes.toString());
        // User type check for the function
        if (user.User_Type !== 'manufacturer') {
            return { error: 'User type must be a manufacturer' };
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
        product.product.price = price+product.payment.raw_product_amount; // product value from UI for the update
        product.payment.producer_amount = price; // product value from UI for the update
        product.producer.production_data.climate = climate; // product value from UI for the update
        product.producer.production_data.soil_type = soil_type; // product value from UI for the update
        product.status = 'Available'; // product value from UI for the update
        product.producer.status = 'Available'; // product value from UI for the update
        product.product.availablefor = 'exporter'; // product value from UI for the update
        let updatedProductAsBytes = Buffer.from(JSON.stringify(product));
        try {
            await ctx.stub.putState(product.id, updatedProductAsBytes);
        } catch (err) {
            return { error: `Failed to Update : ${product.id}` };
        }
        console.log(`Success in updating Product ${product.id}`);
        return {success:updatedProductAsBytes};
    }

    // for exporter
    async sendToExporter(ctx, pId , eId) {
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
        const txTimestamp = await this.getCurrentBlockTimestamp(ctx);
        const invoice = await this.createInvoice(ctx, [{name:product.name , price:product.product.price , quantity:product.product.quantity ,id:product.id  }], exporterId , product.producer.id );
        product.exporter.id = exporterId;
        product.exporter.name = user.Name;
        product.exporter.export_data.export_date = txTimestamp.seconds;
        product.product.owner = eId;
        product.product.availablefor = 'importer';
        product.status = 'Processing';
        product.producer.status='Complete';
        product.exporter.status='Processing';
        product.invoice.exporter_invoice = invoice;
        const updatedProductAsBytes = Buffer.from(JSON.stringify(product));
        await ctx.stub.putState(product.id, updatedProductAsBytes);
        console.log('Success in sending Product to exporter', product.id);
        return {success:updatedProductAsBytes};
    }

    async updateProductExporter(ctx, pid , uid , pprice , packagingType , quantityPerPackage) {
        // parameter null check
        if (!pid) {
            return { error: 'Product Id must be provided' };
        }
        if (!uid) {
            return { error: 'User Id must be provided' };
        }
        if (!pprice) {
            return { error: 'Product Price must be provided' };
        }
        // get user details from the stub ie. Chaincode stub in network using the user id passed
        let userBytes = await ctx.stub.getState(uid);
        if (!userBytes || userBytes.length === 0) {
            return { error: 'Cannot Find User' };
        }
        let user = JSON.parse(userBytes.toString());
        // User type check for the function
        if (user.User_Type !== 'exporter') {
            return { error: 'User type must be a exporter' };
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
        const time = await this.getCurrentBlockTimestamp(ctx);
        // Updating the product values with the new values
        product.product.price = price+product.product.price; // product value from UI for the update
        product.payment.exporter_amount = price; // product value from UI for the update
        product.status = 'Available'; // product value from UI for the update
        product.exporter.status = 'Available'; // product value from UI for the update
        product.exporter.export_data.packagingType = packagingType; // product value from UI for the update
        product.exporter.export_data.quantityPerPackage = quantityPerPackage; // product value from UI for the update
        product.exporter.export_data.export_data = time; // product value from UI for the update
        product.product.availablefor = 'importer';
        let updatedProductAsBytes = Buffer.from(JSON.stringify(product));
        try {
            await ctx.stub.putState(product.id, updatedProductAsBytes);
        } catch (err) {
            return { error: `Failed to Update : ${product.id}` };
        }
        console.log(`Success in updating Product ${product.id}`);
        return {success:updatedProductAsBytes};
    }

    async sendToImporter(ctx, pId , iId) {
        if (!pId) {
            return { error: 'Product Id must be provided' };
        }
        if (!iId) {
            return { error: 'Importer Id must be provided' };
        }
        const productId = pId;
        const importerId = iId;
        const userBytes = await ctx.stub.getState(importerId);
        if (!userBytes || userBytes.length === 0) {
            return { error: 'Cannot Find importer user' };
        }
        const user = JSON.parse(userBytes.toString());
        if (user.User_Type !== 'importer') {
            return { error: 'User type must be importer' };
        }
        const productBytes = await ctx.stub.getState(productId);
        if (!productBytes || productBytes.length === 0) {
            return { error: 'Cannot Find Product' };
        }
        const product = JSON.parse(productBytes.toString());
        if (product.importer.id !== '') {
            return { error: 'Product is send to importer already' };
        }
        const txTimestamp = await this.getCurrentBlockTimestamp(ctx);
        const invoice = await this.createInvoice(ctx, [{name:product.name , price:product.product.price , quantity:product.product.quantity ,id:product.id  }], importerId , product.exporter.id );
        product.importer.id = importerId;
        product.importer.name = user.Name;
        product.importer.import_data.import_date = txTimestamp.seconds;
        product.product.owner = iId;
        product.product.availablefor = '';
        product.status = 'Ordered';
        product.importer.status = 'Ordered';
        product.exporter.status='Complete';
        product.invoice.importer_invoice = invoice;
        const updatedProductAsBytes = Buffer.from(JSON.stringify(product));
        await ctx.stub.putState(product.id, updatedProductAsBytes);
        console.log('Success in sending Product to importer', product.id);
        return {success:updatedProductAsBytes};
    }

    async sendToLogistic(ctx, pId , lId , iId , price , date , type) {
        const errors = this.checkProperties({
            pId , lId , iId , price , date , type
        });
        if (errors && typeof errors === 'object' && Object.keys(errors).length > 0) {
            console.log(`sendToLogistics has been invoked with errors: ${JSON.stringify(errors)}`);
            return errors;
        }

        const importerBytes = await ctx.stub.getState(iId);
        if (!importerBytes || importerBytes.length === 0) {
            return { error: 'Cannot find Importer' };
        }


        const logisticBytes = await ctx.stub.getState(lId);
        if (!logisticBytes || logisticBytes.length === 0) {
            return { error: 'Cannot find logistic partner' };
        }
        const user = JSON.parse(logisticBytes.toString());
        if (user.User_Type !== 'logistic') {
            return { error: 'User type must be importer' };
        }
        const productBytes = await ctx.stub.getState(pId);
        if (!productBytes || productBytes.length === 0) {
            return { error: 'Cannot find Product' };
        }
        const product = JSON.parse(productBytes.toString());
        if (product.logistic.id !== '') {
            return { error: 'Product is already sent assigned to a logistic partner' };
        }
        let pprice = parseFloat(price);
        if (isNaN(price)) {
            return { error: 'Failed to Convert Price' };
        }
        const invoice = await this.createInvoice(ctx, [{name:product.name , price:product.product.price , quantity:product.product.quantity ,id:product.id  }], lId , product.importer.id );
        const txTimestamp =  await this.getCurrentBlockTimestamp(ctx);
        product.status = 'Shipped';
        product.importer.status = 'Shipped';
        product.product.price = pprice+product.product.price; // product value from UI for the update
        product.payment.logistic_amount = pprice; // product value from UI for the update

        product.logistic.id = lId;
        product.logistic.name = user.Name;
        product.logistic.logistics_data.date = txTimestamp;
        product.logistic.logistics_data.expected_delivery_date = date;
        product.logistic.logistics_data.delivery_type = type;
        product.invoice.logistic_invoice = invoice;

        product.logistic.status = 'Processing';
        const updatedProductAsBytes = Buffer.from(JSON.stringify(product));
        try {
            await ctx.stub.putState(product.id, updatedProductAsBytes);
            console.log('Success in sending Product', product.id);
            return { success: updatedProductAsBytes };
        } catch (err) {
            return { error: `Failed to Send to Distributor: ${product.id}` , status : 400 };
        }
    }

    async pickupLogistic(ctx, pId , lId) {
        if (!pId) {
            return { error: 'ProductId must be specified' };
        }
        if (!lId) {
            return { error: 'LogisticId must be specified' };
        }
        const userBytes = await ctx.stub.getState(lId);
        if (!userBytes || userBytes.length === 0) {
            return { error: 'Could not find the logistic' };
        }
        const user = JSON.parse(userBytes.toString());
        if (user.User_Type !== 'logistic') {
            return { error: 'User must be a logistic' };
        }
        const productBytes = await ctx.stub.getState(pId);
        if (!productBytes || productBytes.length === 0) {
            return { error: 'Could not find the product' };
        }
        const product = JSON.parse(productBytes.toString());
        if (product.logistic.logistics_data.pickup_date) {
            return { error: 'Product has already been sent to retailer' };
        }
        //To Get the transaction TimeStamp from the Channel Header
        const txTimestamp =  await this.getCurrentBlockTimestamp(ctx);
        product.logistic.logistics_data.pickup_date = txTimestamp;
        product.logistic.status = 'pickup';
        const updatedProductAsBytes = Buffer.from(JSON.stringify(product));
        try {
            await ctx.stub.putState(product.id, updatedProductAsBytes);
        } catch (errPut) {
            return { error: `Failed to pickup prodct: ${product.id}` };
        }
        console.log(`product ${product.id} picked up successfully`);
        return {success:updatedProductAsBytes};
    }

    async deliveryLogistic(ctx, pId , lId) {
        if (!pId) {
            return { error: 'ProductId must be specified' };
        }
        if (!lId) {
            return { error: 'LogisticId must be specified' };
        }
        const userBytes = await ctx.stub.getState(lId);
        if (!userBytes || userBytes.length === 0) {
            return { error: 'Could not find the logistic' };
        }
        const user = JSON.parse(userBytes.toString());
        if (user.User_Type !== 'logistic') {
            return { error: 'User must be a logistic' };
        }
        const productBytes = await ctx.stub.getState(pId);
        if (!productBytes || productBytes.length === 0) {
            return { error: 'Could not find the product' };
        }
        const product = JSON.parse(productBytes.toString());
        if (product.logistic.logistics_data.delivered_date) {
            return { error: 'Product has already delivered'};
        }
        //To Get the transaction TimeStamp from the Channel Header
        const txTimestamp =  await this.getCurrentBlockTimestamp(ctx);
        product.logistic.status = 'delivered';
        product.importer.status = 'recieved';
        product.logistic.logistics_data.delivery_date = txTimestamp;
        const updatedProductAsBytes = Buffer.from(JSON.stringify(product));
        try {
            await ctx.stub.putState(product.id, updatedProductAsBytes);
        } catch (errPut) {
            return { error: `Failed to deliver prodct: ${product.id}` };
        }
        console.log(`product ${product.id} picked up successfully`);
        return {success:updatedProductAsBytes};
    }


    async updateProductImporter(ctx, pid , iid , pprice) {
        // parameter null check
        if (!pid) {
            return { error: 'Product Id must be provided' };
        }
        if (!iid) {
            return { error: 'User Id must be provided' };
        }
        if (!pprice) {
            return { error: 'Product Price must be provided' };
        }
        // get user details from the stub ie. Chaincode stub in network using the user id passed
        let userBytes = await ctx.stub.getState(iid);
        if (!userBytes || userBytes.length === 0) {
            return { error: 'Cannot Find User' };
        }
        let user = JSON.parse(userBytes.toString());
        // User type check for the function
        if (user.User_Type !== 'importer') {
            return { error: 'User type must be a importer' };
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
        product.product.price = price+product.product.price; // product value from UI for the update
        product.payment.producer_amount = price; // product value from UI for the update
        product.status = 'Available'; // product value from UI for the update
        product.importer.status = 'Available'; // product value from UI for the update
        product.product.availablefor = 'retailer'; // product value from UI for the update
        let updatedProductAsBytes = Buffer.from(JSON.stringify(product));
        try {
            await ctx.stub.putState(product.id, updatedProductAsBytes);
        } catch (err) {
            return { error: `Failed to Update : ${product.id}` };
        }
        console.log(`Success in updating Product ${product.id}`);
        return {success:updatedProductAsBytes};
    }

    async sendToRetailer(ctx, pId , rId) {
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
            await ctx.stub.putState(product.id, updatedProductAsBytes);
        } catch (errPut) {
            return { error: `Failed to send to retailer: ${product.id}` };
        }
        console.log(`Sent product ${product.id} to retailer successfully`);
        return {success:updatedProductAsBytes};
    }

    async updateProductRetailer(ctx, pid , uid , pprice , climate , soil_type) {
        // parameter null check
        if (!pid) {
            return { error: 'Product Id must be provided' };
        }
        if (!uid) {
            return { error: 'User Id must be provided' };
        }
        if (!pprice) {
            return { error: 'Product Price must be provided' };
        }
        // get user details from the stub ie. Chaincode stub in network using the user id passed
        let userBytes = await ctx.stub.getState(uid);
        if (!userBytes || userBytes.length === 0) {
            return { error: 'Cannot Find User' };
        }
        let user = JSON.parse(userBytes.toString());
        // User type check for the function
        if (user.User_Type !== 'manufacturer') {
            return { error: 'User type must be a manufacturer' };
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
        product.product.price = price+product.payment.raw_product_amount; // product value from UI for the update
        product.payment.producer_amount = price; // product value from UI for the update
        product.producer.production_data.climate = climate; // product value from UI for the update
        product.producer.production_data.soil_type = soil_type; // product value from UI for the update
        product.status = 'Available'; // product value from UI for the update
        product.producer.status = 'Available'; // product value from UI for the update
        let updatedProductAsBytes = Buffer.from(JSON.stringify(product));
        try {
            await ctx.stub.putState(product.id, updatedProductAsBytes);
        } catch (err) {
            return { error: `Failed to Update : ${product.id}` };
        }
        console.log(`Success in updating Product ${product.id}`);
        return {success:updatedProductAsBytes};
    }
    // not yet used

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
        product.logistic.logistics_data.delivery_date = deliveredDate;
        product.Status = 'Delivered';
        const updatedProductAsBytes = Buffer.from(JSON.stringify(product));
        await ctx.stub.putState(pId, updatedProductAsBytes);
        console.log(`Success in delivering Product ${product.id}`);
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
        await ctx.stub.putState(product.id, updatedProductAsBytes);
        console.log('Success in inspection by  ', product.id);
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
            await ctx.stub.putState(product.id, updatedProductAsBytes);
        } catch (err) {
            return { error: `Failed to place the order: ${product.id}` };
        }
        console.log(`Order placed successfully ${product.id}`);
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
            await ctx.stub.putState(product.id, updatedProductAsBytes);
        } catch (error) {
            return { error: `Failed to Sell To Cosumer : ${product.id}` };
        }
        console.log(`Success in sending Product ${product.id}`);
        return {success:updatedProductAsBytes};
    }

    // query

    async queryAsset(ctx, query) {
        if (!query) {
            return { error: 'Incorrect number of arguments. Expected 1 argument' };
        }
        const productAsBytes = await ctx.stub.getState(query);
        return productAsBytes.toString() ;
    }
    async queryAvailable(ctx, type) {
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
                console.log(Record);
                if(Record.product.type !== 'Raw Material'){
                    if (Record[recordElement].id === recordValue) {
                        buffer.push({ Key, Record });
                    }}
            }
            if (res.done) {
                await resultsIterator.close();
                break;
            }
        }
        console.log(`- queryAllAssets:\n${JSON.stringify(buffer)}`);
        return { success: buffer };
    }
    async queryInvoice(ctx, recordValue) {
        if (!recordValue) {
            return { error: 'recordValue needed' };
        }
        console.log(recordValue);
        const assetType = 'Invoice';
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
                console.log(Record);
                if (Record.recipient === recordValue || Record.sender === recordValue) {
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
    async queryUserByType(ctx, recordValue) {
        if (!recordValue) {
            return { error: 'recordValue needed' };
        }
        console.log(recordValue);
        const assetType = 'User';
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
                console.log(Record);
                if (Record.User_Type === recordValue) {
                    delete Record.Password;
                    delete Record.code;
                    delete Record.pan;
                    delete Record.aadhar;
                    delete Record.bank;
                    delete Record.cart;
                    delete Record.inventory;
                    buffer.push({ Key, Record });
                }
            }
            if (res.done) {
                await resultsIterator.close();
                break;
            }
        }
        console.log(`- query User By Type:\n${JSON.stringify(buffer)}`);
        return { success: buffer };
    }

    async queryShopItem(ctx, type, recordElement, recordValue) {
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
                console.log(Record);
                // console.log(Record[recordElement]);
                // console.log(Record[recordElement].id);
                if(Record.status === 'Available' && Record.product.availablefor === recordValue){
                    // if (Record[recordElement].id === recordValue) {
                    buffer.push({ Key, Record });
                    // }
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
    async queryGetRawMaterial(ctx) {
        // if (!type) {
        //     return { error: 'Asset Type must be provided' };
        // }
        // console.log(recordElement);
        // console.log(recordValue);
        const assetType = 'Product';
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
                console.log(Record);
                // console.log(Record[recordElement]);
                // console.log(Record[recordElement].id);
                if (Record.product.availablefor === 'manufacturer') {
                    buffer.push({ Key, Record });
                }
            }
            if (res.done) {
                await resultsIterator.close();
                break;
            }
        }
        console.log(`- queryGetRawMaterial:\n${JSON.stringify(buffer)}`);
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
    async userById(ctx, userId ) {
        if (!userId) {
            return { error: 'User ID must be provided' };
        }
        const entityUserBytes = await ctx.stub.getState(userId);
        if (!entityUserBytes) {
            return { error: 'Cannot Find Entity' };
        }
        const entityUser = JSON.parse(entityUserBytes.toString());
        const user = {
            status:200,
            Address:entityUser.Address,
            Email:entityUser.Email,
            Name:entityUser.Name,
            User_ID:entityUser.User_ID,
            User_Type:entityUser.User_Type,
            profilePic:entityUser.profilePic,
            aadhar: entityUser.aadhar,
            pan:entityUser.pan,
            bank:entityUser.bank
        };
        return { success: user };
    }
}
module.exports = SupplyChain;
