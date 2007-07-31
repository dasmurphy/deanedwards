// ===========================================================================
// Checkbox
// ===========================================================================

var Checkbox = this.Checkbox = this.Boolean.extend({
	type: "checkbox",
	
	_noValueSelected: function() {
		return !this.element.checked;
	}
}, {
	className: "Checkbox"
});
