// ===========================================================================
// Output
// ===========================================================================

var Output = this.Output = Control.extend({
	behaviorUrn: "output.htc",
	tagName: "OUTPUT",
	defaultValue: "",
	
	_getRawValue: function() {
		return this.innerText;
	},
	_setRawValue: function(value, silent) {
		this.innerText = value;
		if (!silent) this.component.value.fireChange();
	},
	get_validationMessage: function() {
		return "";
	},
	get_willValidate: function() {
		return false;
	},
	get_defaultValue: function() {
		return this.defaultValue;
	},
	set_defaultValue: function(defaultValue) {
		this._setCustomAttribute(defaultValue);
	},
	checkValidity: function() {
		return true;
	},
	setCustomValidity: function() {
		throw System.NOT_SUPPORTED_ERR;
	},
	_validate: function() {
	}
}, {
	className: "Output"
});
