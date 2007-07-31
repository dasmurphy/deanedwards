// ===========================================================================
// Month
// ===========================================================================

var Month = this.Month = wf2.Date.extend({
	type: "month",
	step: 1,
	defaultStep: 1,
	
	_parse: function(string) {
		return Month.parse(string);
	},
	_format: function(month) {
		return Month.format(month);
	},
	_toLocaleString: function() {
		return Month.format(this.value);
	},
	
	_increment: function(n) {
		this._incrementDate("Month", n * this._getStepValue());
	},
	
	_blockIncrement: function(n) {
		// we'll ignore the step for a block increment
		// we'll just increment by year
		this._incrementDate("Month", n * 12);
	},
	
	_setChrome: function() {
		this.base(Spinner);
	},
	
	_getTypeHint: function() {
		return Month.hint;
	}
}, {
	className: "Month",
	
	format: function(date) {
		return wf2.Date.format(date).slice(0, -3);
	},
	
	parse: function(string) {
		return wf2.Date.parse(string + "-01");
	}
});

