// ===========================================================================
// Slider
// ===========================================================================

wf2.Slider.prototype.extend({
	hitTest: function() {
		var mx, my, tx, ty;
		if (this.element.isDisabled) {
			return false;
		}
		var rect = this.element.getBoundingClientRect();
		if (this.orientation == wf2.Slider.HORIZONTAL) {
			mx = event.clientX - rect.left;
			tx = this._thumbLeft;
			if (mx < tx) {
				return false;
			}
			if (mx < tx + wf2.Slider.THUMB_WIDTH) {
				my = event.clientY - rect.top;
				ty = this._thumbTop;
				if (my < ty) {
					return false;
				}
				return my < ty + wf2.Slider.HORIZONTAL_HEIGHT;
			}
		} else {
			my = event.clientY - rect.top;
			ty = this._thumbTop;
			if (my < ty) {
				return false;
			}
			if (my < ty + wf2.Slider.THUMB_HEIGHT) {
				mx = event.clientX - rect.left;
				tx = this._thumbLeft;
				if (mx < tx) {
					return false;
				}
				return mx < tx + wf2.Slider.VERTICAL_WIDTH;
			}
		}
	},
	
	getState: function() {
		var s;
		if (this.element.isDisabled) {
			s = "disabled";
		} else if (this._activeThumb) {
			s = "active";
		} else if (this._focus || this._hoverThumb) {
			s = "hover";
		} else {
			s = "normal";
		}
		return wf2.Chrome.states[s];
	},
	
	oninterval: function() {
		var rect = this.element.getBoundingClientRect();
		if (this.orientation == wf2.Slider.HORIZONTAL) {
			var mx = this._eventClientX - rect.left;
			var l = this._thumbLeft;
			var w = wf2.Slider.THUMB_WIDTH;
	
			// _increasing is true, false or null
			if (mx < l && this._increasing != true) {
				this.setValue(this.getValue() - this.getBlockIncrement());
				this._increasing = false;
				//this.layout();
			} else if (mx > l + w && this._increasing != false) {
				this.setValue(this.getValue() + this.getBlockIncrement());
				this._increasing = true;
				//this.layout();
			}
		} else {
			var my = this._eventClientY - rect.top;
			var t = this._thumbTop;
			var h = wf2.Slider.THUMB_HEIGHT;
	
			if (my < t && this._increasing != false) {
				this.setValue(this.getValue() + this.getBlockIncrement());
				this._increasing = true;
				//this.layout();
			} else if (my > t + h && this._increasing != true) {
				this.setValue(this.getValue() - this.getBlockIncrement());
				this._increasing = false;
				//this.layout();
			}
		}
		this._firedOnce = true;
	},
	
	onmousedown: function() {
		this.base();
		//this.element.focus();
		event.returnValue = false;
		if (!this.owner._isEditable()) return;
		this._dragging = this._activeThumb;
		if (this._dragging) {
			this._dragInfo = {
				screenX: event.screenX,
				screenY: event.screenY,
				dx:      event.screenX - this._thumbLeft,
				dy:      event.screenY - this._thumbTop
			};
			this.layout(); // make thumb active
			this._firedOnce = true;
		} else {
			this.startTimer();
			this._eventClientX = event.clientX;
			this._eventClientY = event.clientY;
		}
	},
	
	onmouseup: function() {
		this.base();
		event.returnValue = false;
		delete this._dragging;
		delete this._dragInfo;
		if (!this._firedOnce) this.oninterval();
		this.stopTimer();
		delete this._eventClientX;
		delete this._eventClientY;
		delete this._increasing;
		delete this._firedOnce;
	},
	
	onmousemove: function() {
		if (this._dragging) {
			var size, pos;
			if (this.orientation == wf2.Slider.HORIZONTAL) {
				size = this.element.clientWidth - wf2.Slider.THUMB_WIDTH;
				pos = event.screenX - this._dragInfo.dx;
			} else {
				size = this.element.clientHeight - wf2.Slider.THUMB_HEIGHT;
				pos = size - event.screenY + this._dragInfo.dy;
			}
			this.setValue(pos / size);
			//this.layout();
		} else {
			this.base();
		}
	},
	
	onkeydown: function() {
		if (!this.owner._isEditable()) return;
		var keyCode = event.keyCode;
		switch (keyCode) {
			case 33: // page up
				this.setValue(this.getValue() + this.getBlockIncrement());
				break;
			case 34: // page down
				this.setValue(this.getValue() - this.getBlockIncrement());
				break;
			case 35: // end
				this.setValue(1);
				break;
			case 36: // home
				this.setValue(0);
				break;
			case 38: // up
			case 39: // right
				this.setValue(this.getValue() + this.getUnitIncrement());
				break;
			case 37: // left
			case 40: // down
				this.setValue(this.getValue() - this.getUnitIncrement());
				break;
		}
	
		if (keyCode >= 33 && keyCode <= 40) {
			//this.layout();
			event.returnValue = false;
		}
	},
	
	onmousewheel: function() {
		var ui = this.getUnitIncrement() * parseInt(event.wheelDelta / 120);
		this.setValue(this.getValue() + ui);
		event.returnValue = false;
	},
	
	opropertychange: function() {
		switch (event.propertyName) {
			case "min":
			case "max":
			case "step":
				this.layout();
				break;
			default:
				this.base();
		}
	},
	
	getBlockIncrement: function() {
		// try to get as close as possible to 10% while still being a multiple
		// of the step and make sure that the block increment is not smaller than
		// twice the size of the unit increment
		var ui = this.getUnitIncrement();
		return Math.max(2 * ui, Math.round(0.1 / ui) * ui);
	},
	
	getUnitIncrement: function() {
		var range = this.owner; // sliders are bound to range controls
		return range._getStepValue() / (range._getMaxValue() - range._getMinValue());
	}
});
