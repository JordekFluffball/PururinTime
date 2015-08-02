(function (App) {
//statuses: downloading, queue, completed, error, cancel
	App.Models.QueueItem = Backbone.Model.extend({
	  nick: ' ',

	  pack: null,

	  filename: ' ',

	  size: '0MB',

	  progress: 0,

	  status: 'queue'
	});

})(window.App);