// const address = "192.168.1.109:33000";
const address = "178.235.194.75:33000";
// const address = "10.40.31.135:33000";
// const address = "127.0.0.1:33000";
// const address = "192.168.1.100:33000";


const usernameTextInput = document.getElementById("username");
const generateKeysButton = document.getElementById('generate_keys');
const copyPrivateKeyButton = document.getElementById('copy_private_key');
const downloadPrivateKeyButton = document.getElementById('download_private_key');

const publicKeyTextInput = document.getElementById('public_key');
const privateKeyTextInput = document.getElementById('private_key');

const usernameError = document.getElementById('username_error');
const keysError = document.getElementById('keys_error');
const responseMessage = document.getElementById("responseMessage");


const normalColor = 'background-color: rgb(176, 176, 176)';
const errorColor = 'background-color:  rgb(255, 180, 180)';



function resetResponseMessage(){
  responseMessage.innerHTML = '';
}
function resetUsernameError(){
  usernameError.innerHTML = '';
  usernameTextInput.style = normalColor;
}
function resetKeysError(){
  keysError.innerHTML = '';

  publicKeyTextInput.style = normalColor;
  privateKeyTextInput.style = normalColor;
}

function setResponseMessage(message){
  responseMessage.innerHTML = '<br>' + message;
  return;
}
function setUsernameError(error){
  usernameError.innerHTML = '<br>' + error;
  usernameTextInput.style = errorColor;
  resetResponseMessage();
  remindOfErrors();
}
function setKeysError(error){
  keysError.innerHTML = '<br>' + error;

  publicKeyTextInput.style = errorColor;
  privateKeyTextInput.style = errorColor;
  resetResponseMessage();
  remindOfErrors();
}

function remindOfErrors(){
  responseMessage.innerHTML = '<br>' + 'fix errors';
  return;
}


usernameTextInput.addEventListener('input', () => {
  resetUsernameError();
});
publicKeyTextInput.addEventListener('input', () => {
  resetKeysError();
});
privateKeyTextInput.addEventListener('input', () => {
  resetKeysError();
});


copyPrivateKeyButton.addEventListener('click', () => {
  copyToClipboard(privateKeyTextInput);
});

downloadPrivateKeyButton.addEventListener('click', () => {
  const blob = new Blob([privateKeyTextInput.value], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = usernameTextInput.value + '-private_key.txt';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
});

generateKeysButton.addEventListener('click', () => {
  generatePairOfKeys();
});

$(document).ready(() => {
  function ajaxRequest(url, formData, successCallback) {
    $.ajax({
        type: "POST",
        url: "http://" + address + "/" + url,
        data: JSON.stringify(formData),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        headers: { "Access-Control-Allow-Origin": "*" },
        success: successCallback
    });
  }

  $("#register_form").submit((event) => {
    event.preventDefault();

    resetUsernameError();
    resetKeysError();
    resetResponseMessage();

    var verify_code;

    try
    {
      verify_code = encryptMessage(publicKeyTextInput.value, usernameTextInput.value);
      console.log(decryptMessage(privateKeyTextInput.value, verify_code) == usernameTextInput.value);
    }
    catch (error)
    {
      setKeysError('invalid keys !!!. Use "generate keys" button');
      return;
    }

    var formData = {
      username: usernameTextInput.value,
      public_key: publicKeyTextInput.value,
      verify_code: verify_code
    };
    
      ajaxRequest("register", formData, (res) => {
        console.log('response:', res);
        if (res['success'])
        {
          setResponseMessage(res['message']);
        }
        else
        {
          if (res['error']['username'])
          {
            setUsernameError(res['error']['username']);
          }
          if (res['error']['keys'])
          {
            setKeysError(res['error']['keys']);
          }
        }
      }
    );
  });
});

function copyToClipboard(textarea) {
    textarea.select();
    document.execCommand('copy');
}

function generatePairOfKeys() {
  generateKeysButton.innerHTML = 'wait...';
  generateKeysButton.disabled = true;

  setTimeout(() => {
      const keyPair = generateKeyPair();

      publicKeyTextInput.value = keyPair.publicKey;
      privateKeyTextInput.value = keyPair.privateKey;

      resetKeysError();
      resetResponseMessage()
      generateKeysButton.innerHTML = 'generate keys';
      generateKeysButton.disabled = false;
  }, 1);
}

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