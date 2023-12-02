const forge = require('node-forge');

function generateKeyPair() {
    const rsa = forge.pki.rsa;
    const keyPair = rsa.generateKeyPair({ bits: 2048, e: 0x10001 });

    const publicKey = forge.pki.publicKeyToPem(keyPair.publicKey);
    const privateKey = forge.pki.privateKeyToPem(keyPair.privateKey);

    const strippedPublicKey = publicKey.replace(/-----BEGIN PUBLIC KEY-----|-----END PUBLIC KEY-----|\r|\n/g, '');
    const strippedPrivateKey = privateKey.replace(/-----BEGIN RSA PRIVATE KEY-----|-----END RSA PRIVATE KEY-----|\r|\n/g, '');

    return {
        publicKey: strippedPublicKey,
        privateKey: strippedPrivateKey
    };
}

function encryptMessage(publicKey, message) {
    const formattedPublicKey = '-----BEGIN PUBLIC KEY-----\n' + publicKey + '\n-----END PUBLIC KEY-----';
    const publicKeyForge = forge.pki.publicKeyFromPem(formattedPublicKey);
  
    var encryptedMessage = '';
    const maxBlockLen = 190;
    for (var i = 0; i < message.length; i += maxBlockLen) {
        const block = message.substring(i, i + maxBlockLen);
        const encryptedBlock = publicKeyForge.encrypt(block, 'RSA-OAEP', {
        md: forge.md.sha256.create()
        });
        encryptedMessage += encryptedBlock;
    }
    return forge.util.encode64(encryptedMessage);
}

function decryptMessage(privateKey, encryptedMessage) {
    const formattedPrivateKey = '-----BEGIN PRIVATE KEY-----\n' + privateKey + '\n-----END PRIVATE KEY-----';
    const privateKeyForge = forge.pki.privateKeyFromPem(formattedPrivateKey);
  
    encryptedMessage = forge.util.decode64(encryptedMessage);
    var decryptedMessage = '';
    const blockLen = 256;
    for (let i = 0; i < encryptedMessage.length; i += blockLen) {
        const currBlock = encryptedMessage.substring(i, i + blockLen);
        decryptedMessage += privateKeyForge.decrypt(currBlock, 'RSA-OAEP', {
            md: forge.md.sha256.create()
        });
    }
    return decryptedMessage;
}