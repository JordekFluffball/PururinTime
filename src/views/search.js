(function (App) {

	App.Views.SearchView = Backbone.View.extend({
	    events: {
	      "submit #search-form": "submitSearch",
	      "click #lucky": "luckySearch"
	    },

	    template: templates.search,

	    initialize: function(){
	    },

	    render: function(){
	    	var self = this;
	      $.get(this.template, function (source) {
	            var compiledTemplate = handlebars.compile(source);
	            var context = {};
	            self.el = compiledTemplate(context); 
	            $('body').addClass('pururin-background');
	            //$('#view').html(this.el);
	            $('#view').html(self.el);
	            //console.log(self);
	            //console.log(this);
	        }, 'html');
	    },

	    submitSearch: function(e){
	      e.preventDefault();
	      App.currentSearchTerm = $('#search-field').val();
	      console.log("Submit Search: " + App.currentSearchTerm);
	      var searchResultsView = new App.Views.SearchResultsView({el: $('#view')});
	      //searchResultsView.searchTerm = $('#search-field').val();
	      searchResultsView.searchHummingbird(function(){
	        //console.log(searchResultsView);
	        App.changeView(searchResultsView);
	      });
	    },

	    luckySearch: function(){
	      console.log("Lucky search not yet implemented");
	    }
  	});

})(window.App);