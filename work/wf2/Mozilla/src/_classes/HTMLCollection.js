// ===========================================================================
// HTMLCollection
// ===========================================================================

var HTMLCollection = this.HTMLCollection = NodeList.extend({
	_addItem: function(item, index) {
		this.base(item, index);
		this._addNamedItem(item, item.id);
		this._addNamedItem(item, item.name);
	},
	
	_addNamedItem: function(item, name) {
		if (name && !HTMLCollection.PROTECTED.test(name)) {
			if (this[name]) {
				// if there are duplications by id/name
				//  then create another list
				if  (this[name].constructor != NodeList) {
					this[name] = new NodeList([this[name]]);
				}
				this[name]._addItem(item);
			} else {
				this[name] = item;
			}
		}
	},
	
	namedItem: function(name) {
		// bah! who uses this? ;-)
		var namedItem = null, item;
		for (var i = 0; (item = this[i]); i++) {
			if (item.id == name) return item;
			if (!namedItem && item.name == name) namedItem = item;
		}
		return namedItem;
	}
}, {
	className: "HTMLCollection",
	
	PROTECTED: /^(item|namedItem|length)$/
});
