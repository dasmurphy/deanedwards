var wf2 = new function() {
var wf2 = this;
// wf2 classes
/*
	common, version 1.0.4 (2005/06/05)
	Copyright 2005, Dean Edwards
	License: http://creativecommons.org/licenses/LGPL/2.1/
*/

// this function may be used to cast any javascript object
//  to a common object
function ICommon(that) {
	if (that != null) {
		that.base = Base.prototype.base;
		that.extend = Base.prototype.extend;
	}
	return that;
};

// sub-classing
ICommon.extend = function($prototype, $constructor) {
	// initialise class properties
	if (!$prototype) $prototype = {};
	if (!$constructor) $constructor = $prototype.constructor;
	if ($constructor == {}.constructor) $constructor = function () {};
	// build the inheritance chain
	//  insert a dummy constructor between the ancestor
	//  and the new constructor. this allows standard
	//  prototype inheritance plus chained constructor
	//  functions.
	$constructor.valueOf = function () { return this; };
	$constructor.valueOf.prototype = new this.valueOf;
	$constructor.valueOf.prototype.extend($prototype);
	$constructor.prototype = new $constructor.valueOf;
	$constructor.valueOf.prototype.constructor =
	$constructor.prototype.constructor = $constructor;
	$constructor.ancestor = this;
	$constructor.extend = arguments.callee;
	$constructor.ancestorOf = this.ancestorOf;
	return $constructor;
};

// root of the inheritance chain
ICommon.valueOf = function () { return this; };

// common interface
ICommon.valueOf.prototype = {
constructor: ICommon,
base: function() {
//-
//   Call this method from any other method to call that method's ancestor.
//   If there is no ancestor function then this function will throw an error.
//-
	return arguments.callee.caller.ancestor.apply(this, arguments);
},
extend: function(that) {
//-
//   Add the interface of another object to this object
//-
	// if this object is the prototype then extend the /real/ prototype
	if (this == this.constructor.prototype && this.constructor.extend) {
		return this.constructor.valueOf.prototype.extend(that);
	}
	// add each of one of the source object's properties to this object
	for (var i in that) {
		switch (i) {
			case "constructor": // don't do this one!
			case "toString":	// do this one maually
			case "valueOf":	 // ignore this one...
				continue;
		}
		// implement inheritance
		if (typeof that[i] == "function" && that[i] != this[i]) {
			that[i].ancestor = this[i];
		}
		// add the property
		this[i] = that[i];
	}
	// do the "toString" function manually
	if (that.toString != this.toString && that.toString != {}.toString) {
		that.toString.ancestor = this.toString;
		this.toString = that.toString;
	}
	return this;
}};

// create the root
function Base() {
//--
//   empty constructor function
//--
};
this.Base = ICommon.extend({
constructor: Base,
toString: function() {
	return "[common " + (this.constructor.className || "Object") + "]";
},

instanceOf: function(klass) {
	return this.constructor == klass || klass.ancestorOf(this.constructor);
},

startTimer: function(interval) {
	if (!this._timerId) {
		var self = this;
		this._timerId = setInterval(function() {
			self.oninterval();
		}, interval || 100);
	}
},

stopTimer: function() {
	if (this._timerId) {
		clearInterval(this._timerId);
		delete this._timerId;
	}
},

dispose: function() {
	this.stopTimer();
}

});
Base.className = "Base";
Base.ancestor = null;
Base.ancestorOf = function(klass) {
	// Is this class an ancestor of the supplied class?
	while (klass && klass.ancestor != this) klass = klass.ancestor;
	return Boolean(klass);
};

// preserve the common prototype so that we can tell when a
//  property of the root class has changed
Base.valueOf.ancestor = ICommon;

// c'est fini!
// ===========================================================================
// System
// ===========================================================================

this.System = Base.extend({
constructor: function() {
//--
//   The System class is static. It cannot be instantiated using the "new" operator.
//   Access system properties and methods through the System class itself.
//
//   e.g. System.print("Hello World!");
//-
},
dispose: function() {
	window.detachEvent("onunload", this.onunload);
	if (this.implementation) {
		this.implementation.dispose();
		delete this.implementation;
	}
	if (wf2.Date.popup) {
		wf2.Date.popup.dispose();
		delete wf2.Date.popup;
	}
	// delete all object properties
	delete this.popup;
	delete this.hint;
	delete Element.all;
	delete Form.map;
	//- delete this.overflow;
},
NOT_SUPPORTED_ERR: "Object doesn't support this action",
popup: null,
path: "",
scripts: {},
implementation: null,
onload: function() {
	this.ready = true;
	this.getLocaleStrings();
	this.implementation.onload();
	window.attachEvent("onunload", this.onunload);
},
onunload: function() {
	System.unload = true;
	System.dispose();
},
boot: function(path) {
	//window.offscreenBuffering = true;
	this.path = path || this.getPath();
	this.load("wf2-onload.js");
	//- this.createOverflow();

	// check for XP and set theme
	Chrome.detect();

	// create internal isNaN function
	wf2.isNaN = function(value) {
		return isNaN(value) || value === "" || value == null;
	};

	// load interfaces
	this.implementation = new Implementation;
},
getPath: function() {
	var scripts = document.scripts;
	this.src = scripts[scripts.length - 1].src;
	return this.src.slice(0, this.src.lastIndexOf("/") + 1);
},
load: function(src) {
	if (!this.scripts[src]) {
		this.scripts[src] = true;
		src = this.src.replace(/wf2\.js/, src);
		if (this.implementation) {
			var head = document.getElementsByTagName("head")[0];
			var script = document.createElement("script");
			script.src = src;
			head.appendChild(script);
		} else {
			document.write("<script src='" + src + "' defer><" + "/script>");
		}
	}
},
/*--
createOverflow: function() {
	this.overflow = document.createElement("span");
	var style = this.overflow.style
	style.pixelLeft = -99999;
	style.position = "absolute";
},
--*/
getLocaleStrings: function() {
	System.load("locale/en.js");
}
});
var System = this.System.valueOf.prototype;
this.System.className = "System";
// ===========================================================================
// Implementation
// ===========================================================================

this.Implementation = this.Base.extend({
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
});
var Implementation = this.Implementation;
Implementation.className = "Implementation";
// ===========================================================================
// Element
// ===========================================================================

this.Element = Base.extend({
constructor: function(component) {
	this.component = component;
	this.element = component.element;
	this.uniqueID = this.element.uniqueID;
	Element.all[this.uniqueID] = this;
},
dispose: function () {
	this.base();
	this.component = null;
	this.element = null;
	if (Element.all) {
		delete Element.all[this.uniqueID];
	}
},
behaviorUrn: "",
component: null,
element: null,
ready: false,
silent: true,
tagName: null,
uniqueID: "",
_isActive: function() {
try {
	return document.activeElement == this.element;
} catch (ignore) {
	// the document has not fully loaded
}},
_register: function() {
},
_unregister: function() {
},
_getAttribute: function(name) {
	var attribute = this.element.attributes[name];
	return attribute ? attribute.nodeValue : null;
},
_setAttribute: function(name, value) {
	var attribute = this.element.attributes[name];
	if (!attribute) attribute = this._createAttribute(name);
	attribute.nodeValue = value;
},
_createAttribute: function(name) {
	if (document.createAttribute) {
		var attribute = document.createAttribute(name);
		this.element.setAttributeNode(attribute);
	} else attribute = {nodeValue: null};
	return attribute;
},
_setCustomAttribute: function(name, value) {
	this[name] = value;
	if (this.ready) {
		this.component[name].fireChange();
	}
},
_cloneElement: function() {
	var clone = this.element.cloneNode();
	clone.style.behavior = "none";
	return clone;
},
_getParentByTagName: function(tagName) {
	var element = this.element;
	while (element && (element = element.parentElement) && element.tagName != tagName) continue;
	return element;
},
_fireEvent: function(name, args) {
	if (!this.silent) {
		var event = document.createEventObject();
		for (var i in args) event[i] = args[i];
		return this.element.fireEvent(name, event);
	}
},
_fireCustomEvent: function(name, args) {
	if (!this.silent && this.component[name]) {
		var event = document.createEventObject();
		for (var i in args) event[i] = args[i];
		return this.component[name].fire(event);
	}
},
_focus: function() {
try {
	//window.scrollTo(0);
	this.element.scrollIntoView(false);
	this.element.focus();
} catch (ignore) {
	// hidden fields can't get focus
}},
oncontentready: function() {
	this.ready = true;
	this.silent = false;
	this._register();
},
ondetach: function() {
	if (!System.unload) this._unregister();
	this.dispose();
},
onactivate: function() {
},
onblur: function() {
},
onclick: function() {
},
ondblclick: function() {
},
ondeactivate: function() {
},
onfocus: function() {
},
onkeydown: function() {
},
onkeypress: function() {
},
onkeyup: function() {
},
onlosecapture: function() {
},
onmousedown: function() {
},
onmousemove: function() {
},
onmouseout: function() {
},
onmouseover: function() {
},
onmouseup: function() {
},
onmousewheel: function() {
},
onpaste: function() {
},
onpropertychange: function() {
},
onresize: function() {
},
onscroll: function() {
},
ondocumentready: function() {
}
});
var Element = this.Element;
Element.className = "Element";
Element.all = {};
Element.getImplementation = function(element) {
	return element && this.all[element.uniqueID];
};
// ===========================================================================
// FormItem
// ===========================================================================

// concerned with being an item in a form

this.FormItem = Element.extend({
constructor: function(component) {
	this.base(component);
	// hash map of Form objects
	this.formsMap = {};
},
form: null,
forms: null,
formsMap: null,
_afterSubmit: function() {
},
_isSuccessful: function() {
	return false;
},
_forEachForm: function(perform) {
	// make sure the forms map has been sorted
	//  by sourceIndex (do it in get_forms);
	var forms = this.get_forms(), form;
	for (var i = 0; (form = forms[i]); i++) {
		perform(Element.getImplementation(form));
	}
},
_register: function() {
	this.base();
	// if the form attribute is present it
	//  represents a space delimited list of IDs
	if (typeof this.form == "string") {
		var ids = this.form.split(/\s+/), id;
		for (var i = 0; (id = ids[i]); i++) {
			if (!Form.map[id]) Form.map[id] = {};
			Form.map[id][this.uniqueID] = this;
			var form = document.getElementById(id);
			if (form && form.tagName == "FORM") {
				this._registerForm(form);
			}

		}
	// otherwise, just use the parent form
	} else {
		var form = this._getParentByTagName("FORM");
		if (form) {
			var uniqueID = form.uniqueID;
			if (!Form.map[uniqueID]) Form.map[uniqueID] = {};
			Form.map[uniqueID][this.uniqueID] = this;
			this._registerForm(form);
		}
	}
},
_unregister: function() {
	if (typeof this.form == "string") {
		var ids = this.form.split(/\s+/), id;
		for (var i = 0; (id = ids[i]); i++) {
			delete Form.map[id][this.uniqueID];
		}
	}
	for (var uniqueID in this.formsMap) {
		var form = Element.all[uniqueID];
		delete Form.map[uniqueID][this.uniqueID];
		if (form) form._unregisterFormItem(this);
	}
	this.base();
},
_registerForm: function(form) {
	if (form = Element.getImplementation(form)) {
		var uniqueID = form.uniqueID;
		if (!this.formsMap[uniqueID]) {
			this.formsMap[uniqueID] = form;
			form._registerFormItem(this);
			this.forms = null;
		}
	}
},
_unregisterForm: function(form) {
	var uniqueID = form.uniqueID;
	if (this.formsMap[uniqueID]) {
		form._unregisterFormItem(this);
		delete this.formsMap[uniqueID];
		this.forms = null;
	}
},
set_form: function(form) {
	if (this.ready) {
		throw System.NOT_SUPPORTED_ERR;
	} else {
		this.form = String(form);
	}
},
get_form: function() {
	return this.get_forms()[0] || null;
},
get_forms: function() {
	if (!this.forms) {
		this.forms = new NodeList(this.formsMap);
	}
	return this.forms;
}
});
var FormItem = this.FormItem;
FormItem.className = "FormItem";
// ===========================================================================
// Control
// ===========================================================================

// concerned with validity and value

this.Control = FormItem.extend({
constructor: function(component) {
	this.base(component);
	this.raw = this.element.attributes.value;
	if (!this.raw) {
		this.raw = this._createAttribute("value");
		this.raw.nodeValue = "";
	}
	this.validity = new ValidityState(this);
},
raw: null,
validity: null,

_afterValidate: function() {
},

_noValueSelected: function() {
	return this.raw.nodeValue == "";
},

_toLocaleString: function() {
	return this.raw.nodeValue;
},

_getRawValue: function() {
	return this.raw.nodeValue;
},

_setRawValue: function(value, silent) {
	this.silent = silent;
	// IE fires onpropertychange even if we don't change so make sure we only
	// set if really changed
	if (this.raw.nodeValue != value) {
		this.raw.nodeValue = value;
	}
},

_isSuccessful: function() {
	return this.element.name && !this.element.isDisabled;
},

_validate: function() {
	this.validity._validate();
	this._afterValidate();
},

get_labels: function() {
	return null; // not implemented yet
},

get_validity: function() {
	return this.validity;
},

get_validationMessage: function() {
	return this.validity.toString();
},

get_value: function() {
	return this._getRawValue();
},
set_value: function(value) {
	this._DOMPropertyChanged = true;
	this._setRawValue(value);
},

get_willValidate: function() {
	return this.element.name && this.get_form() && !this.element.isDisabled;
},

checkValidity: function(hint) {
	this._validate();
	if (!this.validity.valid) {
		if (hint) {
			this._focus();
			if (!System.hint && wf2.HintPopup) {
				System.hint = new wf2.HintPopup;
			}
			if (System.hint) {
				System.hint.show(this);
			}
		}
		this._fireCustomEvent("oninvalid");
	}
	return this.validity.valid;
},

setCustomValidity: function(error) {
	this.validity.customError = String(error);
	this.validity._validate();
},

oncontentready: function() {
	this.base();
	this._validate();
}

});
var Control = this.Control;
Control.className = "Control";
// ===========================================================================
// Input
// ===========================================================================

this.Input = Control.extend({
constructor: function(component) {
	this.base(component);
	this.readOnly = this._getAttribute("readOnly");
},
behaviorUrn: "input.htc",
tagName: "INPUT",
type: null,
autofocus: false,
readOnly: false,
_cloneElement: function() {
	var clone = document.createElement("<input name=" + this.element.name + ">");
	clone.style.behavior = "none";
	clone.value = this.get_value();
	return clone;
},
_afterValueChange: function() {
	if (!this.silent) {
		this._validate();
		this._fireCustomEvent("onDOMControlValueChanged");
		if (!this._DOMPropertyChanged) {
			this._fireCustomEvent("oninput");
		}
	}
	delete this._DOMPropertyChanged;
	this.silent = !this.ready;
},
_isEditable: function() {
	return !this.get_readOnly() && !this.element.isDisabled;
},
_getTypeHint: function() {
	return ValidityState.messages.typeMismatch;
},
get_autofocus: function() {
	return this.autofocus;
},
set_autofocus: function(autofocus) {
	this._setCustomAttribute("autofocus", Boolean(autofocus || !this.ready));
	if (!this.ready) {
		if (System.ready) {
			this._focus();
		} else {
			Input._focus = this;
		}
	}
},
get_disabled: function() {
	return this._getAttribute("disabled");
},
set_disabled: function(disabled) {
	this._setAttribute("disabled", disabled);
},
get_list: function() {
	return this.list;
},
set_list: function(list) {
	this._setCustomAttribute("list", list);
},
get_min: function() {
	return this.min;
},
set_min: function(min) {
	this._setCustomAttribute("min", min);
},
get_max: function() {
	return this.max;
},
set_max: function(max) {
	this._setCustomAttribute("max", max);
},
get_pattern: function() {
	return this.pattern;
},
set_pattern: function(pattern) {
	this._setCustomAttribute("pattern", pattern);
},
get_readOnly: function() {
	return this.readOnly;
},
set_readOnly: function(readOnly) {
	this.readOnly = Boolean(readOnly);
	this._setAttribute("readOnly", this.readOnly);
},
get_required: function() {
	return this.required;
},
set_required: function(required) {
	this._setCustomAttribute("required", required);
},
get_selectedOption: function() {
	return null;
},
get_step: function() {
	return this.step;
},
set_step: function(step) {
	this._setCustomAttribute("step", step);
},
get_type: function() {
	return this.type;
},
get_valueAsDate: function() {
	return new Date(this.get_value());
},
set_valueAsDate: function(value) {
	this.set_value(value);
},
get_valueAsNumber: function() {
	return Number(this.get_value());
},
set_valueAsNumber: function(value) {
	this.set_value(value);
},
stepDown: function(n) {
	this.stepUp(-n);
},
stepUp: function(n) {
},
dispatchChange: function() {
	this._fireEvent("onchange");
},
dispatchFormChange: function() {
	this._fireCustomEvent("onformchange");
},
onchange: function() {
	this.checkValidity();
	this._forEachForm(function(form) {
		form.dispatchFormChange();
	});
},
onpropertychange: function() {
	if (this.ready && event.propertyName == "value") {
		this._afterValueChange();
	}
},
ondocumentready: function() {
	if (Input._focus == this) {
		this._focus();
		delete Input._focus;
	}
}

});
var Input = this.Input;
Input.className = "Input";
Input.DEFAULT_BACKGROUND = "#ffffff";
// ===========================================================================
// Output
// ===========================================================================

this.Output = Control.extend({
constructor: function(component) {
	this.base(component);
},
behaviorUrn: "output.htc",
tagName: "OUTPUT",
defaultValue: "",

_getRawValue: function() {
	return this.innerText;
},
_setRawValue: function(value, silent) {
	this.innerText = value;
	if (!silent) this.component.value.fireChange();
},
get_validationMessage: function() {
	return "";
},
get_willValidate: function() {
	return false;
},
get_defaultValue: function() {
	return this.defaultValue;
},
set_defaultValue: function(defaultValue) {
	this._setCustomAttribute(defaultValue);
},
checkValidity: function() {
	return true;
},
setCustomValidity: function() {
	throw System.NOT_SUPPORTED_ERR;
},
_validate: function() {
}
});
var Output = this.Output;
Output.className = "Output";
// ===========================================================================
// Button
// ===========================================================================

this.Button = Input.extend({
constructor: function(component) {
	this.base(component);
},
type: "button",
_isSuccessful: function() {
	return false;
},
onpropertychange: function() {
},
checkValidity: function() {
	return true;
},
get_validationMessage: function() {
	return "";
},
get_willValidate: function() {
	return false;
},
setCustomValidity: function() {
	throw System.NOT_SUPPORTED_ERR;
},
_validate: function() {
}
});
var Button = this.Button;
Button.className = "Button";
// ===========================================================================
// Data
// ===========================================================================

this.Data = Input.extend({

constructor: function(component) {
	this.base(component);
},

required: false,

set_required: function(required) {
	this.base(Boolean(required || !this.ready));
	this.validity.valueMissing = this.required && this._noValueSelected();
	this.validity._validate();
},

_validate: function() {
	this.validity.valueMissing = this.required && this._noValueSelected();
	this.validity.customError = Boolean(this.customValidity);
	this.base();
}

});
var Data = this.Data;
Data.className = "Data";
// ===========================================================================
// Submit
// ===========================================================================

this.Submit = Button.extend({

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
var Submit = this.Submit;
Submit.className = "Submit";
// ===========================================================================
// Image
// ===========================================================================

this.Image = Submit.extend({
constructor: function(component) {
	this.base(component);
},
type: "image",

_isSuccessful: function() {
	return document.activeElement == this.element;
}

});
this.Image.className = "Image";
// ===========================================================================
// Reset
// ===========================================================================

this.Reset = Button.extend({
constructor: function(component) {
	this.base(component);
},
type: "reset"
});
var Reset = this.Reset;
Reset.className = "Reset";
// ===========================================================================
// Chrome
// ===========================================================================

this.Chrome = Base.extend({
constructor: function(owner) {
	this.owner = owner;
	this.element = owner.element;
	this.setDefaultCss();
	this.updateDefaultCss();
	this.layout();
},

imageWidth: 17,
owner: null,
element: null,
stateCount: 4,
cursor: "text",

isActive: function() {
	return false;
},

setDefaultCss: function() {
	var rs = this.element.runtimeStyle;
	var borderColor = Chrome.theme.borderColor;
	if (Chrome.theme.name == "classic") {
		rs.border = "2px inset " + borderColor;
		rs.padding = "1px";
	} else {
		rs.border = "1px solid " + borderColor;
		rs.padding = "2px";
	}
	rs.backgroundAttachment = "fixed";
	rs.backgroundRepeat = "no-repeat";
	rs.cursor = "default";
},

showValidity: function() {
	var rs = this.element.runtimeStyle;
	var classic = Chrome.theme.name == "classic";
	if (this.owner.validity.valid) {
		rs.borderColor = Chrome.theme.borderColor;
		if (classic) rs.borderStyle = "inset";
	} else {
		rs.borderColor = "#ff5e5e";
		if (classic) rs.borderStyle = "ridge";
	}
},

updateDefaultCss: function() {
	var element = this.element;
	var rs = element.runtimeStyle;
	var rtl = element.currentStyle.direction == "rtl";

	rs.backgroundPositionX = rtl ? "left" : "right";
	rs.backgroundImage = "url( " + this.getImageUri() + ")";

	// we don't want the padding change to grow the width
	// however this fix is not live and any change to the size of the
	// element after the chrome has been applied will be ignored
	var w1 = element.offsetWidth;
	rs.pixelWidth = 100;

	var padding = this.imageWidth;
	if (!rtl) {
		rs.paddingRight = padding + "px";
	} else {
		rs.paddingLeft = padding + "px";
	}

	var w2 = element.offsetWidth;
	rs.pixelWidth = w1 - w2 + 100;
},

getState: function() {
	return 0;
},

layout: function() {
	var state, top;
	var clientHeight = this.element.clientHeight;
	state = this.getState();
	top = - this.stateCount * (clientHeight / 2 * (clientHeight - 1));
	top -= clientHeight * state;
	this.element.runtimeStyle.backgroundPositionY = top + "px";
},

getImageUri: function(name) {
	return Chrome.path + this.getImageSrc();
},

resetScroll: function() {
	this.element.scrollLeft = this.element.scrollWidth;
},

dispose: function() {
	this.base();
	this.owner = null;
	this.element = null;
},

onmousedown: function() {
},

onmouseup: function() {
},

onclick: function() {
},

ondblclick: function() {
},

onlosecapture: function() {
},

onkeydown: function() {
},

onkeyup: function() {
},

onkeypress: function() {
},

onmousemove: function() {
},

onmouseover: function() {
},

onmouseout: function() {
},

onmousewheel: function() {
},

onfocus: function() {
},

onblur: function() {
},

onresize: function() {
	this.layout();
},

onscroll: function() {
	this.resetScroll();
},

onpropertychange: function() {
	if (event.propertyName == "value") {
		this.resetScroll();
	}
},

oncontentready: function() {
	this.updateDefaultCss();
	this.layout();
	this.resetScroll();
},

ondocumentready: function () {
	if (this.element.isDisabled) {
		this.layout();
	}
}

});
var Chrome = this.Chrome;
Chrome.className = "Chrome";
Chrome.detect = function() {
	// detect XP theme by inspecting the scrollbar colour
	if (/MSIE\s(6.*SV1|7|8)/.test(navigator.appVersion)) {
		// annoyingly, we can't tell the difference between luna blue/olive
		//  (we assume blue - shame, cos olive is nicer)
		var chrome = document.documentElement.currentStyle.scrollbarFaceColor;
		var theme = this.themes[chrome];
	}
	if (!theme) theme = this.themes.classic;
	this.path = System.path + "chrome/" + (theme.path || theme.name) + "/";
	this.theme = theme;
};
Chrome.themes = {
	classic: {
		name: "classic",
		borderColor: "#ffffff"
	},
	"#ece9d8": {
		name: "luna",
		path: "luna/blue",
		borderColor: "#7f9db9"
	},
/*	"same-as-blue": { // must find a way to detect olive!
		name: "luna",
		path: "luna/olive",
		borderColor: "#a4b97f"
	}, */
	"#e0dfe3": {
		name: "luna",
		path: "luna/silver",
		borderColor: "#a5acb2"
	},
	"#ebe9ed": {
		name: "royale",
		borderColor: "#a7a6aa"
	}
};
// ===========================================================================
// Spinner
// ===========================================================================

this.Spinner = Chrome.extend({

constructor: function(owner) {
	this.base(owner);
},

stateCount: 6,

getImageSrc: function () {
	return "spinner.png";
}

});
var Spinner = this.Spinner;
Spinner.className = "Spinner";
// ===========================================================================
// ComboBox
// ===========================================================================

this.ComboBox = Chrome.extend({

constructor: function(owner) {
	this.base(owner);
},

getImageSrc: function () {
	return "dropdown.png";
},

ondocumentready: function () {
	this.base();
	// load the popups module
	System.load("wf2-popups.js");
}

});
var ComboBox = this.ComboBox;
ComboBox.className = "ComboBox";
// ===========================================================================
// Progress Bar
//
// The progress bar uses a value between 0 and 1 and it is up to the consumer to
// map this to a valid value range
//
// ===========================================================================

// TODO: Right to left should invert horizontal

this.ProgressBar = Chrome.extend({

constructor: function(owner) {
	this.base(owner);
	// cancel text selection without creating a closure
	var cancel = function () { event.returnValue = false; };
	this.element.attachEvent("onselectstart", cancel);
},

orientation: null,

setDefaultCss: function() {
	var element = this.element;
	var rs = element.runtimeStyle;
	rs.cursor = "default";
	rs.backgroundAttachment = "fixed";
	rs.backgroundRepeat = "no-repeat";
	rs.overflow = "hidden";
	rs.padding = "0";
	rs.pixelHeight = element.offsetHeight;
	rs.pixelWidth = element.offsetWidth;
	this.setBorder();

	// frig city:
	// this has the effect of pushing the text way out of view... ;-)
	rs.fontSize = "800em";
},

setBorder: function() {
	var rs = this.element.runtimeStyle;
	rs.borderTop = "1px groove white";
	rs.borderBottom = "2px groove white";
	rs.borderLeft = "2px groove white";
	rs.borderRight = "2px groove white";
	if (document.compatMode == "CSS1Compat") {
		rs.pixelHeight--;
		rs.pixelWidth -= 2;
	}
},

updateDefaultCss: function() {
	var rs = this.element.runtimeStyle;
	if (this.orientation == Slider.HORIZONTAL) {
		rs.backgroundPositionY = "center";
	} else {
		rs.backgroundPositionX = "center";
	}
},

showValidity: function() {
},

getDesiredOrientation: function() {
	// when orientation is set we want a factor 2 to change it
	var cw = this.element.clientWidth;
	var ch = this.element.clientHeight;
	if (this.orientation == null) {
		return cw > ch ? ProgressBar.HORIZONTAL : ProgressBar.VERTICAL;
	} else if (this.orientation == ProgressBar.VERTICAL) {
		return cw > 2 * ch ? ProgressBar.HORIZONTAL : ProgressBar.VERTICAL;
	} else {
		return ch > 2 * cw ? ProgressBar.VERTICAL : ProgressBar.HORIZONTAL;
	}
},

layout: function() {
	var element = this.element;
	var clientWidth = element.clientWidth;
	var clientHeight = element.clientHeight;
	var rs = element.runtimeStyle;
	if (this.orientation == ProgressBar.HORIZONTAL) {
		var left = Math.floor(clientWidth * this.getValue()) - ProgressBar.WIDTH;
		left = Math.round(left / ProgressBar.CHUNK_WIDTH) * ProgressBar.CHUNK_WIDTH;
		// TODO: This needs to be abstracted away to make themes better
		if (Chrome.theme.name == "luna") left++;
		rs.backgroundPositionX = left + "px";
		rs.backgroundPositionY = -(clientHeight / 2 * (clientHeight - 1)) + "px";

	} else {
		//this._thumbTop =
		var top = Math.floor(clientHeight * this.getValue());
		top = clientHeight - Math.round(top / ProgressBar.CHUNK_HEIGHT) * ProgressBar.CHUNK_HEIGHT;
		// TODO: This needs to be abstracted away to make themes better
		if (Chrome.theme.name == "luna") top--;
		rs.backgroundPositionY = top + "px";
		rs.backgroundPositionX = -(clientWidth / 2 * (clientWidth - 1)) + "px";
	}
},

getCursor: function() {
	return "default";
},

syncImageSrc:  function() {
	var src = this.getImageUri();
	// Test change in src so we don't reset the backgroundImage because IE is
	// not smart enough when it comes to background images
	if (src != this._imageSrc) {
		this.element.runtimeStyle.backgroundImage = "url(" + src + ")";
		this._imageSrc = src;
	}
},

setOrientation: function(orientation) {
	if (this.orientation != orientation) {
		this.orientation = orientation;
		this.updateDefaultCss();
		this.syncImageSrc();
		this.layout();
	}
},

onresize: function() {
	if (this.orientation != (this.orientation = this.getDesiredOrientation())) {
		this.syncImageSrc(); // switching between horizontal and vertical
		this.updateDefaultCss();
	}
	this.base();
},

oncontentready: function() {
	this.setOrientation(this.getDesiredOrientation());
	this.syncImageSrc();
	this.base();
},

getImageSrc: function () {
	return "progressbar" + (this.orientation == ProgressBar.HORIZONTAL ? "" : "-vertical") + ".png";
},

getValue: function() {
	var range = this.owner;
	var min = range._getMinValue();
	var value = isNaN(range.value) ? min : range.value;
	return (value - min) / (range._getMaxValue() - min) ;
},

setValue: function(value) {
	var range = this.owner;
	var min = range._getMinValue();
	range._setValidValue(min + (range._getMaxValue() - min) * value);
}

});
var ProgressBar = this.ProgressBar;
ProgressBar.className = "ProgressBar";
ProgressBar.HEIGHT = 3000;
ProgressBar.WIDTH = 3000;
ProgressBar.CHUNK_WIDTH = 10;
ProgressBar.CHUNK_HEIGHT = 10;
ProgressBar.HORIZONTAL = 1;
ProgressBar.VERTICAL   = 2;
// ===========================================================================
// Slider
// ===========================================================================

this.Slider = ProgressBar.extend({

constructor: function(owner) {
	// The slider uses a value between 0 and 1 and it is up to the consumer to
	// map this to a valid value range
	this.base(owner);
	// disallow cursor focus of this element
	owner._setAttribute("readOnly", true);
},

setDefaultCss: function() {
	this.base();
	var element = this.element;
	if (element.currentStyle.backgroundColor == Input.DEFAULT_BACKGROUND) {
		element.style.backgroundColor = "transparent";
	}
},

setBorder: function() {
	var rs = this.element.runtimeStyle;
	rs.border = "0";
	rs.padding = "1px";
},

layout: function() {
	// TODO: Right to left should invert horizontal

	var clientWidth, clientHeight, left, top;
	var element = this.element;
	if (this.orientation == Slider.HORIZONTAL) {
		clientWidth = element.clientWidth - Slider.THUMB_WIDTH;
		clientHeight = element.clientHeight - Slider.HORIZONTAL_HEIGHT;
		this._thumbLeft = Math.floor(clientWidth * this.getValue());
		this._thumbTop = Math.floor(clientHeight / 2);
		left = this._thumbLeft -
			Math.ceil((Slider.HORIZONTAL_WIDTH - Slider.THUMB_WIDTH) / 2);
		// the image contains [ normal | hover | pressed | disabled ]
		left -= this.getState() * Slider.HORIZONTAL_WIDTH;
		element.runtimeStyle.backgroundPositionX = left + "px";
	} else {
		clientHeight = element.clientHeight - Slider.THUMB_HEIGHT;
		clientWidth = element.clientWidth - Slider.VERTICAL_WIDTH;
		this._thumbTop = clientHeight - Math.floor(clientHeight * this.getValue());
		this._thumbLeft = Math.floor(clientWidth / 2);
		top = this._thumbTop -
			Math.ceil((Slider.VERTICAL_HEIGHT - Slider.THUMB_HEIGHT) / 2);
		top -= this.getState() * Slider.VERTICAL_HEIGHT;
		element.runtimeStyle.backgroundPositionY = top + "px";
	}
},

getImageSrc: function () {
	return "slider" + (this.orientation == Slider.HORIZONTAL ? "" : "-vertical") + ".png";
}

});
var Slider = this.Slider;
Slider.className = "Slider";
Slider.HORIZONTAL_WIDTH = 3000;
Slider.HORIZONTAL_HEIGHT = 21;
Slider.VERTICAL_WIDTH = 22;
Slider.VERTICAL_HEIGHT = 3000;
Slider.THUMB_WIDTH = 11;
Slider.THUMB_HEIGHT = 11;
Slider.HORIZONTAL = 1;
Slider.VERTICAL   = 2;
// ===========================================================================
// Scalar
// ===========================================================================

// a standard text box

this.Scalar = Data.extend({
constructor: function(component) {
	this.base(component);
	//- this.value =
	// IE "remembers" previously entered values
	this.raw.nodeValue = this.element.defaultValue;
	this._setChrome();
},

chrome: null,
list: null,
//- value: "",

dispose: function() {
	this._removeChrome();
	this.base();
},

_setChrome: function(klass) {
	this._removeChrome();
	if (this.get_list()) klass = ComboBox;
	if (klass) this.chrome = new klass(this);
},

_removeChrome: function() {
	if (this.chrome) {
		this.chrome.dispose();
		this.chrome = null;
	}
},
/*--
_getRawValue: function() {
	return this.value;
},

_setRawValue: function(value, silent) {
	if (this.value != value) {
		this.value = value;
		this.silent = silent;
		this.raw.nodeValue = this._checkWidth(value);
	}
},

_checkWidth: function(value) {
	var overflow = System.overflow;
	var cs = this.element.currentStyle;
	overflow.style.fontFamily = cs.fontFamily;
	overflow.style.fontSize = cs.fontSize;
	document.body.appendChild(overflow);
	var clientWidth = this.element.clientWidth - 18;
	overflow.innerText = value;
	var length = value.length;
	while (length && overflow.offsetWidth > clientWidth) {
		overflow.innerText = value.slice(0, --length);
	}
	value = overflow.innerText;
	document.body.removeChild(overflow);
	return value;
},
--*/
_createPopup: function() {
	if (wf2.DataListPopup) {
		var list = this.get_list();
		if (list) list = Element.getImplementation(list);
		if (list) return list._createPopup();
	}
},

get_list: function() {
	if (this.list) {
		var list = document.getElementById(this.list);
		if (list && (list.tagName == "DATALIST" || list.tagName == "SELECT")) {
			return list;
		}
	}
	return null;
},

set_list: function(list) {
	if (this.ready) {
		throw System.NOT_SUPPORTED_ERR;
	} else {
		this.list = String(list);
		this._setChrome();
	}
},

// This is allows sub classes to override to select parts of text
// maybe it should use a range internally to allow overriding element.select()
select: function() {
	this.element.select();
},

set_disabled: function(disabled) {
	this.base(disabled);
	if (this.chrome) this.chrome.layout();
},

oncontentready: function() {
	this.base();
	if (this.chrome) this.chrome.oncontentready();
},

ondocumentready: function() {
	this.base();
	if (this.chrome) this.chrome.ondocumentready();
},

onpropertychange: function() {
	if (this.ready) {
		this.base();
		if (this.chrome) this.chrome.onpropertychange();
	}
}

});
var Scalar = this.Scalar;
Scalar.className = "Scalar";
// ===========================================================================
// Select
// ===========================================================================

this.Select = Data.extend({
constructor: function(component) {
	this.base(component);
},
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
var Select = this.Select;
Select.className = "Select";
// ===========================================================================
// Boolean
// ===========================================================================

this.Boolean = Data.extend({
constructor: function(component) {
	this.base(component);
},
_isSuccessful: function() {
	return this.element.checked && this.base();
}
});
this.Boolean.className = "Boolean";
// ===========================================================================
// Checkbox
// ===========================================================================

this.Checkbox = this.Boolean.extend({
constructor: function(component) {
	this.base(component);
},
type: "checkbox",
_noValueSelected: function() {
	return !this.element.checked;
}
});
var Checkbox = this.Checkbox;
Checkbox.className = "Checkbox";
// ===========================================================================
// Radio
// ===========================================================================

this.Radio = this.Boolean.extend({
constructor: function(component) {
	this.base(component);
},
type: "radio",
_noValueSelected: function() {
	var checked = true;
	var name = this.element.name;
	var form = this.get_form();
	if (name && form) {
		var radios = form.elements[name], radio;
		if (radios.length > 1) {
			checked = false;
			for (var i = 0; (radio = radios[i]); i++) {
				if (radio.checked) {
					checked = true;
					break;
				}
			}
		} else { // only one radio in group
			checked = this.element.checked;
		}
	}
	return !checked;
}
});
var Radio = this.Radio;
Radio.className = "Radio";
// ===========================================================================
// Text
// ===========================================================================

this.Text = Scalar.extend({

constructor: function(component) {
	this.base(component);
},

type: "text",
patternRegExp: /.*/,
pattern: "",
hint: null,

_validate: function() {
	this.validity.patternMismatch = !this.patternRegExp.test(this._getRawValue());
	this.validity.tooLong = this._getRawValue().length > this.get_maxLength();
	this.base();
},

_getTypeHint: function() {
	return this._getPatternHint();
},

_getPatternHint: function() {
	return this.pattern ? this.element.title : "";
},

get_maxLength: function() {
	return this.element.maxLength;
},

get_pattern: function() {
	return this.pattern;
},
set_pattern: function(pattern) {
	// create the RegExp used for validation
	if (pattern == null) {
		this.patternReg = Text.PATTERN;
	} else {
		try { // TO DO: escape pattern text?
			this.patternRegExp = new RegExp("^$|^" + pattern + "$");
		} catch (ignore) {
			this.patternRegExp = Text.PATTERN;
		}
	}
	this.base(String(pattern));
},

onpropertychange: function() {
	if (this.ready) {
		switch (event.propertyName) {
			case "maxLength":
			case "pattern":
				this._validate();
				break;
			default:
				this.base();
		}
	}
}

});

var Text = this.Text;
Text.className = "Text";
Text.PATTERN = /.*/;
// ===========================================================================
// Number
// ===========================================================================

this.Number = Scalar.extend({

constructor: function(component) {
	this.base(component);
},

type: "number",
step: 1,
defaultStep: 1,
min: "",
max: "",
value: NaN,

_afterValidate: function() {
	if (this.chrome) this.chrome.showValidity();
},

_afterValueChange: function() {
	// validate keyboard entry
	if (event.propertyName == "value" && this._isActive() && !this.chrome.isActive()) {
		this.value = this._parse(this.raw.nodeValue);
	}
	this.base();
},

_getRawValue: function() {
	return wf2.isNaN(this.value) ? this.raw.nodeValue : this._format(this.value);
},

_setRawValue: function(value, silent) {
	this.silent = silent;
	var v1 = (typeof value == "string") ? this._parse(value) : Number(value);
	this.value = v1;
	var v2 = wf2.isNaN(v1) ? value : this._displayValue();
	// IE fires onpropertychange even if we don't change so make sure we only
	// set if really changed
	if (v2 != this.raw.nodeValue) {
		this.raw.nodeValue = v2;
	}
},

_displayValue: function() {
	return this._isActive() ? this._format(this.value) : this._toLocaleString();
},

_parse: function(string) {
	return wf2.isNaN(string) ? NaN : Number(string);
},
_format: function(number) {
	return String(number);
},
_toLocaleString: function() {
	return String(this.value);
},

_setChrome: function(klass) {
	this.base(klass || Spinner);
},

_validate: function() {
	var value = Number(this.value);
	var empty = this._noValueSelected();
	this.validity.typeMismatch = !empty && wf2.isNaN(value);
	this.validity.stepMismatch = !empty && false; // TO DO
	this.validity.rangeOverflow = !empty && !wf2.isNaN(this.max) && (value > this.max);
	this.validity.rangeUnderflow = !empty && !wf2.isNaN(this.min) && (value < this.min);
	this.base();
},

get_valueAsDate: function() {
	return new Date(this.value);
},

get_valueAsNumber: function() {
	return this.value.valueOf();
},

get_min: function() {
	return wf2.isNaN(this.min) ? this.min : this._format(this.min);
},
set_min: function(min) {
	this.base(this._parse(min) || min);
},

get_max: function() {
	return wf2.isNaN(this.max) ? this.max : this._format(this.max);
},
set_max: function(max) {
	this.base(this._parse(max) || max);
},

set_step: function(step) {
	if (step != "any") {
		step = (wf2.isNaN(step) || step <= 0) ? this.defaultStep : Number(step);
	}
	this.base(step);
},

stepUp: function(n) {
	if (!isNaN(n)) this._increment(n);
},

_getMinValue: function() {
	return wf2.isNaN(this.min) ? 0 : this.min;
},

_getMaxValue: function() {
	return wf2.isNaN(this.max) ? 0 : this.max;
},

_getStepValue: function() {
	return wf2.isNaN(this.step) ? this.defaultStep : this.step;
},

_getStartValue: function() {
	return this._getValidValue(0);
},

_getValidValue: function(value) {
	if (wf2.isNaN(value)) value = this._getStartValue();
	if (!wf2.isNaN(this.min) && value <= this.min) {
		return this.min;
	} else if (!wf2.isNaN(this.max) && value >= this.max) {
		return this.max
	} else {
		var min = this._getMinValue();
		var step = this._getStepValue();
		return min + Math.round((value - min) / step) * step;
	}
},

_setValidValue: function(value) {
	this._setRawValue(this._getValidValue(value));
},

_increment: function(n) {
	var value = this.get_valueAsNumber() + this._getStepValue() * (n || 1);
	this._setRawValue(this._getValidValue(value));
},

_blockIncrement: function(n) {
	this._increment(n * 10);
},

oncontentready: function() {
	this._setRawValue(this.raw.nodeValue, true);
	this.base();
},

onpropertychange: function() {
	if (this.ready) {
		switch (event.propertyName) {
			case "min":
			case "max":
			case "step":
				this._validate();
				break;
			default:
				this.base();
		}
	}
},

onactivate: function() {
	if (this._isEditable()) {
		this._setRawValue(this._getRawValue(), true);
	}
},

ondeactivate: function() {
	this.base();
	if (this._isEditable()) {
		this._setRawValue(this.raw.nodeValue, true);
	}
},

_getTypeHint: function() {
	return wf2.Number.hint;
}

});
this.Number.className = "Number";
this.Number.pad = function(value, length) {
	return ("000" + value).slice(-(length || 2));
};
// ===========================================================================
// Range
// ===========================================================================

this.Range = this.Number.extend({
constructor: function(component) {
	this.base(component);
},

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
var Range = this.Range;
Range.className = "Range";
// ===========================================================================
// DateTime
// ===========================================================================

this.DateTime = this.Number.extend({

constructor: function(component) {
	this.base(component);
},

step: 60,
defaultStep: 60,
type: "datetime",

_parse: function(string) {
	return DateTime.parse(string);
},
_format: function(datetime) {
	return DateTime.format(datetime);
},
_toLocaleString: function() {
	return this.value.toLocaleString();
},

_setRawValue: function(value, silent) {
	this.silent = silent;
	var v1 = (typeof value == "string") ? this._parse(value) : new Date(value);
	this.value = v1;
	var v2 = wf2.isNaN(v1) ? value : this._displayValue();
	// IE fires onpropertychange even if we don't change so make sure we only
	// set if really changed
	//- v2 = this._checkWidth(v2);
	if (v2 != this.raw.nodeValue) {
		this.raw.nodeValue = v2;
	}
},

_setChrome: function(klass) {
	this.base(klass || ComboBox);
},

_createPopup: function() {
	if (!wf2.Date.popup && wf2.DatePopup) {
		wf2.Date.popup = new wf2.DatePopup;
	}
	return wf2.Date.popup;
},

_increment: function(n) {
	this.base(n * 1000);
},

_incrementDate: function(part, n) {
	var value = this.get_valueAsDate();
	value["set" + part](value["get" + part]() + (n || 1));
	this._setRawValue(this._getValidValue(value));
},

_getStartValue: function() {
	return this._getValidValue(this._parse(this._format(new Date)));
},

_getTypeHint: function() {
	return DateTime.hint;
}

});

var DateTime = this.DateTime;
DateTime.className = "DateTime";
DateTime.parse = function(string) {
	// trim trailing "Z"
	string = String(string).slice(0, -1);
	var datetime = DateTimeLocal.parse(string);
	if (isNaN(datetime)) return datetime;
	datetime.setMinutes(datetime.getMinutes() + datetime.getTimezoneOffset());
	return datetime;
};
DateTime.format = function(datetime) {
	datetime.setMinutes(datetime.getMinutes() - datetime.getTimezoneOffset());
	return DatetimeLocal.format(datetime) + "Z"
};
// ===========================================================================
// DateTimeLocal
// ===========================================================================

this.DateTimeLocal = DateTime.extend({
constructor: function(component) {
	this.base(component);
},
type: "datetime-local",
_parse: function(string) {
	return DateTimeLocal.parse(string);
},
_format: function(datetime) {
	return DateTimeLocal.format(datetime);
}
});
var DateTimeLocal = this.DateTimeLocal;
DateTimeLocal.className = "DateTimeLocal";
DateTimeLocal.parse = function(string) {
	var parts = String(string).split("T");
	var date = wf2.Date.parse(parts[0]);
	var datetime = Time.parse(parts[1]);
	datetime.setFullYear(date.getFullYear());
	datetime.setMonth(date.getMonth());
	datetime.setDate(date.getDate());
	return datetime;
};
DateTimeLocal.format = function(datetime) {
	return wf2.Date.format(datetime) + "T" + Time.format(datetime);
};
// ===========================================================================
// Date
// ===========================================================================

this.Date = DateTime.extend({

constructor: function(component) {
	this.base(component);
},

type: "date",
step: 1,
defaultStep: 1,

_parse: function(string) {
	return wf2.Date.parse(string);
},
_format: function(date) {
	return wf2.Date.format(date);
},
_toLocaleString: function() {
	return this.value.toLocaleDateString();
},

_increment: function(n) {
	this._incrementDate("Date", n * this._getStepValue());
},

_blockIncrement: function(n) {
	// we'll ignore the step for a block increment
	// we'll just increment by month
	this._incrementDate("Month", n);
},

_getTypeHint: function() {
	return wf2.Date.hint;
}

});

this.Date.className = "Date";
this.Date.parse = function(string) {
	if (!wf2.Date.PATTERN.test(string)) return NaN;
	var date = new Date(1970, 0, 1);
	var parts = String(string).split("-");
	date.setFullYear(parts[0]);
	date.setMonth(parts[1] - 1);
	date.setDate(parts[2]);
	if (!Number(parts[1]) || parts[2] != date.getDate()) return NaN;
	return date;
};
this.Date.format = function(date) {
	var pad = wf2.Number.pad;
	return pad(date.getFullYear(), 4) + "-" + pad(date.getMonth() + 1) + "-" + pad(date.getDate());
};
this.Date.PATTERN = /^\d{4}-(0\d|10|11|12)-\d{2}$/;
// ===========================================================================
// Month
// ===========================================================================

this.Month = wf2.Date.extend({

constructor: function(component) {
	this.base(component);
},

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

});

var Month = this.Month;
Month.className = "Month";
Month.parse = function(string) {
	return wf2.Date.parse(string + "-01");
};
Month.format = function(date) {
	return wf2.Date.format(date).slice(0, -3);
};
// ===========================================================================
// Week
// ===========================================================================

this.Week = this.Date.extend({

constructor: function(component) {
	this.base(component);
},

type: "week",

_parse: function(string) {
	return Week.parse(string);
},
_format: function(week) {
	return Week.format(week);
},
_toLocaleString: function() {
	return Week.format(this.value);
},

_increment: function(n) {
	this._incrementDate("Date", n * this._getStepValue() * 7);
},

_blockIncrement: function(n) {
	// we'll ignore the step for a block increment
	// we'll just increment by year
	this._incrementDate("Year", n);
},

_getTypeHint: function() {
	return Week.hint;
}

});

var Week = this.Week;
Week.className = "Week";
Week.parse = function(string) {
	if (!Week.PATTERN.test(string)) return NaN;
	var parts = String(string).split("-W");
	var date = new Date(1970, 0, 1);
	date.setFullYear(parts[0]);
	while (date.getDay() != Week.MONDAY) date.setDate(date.getDate() + 1);
	date = new Date(date.valueOf() + (parts[1] - 1) * Week.MILLISECONDS);
	return (date.getFullYear() == parts[0]) ? date : NaN;
};
Week.format = function(date) {
	var year = new Date(date.getFullYear(), 0, 1);
	var week = parseInt((date - year) / Week.MILLISECONDS) + 1;
	return date.getFullYear() + "-W" + wf2.Number.pad(week);
};
Week.MILLISECONDS = 7 * 24 * 60 * 60 * 1000;
Week.MONDAY = 1;
Week.PATTERN = /^\d{4}-W([0-4]\d|5[0-3])$/;
// ===========================================================================
// Time
// ===========================================================================

this.Time = DateTime.extend({

constructor: function(component) {
	this.base(component);
},

type: "time",

_parse: function(string) {
	return Time.parse(string, this.step);
},
_format: function(time) {
	return Time.format(time, this.step);
},
_toLocaleString: function() {
	return this.value.toLocaleTimeString();
	//return this._format(time) + " " + ((time.getHours() > 11) ? "PM" : "AM");
},

_setChrome: function() {
	this.base(Spinner);
},

_blockIncrement: function(n) {
	this._increment(n * 60);
},

_getStartValue: function() {
	return this._getValidValue(0);
},

_getTypeHint: function() {
	return Time.hint;
}

});
var Time = this.Time;
Time.className = "Time";
Time.parse = function(string) {
	if (!Time.PATTERN.test(string)) return NaN;
	var time = new Date(1970, 0, 1);
	var parts = string.split(":");
	time.setHours(parts[0]);
	time.setMinutes(parts[1]);
	if (parts[2]) {
		// seconds
		parts = parts[2].split(".");
		time.setSeconds(parts[0]);
		// milliseconds
		if (parts[1]) {
			time.setMilliseconds(parts[1] * Math.pow(10, 3 - parts[1].length));
		}
	}
	return time;
};
Time.format = function(time, precision) {
	if (precision == null) precision = 60;
	var pad = wf2.Number.pad;
	var string = pad(time.getHours()) + ":" + pad(time.getMinutes());
	if (precision < 60) string += ":" + pad(time.getSeconds());
	if (precision < 1) string += "." + pad(time.getMilliseconds(), 3);
	return string;
};
Time.PATTERN = /^([01]\d|2[0-4]):[0-5]\d(:[0-5]\d(\.\d+)?)?$/;
// ===========================================================================
// Email
// ===========================================================================

this.Email = Text.extend({

constructor: function(component) {
	this.base(component);
},

type: "email",

_getPatternHint: function() {
	return (Email.hint + "\n" + this.base()).replace(/\s$/, "");
},

_validate: function() {
	this.validity.typeMismatch = !Email.PATTERN.test(this._getRawValue());
	this.base();
}

});

var Email = this.Email;
Email.className = "Email";
// http://www.ietf.org/rfc/rfc2822 without comments and without whitespace except in quoted strings
Email.PATTERN = /^$|^("[^"]*"|[^\s\.]\S*[^\s\.])@[^\s\.]+(\.[^\s\.]+)*$/;
// ===========================================================================
// Url
// ===========================================================================

this.Url = Text.extend({

constructor: function(component) {
	this.base(component);
},

type: "url",

_getPatternHint: function() {
	return (Url.hint + "\n" + this.base()).replace(/\s$/, "");
},

_validate: function() {
	this.validity.typeMismatch = !Url.PATTERN.test(this._getRawValue());
	this.base();
}

});

var Url = this.Url;
Url.className = "Url";
// [[fix]] absoluteURI from http://www.ietf.org/rfc/rfc2396
Url.PATTERN = /^$|^[a-zA-Z][a-zA-Z0-9+-.]*:[^\s]+$/;
// ===========================================================================
// Password
// ===========================================================================

this.Password = Text.extend({
constructor: function(component) {
	this.base(component);
},
type: "password"
});
var Password = this.Password;
Password.className = "Password";
// ===========================================================================
// Hidden
// ===========================================================================

this.Hidden = Data.extend({
constructor: function(component) {
	this.base(component);
},
type: "hidden",
_setChrome: function() {
	// hidden fields don't need chrome
}
});
var Hidden = this.Hidden;
Hidden.className = "Hidden";
// ===========================================================================
// File
// ===========================================================================

this.File = Data.extend({
constructor: function(component) {
	this.base(component);
},

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
var File = this.File;
File.className = "File";
// ===========================================================================
// Form (DOM interface)
// ===========================================================================

this.Form = Element.extend({
constructor: function(component) {
	this.base(component);
	// hash map of FormItem objects
	this.elementsMap = {};
},
dispose: function() {
	this.base();
	this.elementsMap = null;
	this.elements = null;
},

accept: "",
behaviorUrn: "form.htc",
data: "",
elements: null,
elementsMap: null,
replace: "",
tagName: "FORM",

_forEachElement: function(perform) {
	var elements = this.get_elements(), element;
	for (var i = 0; (element = elements[i]); i++) {
		perform(Element.getImplementation(element));
	}
},

_register: function() {
	this.base();
	var map = Form.map[this.get_id()];
	for (var uniqueID in map) {
		map[uniqueID]._registerForm(this);
	}
	map = Form.map[this.uniqueID];
	for (uniqueID in map) {
		map[uniqueID]._registerForm(this);
	}
},

_unregister: function() {
	var map = Form.map[this.get_id()];
	for (var uniqueID in map) {
		map[uniqueID]._unregisterForm(this);
	}
	map = Form.map[this.uniqueID];
	for (uniqueID in map) {
		map[uniqueID]._unregisterForm(this);
	}
	this.base();
},

_registerFormItem: function(formitem) {
	var uniqueID = formitem.uniqueID;
	if (!this.elementsMap[uniqueID]) {
		this.elementsMap[uniqueID] = formitem;
		this.elements = null;
	}
},

_unregisterFormItem: function(formitem) {
	var uniqueID = formitem.uniqueID;
	if (this.elementsMap[uniqueID]) {
		delete this.elementsMap[uniqueID];
		this.elements = null;
	}
},

_dispatchCustomEvent: function(name) {
	this._forEachElement(function(element) {
		element._fireCustomEvent(name);
	});
	this._fireCustomEvent(name);
},

checkValidity: function() {
	var valid = true;
	this._forEachElement(function(control) {
		if (control.get_willValidate()) {
			valid |= control.checkValidity();
		}
	});
	return valid;
},

dispatchFormChange: function() {
	this._dispatchCustomEvent("onformchange");
},

dispatchFormInput: function() {
	this._dispatchCustomEvent("onforminput");
},

reset: function() {
	this.element.reset();
},

resetFromData: function(data) {
},

submit: function() {
},

get_accept: function() {
	return this.accept;
},
set_accept: function(accept) {
	this.accept = String(accept);
},

get_data: function() {
	return this.data;
},
set_data: function(data) {
	this.data = String(data);
},

get_elements: function() {
	if (!this.elements) {
		this.elements = new HTMLCollection(this.elementsMap);
	}
	return this.elements;
},

get_id: function() {
	this._getAttribute("id");
},
set_id: function(id) {
	if (this.ready) this._unregister();
	this._setAttribute("id", id);
	if (this.ready) this._register();
},

get_length: function() {
	return this.get_elements().length;
},

get_replace: function() {
	return this.replace;
},
set_replace: function(replace) {
	this.replace = String(replace);
}

});
var Form = this.Form;
Form.className = "Form";
Form.map = {};
// ===========================================================================
// TextArea
// ===========================================================================

this.TextArea = Text.extend({
constructor: function(component) {
	this.base(component);
},
tagName: "TEXTAREA",
type: "textarea",
behaviorUrn: "textarea.htc",
maxLength: Math.pow(2, 31) -1, // what is the correct default for this?
get_maxLength: function() {
	return this.maxLength;
},
set_maxLength: function(maxLength) {
	this._setCustomAttribute("maxLength", Number(maxLength) || TextArea.MAX_LENGTH);
}
});
var TextArea = this.TextArea;
TextArea.className = "TextArea";
TextArea.MAX_LENGTH = Math.pow(2, 31) - 1;
// ===========================================================================
// DataList
// ===========================================================================

this.DataList = Element.extend({

constructor: function(component) {
	this.base(component);
},

dispose: function() {
	this.base();
	if (this.popup) {
		this.popup.dispose();
		this.popup = null;
	}
},

behaviorUrn: "datalist.htc",
tagName: "DATALIST",
data: "",
popup: null,

_createPopup: function() {
	if (!this.popup && wf2.DataListPopup) {
		this.popup = new wf2.DataListPopup(this);
	}
	return this.popup;
},

get_options: function() {
	return this.element.getElementsByTagName("option");
},

get_data: function() {
	return this.data;
},
set_data: function(data) {
	this.data = String(data);
}

});
var DataList = this.DataList;
DataList.className = "DataList";
// ===========================================================================
// ValidityState
// ===========================================================================

this.ValidityState = Base.extend({
constructor: function(owner) {
	this.owner = owner;
},
dispose: function() {
	this.owner = null;
},
owner: null,
typeMismatch: false,
stepMismatch: false,
rangeUnderflow: false,
rangeOverflow: false,
tooLong: false,
patternMismatch: false,
valueMissing: false,
customError: "",
valid: true,
toString: function() {
	if (this.valid) return "";
	if (this.customError) return customError;
	var messages = ValidityState.messages;
	if (this.valueMissing) return messages.valueMissing;
	if (this.patternMismatch || this.typeMismatch) return this.owner._getTypeHint();
	if (this.tooLong) return messages.tooLong;
	if (this.rangeUnderflow) return messages.rangeUnderflow;
	if (this.rangeOverflow) return messages.rangeOverflow;
},
_validate: function() {
	this.valid = !(
		this.typeMismatch ||
		this.rangeUnderflow ||
		this.rangeOverflow ||
		this.tooLong ||
		this.patternMismatch ||
		this.valueMissing ||
		Boolean(this.customError)
	);
}
});
var ValidityState = this.ValidityState;
ValidityState.className = "ValidityState";
ValidityState.messages = {};
// ===========================================================================
// NodeList
// ===========================================================================

this.NodeList = Base.extend({
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
_addItem: function(node, index) {
	this[index] = node;
	this.length = index;
},
length: 0,
item: function(index) {
	return this[index];
}
});
var NodeList = this.NodeList;
NodeList.className = "NodeList";
NodeList.sort = function($element1, $element2) {
	return $element1.sourceIndex - $element2.sourceIndex;
};
// ===========================================================================
// HTMLCollection
// ===========================================================================

this.HTMLCollection = NodeList.extend({
constructor: function(map) {
	this.base(map);
},
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
});
var HTMLCollection = this.HTMLCollection;
HTMLCollection.PROTECTED = /^(item|namedItem|length)$/;
HTMLCollection.className = "HTMLCollection";
// boot
System.boot();
};
