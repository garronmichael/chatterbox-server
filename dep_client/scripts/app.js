// YOUR CODE HERE:

//get message function:
//get message from Parse
//escape message content
//display and append to body


var app = {
  server: 'http://127.0.0.1:3000/1/classes/chatterbox'
};

app.fetch = function(number){
    var options = {order:'-createdAt',limit:number,
    where: {roomname: app.settings.roomName}};
    $.ajax({
      // always use this url
      url: app.server,
      type: 'GET',
      // data: JSON.stringify(message),
      contentType: 'application/json',
      // data: options,
      success: function (data) {
        console.log(data);
        app.addMessage(JSON.parse(data).results);
        // console.log(data);
      },
      error: function (data) {
        // see: https://developer.mozilla.org/en-US/docs/Web/API/console.error
        console.error('chatterbox: Failed to receive message,trying again...');
        setTimeout(app.fetch,2000);
      }
    });
  };

app.addMessage = function(messages){
  // console.log(messages);
  var $stream = $('#chats');
  _.each(messages,function(value){
    if (app.settings.alreadyReceived.indexOf(value.objectId) === -1) {
      // console.log(value.encrypted);
      if (value.crypto === true){
        value.text = app.decrypt(value.text);
      }
      if (!value.username) value.username = "Anaughtymouse";
      var $message = $('<li><a href="#" class="username">' +
        validator.escape(value.username) +
        '</a>: "' +validator.escape(value.text)+'"</li>');
      if (app.settings.friends.indexOf(value.username) > -1) {
        $message.addClass('friend');
      }
      $stream.prepend($message);
      app.settings.alreadyReceived.push(value.objectId);
      //let's keep the chat tidy
      if ($stream.children().length > 20){
        $stream.last().remove();
      }
    }
  });

  $('.username').on('click', function() {
    app.addFriend($(this).text());
  });
  timerID = setTimeout(function(){app.fetch(1)},2000);
};

app.send = function(message){
  // var data = {
  //   username: this.settings.username,
  //   text: message,
  //   roomname: this.settings.roomName
  // };
  console.log(message);
  $.ajax({
    // always use this url
    url: app.server,
    type: 'POST',
    data: JSON.stringify(message),
    contentType: 'application/json',
    success: function (data) {
      console.log('chatterbox: Message sent');
    },
    error: function (data) {
      // see: https://developer.mozilla.org/en-US/docs/Web/API/console.error
      console.error('chatterbox: Failed to send message');
    }
  });
};

app.activateEncryption = function(input){
  var $encBox = $('#encBox');
  var input = input || $encBox.val();
  app.settings.passphrase = input;
  app.settings.encryption = true;
  $encBox.val('');
  $('#encryption').removeClass('enc-off').addClass('enc-on').text('on');
};

app.encrypt = function(message){
  var encrypted = CryptoJS.AES.encrypt(message,app.settings.passphrase, { format: JSONFormatter });
  // var encrypted = CryptoJS.AES.encrypt(message,app.settings.passphrase);
  return encrypted.toString();
};

app.decrypt = function(message){
  var decrypted = CryptoJS.AES.decrypt(message,app.settings.passphrase, { format: JSONFormatter });
  console.log(decrypted);
  return decrypted.toString(CryptoJS.enc.Utf8);
};

app.settings = {
  friends: [],
  roomName: 'lobby',
  username: 'Anonymous',
  lastMessageReceived: null,
  alreadyReceived: [],
  timerID: null,
  encryption: false,
  rooms: ['lobby'],
  passphrase: ''
};

app.clearMessages = function(){
  $('#chats').empty();
};

app.handleSubmit = function(){
  var $box = $('#message');
  var input = $box.val();
  if (app.settings.encryption){
    input = app.encrypt(input);
  }
  app.send({
    username: app.settings.username,
    text: input,
    roomname: app.settings.roomName,
    crypto: app.settings.encryption
  });
  $('#message').val('');
};

app.init = function(){

  var $send = $('#send');
  $send.on('submit',function(event){
    event.preventDefault();
    app.handleSubmit();
  });

  $('#roomButton').on('click',function(){
    var $roomBox = $('#roomBox');
    var input = $roomBox.val();
    clearTimeout(timerID);
    input = validator.escape(input);
    app.addRoom(input);
    app.changeRoom(input);
    app.clearMessages();
    app.fetch(10);
  });

  $('#encForm').on('submit',function(e){
    e.preventDefault();
    app.activateEncryption();
  });

  var bar = window.location.search;
  app.settings.username = bar.slice(bar.indexOf("=")+1);
  $('#roomName').text('Current room: ' +app.settings.roomName);
  $('#encryption').text('off').addClass('enc-off');
  // console.log(this)

  var initPhrase = prompt('Enter your passphrase to access encrypted messages.') || '';
  if (initPhrase !== '') app.activateEncryption(initPhrase);
  app.fetch(10);
};

app.addRoom = function(name){
  app.settings.rooms.push(name);
  var $room = $('<li>' +validator.escape(name) + '</li>');
  $('#roomSelect').append($room);
};

app.addFriend = function(name){
  app.settings.friends.push(name);
};

app.changeRoom = function(name){
  app.settings.roomName = name;
  $('#roomName').text('Curent room: ' + app.settings.roomName);
};

$(document).ready(app.init);

//example JSON formatter from CryptoJS project
var JSONFormatter = {
        stringify: function (cipherParams) {
            // create json object with ciphertext
            var jsonObj = {
                ct: cipherParams.ciphertext.toString(CryptoJS.enc.Base64)
            };

            // optionally add iv and salt
            if (cipherParams.iv) {
                jsonObj.iv = cipherParams.iv.toString();
            }
            if (cipherParams.salt) {
                jsonObj.s = cipherParams.salt.toString();
            }

            // stringify json object
            return JSON.stringify(jsonObj);
        },

        parse: function (jsonStr) {
            // parse json string
            var jsonObj = JSON.parse(jsonStr);

            // extract ciphertext from json object, and create cipher params object
            var cipherParams = CryptoJS.lib.CipherParams.create({
                ciphertext: CryptoJS.enc.Base64.parse(jsonObj.ct)
            });

            // optionally extract iv and salt
            if (jsonObj.iv) {
                cipherParams.iv = CryptoJS.enc.Hex.parse(jsonObj.iv)
            }
            if (jsonObj.s) {
                cipherParams.salt = CryptoJS.enc.Hex.parse(jsonObj.s)
            }

            return cipherParams;
        }
    };


//function: escape message content
