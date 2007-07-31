// ===========================================================================
// Number
// ===========================================================================

this.Number = Scalar.extend({
	type: "number",
	step: 1,
	defaultStep: 1,
	min: "",
	max: "",
	value: NaN,
	
	_afterValidate: function() {
		if (this.chrome) this.chrome.showValidity();
	},
	
	_afterValueChange: function() {
		// validate keyboard entry
		if (event.propertyName == "value" && this._isActive() && !this.chrome.isActive()) {
			this.value = this._parse(this.raw.nodeValue);
		}
		this.base();
	},
	
	_getRawValue: function() {
		return wf2.isNaN(this.value) ? this.raw.nodeValue : this._format(this.value);
	},
	
	_setRawValue: function(value, silent) {
		this.silent = silent;
		var v1 = (typeof value == "string") ? this._parse(value) : Number(value);
		this.value = v1;
		var v2 = wf2.isNaN(v1) ? value : this._displayValue();
		// IE fires onpropertychange even if we don't change so make sure we only
		// set if really changed
		if (v2 != this.raw.nodeValue) {
			this.raw.nodeValue = v2;
		}
	},
	
	_displayValue: function() {
		return this._isActive() ? this._format(this.value) : this._toLocaleString();
	},
	
	_parse: function(string) {
		return wf2.isNaN(string) ? NaN : Number(string);
	},
	_format: function(number) {
		return String(number);
	},
	_toLocaleString: function() {
		return String(this.value);
	},
	
	_setChrome: function(klass) {
		this.base(klass || Spinner);
	},
	
	_validate: function() {
		var value = Number(this.value);
		var empty = this._noValueSelected();
		this.validity.typeMismatch = !empty && wf2.isNaN(value);
		this.validity.stepMismatch = !empty && false; // TO DO
		this.validity.rangeOverflow = !empty && !wf2.isNaN(this.max) && (value > this.max);
		this.validity.rangeUnderflow = !empty && !wf2.isNaN(this.min) && (value < this.min);
		this.base();
	},
	
	get_valueAsDate: function() {
		return new Date(this.value);
	},
	
	get_valueAsNumber: function() {
		return this.value.valueOf();
	},
	
	get_min: function() {
		return wf2.isNaN(this.min) ? this.min : this._format(this.min);
	},
	set_min: function(min) {
		this.base(this._parse(min) || min);
	},
	
	get_max: function() {
		return wf2.isNaN(this.max) ? this.max : this._format(this.max);
	},
	set_max: function(max) {
		this.base(this._parse(max) || max);
	},
	
	set_step: function(step) {
		if (step != "any") {
			step = (wf2.isNaN(step) || step <= 0) ? this.defaultStep : Number(step);
		}
		this.base(step);
	},
	
	stepUp: function(n) {
		if (!isNaN(n)) this._increment(n);
	},
	
	_getMinValue: function() {
		return wf2.isNaN(this.min) ? 0 : this.min;
	},
	
	_getMaxValue: function() {
		return wf2.isNaN(this.max) ? 0 : this.max;
	},
	
	_getStepValue: function() {
		return wf2.isNaN(this.step) ? this.defaultStep : this.step;
	},
	
	_getStartValue: function() {
		return this._getValidValue(0);
	},
	
	_getValidValue: function(value) {
		if (wf2.isNaN(value)) value = this._getStartValue();
		if (!wf2.isNaN(this.min) && value <= this.min) {
			return this.min;
		} else if (!wf2.isNaN(this.max) && value >= this.max) {
			return this.max
		} else {
			var min = this._getMinValue();
			var step = this._getStepValue();
			return min + Math.round((value - min) / step) * step;
		}
	},
	
	_setValidValue: function(value) {
		this._setRawValue(this._getValidValue(value));
	},
	
	_increment: function(n) {
		var value = this.get_valueAsNumber() + this._getStepValue() * (n || 1);
		this._setRawValue(this._getValidValue(value));
	},
	
	_blockIncrement: function(n) {
		this._increment(n * 10);
	},
	
	oncontentready: function() {
		this._setRawValue(this.raw.nodeValue, true);
		this.base();
	},
	
	onpropertychange: function() {
		if (this.ready) {
			switch (event.propertyName) {
				case "min":
				case "max":
				case "step":
					this._validate();
					break;
				default:
					this.base();
			}
		}
	},
	
	onactivate: function() {
		if (this._isEditable()) {
			this._setRawValue(this._getRawValue(), true);
		}
	},
	
	ondeactivate: function() {
		this.base();
		if (this._isEditable()) {
			this._setRawValue(this.raw.nodeValue, true);
		}
	},
	
	_getTypeHint: function() {
		return wf2.Number.hint;
	}
}, {
	className: "Number",
	
	pad: function(value, length) {
		return ("000" + value).slice(-(length || 2));
	}
});
