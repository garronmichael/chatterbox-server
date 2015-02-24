var Tweet = Backbone.Model.extend({
  idAttribute: 'objectId',
  parse: function(response) {
    response.username = response.username || null;
    response.roomname = response.roomname || null;
    response.text = response.text || null;
    return response;
  }
});

var TweetView = Backbone.View.extend({
  initialize: function() {
    this.listenTo(this.model, "change", this.render);
  },
  template: _.template('<div class="message"><div class="user"><%- username %></div><div class="text"><%- text %></div><div><%- createdAt %></div><div><%- roomname %></div></div>'),
  render: function() {
    this.$el.html(this.template(this.model.attributes));
    return this.$el;
  }
});

var Tweets = Backbone.Collection.extend({
  model: Tweet,
  url: 'https://api.parse.com/1/classes/chatterbox',
  parse: function(response) {
    return response.results;
  }
});

var TweetsView = Backbone.View.extend({
  className: 'messages',
  initialize: function() {
    this.listenTo(this.collection, 'change', this.render);
    this.listenTo(this.collection, 'fetch', this.render);
    this.listenTo(this.collection, 'sync', this.render);
  },
  render: function() {


    this.$el.prepend(
      this.collection.map(function(tweet) {
        var tweetView = new TweetView({model: tweet});
        var room = tweetView.model.get('roomname');
        var selectedRoom = $('option:selected').val();
        if(room === selectedRoom) {
          return tweetView.render().html();
        }
      })
    );
    return this.$el;
  }
});


setInterval(function(){
  tweets.fetch({data: {
      limit: 50,
      order: '-createdAt'
    }});
}, 1000);


var FormView = Backbone.View.extend({
  collection: tweets,
  events: {
    "submit": "submitForm"
  },
  submitForm: function () {
    var username = this.$el.find('.userBox').val();
    var text = this.$el.find('.messageBox').val();
    this.$el.find('.messageBox').val('');
    this.collection.create({username: username, text: text});
  }
});

var RoomView = Backbone.View.extend({
  tagName: 'option',
  initialize: function() {
    this.listenTo(this.model, 'change', this.render);
  },
  render: function() {
    this.$el.val(this.model.get('roomname'));
    this.$el.text(this.model.get('roomname'));
    return this.$el;
  }
});

var RoomsView = Backbone.View.extend({
  tagName: 'select',
  collection: tweets,
  initialize: function() {
    this.listenTo(this.collection, 'change', this.render);
    this.listenTo(this.collection, 'fetch', this.render);
    this.listenTo(this.collection, 'sync', this.render);
  },
  render: function() {
    var rooms = [];
    $('option').each(function(){
      rooms.push($(this).val());
    });
    this.$el.prepend(
      this.collection.map(function(tweet) {
        var roomView = new RoomView({model: tweet});
        if (rooms.indexOf(roomView.model.get('roomname')) === -1) {
          rooms.push(roomView.model.get('roomname'));
          return roomView.render();
        }
      })
    );
    return this.$el;
  }
});

  var tweets = new Tweets();
  var tweetsView = new TweetsView({collection: tweets});
  var roomsView = new RoomsView({collection: tweets});
$(function(){
  $('body').append(tweetsView.render());
  $('label').append(roomsView.render());
});
