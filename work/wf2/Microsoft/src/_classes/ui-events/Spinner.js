// ===========================================================================
// Spinner (event handlers)
// ===========================================================================

wf2.Spinner.states = {
	normal: 0,
	up_hover: 1,
	up_active: 2,
	down_hover: 3,
	down_active: 4,
	disabled: 5
};

wf2.Spinner.prototype.extend({
	steps: 1,
	direction: 0,
	
	getState: function() {
		var s;
		if (this.element.isDisabled) {
			s = "disabled";
		} else if (this.owner.get_readOnly()) {
			s = "normal";
		} else if (this.isActive()) {
			s = this._activeThumb + "_active";
		} else if (this._hoverThumb) {
			s = this._hoverThumb + "_hover";
		} else {
			s = "normal";
		}
		return wf2.Spinner.states[s];
	},
	
	hitTest: function() {
		// this returns null, "up" or "down"
		if (this.base()) {
			if (event.offsetY <= (this.element.clientHeight / 2)) {
				return "up";
			} else {
				return "down";
			}
		}
	},
	
	activate: function(direction, block) {
		if (!this._timerId) {
			this._activeThumb = this._hoverThumb = direction;
			this.layout();
			this._block = block;
			this.startTimer();
		}
	},
	
	deactivate: function() {
		if (this._timerId) {
			this.stopTimer();
			this._activeThumb = this._hoverThumb = null;
			delete this._block;
			this.layout();
		}
	},
	
	startTimer: function() {
		if (!this._timerId) {
			this.steps = 1;
			this.direction = (this._activeThumb == "up") ? 1 : -1;
			this.base();
		}
	},
	
	stopTimer: function() {
		if (this._timerId) {
			this.base();
			if (!this._firedOnce) this.increment();
			delete this._firedOnce;
			this.owner.select();
		}
	},
	
	oninterval: function() {
		this.increment();
		this.steps *= 1.1; // accelerate
	},
	
	increment: function() {
		var n = parseInt(this.steps * this.direction);
		if (this._block) {
			this.owner._blockIncrement(n);
		} else {
			this.owner._increment(n);
		}
		this._firedOnce = true;
	},
	
	onkeydown: function() {
		this.base();
	
		if (!this.owner._isEditable()) return;
	
		switch (event.keyCode) {
			case 38: // up-arrow
				this.activate("up");
				event.returnValue = false;
				break;
			case 40: // down-arrow
				this.activate("down");
				event.returnValue = false;
				break;
			case 33: // page-up
				this.activate("up", true);
				event.returnValue = false;
				break;
			case 34: // page-down
				this.activate("down", true);
				event.returnValue = false;
				break;
		}
	},
	
	onkeyup: function() {
		this.base();
	
		if (!this.owner._isEditable()) return;
	
		switch (event.keyCode) {
			case 33: // page-up
			case 34: // page-down
			case 38: // up-arrow
			case 40: // down-arrow
				event.returnValue = false;
				this.deactivate();
				break;
		}
	},
	
	onmousedown: function() {
		this.base();
		if (this._activeThumb) {
			this.startTimer();
		}
	},
	
	onmouseup: function() {
		if (this._activeThumb) {
			this.stopTimer();
		}
		// call afterward because we don't want to clear the state yet
		this.base();
	},
	
	ondblclick: function() {
		this.base();
		if (this._hoverThumb != undefined) {
			// IE does not fire down/up for dblclicks
			this.owner._increment(this.direction);
		}
	}
});
