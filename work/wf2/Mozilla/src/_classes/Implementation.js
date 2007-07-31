// ===========================================================================
// Implementation
// ===========================================================================

var Implementation = this.Implementation = this.Base.extend({
	constructor: function() {
		// globalise the bind method (it is used in CSS expressions)
		var self = this;
		wf2.bind = function(component) {
			return self.bind(component);
		};
		// create bindings
		this.bindings = {};
		var behaviors = [
			"INPUT,BUTTON{behavior:url(" + System.path + "input.htc)}",
			"DATALIST *{behavior:none!important}"
		];
		for (var i in wf2) {
			if (wf2[i] && wf2[i].className) {
				var _interface = wf2[i].prototype;
				var tagName = _interface.tagName;
				if (tagName) {
					if (tagName == "INPUT") {
						if (_interface.type) this.bindings[_interface.type] = wf2[i];
					} else {
						var behaviorUrn = _interface.behaviorUrn;
						if (behaviorUrn) {
							this.bindings[tagName] = wf2[i];
							behaviors.push(tagName + "{behavior:url(" + System.path + behaviorUrn + ")}");
						}
					}
				}
			}
		}
		// bindings applied using CSS
		var styleSheet = document.createStyleSheet();
		styleSheet.cssText = this.cssText + behaviors.join("");
	},
	
	bindings: null,
	cssText: "datalist {display: none;}\ninput, output {font-family: Sans-Serif;}",
	
	bind: function(component) {
		// allow for re-attachment
		var element = component.element;
		if (element._clone) return this.getClone(component);
		var binding = element.tagName;
		var type = "text";
		switch (binding) {
		  case "BUTTON":
			var typeNode = element.attributes.type;
			type = typeNode ? typeNode.nodeValue : "submit";
		  case "INPUT":
			// get the input type
			var search = /type="?([^\s">]*)"?/i;
			binding = (element.outerHTML.match(search)||[])[1] || type;
			break;
		}
		if (!this.bindings[binding]) binding = "text";
		return new this.bindings[binding](component);
	},
	
	onload: function() {
		this.fixElements("output");
		this.fixElements("datalist");
	},
	
	getClone: function(component) {
		var element = component.element;
		var implementation = element._clone;
		element._clone = null;
		implementation.uniqueID = element.uniqueID;
		Element.all[element.uniqueID] = implementation;
		implementation.component = component;
		implementation.element = element;
		return implementation;
	},
	
	fixElements: function(tagName) {
		var elements = document.getElementsByTagName(tagName), element;
		for (var i = 0; (element = elements[i]); i++) {
			this.fixElement(element);
		}
	},
	
	fixElement: function(element) {
		//element.runtimeStyle.behavior = "none"; // this line stops the progress bar
		var fixed = document.createElement(element.outerHTML);
		if (element.outerHTML.slice(-2) != "/>") {
			// remove child nodes and copy them to the new element
			var endTag = "</" + element.tagName + ">", nextSibling;
			while ((nextSibling = element.nextSibling) && nextSibling.outerHTML != endTag) {
				fixed.appendChild(nextSibling);
			}
			// remove the closing tag
			if (nextSibling) nextSibling.removeNode();
		}
		// replace the broken element with the fixed element
		element.replaceNode(fixed);
		// return the new element
		return fixed;
	}
}, {
	className: "Implementation"
});
