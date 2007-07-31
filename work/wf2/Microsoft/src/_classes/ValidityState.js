// ===========================================================================
// ValidityState
// ===========================================================================

var ValidityState = this.ValidityState = Base.extend({
	constructor: function(owner) {
		this.owner = owner;
	},
	
	owner: null,
	typeMismatch: false,
	stepMismatch: false,
	rangeUnderflow: false,
	rangeOverflow: false,
	tooLong: false,
	patternMismatch: false,
	valueMissing: false,
	customError: "",
	valid: true,
	
	dispose: function() {
		this.owner = null;
	},
	
	_validate: function() {
		this.valid = !(
			this.typeMismatch ||
			this.rangeUnderflow ||
			this.rangeOverflow ||
			this.tooLong ||
			this.patternMismatch ||
			this.valueMissing ||
			Boolean(this.customError)
		);
	},
	
	toString: function() {
		if (this.valid) return "";
		if (this.customError) return customError;
		var messages = ValidityState.messages;
		if (this.valueMissing) return messages.valueMissing;
		if (this.patternMismatch || this.typeMismatch) return this.owner._getTypeHint();
		if (this.tooLong) return messages.tooLong;
		if (this.rangeUnderflow) return messages.rangeUnderflow;
		if (this.rangeOverflow) return messages.rangeOverflow;
	}
}, {
	messages: {}
});
