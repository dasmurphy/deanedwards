
this.Base = Base;

Base.prototype.extend({
	startTimer: function(interval) {
		if (!this._timerId) {
			var self = this;
			this._timerId = setInterval(function() {
				self.oninterval();
			}, interval || 100);
		}
	},
	
	stopTimer: function() {
		if (this._timerId) {
			clearInterval(this._timerId);
			delete this._timerId;
		}
	},
	
	dispose: function() {
		this.stopTimer();
	}
});

Base.className = "Base";
