(function (App) {

	App.Views.ProfileView = Backbone.View.extend({
    template: templates.profile,

    context: {},

    events: {
        "click tr": "downloadPack"
     },

    initialize: function(){

    },

    render: function(){
      var self = this;
      $.get(this.template, function (source) {
            var compiledTemplate = handlebars.compile(source);
            self.el = compiledTemplate(self.context);
            $('body').removeClass('pururin-background');
            $('#view').html(self.el);
        }, 'html');
    },

    downloadPack: function(e){
    	var botname = $(e.currentTarget).attr('data-botname');
    	var pack = $(e.currentTarget).attr('data-pack');
    	var size = $(e.currentTarget).attr('data-filesize');
    	var filename = $(e.currentTarget).attr('data-filename');
    	//App.irc.client.getXdcc(botname, 'xdcc send #' + pack, localStorage.downloadPath);
    	App.addToQueue({status: 'queue', nick: botname, filename: filename, size: size, pack: pack});

    	$(e.currentTarget).addClass('success');
    }


  });

})(window.App);