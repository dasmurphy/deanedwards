// ===========================================================================
// Button
// ===========================================================================

var Button = this.Button = Input.extend({
	type: "button",
	
	_isSuccessful: function() {
		return false;
	},
	
	onpropertychange: function() {
	},
	
	checkValidity: function() {
		return true;
	},
	
	get_validationMessage: function() {
		return "";
	},
	
	get_willValidate: function() {
		return false;
	},
	
	setCustomValidity: function() {
		throw System.NOT_SUPPORTED_ERR;
	},
	
	_validate: function() {
	}
}, {
	className: "Button"
});
