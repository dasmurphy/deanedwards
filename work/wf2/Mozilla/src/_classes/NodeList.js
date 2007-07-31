// ===========================================================================
// NodeList
// ===========================================================================

var NodeList = this.NodeList = Base.extend({
	constructor: function(map) {
		// create a temporary list from a hash map of
		//  WF2 FormItem objects
		var list = [];
		for (var uniqueID in map) {
			list.push(document.all[uniqueID]);
		}
		// sort the list by sourceIndex
		list.sort(NodeList.sort);
		// build this collection from the sorted list
		for (var i = 0; (node = list[i]); i++) {
			this._addItem(node, i);
		}
	},
	
	length: 0,
	
	_addItem: function(node, index) {
		this[index] = node;
		this.length = index;
	},
	
	item: function(index) {
		return this[index];
	}
}, {
	className: "NodeList",
	
	sort: function(element1, element2) {
		return element1.sourceIndex - element2.sourceIndex;
	}
});
