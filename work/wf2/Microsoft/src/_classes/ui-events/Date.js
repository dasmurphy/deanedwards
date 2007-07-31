// ===========================================================================
// Date
// ===========================================================================

wf2.Date.prototype.extend({
	onkeypress: function () {
		switch (event.keyCode) {
			// disallow
			case 58:  // COLON
			case 46:  // DOT
				event.returnValue = false;
				break;
			default:
				this.base();
		}
	}
});
