// ===========================================================================
// Email
// ===========================================================================

var Email = this.Email = Text.extend({
	type: "email",
	
	_getPatternHint: function() {
		return (Email.hint + "\n" + this.base()).replace(/\s$/, "");
	},
	
	_validate: function() {
		this.validity.typeMismatch = !Email.PATTERN.test(this._getRawValue());
		this.base();
	}
}, {
	className: "Email",
	// http://www.ietf.org/rfc/rfc2822 without comments and without whitespace except in quoted strings
	PATTERN: /^$|^("[^"]*"|[^\s\.]\S*[^\s\.])@[^\s\.]+(\.[^\s\.]+)*$/
});
