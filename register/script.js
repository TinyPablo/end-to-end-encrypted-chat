const address = "192.168.1.109:33000";


function encryptMessage(publicKey, message) {

  const publicKeyForge = forge.pki.publicKeyFromPem(publicKey);
  const encrypted = publicKeyForge.encrypt(message, 'RSA-OAEP', {
    md: forge.md.sha256.create(),
  });
  return forge.util.encode64(encrypted);  }

document.addEventListener('DOMContentLoaded', () => {
  const usernameTextInput = document.getElementById("username");
  const generateKeysButton = document.getElementById('generate_keys');
  const copyPrivateKeyButton = document.getElementById('copy_private_key');
  const downloadPrivateKeyButton = document.getElementById('download_private_key');

  const publicKeyTextarea = document.getElementById('public_key');
  const privateKeyTextarea = document.getElementById('private_key');

  generateKeysButton.addEventListener('click', () => {
    const keyPair = generateKeyPair();

    publicKeyTextarea.value = keyPair.publicKey;
    privateKeyTextarea.value = keyPair.privateKey;
  });

  copyPrivateKeyButton.addEventListener('click', () => {
    copyToClipboard(privateKeyTextarea);
  });

  downloadPrivateKeyButton.addEventListener('click', () => {
    const blob = new Blob([privateKeyTextarea.value], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = usernameTextInput.value + '_private_key.txt';
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
      var formData = {
          username: usernameTextInput.value,
          public_key: publicKeyTextarea.value
      };
      ajaxRequest("register", formData, (res) => {
        const response = document.getElementById("response");
        console.log(res);
        response.innerHTML = res['message'];
        if (res['success'])
        {
          response.style = 'color: black';
        }
        else
        {
          response.style = 'color: red';
        }
      });
    });
  });

  function generateKeyPair() {
    const rsa = forge.pki.rsa;
    const keyPair = rsa.generateKeyPair({ bits: 2048, e: 0x10001 });
    return {
      publicKey: forge.pki.publicKeyToPem(keyPair.publicKey),
      privateKey: forge.pki.privateKeyToPem(keyPair.privateKey)
    }
  }
});
