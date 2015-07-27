var fs = require('fs');
var irc = require('irc');
var xdcc = require('xdcc');
var gui = require('nw.gui');
var handlebars = require('handlebars');
var aniup = require('ani-up');
var hummingbird = aniup.hummingbird; 

var views = {
      search: "html/search.html",
      results: "html/results.html",
      profile: "html/profile.html",
      about: "html/about.html",
      downloads: "html/downloads.html",
      settings: "html/settings.html"
    };
var currentView;

var downloadPath= "./Downloads";

//GUI/utilities
// initialize window menu
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


//IRC setup
var user = 'PururinTime' + Math.random().toString(36).substr(7, 3);

// Set IRC configuration
var config = {
    server: 'irc.rizon.net',
    nick: user,
    options: {
        channels: ['#nibl'],
        userName: user,
        realName: user,
        debug: false,
        stripColors: true,
        autoConnect: false
    }
};

var joinSuccess = false;
//{botname: botname, pack: pack, size: size, filename: filename}
var XDCCQueue = [];
var currentDownload = {};
var completed = [];
var client = new irc.Client(config.server, config.nick, config.options);
client.connect();
console.log("-- CONNECTING TO " + config.server + " AS " + config.nick);

client.on('join', function (channel, nick, message) {
    if (nick == config.nick && channel == config.options.channels[0]) {
        console.log('-- Joined ' + channel);
        joinSuccess = true;

    }
});

var totalData, progress, progressDecimal;

//XDCC handlers
client.on('xdcc-connect', function(meta) {
  console.log('Connected: ' + meta.ip + ':' + meta.port);
  //console.log(meta.length);
  totalData = meta.length;

});

client.on('xdcc-data', function(received) {
  //console.log('Receiving Data');
  progress = received;
  progressDecimal = progress/totalData;
});

function cancelXDCC(botname){
	//client.emit('xdcc-cancel', nick);
	client.say(botname, "XDCC CANCEL");
  //queue up next
  //delete this file's data
}

client.on('xdcc-end', function(received) {
  console.log('Download completed, starting next in queue');
  completed.push(currentDownload);
  currentDownload = {};
  downloadNextInQueue();
  //loadView not in scope!
  /*if (currentView == views.downloads) {
    var downloading;
    if(jQuery.isEmptyObject(currentDownload)){
      downloading = null;
    } else {
      downloading = currentDownload;
    }
    loadView(views.downloads, {XDCCQueue: XDCCQueue, currentDownload: downloading, completed: completed});
  }*/
});

client.on('notice', function(from, to, message) {
  if (to == user) {
    console.log("[notice]", message);
  }
});

client.on('error', function(message) {
  console.error(message);
});

function downloadNextInQueue(){
  console.log("downloading next in queue");
  console.log(XDCCQueue);
  console.log(currentDownload);
  console.log(completed);
  if (XDCCQueue.length > 0) {
    console.log("Queue length > 0, getXdcc");
    currentDownload = XDCCQueue.shift();
    console.log(currentDownload);
    client.getXdcc(currentDownload.botname, 'xdcc send #' + currentDownload.pack, downloadPath);
  } else {
    console.log("queue is empty, ending queue chain");
  }
}


var userSearchString = '';

