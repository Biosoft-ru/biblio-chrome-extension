$(document).on('submit','form',function(e) {
  e.preventDefault();

  let username = $( "#username" ).val();
  if(username === undefined)username = "";

  const data = {
    action: "login",
    serverName: "micro.biouml.org",
    username: username,
    password: $( "#password" ).val()
  };

  chrome.storage.local.set({username: username});

  $.post( "http://localhost:8080/biostore/permission", data, function( res ) {
    const json = JSON.parse(res);
    chrome.storage.local.set({jwtoken: json.jwtoken});

    checkState();
  });

});

$(document).on("click", "#logout", function(e) {
  e.preventDefault();

  chrome.storage.local.clear();
  checkState();
});

function checkState() {
  chrome.storage.local.get(['jwtoken'], function(result) {
    if(result.jwtoken !== undefined)
    {
      console.log(parseJwt(result.jwtoken));
      $('#login-block').hide();
      $('#logout-block').show();
    }else{
      $('#login-block').show();
      $('#logout-block').hide();
    }
  });
}

checkState();

function parseJwt(token) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace('-', '+').replace('_', '/');
  return JSON.parse(window.atob(base64));
}
