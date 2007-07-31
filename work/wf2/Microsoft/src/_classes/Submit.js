// ===========================================================================
// Submit
// ===========================================================================

var Submit = this.Submit = Button.extend({
	constructor: function(component) {
		this.base(component);
		this.tagName = this.element.tagName;
	},
	
	type: "submit",
	
	_isSuccessful: function() {
		return this.element.name && this._isActive();
	},
	
	ondocumentready: function () {
		// this code removes the focus of a form's default
		//  submit button
		if (this._getAttribute("type") == "submit") {
			var element = this.element;
			var outerHTML = "<" + element.tagName + " type=button value='' name=" + element.name + ">";
			var button = document.createElement(outerHTML);
			button.innerText = element.innerText;
			this.raw = button.attributes.value;
			this.raw.nodeValue = this.get_value();
			// TO DO: copy other attributes
			//button.mergeAttributes(element);
			this.formsMap = {};
			button._clone = this;
			element.replaceNode(button);
		}
	}
});
