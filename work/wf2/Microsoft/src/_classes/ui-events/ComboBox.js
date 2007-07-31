// ===========================================================================
// ComboBox
// ===========================================================================

wf2.ComboBox.prototype.extend({
	isActive: function() {
		return this.popup && this.popup.isOpen();
	},
	
	getState: function () {
		var s;
		if (this.element.isDisabled) {
			s = "disabled";
		} else if (this.owner.get_readOnly() || !wf2.Popup) {
			s = "normal";
		} else if (this._hoverThumb && this._activeThumb) {
			s = "active";
		} else if (this._hoverThumb &&  !this.isActive()) {
			s = "hover";
		} else {
			s = "normal";
		}
		return wf2.Chrome.states[s];
	},
	
	popup: null,
	
	dispose: function() {
		this.base();
		this.popup = null;
	},
	
	onmousedown: function() {
		if (!this.owner._isEditable()) return;
		var BUTTON_LEFT = 1;
		if (!(event.button & BUTTON_LEFT)) return;
		if (!this.popup) {
			this.popup = this.owner._createPopup();
		}
		if (this.popup) {
			if (this.hitTest()) {
				if (!this.popup.isOpen()) this.base();
				this.popup.toggle(this.owner);
			}
		}
	},
	
	onkeydown: function () {
		// up/down-arrows
		if (this.owner._isEditable()) {
			var UP_DOWN = event.keyCode == 38 || event.keyCode == 40;
			if (!this.popup && UP_DOWN) {
				this.popup = this.owner._createPopup();
			}
			if (this.popup) {
				if (event.keyCode == 27) {	// escape
					this.popup.hide();
				} else if (UP_DOWN && !this.popup.isOpen()) {
					this.popup.show(this.owner);
					event.returnValue = false;
				} else if (this.popup.isOpen()) {
					this.popup.onkeydown();
					event.returnValue = false;
				} else this.base();
				return;
			}
		}
		this.base();
	},
	
	onkeyup: function () {
		if (this.isActive()) this.popup.onkeyup();
	}
});
