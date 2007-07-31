// ===========================================================================
// Boolean
// ===========================================================================

this.Boolean = Data.extend({
	_isSuccessful: function() {
		return this.element.checked && this.base();
	}
}, {
	className: "Boolean"
});
