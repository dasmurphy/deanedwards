// ===========================================================================
// Data
// ===========================================================================

var Data = this.Data = Input.extend({
	required: false,
	
	set_required: function(required) {
		this.base(Boolean(required || !this.ready));
		this.validity.valueMissing = this.required && this._noValueSelected();
		this.validity._validate();
	},
	
	_validate: function() {
		this.validity.valueMissing = this.required && this._noValueSelected();
		this.validity.customError = Boolean(this.customValidity);
		this.base();
	}
}, {
	className: "Data"
});
