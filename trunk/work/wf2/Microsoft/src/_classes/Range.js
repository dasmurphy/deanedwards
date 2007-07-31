// ===========================================================================
// Range
// ===========================================================================

var Range = this.Range = this.Number.extend({
	type: "range",
	min: 0,
	max: 100,
	
	_afterValueChange: function() {
		this.base();
		if (this.chrome) this.chrome.layout();
	},
	
	set_readOnly: function(readOnly) {
		this.base(readOnly);
		this._setChrome();
	},
	
	_setChrome: function() {
		this.base(this.readOnly ? ProgressBar : Slider);
	},
	
	onactivate: function() {
	},
	
	ondeactivate: function() {
	}
});
