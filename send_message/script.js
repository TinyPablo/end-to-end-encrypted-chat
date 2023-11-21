// const address = "192.168.1.109:33000";
const address = "178.235.194.75:33000";


document.addEventListener('DOMContentLoaded', () => {    
  const usernameTextInput = document.getElementById("username");
  const recipientTextInput = document.getElementById("recipient");
  const messageTextarea = document.getElementById("message");

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
      var payload = { username: recipientTextInput.value };

      ajaxRequest("get_user_public_key", payload, (public_key_response) => { 
        const response = document.getElementById("response");
        response.innerHTML = JSON.stringify(public_key_response);

        if (public_key_response['success'])
        {
          response.style = 'color: black';
          var recipient_public_key = public_key_response['message'];
          const encrypted_message = encryptMessage(recipient_public_key, messageTextarea.value);

          console.log('encrypted message:', encrypted_message);

          var formData = {
            sender: usernameTextInput.value,
            recipient: recipientTextInput.value,
            message: encrypted_message
          };
          ajaxRequest("send_message", formData, (res) => {
            response.innerHTML = JSON.stringify(res);
            if (res['success'])
            {
              response.style = 'color: black';
            }
            else
            {
              response.style = 'color: red';
            }
          });
        }
        else
        {
            response.style = 'color: red';
        }
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
});



