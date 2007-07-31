// ===========================================================================
// Element
// ===========================================================================

var Element = Base.extend({
	destructor: function () {
		this.element = null;
	},
	
	element: null,
	
	hasAttribute: function(name) {
		return this.element.hasAttribute(name);
	},
	
	getAttribute: function(name) {
		return this.element.getAttribute(name);
	},
	
	setAttribute: function(name, val) {
		return this.element.setAttribute(name, val);
	}
});
