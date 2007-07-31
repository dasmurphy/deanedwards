// ===========================================================================
// Week
// ===========================================================================

var Week = this.Week = this.Date.extend({
	type: "week",
	
	_parse: function(string) {
		return Week.parse(string);
	},
	_format: function(week) {
		return Week.format(week);
	},
	_toLocaleString: function() {
		return Week.format(this.value);
	},
	
	_increment: function(n) {
		this._incrementDate("Date", n * this._getStepValue() * 7);
	},
	
	_blockIncrement: function(n) {
		// we'll ignore the step for a block increment
		// we'll just increment by year
		this._incrementDate("Year", n);
	},
	
	_getTypeHint: function() {
		return Week.hint;
	}
}, {
	className: "Week",
	
	MILLISECONDS: 7 * 24 * 60 * 60 * 1000,
	MONDAY: 1,
	PATTERN: /^\d{4}-W([0-4]\d|5[0-3])$/,
	
	format: function(date) {
		var year = new Date(date.getFullYear(), 0, 1);
		var week = parseInt((date - year) / Week.MILLISECONDS) + 1;
		return date.getFullYear() + "-W" + wf2.Number.pad(week);
	},
	
	parse: function(string) {
		if (!Week.PATTERN.test(string)) return NaN;
		var parts = String(string).split("-W");
		var date = new Date(1970, 0, 1);
		date.setFullYear(parts[0]);
		while (date.getDay() != Week.MONDAY) date.setDate(date.getDate() + 1);
		date = new Date(date.valueOf() + (parts[1] - 1) * Week.MILLISECONDS);
		return (date.getFullYear() == parts[0]) ? date : NaN;
	}
});
