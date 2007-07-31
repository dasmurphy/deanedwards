// ===========================================================================
// Time
// ===========================================================================

wf2.Time.prototype.extend({
	onkeypress: function () {
		switch (event.keyCode) {
			// disallow
	//		case 47:  // SLASH
			case 45:  // MINUS
				event.returnValue = false;
				break;
			default:
				this.base();
		}
	}
});
