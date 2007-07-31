// ===========================================================================
// Url
// ===========================================================================

var Url = this.Url = Text.extend({
	type: "url",
	
	_getPatternHint: function() {
		return (Url.hint + "\n" + this.base()).replace(/\s$/, "");
	},
	
	_validate: function() {
		this.validity.typeMismatch = !Url.PATTERN.test(this._getRawValue());
		this.base();
	}
}, {
	className: "Url",
	// [[fix]] absoluteURI from http://www.ietf.org/rfc/rfc2396
	PATTERN: /^$|^[a-zA-Z][a-zA-Z0-9+-.]*:[^\s]+$/
});
