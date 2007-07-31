// ===========================================================================
// Week
// ===========================================================================

wf2.Week.prototype.extend({
	onkeypress: function () {
		switch (event.keyCode) {
			// allow
			case 119:  // w
				var range = document.selection.createRange();
				range.text = "W";
				range.collapse(false);
				range.select();
				event.returnValue = false;
			case 87:  // W
				break;
	/*
			// disallow
			case 47:  // SLASH
			case 46:  // DOT
				event.returnValue = false;
				break;
	*/
			default:
				this.base();
		}
	}
});
