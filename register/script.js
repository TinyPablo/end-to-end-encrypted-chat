// const address = "192.168.1.109:33000";
// const address = "178.235.194.75:33000";
// const address = "10.40.31.195:33000";
const address = "127.0.0.1:33000";


document.addEventListener('DOMContentLoaded', () => {
  const usernameTextInput = document.getElementById("username");
  const generateKeysButton = document.getElementById('generate_keys');
  const copyPrivateKeyButton = document.getElementById('copy_private_key');
  const downloadPrivateKeyButton = document.getElementById('download_private_key');

  const publicKeyTextInput = document.getElementById('public_key');
  const privateKeyTextInput = document.getElementById('private_key');

  const usernameError = document.getElementById('username_error');
  const keysError = document.getElementById('keys_error');
  const responseMessage = document.getElementById("responseMessage");


  function resetResponseMessage(){
    responseMessage.innerHTML = '';
  }
  function resetUsernameError(){
    usernameError.innerHTML = '';
    usernameTextInput.style = 'background-color: rgb(176, 176, 176)';
  }
  function resetKeysError(){
    keysError.innerHTML = '';

    publicKeyTextInput.style = 'background-color: rgb(176, 176, 176)';
    privateKeyTextInput.style = 'background-color: rgb(176, 176, 176)';
  }

  usernameTextInput.addEventListener('input', () => {resetUsernameError(); resetResponseMessage(); usernameTextInput.value = usernameTextInput.value.trim()});
  publicKeyTextInput.addEventListener('input', () => {resetKeysError(); resetResponseMessage()});
  privateKeyTextInput.addEventListener('input', () => {resetKeysError(); resetResponseMessage()});

  generateKeysButton.addEventListener('click', () => {
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
        keysError.innerHTML = '<br>' + 'invalid keys';
        publicKeyTextInput.style = 'background-color:  rgb(255, 180, 180)';
        privateKeyTextInput.style = 'background-color:  rgb(255, 180, 180)';
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
            responseMessage.innerHTML = '<br>' + res['message'];
          }
          else
          {
            if (res['error']['username'])
            {
              usernameError.innerHTML = '<br>' + res['error']['username'];
              usernameTextInput.style = 'background-color:  rgb(255, 180, 180)';
            }
            if (res['error']['keys'])
            {
              keysError.innerHTML = '<br>' + res['error']['keys'];
              publicKeyTextInput.style = 'background-color:  rgb(255, 180, 180)';
              privateKeyTextInput.style = 'background-color:  rgb(255, 180, 180)';
            }
          }
        }
      );
    });
  });

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
  
    const encrypted = publicKeyForge.encrypt(message, 'RSA-OAEP', {
      md: forge.md.sha256.create(),
    });
  
    return forge.util.encode64(encrypted);
  }
  function decryptMessage(privateKey, encryptedMessage) {
    const formattedPrivateKey = '-----BEGIN PRIVATE KEY-----\n' + privateKey + '\n-----END PRIVATE KEY-----';
    const privateKeyForge = forge.pki.privateKeyFromPem(formattedPrivateKey);
  
    const encrypted = forge.util.decode64(encryptedMessage);
    const decrypted = privateKeyForge.decrypt(encrypted, 'RSA-OAEP', {
      md: forge.md.sha256.create(),
    });
  
    return decrypted;
  }
  
});
