(function (App) {

	App.Views.Navbar = Backbone.View.extend({
	    events: {
	      "click #search-link": "gotoSearchView",
	      "click #downloads-link": "gotoDownloadsView",
	      "click #settings-link": "gotoSettingsView",
	      "click #about-link": "gotoAboutView"
	    },

	    gotoSearchView: function(){
	    	var searchView = new App.Views.SearchView({el: $("#view")});
  			App.changeView(searchView);
	    },

	    gotoDownloadsView: function(){
	    	var downloadsView = new App.Views.DownloadsView({el: $("#view")});
	    	App.changeView(downloadsView);
	    },

	    gotoSettingsView: function(){
	    	var settingsView = new App.Views.SettingsView({el: $("#view")});
	    	App.changeView(settingsView);
	    },

	    gotoAboutView: function(){
	    	var aboutView = new App.Views.AboutView({el: $("#view")});
	    	App.changeView(aboutView);
	    }

  	});

})(window.App);