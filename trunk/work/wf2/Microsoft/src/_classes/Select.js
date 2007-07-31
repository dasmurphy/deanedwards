// ===========================================================================
// Select
// ===========================================================================

var Select = this.Select = Data.extend({
	tagName: "SELECT",
	type: "select-one",
	behaviorUrn: "select.htc",
	data : null,
	_cloneElement: function() {
		// this is probably not the most efficient
		//  way of submitting a clone of this element
		var clone = this.element.cloneNode(true);
		clone.style.behavior = "none";
		return clone;
	},
	_validate: function() {
	},
	get_data: function() {
		return this.data;
	},
	set_data: function(data) {
		this._setCustomAttribute(String(data));
	},
	get_selectedOptions: function() {
		var map = {};
		var options = this.element.options, option;
		for (var i = 0; (option = options[i]); i++) {
			if (option.selected) {
				map[option.uniqueID] = option;
			}
		}
		return new HTMLCollection(map);
	}
});
