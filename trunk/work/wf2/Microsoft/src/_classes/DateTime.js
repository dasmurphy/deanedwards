// ===========================================================================
// DateTime
// ===========================================================================

var DateTime = this.DateTime = this.Number.extend({
	step: 60,
	defaultStep: 60,
	type: "datetime",
	
	_format: function(datetime) {
		return DateTime.format(datetime);
	},
	
	_parse: function(string) {
		return DateTime.parse(string);
	},
	
	_toLocaleString: function() {
		return this.value.toLocaleString();
	},
	
	_setRawValue: function(value, silent) {
		this.silent = silent;
		var v1 = (typeof value == "string") ? this._parse(value) : new Date(value);
		this.value = v1;
		var v2 = wf2.isNaN(v1) ? value : this._displayValue();
		// IE fires onpropertychange even if we don't change so make sure we only
		// set if really changed
		//- v2 = this._checkWidth(v2);
		if (v2 != this.raw.nodeValue) {
			this.raw.nodeValue = v2;
		}
	},
	
	_setChrome: function(klass) {
		this.base(klass || ComboBox);
	},
	
	_createPopup: function() {
		if (!wf2.Date.popup && wf2.DatePopup) {
			wf2.Date.popup = new wf2.DatePopup;
		}
		return wf2.Date.popup;
	},
	
	_increment: function(n) {
		this.base(n * 1000);
	},
	
	_incrementDate: function(part, n) {
		var value = this.get_valueAsDate();
		value["set" + part](value["get" + part]() + (n || 1));
		this._setRawValue(this._getValidValue(value));
	},
	
	_getStartValue: function() {
		return this._getValidValue(this._parse(this._format(new Date)));
	},
	
	_getTypeHint: function() {
		return DateTime.hint;
	}
}, {
	format: function(datetime) {
		datetime.setMinutes(datetime.getMinutes() - datetime.getTimezoneOffset());
		return DatetimeLocal.format(datetime) + "Z"
	},
	
	parse: function(string) {
		// trim trailing "Z"
		string = String(string).slice(0, -1);
		var datetime = DateTimeLocal.parse(string);
		if (isNaN(datetime)) return datetime;
		datetime.setMinutes(datetime.getMinutes() + datetime.getTimezoneOffset());
		return datetime;
	}
});
