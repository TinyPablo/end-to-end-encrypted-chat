// const address = "192.168.1.109:33000";
const address = "178.235.194.75:33000";
// const address = "10.40.31.135:33000";
// const address = "127.0.0.1:33000";
// const address = "192.168.1.100:33000";

  
const usernameTextInput = document.getElementById("username");
const recipientTextInput = document.getElementById("recipient");
const privateKeyTextInput = document.getElementById('private_key');  
const messageTextarea = document.getElementById("message");

const loadPrivateKeyButton = document.getElementById('load_private_key');

const usernameError = document.getElementById('username_error');
const recipientError = document.getElementById('recipient_error');
const privateKeyError = document.getElementById('private_key_error');
const messageError = document.getElementById('message_error');
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
function resetRecipientError(){
  recipientError.innerHTML = '';
  recipientTextInput.style = normalColor;
}
function resetPrivateKeyError(){
  privateKeyError.innerHTML = '';
  privateKeyTextInput.style = normalColor;
}
function resetMessageError(){
  messageError.innerHTML = '';
  messageError.style = normalColor;
}

function setResponseMessage(message){
  responseMessage.innerHTML = '<br>' + message;
  resetMessageError();
  return;
}
function setUsernameError(error){
  usernameError.innerHTML = '<br>' + error;
  usernameTextInput.style = errorColor;
  resetMessageError();
  remindOfErrors();
}
function setRecipientError(error){
  recipientError.innerHTML = '<br>' + error;
  recipientTextInput.style = errorColor;
  resetMessageError();
  remindOfErrors();
}
function setPrivateKeyError(error){
  privateKeyError.innerHTML = '<br>' + error;
  privateKeyTextInput.style = errorColor;
  resetMessageError();
  remindOfErrors();
}
function setMessageError(error){
  messageError.innerHTML = error;
  messageTextarea.style = errorColor;
  resetMessageError();
  remindOfErrors();
}

function remindOfErrors(){
  responseMessage.innerHTML = '<br>' + 'fix errors';
  return;
}


usernameTextInput.addEventListener('input', () => {
  resetUsernameError();
});
recipientTextInput.addEventListener('input', () => {
  resetUsernameError();
});
privateKeyTextInput.addEventListener('input', () => {
  resetUsernameError();
});
messageTextarea.addEventListener('input', () => {
  resetUsernameError();
});


loadPrivateKeyButton.addEventListener('click', () => {
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.addEventListener('change', (event) => {
    const selectedFile = event.target.files[0];

    const fileReader = new FileReader();

    fileReader.addEventListener('load', (fileEvent) => {
      const fileContent = fileEvent.target.result;

      privateKeyTextInput.value = fileContent;
    });
    fileReader.readAsText(selectedFile);
  });
  fileInput.click();
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

  $("#send_message_form").submit((event) => {
    event.preventDefault();
    
    resetUsernameError();
    resetRecipientError();
    resetPrivateKeyError();
    resetMessageError();
    resetResponseMessage();

    var verify_code_payload = { username: usernameTextInput.value };
    var public_key_payload = { username: recipientTextInput.value };

    ajaxRequest("get_user_verify_code", verify_code_payload, (verify_code_res) => {
      var isPrivateKeyValid;

      if (!verify_code_res['success']) {
        if (verify_code_res['error']['username']) {
          setUsernameError(verify_code_res['error']['username']);
        }
      }
        try
        {
          isPrivateKeyValid = decryptMessage(privateKeyTextInput.value, 
          verify_code_res['message']) == usernameTextInput.value;
        }
        catch (error)
        {
          isPrivateKeyValid = false;
        }

        if (!isPrivateKeyValid) {
          setPrivateKeyError('incorrect private key');
          return;
        }

      ajaxRequest("get_user_public_key", public_key_payload, (public_key_res) => {
        
        if (!public_key_res['success']) {
          if (public_key_res['error']['username']) {
            setRecipientError('invalid recipient');
          }
        }

        console.log('verify_code_res: ', verify_code_res);
        console.log('public_key_res: ', public_key_res);
        console.log('isPrivateKeyValid: ', isPrivateKeyValid);

        
        var formData = {
          sender: usernameTextInput.value,
          recipient: recipientTextInput.value,
          message: encryptMessage(recipient_public_key = public_key_res['message'], messageTextarea.value)
        };

        
        ajaxRequest("send_message", formData, (res) => {
          if (res['success'])
          {
            setResponseMessage(res['message'])
          }
          else
          {
            if (res['error']['message'])
            {
              setMessageError(res['error']['message']);
            }
          }
        });
      });
    });
  });
});

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