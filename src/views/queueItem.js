(function (App) {

	App.Views.QueueItem= Backbone.View.extend({
	    events: {
	      "click #cancel-button": "cancelItem"
	    },

	    template: templates.queueItem,

	    initialize: function(){
	    },

	    render: function(callback){
	    	var self = this;
	      $.get(this.template, function (source) {
	            var compiledTemplate = handlebars.compile(source);
	            console.log("queueitem model: %o", self.model);
	            var context = {id: self.model.cid, filename: self.model.get('filename'), botname: self.model.get('nick'), size: self.model.get('size')};
	            self.el = compiledTemplate(context);
	            //console.log("queue item el: " + self.el);
	            //console.log("with context: %o", context);
	            //$('body').removeClass('pururin-background');
	            //$('#view').html(this.el);
	            callback(self.el);
	            //$('#view').html(self.el);
	        }, 'html');
	    },

	    cancelItem: function(){
	    	console.log("Cancel button clicked");
	    }
  	});

})(window.App);