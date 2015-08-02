(function (App) {
	//status: downloading, queue, complete
	App.Collections.Queue = Backbone.Collection.extend({
  		model: App.Models.QueueItem,

  		downloading: function() {
	      return this.where({status: 'downloading'});
	    },

	    queue: function() {
	      return this.where({status: 'queue'});
	    },

	    completed: function() {
	      return this.where({status: 'completed'});
	    }
	});

})(window.App);