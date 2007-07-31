// ===========================================================================
// Chrome
// ===========================================================================

wf2.Chrome.states = {
	normal: 0,
	hover: 1,
	active: 2,
	disabled: 3
};

wf2.Chrome.prototype.extend({
	isActive: function() {
		return this._activeThumb && (this._activeThumb == this._hoverThumb);
	},
	
	getCursor: function() {
		return (this._activeThumb || this._hoverThumb || !this._hover) ? "default" : "";
	},
	
	syncCursor: function() {
		this.element.runtimeStyle.cursor = this.getCursor();
	},
	
	hitTest: function () {
		if (this.element.currentStyle.direction == "rtl") {
			return event.offsetX <= this.imageWidth;
		} else {
			return event.offsetX >= this.element.clientWidth - this.imageWidth;
		}
	},
	
	delayRefresh: function() {
		// use a timer delay to prevent excess mouse movement
		//  from causing cursor flicker (hourglass)
		if (!this._delay) {
			var self = this;
			this._delay = setTimeout(function() {
				self.syncCursor();
				self.layout();
				delete self._delay;
			}, 50);
		}
	},
	
	onmousedown: function() {
		if (!this.owner._isEditable()) return;
	
		this._activeThumb = this.hitTest();
		if (this._activeThumb) {
			this.element.setCapture();
		}
		this.syncCursor();
		this.layout();
	},
	
	onmouseup: function() {
		if (this._activeThumb) {
			delete this._activeThumb;
			this.syncCursor();
			this.layout();
		}
		this.element.releaseCapture();
	
	},
	
	onkeydown: function() {
		if (event.keyCode == 13) {
			this.owner._triggerSubmission();
		}
	},
	
	onlosecapture: function() {
		this.onmouseup();
	},
	
	onmousemove: function() {
		this._hoverThumb = this.hitTest();
		this.delayRefresh();
	},
	
	onmouseover: function() {
		this._hover = true;
	},
	
	onmouseout: function() {
		delete this._hoverThumb;
		delete this._hover;
		this.delayRefresh();
	},
	
	onmousewheel: function() {
		this.owner._increment(parseInt(event.wheelDelta / 120));
		event.returnValue = false;
	},
	
	onfocus: function() {
		this._focus = true;
		this.layout();
	},
	
	onblur: function() {
		delete this._focus;
		this.layout();
	},
	
	onresize: function() {
		this.layout();
	},
	
	onscroll: function() {
		this.resetScroll();
	}
});
