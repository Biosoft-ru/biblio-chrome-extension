const biostoreUrl = 'http://localhost:8080';
const serverName = 'micro.biouml.org';

$(document).on('submit','form',function(e) {
  $('#message').text("");
  e.preventDefault();

  let username = $( "#username" ).val();
  if(username === undefined)username = "";

  const data = {
    action: "login",
    serverName: serverName,
    username: username,
    password: $( "#password" ).val()
  };

  $.post( biostoreUrl + "/biostore/permission", data, function( res ) {
    const json = JSON.parse(res);
    chrome.storage.local.set({jwtoken: json.jwtoken, username: username, jwtoken_get_time: new Date().getTime()});

    checkState();
  });

});

$(document).on("click", "#logout", function(e) {
  $('#message').text("");
  e.preventDefault();

  chrome.storage.local.get(['username', 'jwtoken'], function(result) {
    $.post( biostoreUrl + "/biostore/permission", { action: "logout", jwtoken: result.jwtoken }, function( res ) {
      chrome.storage.local.clear(function () {
        checkState();
      });
    }).fail(function (data) {
      alert("Fail logout" + data);

      chrome.storage.local.clear(function () {
        checkState();
      });
    });
  });

});

function checkState() {
  chrome.storage.local.get(['username', 'jwtoken'], function(result) {
    if(result.jwtoken !== undefined)
    {
      $('#current-username').text(result.username);

      $.get( biostoreUrl + "/biostore/permission?action=login&serverName="+serverName+"&username=" + result.username + "&jwtoken=" + result.jwtoken, function( res ) {
        const json = JSON.parse(res);

        if(json.type === "ok"){
          $('#login-block').hide();
          $('#logout-block').show();
        }else{
          $('#login-block').show();
          $('#logout-block').hide();
          console.log(res);
          $('#message').text(json.message);
        }
      });

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
