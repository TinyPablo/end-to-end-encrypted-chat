document.addEventListener('DOMContentLoaded', () => {    

  $(document).ready(() => {
    function ajaxRequest(url, formData, successCallback) {
      $.ajax({
        type: "POST",
        url: "http://192.168.1.109:33000/" + url,
        data: JSON.stringify(formData),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        headers: { "Access-Control-Allow-Origin": "*" },
        success: successCallback
      });
    }

    $("#send_message_form").submit(function (event) {
      event.preventDefault();
      var payload = { username: $("#recipient").val() };

      ajaxRequest("get_public_key_by_username", payload, (public_key_response) => { 
        const response = document.getElementById("response");
        response.innerHTML = JSON.stringify(public_key_response);

        if (public_key_response['success'])
        {
          response.style = 'color: black';
          var recipient_public_key = public_key_response['message'];
          const encrypted_message = encryptMessage(recipient_public_key, $("#message").val());

          console.log('encrypted message:', encrypted_message);

          var formData = {
            username: $("#username").val(),
            recipient: $("#recipient").val(),
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
});


function encryptMessage(publicKey, message) {
  const publicKeyForge = forge.pki.publicKeyFromPem(publicKey);
  const encrypted = publicKeyForge.encrypt(message, 'RSA-OAEP', {
    md: forge.md.sha256.create(),
  });
  return forge.util.encode64(encrypted);  }

