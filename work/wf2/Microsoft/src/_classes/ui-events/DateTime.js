// ===========================================================================
// DateTime
// ===========================================================================

wf2.DateTime.prototype.extend({
	onkeypress: function () {
		switch (event.keyCode) {
			// allow
	//		case 47:  // SLASH
			case 58:  // COLON
				break;
			// disallow
			case 69:   // E
			case 101:  // e
			case 44:   // COMMA
				event.returnValue = false;
				break;
			default:
				this.base();
		}
	}
});
