(function (App) {
  App.Views.SearchResultsView = Backbone.View.extend({
      template: templates.results,

      results: [],

      events: {
        "mouseover .anime-item": "hoverOverAnime",
        "mouseleave .anime-item": "hoverOffAnime",
        "click .anime-item": "clickAnime"
      },

      initialize: function(){
      },

      render: function(){
        console.log("results render with results: " + this.results);
        var self = this;
        $.get(this.template, function (source) {
              var compiledTemplate = handlebars.compile(source);
              var context = {anime: self.results};
              //console.log("render this: " + JSON.stringify(self));
              self.el = compiledTemplate(context);
              $('body').removeClass('pururin-background');
              $('#view').html(self.el);
          }, 'html');
      },

      searchHummingbird: function(callback){
        console.log("Searching Hummingbird with term: " + App.currentSearchTerm);
        var self = this;
        hummingbird.search(App.currentSearchTerm, function(err, results) {
          if(err) {
              console.log(err);
          }
          else {
              if(results) {
                  console.log("results: %o", results);
                  self.results = results;
                  //console.log("this.results = results, now this.results = " + this.results);
                  console.log(self);
                  callback();
              }
              else {
                  console.log("No results were found.");
              }
          }
         });
      },

      hoverOverAnime: function(e){
        //console.log("Hover over anime: " + e.currentTarget);
        $(e.currentTarget).addClass('bg-info');
      },

      hoverOffAnime: function(e){
        $(e.currentTarget).removeClass('bg-info');
      },

      clickAnime: function(e){
        console.log("Anime clicked");
        var title = $(e.currentTarget).attr('data-title');
        var slug = $(e.currentTarget).attr('data-slug');
        var synopsis = $(e.currentTarget).attr('data-synopsis');
        var coverImage = $(e.currentTarget).attr('data-cover-image');

        var searchTerm = slug.replace(/-/g, ' ');

        App.searchXDCC(searchTerm, function(packageList){
          if (packageList.length > 0) {
            console.log("initial XDCC search successful");
            var profileView = new App.Views.ProfileView({el: $("#view")});
            profileView.context = {title: title, synopsis: synopsis, cover_image: coverImage, packageList: packageList};
            App.changeView(profileView);
          } else {
            console.log("no initial XDCC results");
            App.tryAlternativeXDCCSearchTerms(searchTerm, function(newPackageList){
              console.log("try alternative callback");
              var profileView = new App.Views.ProfileView({el: $("#view")});
              profileView.context = {title: title, synopsis: synopsis, cover_image: coverImage, packageList: packageList};
              App.changeView(profileView);
            });
          }
        });

        var profileView = new App.Views.ProfileView({});
        //console.log(e.currentTarget);
      }
    });
})(window.App);