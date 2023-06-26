const auth = 'Basic ' + Buffer.from(process.env.PROJECTID + ':' + process.env.PROJECTSECRET).toString('base64');
const ipfsClient = require('ipfs-http-client');
const { Readable } = require('stream');
const ipfs = new ipfsClient({
    host: 'ipfs.infura.io',
    port: 5001,
    protocol: 'https',
    headers: {
        authorization: auth,
    },
});

// const auth = 'Basic ' + Buffer.from(process.env.PROJECTID + ':' + process.env.PROJECTSECRET).toString('base64');
// const ipfsClient = require('ipfs-http-client');
// const ipfs = new ipfsClient({
//     host: 'ipfs.infura.io',
//     port: 5001,
//     protocol: 'https',
//     headers: {
//         authorization: auth,
//     },
// });

module.exports.addToIpfs = function(data) {
    // const fileStream = new Readable();
    // fileStream.push(data.buffer);
    // fileStream.push(null);

    return ipfs.add(data).then((response) => {
        console.log('file');
        console.log(response);
        let hash = response.path;
        return hash;
    }).catch((err) => {
        console.log(err);
        throw err;
    });
};

