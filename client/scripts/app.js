// YOUR CODE HERE:

var parseURL = 'https://api.parse.com/1/classes/chatterbox'
var nodeURL = 'http://127.0.0.1:3000/classes/chatterbox/'

var getMessages = function() {
  $.ajax({
    // always use this url
    url: nodeURL,
    type: 'GET',
    contentType: 'application/json',
    data: {
      limit: 50,
      order: '-createdAt'
    },
    success: success,
    error: function (data) {
      // see: https://developer.mozilla.org/en-US/docs/Web/API/console.error
      console.error('chatterbox: Failed to send message');
    }
  });
};

var success = function(data) {
  console.log(data);
  var $messages = $('.messages');
  $('.message').remove();
  for(var i = data.results.length - 1; i > -1; i--) {
    var room = encodeURI(data.results[i].roomname);
    var $message = $('.message:last-child');
    var text = encodeURI(data.results[i].text);
    text = text.replace(/\%20/g, ' ');
    var user = encodeURI(data.results[i].username);
    user = user.replace(/\%20/g, ' ');
    $messages.append('<div class="message well ' + room + '"></div>');
    if (friends.indexOf(user) !== -1) {
      $message.addClass('friend');
    }
    $message.append('<div class="user">'+user+': </div>');
    $message.append('<div class="text">'+text+'</div>');
  }
  $('.user').click(function(event) {
    var friend = $(event.target).text().slice(0,-2);
    friends.push(friend);
    friends = _.uniq(friends);
  });
  populateRooms(data.results);
  filterByRoom();
};

var populateRooms = function(results) {

  var selectedRoom = $('option:checked').val();
  $('option').remove();
  var allRooms = _.pluck(results, 'roomname');
  allRooms.sort();
  allRooms = _.uniq(allRooms);
  for(var i = 0; i < allRooms.length; i++) {
   var room = encodeURI(allRooms[i]);
   room = room.replace(/\%20/g, ' ');
   $('select').append('<option value=' + room + '>' + room + '</option>');
  }
  $('option[value="' + selectedRoom + '"]').prop('selected', true);
};

var submit = function() {
  var username = $('.userBox').val();
  var text = $('.messageBox').val();
  $('.messageBox').val('');
  var room = $('.roomBox').val() || $('select').val();
  $('.roomBox').val('');
  if (room === null) {
    room = '';
  }
  var message = {
    'username': username,
    'text': text,
    'roomname': 'serverroom'
  };
  submitMessage(message);
};

var submitMessage = function(message) {
  $.ajax({
    url: nodeURL,
    type: 'POST',
    data: JSON.stringify(message),
    contentType: 'application/json',
    success: function (data) {
      console.log('chatterbox: Message sent');
    },
    error: function (data) {
      console.error('chatterbox: Failed to send message');
    }
  });
};

var filterByRoom = function() {
  var roomVal =  $('select').val();
  $('.message').show();
  if(roomVal) {
    $('.message').not('.' + roomVal).hide();
  }
}

var friends = [];






getMessages();
// setInterval(getMessages, 2000);


