document.addEventListener('DOMContentLoaded', () => {
  const loadPrivateKeyButton = document.getElementById('load_private_key');
  const privateKeyTextarea = document.getElementById('private_key');

  loadPrivateKeyButton.addEventListener('click', function() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.addEventListener('change', function(event) {
      const selectedFile = event.target.files[0];
  
      const fileReader = new FileReader();
  
      fileReader.addEventListener('load', function(fileEvent) {
        const fileContent = fileEvent.target.result;
  
        privateKeyTextarea.value = fileContent;
      });
      fileReader.readAsText(selectedFile);
    });
    fileInput.click();
  });    
          
  $(document).ready(() => {
    function ajaxRequest(url, formData, successCallback) {
        $.ajax({
            type: "POST",
            url: "http://192.168.1.109:33000/" + url,
            data: JSON.stringify(formData),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            headers: {
                "Access-Control-Allow-Origin": "*"
            },
            success: successCallback
        });
    }

    $("#view_messages_form").submit(function (event) {
        event.preventDefault();
        var formData = {
          username: $("#username").val()
        };

        ajaxRequest("view_messages", formData, (res) => {
            const response = document.getElementById("response");
            console.log(res);

            response.innerHTML = JSON.stringify(res);
            response.style = 'color: red';
            
            console.log('res:', res)
            console.log('messages.length: ',res['message'].length)

            if (res['success'] && res['message'].length != 0)
            {
              var response_text = res['message'];
              for (let i = 0; i < response_text.length; i++)
              {
                console.log('encrypted_message: ',response_text[i]['message']);
                console.log('private key: ',privateKeyTextarea.value);
                console.log('priv key value: ',$("#private_key").val())
                response_text[i]['message'] = decryptMessage($("#private_key").val(), response_text[i]['message']);
              }
              response.innerHTML = JSON.stringify(response_text);
              response.style = 'color: black';
            }
        });
    });

  });
});

function decryptMessage(privateKey, encryptedMessage) {
  const privateKeyForge = forge.pki.privateKeyFromPem(privateKey);
  const encrypted = forge.util.decode64(encryptedMessage);
  const decrypted = privateKeyForge.decrypt(encrypted, 'RSA-OAEP', {
    md: forge.md.sha256.create(),
  });
  return decrypted;
}