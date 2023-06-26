const axios = require('axios');
const token = process.env.KYCHUB_API;
const endpoint = 'https://api.kychub.com';
module.exports.panVerification = function(data) {
    return new Promise((resolve, reject) => {
        data = JSON.stringify({
            pan: data.panNo,
            name: data.name,
        });

        const url = process.env.KYC_URL + '/kyc/india/v2/fetch-pan';

        const config = {
            method: 'post',
            maxBodyLength: Infinity,
            url,
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + token,
            },
            data,
        };

        axios(config)
            .then((response) => {
                resolve(response.data);
            })
            .catch((error) => {
                reject(error);
            });
    });
};


module.exports.aadharVerify = function(data) {
    return new Promise((resolve, reject) => {
        const url = endpoint + '/kyc/india/v2/document-validation';
        console.log(data);
        console.log(data);
        const jsonData = JSON.stringify({
            number: data.number,
            type: data.type,
        });

        const config = {
            method: 'post',
            maxBodyLength: Infinity,
            url,
            headers: {
                Authorization: 'Bearer ' + token,
                'Content-Type': 'application/json',
            },
            data: jsonData,
        };

        axios(config)
            .then((response) => {
                resolve(response.data);
                console.log(response.data);
            })
            .catch((error) => {
                console.log(error);
                reject(error);
            });
    });
};

module.exports.bankVerification = function(data) {
    return new Promise((resolve, reject) => {
        const jsonData = JSON.stringify({
            name: data.name,
            account_number: data.accountNumber,
            ifsc: data.ifsc,
        });
        console.log(jsonData);
        const url = process.env.KYC_URL + '/kyc/india/v2/verify-bank-account';
        const config = {
            method: 'post',
            maxBodyLength: Infinity,
            url,
            headers: {
                Authorization: 'Bearer ' + token,
                'Content-Type': 'application/json',
            },
            data: jsonData,
        };
        axios(config)
            .then((response) => {
                resolve(response.data);
            })
            .catch((error) => {
                reject(error);
            });
    });
};
