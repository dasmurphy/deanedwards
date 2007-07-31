// ===========================================================================
// Data
// ===========================================================================

wf2.Data.prototype.extend({
	onkeydown: function() {
		if (event.keyCode == 13) {
			this._triggerSubmission();
		} else {
			this.base();
		}
	},
	
	_triggerSubmission: function() {
		var form = Element.getImplementation(this.get_form());
		if (form) {
			this.dispatchChange();
			form._triggerSubmission();
			event.returnValue = false; // prevent default
		}
	}
});
