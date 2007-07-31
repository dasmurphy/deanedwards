// ===========================================================================
// Control
// ===========================================================================

// concerned with validity and value

var Control = this.Control = FormItem.extend({
	constructor: function(component) {
		this.base(component);
		this.raw = this.element.attributes.value;
		if (!this.raw) {
			this.raw = this._createAttribute("value");
			this.raw.nodeValue = "";
		}
		this.validity = new ValidityState(this);
	},
	raw: null,
	validity: null,
	
	_afterValidate: function() {
	},
	
	_noValueSelected: function() {
		return this.raw.nodeValue == "";
	},
	
	_toLocaleString: function() {
		return this.raw.nodeValue;
	},
	
	_getRawValue: function() {
		return this.raw.nodeValue;
	},
	
	_setRawValue: function(value, silent) {
		this.silent = silent;
		// IE fires onpropertychange even if we don't change so make sure we only
		// set if really changed
		if (this.raw.nodeValue != value) {
			this.raw.nodeValue = value;
		}
	},
	
	_isSuccessful: function() {
		return this.element.name && !this.element.isDisabled;
	},
	
	_validate: function() {
		this.validity._validate();
		this._afterValidate();
	},
	
	get_labels: function() {
		return null; // not implemented yet
	},
	
	get_validity: function() {
		return this.validity;
	},
	
	get_validationMessage: function() {
		return this.validity.toString();
	},
	
	get_value: function() {
		return this._getRawValue();
	},
	set_value: function(value) {
		this._DOMPropertyChanged = true;
		this._setRawValue(value);
	},
	
	get_willValidate: function() {
		return this.element.name && this.get_form() && !this.element.isDisabled;
	},
	
	checkValidity: function(hint) {
		this._validate();
		if (!this.validity.valid) {
			if (hint) {
				this._focus();
				if (!System.hint && wf2.HintPopup) {
					System.hint = new wf2.HintPopup;
				}
				if (System.hint) {
					System.hint.show(this);
				}
			}
			this._fireCustomEvent("oninvalid");
		}
		return this.validity.valid;
	},
	
	setCustomValidity: function(error) {
		this.validity.customError = String(error);
		this.validity._validate();
	},
	
	oncontentready: function() {
		this.base();
		this._validate();
	}
});
