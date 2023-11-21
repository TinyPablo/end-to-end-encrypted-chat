const forge = require('node-forge');
function generateKeyPair() {
    const rsa = forge.pki.rsa;
    const keyPair = rsa.generateKeyPair({ bits: 2048, e: 0x10001 });
    return keyPair;
  }
  
function encryptMessage(publicKey, message) {
  const publicKeyForge = forge.pki.publicKeyFromPem(publicKey);
  const encrypted = publicKeyForge.encrypt(message, "RSA-OAEP", {
    md: forge.md.sha256.create(),
  });
  return forge.util.encode64(encrypted);
}
  
function decryptMessage(privateKey, encryptedMessage) {
  const privateKeyForge = forge.pki.privateKeyFromPem(privateKey);
  const encrypted = forge.util.decode64(encryptedMessage);
  const decrypted = privateKeyForge.decrypt(encrypted, "RSA-OAEP", {
    md: forge.md.sha256.create(),
  });
  return decrypted;
}

const keyPair = generateKeyPair();
const publicKey = forge.pki.publicKeyToPem(keyPair.publicKey);
const privateKey = forge.pki.privateKeyToPem(keyPair.privateKey);

const originalMessage = "Hello, World!";
const encryptedMessage = encryptMessage(publicKey, originalMessage);
const decryptedMessage = decryptMessage(privateKey, encryptedMessage);

console.log('public key: ',publicKey);
console.log('priv key: ',privateKey);
console.log("Original message:", originalMessage);
console.log("Encrypted message:", encryptedMessage);
console.log("Decrypted message:", decryptedMessage);
  