//wait for jQuery
$(document).ready(function () {
  function loadView(viewPath, context){
    currentView = viewPath;
    fs.readFile(viewPath, 'utf-8', function(error, source){
      var template = handlebars.compile(source);
      $("#view").html(template(context));
      if(viewPath == views.search){
        $('body').addClass('puruin-background');
      } else {
        $('body').removeClass('puruin-background');
      }
      var progressInterval
      if(viewPath == views.downloads){
        progressInterval = setInterval(function(){
         $('#view').find('.progress-bar').css('width', (progressDecimal * 100) + '%');
        }, 400);
        
      } else {clearInterval(progressInterval);}
    });
  }
  function searchXDCC(term, callback){
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
  }
  function tryAlternativeXDCCSearchTerms(term, callback){
    var newTerm = '';
    //functions to avoid callback hell
    function tryS2(){
      if (term.indexOf("2nd season") >= 0){
        newTerm = term.replace("2nd season", "s2");
        console.log("Alt Search: trying XDCC search with term " + newTerm);
        searchXDCC(newTerm, function(packageList){
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
      console.log("trying using user search string: " + userSearchString);
      searchXDCC(userSearchString, function(packageList){
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
  }

  //start view
  loadView(views.search, {});

  //NAVBAR
  $("#logo").click(function(e) {
    e.preventDefault();
    loadView(views.search, {});
  });
  $("#search-link").click(function(e) {
    e.preventDefault();
    loadView(views.search, {});
  });
  $("#about-link").click(function(e) {
    e.preventDefault();
    loadView(views.about, {});
  });
  $("#settings-link").click(function(e) {
    e.preventDefault();
    loadView(views.settings, {});
  });
  $("#downloads-link").click(function(e) {
    e.preventDefault();
    var downloading;
    if(jQuery.isEmptyObject(currentDownload)){
      downloading = null;
    } else {
      downloading = currentDownload;
    }
    loadView(views.downloads, {XDCCQueue: XDCCQueue, currentDownload: downloading, completed: completed});
  });

  //SEARCH
  $("#view").on('submit', '#search-form',function(e){
    e.preventDefault();
    userSearchString = $('#search-field').val();

    hummingbird.search(userSearchString, function(err, results) {
        if(err) {
            console.log(err);
        }
        else {
            if(results) {
                console.log("results: %o", results);


                loadView(views.results, {anime: results});
            }
            else {
                console.log("No results were found.");
            }
        }
    });
    $("#view").on('click', '#lucky',function(e){
      e.preventDefault();
      userSearchString = $('#search-field').val();

      hummingbird.search(userSearchString, function(err, results) {
          if(err) {
              console.log(err);
          }
          else {
              if(results) {
                  console.log("results: %o", results);
                  var firstResult = results[0];
                  var slug = firstResult.slug;
                  var searchTerm = slug.replace(/-/g, ' ');

                  searchXDCC(searchTerm, function(packageList){
                    function loadProfileView(){
                      loadView(views.profile, {title: firstResult.title, synopsis: firstResult.synopsis, cover_image: firstResult.cover_image, packageList: packageList});
                    }
                    if (packageList.length > 0) {
                      console.log("initial XDCC search successful");
                      loadProfileView();
                    } else {
                      console.log("no initial XDCC results");
                      tryAlternativeXDCCSearchTerms(searchTerm, function(newPackageList){
                        console.log("try alternative callback");
                        packageList = newPackageList;
                        loadProfileView();
                      });
                    }
                  });

              }
              else {
                  console.log("No results were found.");
              }
          }
      });

    });

    /*var msgArray = XDCCtext.split(" ");
    hostUser = msgArray[1];
    pack = msgArray[4];

    client.getXdcc(hostUser, 'xdcc send ' + pack, './Downloads');*/
  });

  //RESULTS
  $("#view").on('mouseover', '.anime-item',function(){
    $(this).addClass('bg-info');
  });
  $("#view").on('mouseleave', '.anime-item',function(){
    $(this).removeClass('bg-info');
  });

  $("#view").on('click', '.anime-item',function(e){
    e.preventDefault();
    var title = $(this).attr('data-title');
    var slug = $(this).attr('data-slug');
    var synopsis = $(this).attr('data-synopsis');
    var coverImage = $(this).attr('data-cover-image');

    var searchTerm = slug.replace(/-/g, ' ');

    searchXDCC(searchTerm, function(packageList){
      function loadProfileView(){
        loadView(views.profile, {title: title, synopsis: synopsis, cover_image: coverImage, packageList: packageList});
      }
      if (packageList.length > 0) {
        console.log("initial XDCC search successful");
        loadProfileView();
      } else {
        console.log("no initial XDCC results");
        tryAlternativeXDCCSearchTerms(searchTerm, function(newPackageList){
          console.log("try alternative callback");
          packageList = newPackageList;
          loadProfileView();
        });
      }
    });
  });

  //PROFILE
  $("#view").on('click', 'tr',function(){
    var botname = $(this).attr('data-botname');
    var pack = $(this).attr('data-pack');
    var size = $(this).attr('data-filesize');
    var filename = $(this).attr('data-filename');
    var animeToAddToQueue = {botname: botname, pack: pack, size: size, filename: filename};
    console.log("adding anime to queue: ");
    console.log(animeToAddToQueue);
    XDCCQueue.push(animeToAddToQueue);
    if (XDCCQueue.length == 1 && jQuery.isEmptyObject(currentDownload)) {
      console.log("queue has one item after add & no current download, starting queue chain");
      downloadNextInQueue();
    };
    //client.getXdcc(botname, 'xdcc send #' + pack, downloadPath);
    $(this).addClass('success');
  });
  $("#view").on('click', '#back-button',function(){
    hummingbird.search(userSearchString, function(err, results) {
        if(err) {
            console.log(err);
        }
        else {
            if(results) {
                console.log("results: %o", results);


                loadView(views.results, {anime: results});
            }
            else {
                console.log("No results were found.");
            }
        }
    });
  });

  //DOWNLOADS

});
