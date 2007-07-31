// ===========================================================================
// Text
// ===========================================================================

var Text = this.Text = Scalar.extend({
	type: "text",
	patternRegExp: /.*/,
	pattern: "",
	hint: null,
	
	_validate: function() {
		this.validity.patternMismatch = !this.patternRegExp.test(this._getRawValue());
		this.validity.tooLong = this._getRawValue().length > this.get_maxLength();
		this.base();
	},
	
	_getTypeHint: function() {
		return this._getPatternHint();
	},
	
	_getPatternHint: function() {
		return this.pattern ? this.element.title : "";
	},
	
	get_maxLength: function() {
		return this.element.maxLength;
	},
	
	get_pattern: function() {
		return this.pattern;
	},
	set_pattern: function(pattern) {
		// create the RegExp used for validation
		if (pattern == null) {
			this.patternReg = Text.PATTERN;
		} else {
			try { // TO DO: escape pattern text?
				this.patternRegExp = new RegExp("^$|^" + pattern + "$");
			} catch (ignore) {
				this.patternRegExp = Text.PATTERN;
			}
		}
		this.base(String(pattern));
	},
	
	onpropertychange: function() {
		if (this.ready) {
			switch (event.propertyName) {
				case "maxLength":
				case "pattern":
					this._validate();
					break;
				default:
					this.base();
			}
		}
	}
}, {
	PATTERN: /.*/
});
