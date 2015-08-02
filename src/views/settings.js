(function (App) {

	App.Views.SettingsView = Backbone.View.extend({
	    events: {
	      "change #download-directory": "setDownloadsDirectory"
	    },

	    template: templates.settings,

	    initialize: function(){
	    },

	    render: function(){
	    	var self = this;
	      $.get(this.template, function (source) {
	            var compiledTemplate = handlebars.compile(source);
	            var context = {downloadPath: localStorage.downloadPath};
	            self.el = compiledTemplate(context); 
	            $('body').removeClass('pururin-background');
	            $('#view').html(self.el);
	            //console.log(self);
	        }, 'html');
	    },

	    setDownloadsDirectory: function(e){
	    	localStorage.downloadPath = $(e.currentTarget).val();
	    	$('#download-path').html($(e.currentTarget).val());
	    }
  	});

})(window.App);