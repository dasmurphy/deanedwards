// ===========================================================================
// Time
// ===========================================================================

var Time = this.Time = DateTime.extend({
	type: "time",
	
	_format: function(time) {
		return Time.format(time, this.step);
	},
	
	_parse: function(string) {
		return Time.parse(string, this.step);
	},
	
	_toLocaleString: function() {
		return this.value.toLocaleTimeString();
		//return this._format(time) + " " + ((time.getHours() > 11) ? "PM" : "AM");
	},
	
	_setChrome: function() {
		this.base(Spinner);
	},
	
	_blockIncrement: function(n) {
		this._increment(n * 60);
	},
	
	_getStartValue: function() {
		return this._getValidValue(0);
	},
	
	_getTypeHint: function() {
		return Time.hint;
	}
}, {
	className: "Time",
	
	PATTERN: /^([01]\d|2[0-4]):[0-5]\d(:[0-5]\d(\.\d+)?)?$/,
	
	format: function(time, precision) {
		if (precision == null) precision = 60;
		var pad = wf2.Number.pad;
		var string = pad(time.getHours()) + ":" + pad(time.getMinutes());
		if (precision < 60) string += ":" + pad(time.getSeconds());
		if (precision < 1) string += "." + pad(time.getMilliseconds(), 3);
		return string;
	},
	
	parse: function(string) {
		if (!this.PATTERN.test(string)) return NaN;
		var time = new Date(1970, 0, 1);
		var parts = string.split(":");
		time.setHours(parts[0]);
		time.setMinutes(parts[1]);
		if (parts[2]) {
			// seconds
			parts = parts[2].split(".");
			time.setSeconds(parts[0]);
			// milliseconds
			if (parts[1]) {
				time.setMilliseconds(parts[1] * Math.pow(10, 3 - parts[1].length));
			}
		}
		return time;
	}
});
