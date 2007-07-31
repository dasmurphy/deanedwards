
var Binding = Element.extend({
	constructor: function(element) {
		this.base(element);
		this.uniqueID = assignID(element);
		Binding.all[this.uniqueID] = this;
	},
	
	destructor: function () {
		this.base(element);
		if (Element.all) {
			delete Element.all[this.uniqueID];
		}
	},
	
	tagName: "",
	uniqueID: "",
}, {
	all: {},
	getImplementation: function(element) {
		return element && this.all[element.uniqueID];
	}
});
