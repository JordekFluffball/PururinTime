(function (App) {

	App.Views.DownloadsView = Backbone.View.extend({
	    events: {
	    	"click #cancel-button": "cancel"
	    },

	    template: templates.downloads,

	    initialize: function(){
	    	//App.irc.client.on('xdcc-connect', this.receivingNewXDCC);
	    	//App.irc.client.on('xdcc-end', this.completedXDCC);
	    	this.listenTo(App.queue, 'add', this.addOne);
	    	this.listenTo(App.queue, 'change:status', this.statusChange);
	    	this.listenTo(App.queue, 'change:progress', this.progressChange);
	    	this.listenTo(App.queue, 'change:filename', this.filenameChange);
	    },

	    render: function(){
	    	var self = this;
	      $.get(this.template, function (source) {
	            var compiledTemplate = handlebars.compile(source);
	            var context = {};
	            self.el = compiledTemplate(context); 
	            $('body').removeClass('pururin-background');
	            $('#view').html(self.el);
	            _.each(App.queue.models, function(queueItem, index, list){
		    		//console.log("adding all models from queue to downloadView");
		    		//console.log("Current queueItem: %o", queueItem);
		    		self.addOne(queueItem);
		    	});
	            //console.log(this);
	        }, 'html');
	    },

	    receivingNewXDCC: function(details){
	    	console.log("DOWNLOADS VIEW: receivingNewXDCC: %o", details);
	    },

	    completedXDCC: function(received, details){
	    	console.log("DOWNLOADS VIEW: completedXDCC: %o", details);
	    },

	    addOne: function(queueItem){
	    	//console.log("dl view addOne");
	    	var newQueueView = new App.Views.QueueItem({model: queueItem});
	    	//console.log('newQueueView: %o', newQueueView);
	    	App.queueViews.push(newQueueView);

	    	var status = queueItem.get('status');
	    	if(status == 'queue'){
	    		newQueueView.render(function(source){
		    		$("#in-queue").append(source);
		    	});
	    	}
	    	else if (status == 'downloading') {
	    		newQueueView.render(function(source){
		    		$("#in-progress").append(source);
		    	});
	    	}
	    	else{
	    		newQueueView.render(function(source){
		    		$("#in-completed").append(source);
		    	});
	    	}
	    },

	    cancel: function(e){
	    	var queueItemID = $(e.currentTarget).attr('data-id');
	    	var queueItem = App.queue.get(queueItemID);

	    	if(queueItem.get('status') == 'downloading'){
	    		App.cancelXDCC(queueItem.get('nick'));
	    		App.downloadNextInQueue();
	    	}
	    	
	    	$(e.currentTarget).closest('.queue-item').remove();
	    },

	    statusChange: function(queueItem){
	    	console.log('status change of %o', queueItem);
	    	var status = queueItem.get('status');
	    	var id = queueItem.cid;
	    	var selectorString = ".queue-item[data-id=" + id + "]";
	    	if(status == 'queue'){
	    		$(selectorString).detach().appendTo('#in-queue');
	    	}
	    	else if (status == 'downloading') {
	    		$(selectorString).detach().appendTo('#in-progress');
	    	}
	    	else{
	    		$(selectorString).detach().appendTo('#in-completed');
	    	}

	    },

	    progressChange: function(queueItem){
	    	//console.log("progressChange: " + queueItem.get('progress'));
	    	$('#in-progress').find('.progress-bar').css('width', queueItem.get('progress') + '%');
	    },

	    filenameChange: function(queueItem){
	    	console.log("filenameChange: " + queueItem.get('filename'));
	    	$('#downloading-filename').text(queueItem.get('filename'));
	    }
  	});

})(window.App);