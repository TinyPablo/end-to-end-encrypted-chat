// const address = "192.168.1.109:33000";
// const address = "178.235.194.75:33000";
// const address = "10.40.31.195:33000";
const address = "127.0.0.1:33000";

document.addEventListener('DOMContentLoaded', () => {    
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

  function resetResponseMessage(){
    responseMessage.innerHTML = '';
  }
  function resetUsernameError(){
    usernameError.innerHTML = '';
    usernameTextInput.style = 'background-color: rgb(176, 176, 176)';
  }
  function resetRecipientError(){
    recipientError.innerHTML = '';
    recipientError.style = 'background-color: rgb(176, 176, 176)';
  }
  function resetPrivateKeyError(){
    privateKeyError.innerHTML = '';
    privateKeyTextInput.style = 'background-color: rgb(176, 176, 176)';
  }
  function resetMessageError(){
    messageError.innerHTML = '';
    messageError.style = 'background-color: rgb(176, 176, 176)';
  }

  usernameTextInput.addEventListener('input', () => {resetUsernameError(); resetResponseMessage();});
  recipientTextInput.addEventListener('input', () => {resetRecipientError(); resetResponseMessage();});
  privateKeyTextInput.addEventListener('input', () => {resetPrivateKeyError(); resetResponseMessage()});
  messageTextarea.addEventListener('input', () => {resetMessageError(); resetResponseMessage()});


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
      
      var verify_code_payload = { username: usernameTextInput.value };
      var public_key_payload = { username: recipientTextInput.value };
      
      const responseMessage = document.getElementById("responseMessage");

      ajaxRequest("get_user_verify_code", verify_code_payload, (verify_code_res) => {
        var isPrivateKeyValid;

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
            privateKeyError.innerHTML = '<br>' + 'incorrect private key';
            privateKeyTextInput.style = 'background-color:  rgb(255, 180, 180)';
            
          }

        ajaxRequest("get_user_public_key", public_key_payload, (public_key_res) => {



          if (public_key_res['success'] && verify_code_res['success'] && isPrivateKeyValid)
          {
            var formData = {
              sender: usernameTextInput.value,
              recipient: recipientTextInput.value,
              message: encrypted_message = encryptMessage(recipient_public_key = public_key_res['message'], messageTextarea.value)
            };
            responseMessage.style = 'color: black';

            
            ajaxRequest("send_message", formData, (res) => {
              responseMessage.innerHTML = JSON.stringify(res);
              if (res['success'])
              {
                responseMessage.style = 'color: black';
              }
              else
              {
                responseMessage.style = 'color: red';
              }
            });
          }
          else
          {
            responseMessage.style = 'color: red';
          }
        });
      });
    });
  });

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



