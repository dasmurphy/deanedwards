// ===========================================================================
// File
// ===========================================================================

var File = this.File = Data.extend({
	type: "file",
	min: 0,
	max: 1,
	
	_afterSubmit: function() {
		if (this._clone) {
			this._clone.replaceNode(this.element);
			delete this._clone;
		}
	},
	
	_cloneElement: function() {
		// cloning doesn't work on file elements so
		//  we have to use the real element and use
		//  the clone as a placeholder while we're
		//  messing about with it
		// -
		// this causes a progress bar in IE6 - don't know why
		var clone = this.base();
		if (this.get_value()) {
			this._clone = clone;
			this.element.replaceNode(clone);
			clone = this.element;
			this.element._clone = this;
		}
		return clone;
	},
	
	oncontentready: function() {
		if (!this._clone) this.base();
	},
	
	ondetach: function() {
		if (!this._clone) this.base();
	}
});
