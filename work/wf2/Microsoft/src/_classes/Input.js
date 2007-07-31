// ===========================================================================
// Input
// ===========================================================================

var Input = this.Input = Control.extend({
	constructor: function(component) {
		this.base(component);
		this.readOnly = this._getAttribute("readOnly");
	},
	
	behaviorUrn: "input.htc",
	tagName: "INPUT",
	type: null,
	autofocus: false,
	readOnly: false,
	
	_cloneElement: function() {
		var clone = document.createElement("<input name=" + this.element.name + ">");
		clone.style.behavior = "none";
		clone.value = this.get_value();
		return clone;
	},
	
	_afterValueChange: function() {
		if (!this.silent) {
			this._validate();
			this._fireCustomEvent("onDOMControlValueChanged");
			if (!this._DOMPropertyChanged) {
				this._fireCustomEvent("oninput");
			}
		}
		delete this._DOMPropertyChanged;
		this.silent = !this.ready;
	},
	
	_isEditable: function() {
		return !this.get_readOnly() && !this.element.isDisabled;
	},
	
	_getTypeHint: function() {
		return ValidityState.messages.typeMismatch;
	},
	
	get_autofocus: function() {
		return this.autofocus;
	},
	
	set_autofocus: function(autofocus) {
		this._setCustomAttribute("autofocus", Boolean(autofocus || !this.ready));
		if (!this.ready) {
			if (System.ready) {
				this._focus();
			} else {
				Input._focus = this;
			}
		}
	},
	
	get_disabled: function() {
		return this._getAttribute("disabled");
	},
	set_disabled: function(disabled) {
		this._setAttribute("disabled", disabled);
	},
	
	get_list: function() {
		return this.list;
	},
	set_list: function(list) {
		this._setCustomAttribute("list", list);
	},
	
	get_min: function() {
		return this.min;
	},
	set_min: function(min) {
		this._setCustomAttribute("min", min);
	},
	
	get_max: function() {
		return this.max;
	},
	set_max: function(max) {
		this._setCustomAttribute("max", max);
	},
	
	get_pattern: function() {
		return this.pattern;
	},
	set_pattern: function(pattern) {
		this._setCustomAttribute("pattern", pattern);
	},
	
	get_readOnly: function() {
		return this.readOnly;
	},
	set_readOnly: function(readOnly) {
		this.readOnly = Boolean(readOnly);
		this._setAttribute("readOnly", this.readOnly);
	},
	
	get_required: function() {
		return this.required;
	},
	set_required: function(required) {
		this._setCustomAttribute("required", required);
	},
	
	get_selectedOption: function() {
		return null;
	},
	
	get_step: function() {
		return this.step;
	},
	set_step: function(step) {
		this._setCustomAttribute("step", step);
	},
	
	get_type: function() {
		return this.type;
	},
	
	get_valueAsDate: function() {
		return new Date(this.get_value());
	},
	set_valueAsDate: function(value) {
		this.set_value(value);
	},
	
	get_valueAsNumber: function() {
		return Number(this.get_value());
	},
	set_valueAsNumber: function(value) {
		this.set_value(value);
	},
	
	stepDown: function(n) {
		this.stepUp(-n);
	},
	
	stepUp: function(n) {
	},
	
	dispatchChange: function() {
		this._fireEvent("onchange");
	},
	
	dispatchFormChange: function() {
		this._fireCustomEvent("onformchange");
	},
	
	onchange: function() {
		this.checkValidity();
		this._forEachForm(function(form) {
			form.dispatchFormChange();
		});
	},
	
	onpropertychange: function() {
		if (this.ready && event.propertyName == "value") {
			this._afterValueChange();
		}
	},
	
	ondocumentready: function() {
		if (Input._focus == this) {
			this._focus();
			delete Input._focus;
		}
	}
}, {
	DEFAULT_BACKGROUND: "#ffffff"
});
