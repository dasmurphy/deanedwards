// ===========================================================================
// Date
// ===========================================================================

this.Date = DateTime.extend({
	type: "date",
	step: 1,
	defaultStep: 1,
	
	_parse: function(string) {
		return wf2.Date.parse(string);
	},
	_format: function(date) {
		return wf2.Date.format(date);
	},
	_toLocaleString: function() {
		return this.value.toLocaleDateString();
	},
	
	_increment: function(n) {
		this._incrementDate("Date", n * this._getStepValue());
	},
	
	_blockIncrement: function(n) {
		// we'll ignore the step for a block increment
		// we'll just increment by month
		this._incrementDate("Month", n);
	},
	
	_getTypeHint: function() {
		return wf2.Date.hint;
	}
}, {
	PATTERN: /^\d{4}-(0\d|10|11|12)-\d{2}$/,
	
	format: function(date) {
		var pad = wf2.Number.pad;
		return pad(date.getFullYear(), 4) + "-" + pad(date.getMonth() + 1) + "-" + pad(date.getDate());
	},
	
	parse: function(string) {
		if (!wf2.Date.PATTERN.test(string)) return NaN;
		var date = new Date(1970, 0, 1);
		var parts = String(string).split("-");
		date.setFullYear(parts[0]);
		date.setMonth(parts[1] - 1);
		date.setDate(parts[2]);
		if (!Number(parts[1]) || parts[2] != date.getDate()) return NaN;
		return date;
	}
});

