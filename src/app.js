 var fs = require('fs');
var irc = require('irc');
var xdcc = require('xdcc');
var gui = require('nw.gui');
var handlebars = require('handlebars');
var aniup = require('ani-up');
var hummingbird = aniup.hummingbird; 
var path = require('path');

var win = gui.Window.get(),
    nativeMenuBar = new gui.Menu({
        type: "menubar"
});

// check operating system for the menu
if (process.platform === "darwin") {
    nativeMenuBar.createMacBuiltin("PururinTime");
}

// actually assign menu to window
win.menu = nativeMenuBar;

var templates = {
      search: "search.html",
      results: "results.html",
      profile: "profile.html",
      about: "about.html",
      downloads: "downloads.html",
      settings: "settings.html",
      queueItem: "queueItem.html"
};

if(!localStorage.downloadPath){
  localStorage.downloadPath = "./Downloads";
}



function PururinApp(){
  this.Views = {};
  this.Models = {};
  this.Collections = {};

  this.irc = {};
  this.queueViews = [];
  this.currentSearchTerm = '';
  this.start = function(){
    //console.log(this);




    this.irc.username = 'PururinTime' + Math.random().toString(36).substr(7, 3);
    this.irc.config = {
      server: 'irc.rizon.net',
      nick: this.irc.username,
      options: {
        channels: ['#nibl'],
        userName: this.irc.username,
        realName: this.irc.username,
        debug: false,
        stripColors: true,
        autoConnect: false
      }
    };
    this.irc.client =  new irc.Client(this.irc.config.server, this.irc.config.nick, this.irc.config.options);
    this.irc.client.connect();

    //XDCC handlers
    var self = this;
    this.irc.client.on('xdcc-connect', function(meta) {
      console.log("connected: %o", meta);
      var sizeInMB = (Math.round(meta.length/1000000)).toString() + 'MB';
      //console.log("size in mb: " + sizeInMB);
      var itemDownloading = self.queue.downloading()[0];
      itemDownloading.set({filename: meta.file, size: sizeInMB});
    });

    this.irc.client.on('xdcc-data', function(received, details) {
      //console.log('Receiving Data');
      //console.log("data details: %o", details);
      var progressDecimal = Math.round((received/details.length) * 100);
      var itemDownloading = self.queue.downloading()[0];
      itemDownloading.set('progress', progressDecimal);
    });

    this.irc.client.on('xdcc-end', function(received, details) {
      console.log("xdcc complete: %o", details);
      var finishedItem = self.queue.downloading()[0];
      finishedItem.set({status: 'completed'});
      self.downloadNextInQueue();
    });

    this.irc.client.on('notice', function(from, to, message) {
      if (to == self.irc.username) {
        console.log("[notice]", message);
        if (message.indexOf("invalid") > -1 || message.indexOf("Invalid") > -1) {
          console.log("message contains invalid");
          var itemDownloading = self.queue.downloading()[0];
          itemDownloading.set('status', 'error');
          self.downloadNextInQueue();
        }
      }
    });

    this.irc.client.on('error', function(message) {
      console.error(message);
    });
  };

  this.initQueue = function(){
    this.queue = new this.Collections.Queue;
  };

  this.cancelXDCC = function cancelXDCC(botname){
      //client.emit('xdcc-cancel', nick);
      this.irc.client.say(botname, "XDCC CANCEL");

      //queue up next
      //delete this file's data
  };

  this.changeView = function(view){
    /*console.log("Changing view from");
    console.log(this.currentView);
    console.log("to");
    console.log(view);*/
    if(this.currentView){
      //this.currentView.remove();
      //console.log("this.currentView exists, unbinding events");
      this.currentView.unbind();
      this.currentView.undelegateEvents();
      this.currentView.stopListening();
      this.currentView.off();
      $(this.currentView.el).empty();

      _.each(this.queueViews, function(queueView, index, list){
            queueView.unbind();
            queueView.undelegateEvents();
            queueView.stopListening();
            queueView.off();
            queueView.remove();
      });
      this.queueViews = [];
    }
    //$("#view").html('');
    //remove previous view
    this.currentView = view;
    //this.currentView.render();
    this.currentView.render();
    //this.currentView.delegateEvents();
    //this.currentView.bind();
  };

  this.addToQueue = function(queueObject){
    //{nick: botname, filename: filename, size: size, pack: pack}
    var newQueueItem = new App.Models.QueueItem(queueObject);
    this.queue.add(newQueueItem);
    console.log('added queueitem to queue: %o', newQueueItem);
    var numDownloading = this.queue.downloading().length;

    //nothing is downloading, so start downloading the next item (should be newQueueItem)
    if(numDownloading < 1){
      this.downloadNextInQueue();
    }
  };

  this.downloadNextInQueue = function(){
    var itemsInQueue = this.queue.queue();
    if(itemsInQueue.length > 0){
      var itemToDownload = itemsInQueue[0];

      var nick = itemToDownload.get('nick');
      var pack = itemToDownload.get('pack');

      itemToDownload.set('status', 'downloading');

      this.irc.client.getXdcc(nick, 'xdcc send #' + pack, localStorage.downloadPath);
    }
  };

  this.searchXDCC = function(term, callback){
    $.get('http://nibl.co.uk/bots.php', {search: term, sortby: "filename", order: "asc"}, function(data){
      var $botlist = $(data).find('table.botlist');
      $botlist.find('.nowrap').remove();
      $botlist.find('a').remove();

      var packageList = [];
      $botlist.find('tr').each(function(index){
        var botname, pack, filename, size;
        botname = $(this).attr('botname');
        pack =  $(this).attr('botpack');
        filename = $(this).find('td.filename').html();
        filesize = $(this).find('td.filesize').html();
        packageList.push({botname: botname, pack: pack, filename: filename, filesize: filesize});
      });
      callback(packageList);
    });
  };

  this.cancelXDCC = function cancelXDCC(nick){
    this.irc.client.say(nick, "XDCC CANCEL");
    //queue up next
  }

  this.tryAlternativeXDCCSearchTerms = function(term, callback){
    var newTerm = '';
    var self = this;
    //functions to avoid callback hell
    function tryS2(){
      if (term.indexOf("2nd season") >= 0){
        newTerm = term.replace("2nd season", "s2");
        console.log("Alt Search: trying XDCC search with term " + newTerm);
        this.searchXDCC(newTerm, function(packageList){
          if(packageList.length > 0){
            console.log("Alt search successful");
            callback(packageList);
          } else {
            console.log("S2 try failed");
            tryUserString(); //try something else
          }
        });
      } else {
        tryUserString();
      }
    }
    function tryUserString(){
      console.log();
      console.log("trying using user search string: " + self.currentSearchTerm);
      self.searchXDCC(self.currentSearchTerm, function(packageList){
        if(packageList.length > 0){
            console.log("Alt search successful");
            callback(packageList);
          } else {
            console.log("user search string try failed");
            callback([]); //give up and go back
          }
      });
    }
    tryS2();
  };
}

var App = new PururinApp();
App.start();
