(function (App) {

	App.Views.AboutView = Backbone.View.extend({

	    template: templates.about,

	    render: function(){
	    	var self = this;
	      $.get(this.template, function (source) {
	            var compiledTemplate = handlebars.compile(source);
	            var context = {};
	            self.el = compiledTemplate(context); 
	            $('body').removeClass('pururin-background');
	            $('#view').html(self.el);
	            //console.log(this);
	        }, 'html');
	    },
  	});

})(window.App);