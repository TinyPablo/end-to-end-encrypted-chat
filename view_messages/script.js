// const address = "192.168.1.109:33000";
// const address = "178.235.194.75:33000";
// const address = "10.40.31.195:33000";
const address = "127.0.0.1:33000";


document.addEventListener('DOMContentLoaded', () => {
  const loadPrivateKeyButton = document.getElementById('load_private_key');
  const privateKeyTextInput = document.getElementById('private_key');    
  const usernameTextInput = document.getElementById("username");

  
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
            headers: {
                "Access-Control-Allow-Origin": "*"
            },
            success: successCallback
        });
    }

    $("#view_messages_form").submit((event) => {
        event.preventDefault();
        var formData = {
          username: usernameTextInput.value
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
                console.log('private key: ', privateKeyTextInput.value);
                console.log('priv key value: ', privateKeyTextInput.value)
                response_text[i]['message'] = decryptMessage(privateKeyTextInput.value, response_text[i]['message']);
              }
              response.innerHTML = JSON.stringify(response_text);
              response.style = 'color: black';
            }
        });
    });

  });

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

