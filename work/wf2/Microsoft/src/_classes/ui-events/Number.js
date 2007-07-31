// ===========================================================================
// Number
// ===========================================================================

wf2.Number.prototype.extend({
	onpaste: function() {
		if (isNaN(clipboardData.getData("text"))) {
			event.returnValue = false;
		}
	},
	
	ondblclick: function () {
		// IE does not fire down up for dblclicks
		this.base();
		this.element.select();
	},
	
	onkeypress: function () {
		// this has no effect on UI
	
		if (!this._isEditable()) return;
	
		var preventDefault = true;
		var keyCode = event.keyCode;
		switch (keyCode) {
			case 69:  // E
				var range = document.selection.createRange();
				range.text = "e";
				range.collapse(false);
				range.select();
				break;
			case 101: // e
			case 45:  // MINUS
			case 46:  // DOT
			case 44:  // COMMA
				preventDefault = false;
		}
		if (keyCode >= 48 && keyCode <= 57) { // number
			preventDefault = false;
		}
	
		if (preventDefault) {
			event.returnValue = false;
		}
	},
	
	onmousewheel: function() {
		if (this.chrome) this.chrome.onmousewheel();
	}
});
