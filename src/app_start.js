(function (App) {
	$(function(){
		App.initQueue();

		var searchView = new App.Views.SearchView({el: $("#view")});
  		App.changeView(searchView);

  		var navbar = new App.Views.Navbar({el: $('nav')});
	});
})(window.App);