new function() {
var wf2 = window.wf2;
var System = wf2.System.valueOf.prototype;
var Element = wf2.Element;
// wf2 classes
// ===========================================================================
// Chrome
// ===========================================================================

wf2.Chrome.states = {
	normal: 0,
	hover: 1,
	active: 2,
	disabled: 3
};

wf2.Chrome.prototype.extend({

isActive: function() {
	return this._activeThumb && (this._activeThumb == this._hoverThumb);
},

getCursor: function() {
	return (this._activeThumb || this._hoverThumb || !this._hover) ? "default" : "";
},

syncCursor: function() {
	this.element.runtimeStyle.cursor = this.getCursor();
},

hitTest: function () {
	if (this.element.currentStyle.direction == "rtl") {
		return event.offsetX <= this.imageWidth;
	} else {
		return event.offsetX >= this.element.clientWidth - this.imageWidth;
	}
},

delayRefresh: function() {
	// use a timer delay to prevent excess mouse movement
	//  from causing cursor flicker (hourglass)
	if (!this._delay) {
		var self = this;
		this._delay = setTimeout(function() {
			self.syncCursor();
			self.layout();
			delete self._delay;
		}, 50);
	}
},

onmousedown: function() {
	if (!this.owner._isEditable()) return;

	this._activeThumb = this.hitTest();
	if (this._activeThumb) {
		this.element.setCapture();
	}
	this.syncCursor();
	this.layout();
},

onmouseup: function() {
	if (this._activeThumb) {
		delete this._activeThumb;
		this.syncCursor();
		this.layout();
	}
	this.element.releaseCapture();

},

onkeydown: function() {
	if (event.keyCode == 13) {
		this.owner._triggerSubmission();
	}
},

onlosecapture: function() {
	this.onmouseup();
},

onmousemove: function() {
	this._hoverThumb = this.hitTest();
	this.delayRefresh();
},

onmouseover: function() {
	this._hover = true;
},

onmouseout: function() {
	delete this._hoverThumb;
	delete this._hover;
	this.delayRefresh();
},

onmousewheel: function() {
	this.owner._increment(parseInt(event.wheelDelta / 120));
	event.returnValue = false;
},

onfocus: function() {
	this._focus = true;
	this.layout();
},

onblur: function() {
	delete this._focus;
	this.layout();
},

onresize: function() {
	this.layout();
},

onscroll: function() {
	this.resetScroll();
}

});
// ===========================================================================
// Spinner (event handlers)
// ===========================================================================

wf2.Spinner.states = {
	normal: 0,
	up_hover: 1,
	up_active: 2,
	down_hover: 3,
	down_active: 4,
	disabled: 5
};

wf2.Spinner.prototype.extend({

steps: 1,
direction: 0,

getState: function() {
	var s;
	if (this.element.isDisabled) {
		s = "disabled";
	} else if (this.owner.get_readOnly()) {
		s = "normal";
	} else if (this.isActive()) {
		s = this._activeThumb + "_active";
	} else if (this._hoverThumb) {
		s = this._hoverThumb + "_hover";
	} else {
		s = "normal";
	}
	return wf2.Spinner.states[s];
},

hitTest: function() {
	// this returns null, "up" or "down"
	if (this.base()) {
		if (event.offsetY <= (this.element.clientHeight / 2)) {
			return "up";
		} else {
			return "down";
		}
	}
},

activate: function(direction, block) {
	if (!this._timerId) {
		this._activeThumb = this._hoverThumb = direction;
		this.layout();
		this._block = block;
		this.startTimer();
	}
},

deactivate: function() {
	if (this._timerId) {
		this.stopTimer();
		this._activeThumb = this._hoverThumb = null;
		delete this._block;
		this.layout();
	}
},

startTimer: function() {
	if (!this._timerId) {
		this.steps = 1;
		this.direction = (this._activeThumb == "up") ? 1 : -1;
		this.base();
	}
},

stopTimer: function() {
	if (this._timerId) {
		this.base();
		if (!this._firedOnce) this.increment();
		delete this._firedOnce;
		this.owner.select();
	}
},

oninterval: function() {
	this.increment();
	this.steps *= 1.1; // accelerate
},

increment: function() {
	var n = parseInt(this.steps * this.direction);
	if (this._block) {
		this.owner._blockIncrement(n);
	} else {
		this.owner._increment(n);
	}
	this._firedOnce = true;
},

onkeydown: function() {
	this.base();

	if (!this.owner._isEditable()) return;

	switch (event.keyCode) {
		case 38: // up-arrow
			this.activate("up");
			event.returnValue = false;
			break;
		case 40: // down-arrow
			this.activate("down");
			event.returnValue = false;
			break;
		case 33: // page-up
			this.activate("up", true);
			event.returnValue = false;
			break;
		case 34: // page-down
			this.activate("down", true);
			event.returnValue = false;
			break;
	}
},

onkeyup: function() {
	this.base();

	if (!this.owner._isEditable()) return;

	switch (event.keyCode) {
		case 33: // page-up
		case 34: // page-down
		case 38: // up-arrow
		case 40: // down-arrow
			event.returnValue = false;
			this.deactivate();
			break;
	}
},

onmousedown: function() {
	this.base();
	if (this._activeThumb) {
		this.startTimer();
	}
},

onmouseup: function() {
	if (this._activeThumb) {
		this.stopTimer();
	}
	// call afterward because we don't want to clear the state yet
	this.base();
},

ondblclick: function() {
	this.base();
	if (this._hoverThumb != undefined) {
		// IE does not fire down/up for dblclicks
		this.owner._increment(this.direction);
	}
}

});
// ===========================================================================
// ComboBox
// ===========================================================================

wf2.ComboBox.prototype.extend({

isActive: function() {
	return this.popup && this.popup.isOpen();
},

getState: function () {
	var s;
	if (this.element.isDisabled) {
		s = "disabled";
	} else if (this.owner.get_readOnly() || !wf2.Popup) {
		s = "normal";
	} else if (this._hoverThumb && this._activeThumb) {
		s = "active";
	} else if (this._hoverThumb &&  !this.isActive()) {
		s = "hover";
	} else {
		s = "normal";
	}
	return wf2.Chrome.states[s];
},

popup: null,

dispose: function() {
	this.base();
	this.popup = null;
},

onmousedown: function() {
	if (!this.owner._isEditable()) return;
	var BUTTON_LEFT = 1;
	if (!(event.button & BUTTON_LEFT)) return;
	if (!this.popup) {
		this.popup = this.owner._createPopup();
	}
	if (this.popup) {
		if (this.hitTest()) {
			if (!this.popup.isOpen()) this.base();
			this.popup.toggle(this.owner);
		}
	}
},

onkeydown: function () {
	// up/down-arrows
	if (this.owner._isEditable()) {
		var UP_DOWN = event.keyCode == 38 || event.keyCode == 40;
		if (!this.popup && UP_DOWN) {
			this.popup = this.owner._createPopup();
		}
		if (this.popup) {
			if (event.keyCode == 27) {	// escape
				this.popup.hide();
			} else if (UP_DOWN && !this.popup.isOpen()) {
				this.popup.show(this.owner);
				event.returnValue = false;
			} else if (this.popup.isOpen()) {
				this.popup.onkeydown();
				event.returnValue = false;
			} else this.base();
			return;
		}
	}
	this.base();
},

onkeyup: function () {
	if (this.isActive()) this.popup.onkeyup();
}

});
// ===========================================================================
// Progress Bar
// ===========================================================================

wf2.ProgressBar.prototype.extend({

hitTest: function() {
	return false;
}

});
// ===========================================================================
// Slider
// ===========================================================================

wf2.Slider.prototype.extend({

hitTest: function() {
	var mx, my, tx, ty;
	if (this.element.isDisabled) {
		return false;
	}
	var rect = this.element.getBoundingClientRect();
	if (this.orientation == wf2.Slider.HORIZONTAL) {
		mx = event.clientX - rect.left;
		tx = this._thumbLeft;
		if (mx < tx) {
			return false;
		}
		if (mx < tx + wf2.Slider.THUMB_WIDTH) {
			my = event.clientY - rect.top;
			ty = this._thumbTop;
			if (my < ty) {
				return false;
			}
			return my < ty + wf2.Slider.HORIZONTAL_HEIGHT;
		}
	} else {
		my = event.clientY - rect.top;
		ty = this._thumbTop;
		if (my < ty) {
			return false;
		}
		if (my < ty + wf2.Slider.THUMB_HEIGHT) {
			mx = event.clientX - rect.left;
			tx = this._thumbLeft;
			if (mx < tx) {
				return false;
			}
			return mx < tx + wf2.Slider.VERTICAL_WIDTH;
		}
	}
},

getState: function() {
	var s;
	if (this.element.isDisabled) {
		s = "disabled";
	} else if (this._activeThumb) {
		s = "active";
	} else if (this._focus || this._hoverThumb) {
		s = "hover";
	} else {
		s = "normal";
	}
	return wf2.Chrome.states[s];
},

oninterval: function() {
	var rect = this.element.getBoundingClientRect();
	if (this.orientation == wf2.Slider.HORIZONTAL) {
		var mx = this._eventClientX - rect.left;
		var l = this._thumbLeft;
		var w = wf2.Slider.THUMB_WIDTH;

		// _increasing is true, false or null
		if (mx < l && this._increasing != true) {
			this.setValue(this.getValue() - this.getBlockIncrement());
			this._increasing = false;
			//this.layout();
		} else if (mx > l + w && this._increasing != false) {
			this.setValue(this.getValue() + this.getBlockIncrement());
			this._increasing = true;
			//this.layout();
		}
	} else {
		var my = this._eventClientY - rect.top;
		var t = this._thumbTop;
		var h = wf2.Slider.THUMB_HEIGHT;

		if (my < t && this._increasing != false) {
			this.setValue(this.getValue() + this.getBlockIncrement());
			this._increasing = true;
			//this.layout();
		} else if (my > t + h && this._increasing != true) {
			this.setValue(this.getValue() - this.getBlockIncrement());
			this._increasing = false;
			//this.layout();
		}
	}
	this._firedOnce = true;
},

onmousedown: function() {
	this.base();
	//this.element.focus();
	event.returnValue = false;
	if (!this.owner._isEditable()) return;
	this._dragging = this._activeThumb;
	if (this._dragging) {
		this._dragInfo = {
			screenX: event.screenX,
			screenY: event.screenY,
			dx:      event.screenX - this._thumbLeft,
			dy:      event.screenY - this._thumbTop
		};
		this.layout(); // make thumb active
		this._firedOnce = true;
	} else {
		this.startTimer();
		this._eventClientX = event.clientX;
		this._eventClientY = event.clientY;
	}
},

onmouseup: function() {
	this.base();
	event.returnValue = false;
	delete this._dragging;
	delete this._dragInfo;
	if (!this._firedOnce) this.oninterval();
	this.stopTimer();
	delete this._eventClientX;
	delete this._eventClientY;
	delete this._increasing;
	delete this._firedOnce;
},

onmousemove: function() {
	if (this._dragging) {
		var size, pos;
		if (this.orientation == wf2.Slider.HORIZONTAL) {
			size = this.element.clientWidth - wf2.Slider.THUMB_WIDTH;
			pos = event.screenX - this._dragInfo.dx;
		} else {
			size = this.element.clientHeight - wf2.Slider.THUMB_HEIGHT;
			pos = size - event.screenY + this._dragInfo.dy;
		}
		this.setValue(pos / size);
		//this.layout();
	} else {
		this.base();
	}
},

onkeydown: function() {
	if (!this.owner._isEditable()) return;
	var keyCode = event.keyCode;
	switch (keyCode) {
		case 33: // page up
			this.setValue(this.getValue() + this.getBlockIncrement());
			break;
		case 34: // page down
			this.setValue(this.getValue() - this.getBlockIncrement());
			break;
		case 35: // end
			this.setValue(1);
			break;
		case 36: // home
			this.setValue(0);
			break;
		case 38: // up
		case 39: // right
			this.setValue(this.getValue() + this.getUnitIncrement());
			break;
		case 37: // left
		case 40: // down
			this.setValue(this.getValue() - this.getUnitIncrement());
			break;
	}

	if (keyCode >= 33 && keyCode <= 40) {
		//this.layout();
		event.returnValue = false;
	}
},

onmousewheel: function() {
	var ui = this.getUnitIncrement() * parseInt(event.wheelDelta / 120);
	this.setValue(this.getValue() + ui);
	event.returnValue = false;
},

opropertychange: function() {
	switch (event.propertyName) {
		case "min":
		case "max":
		case "step":
			this.layout();
			break;
		default:
			this.base();
	}
},

getBlockIncrement: function() {
	// try to get as close as possible to 10% while still being a multiple
	// of the step and make sure that the block increment is not smaller than
	// twice the size of the unit increment
	var ui = this.getUnitIncrement();
	return Math.max(2 * ui, Math.round(0.1 / ui) * ui);
},

getUnitIncrement: function() {
	var range = this.owner; // sliders are bound to range controls
	return range._getStepValue() / (range._getMaxValue() - range._getMinValue());
}

});
// ===========================================================================
// Form (submission interface)
// ===========================================================================

wf2.Form.SYNTAX_ERR = 12;

wf2.Form.prototype.extend({

submit: function() {
	if (!this._isValid()) {
		// [[FIX]] how should DOM exceptions be handled?
		throw new Error(wf2.Form.SYNTAX_ERR, "Form is not valid");
	}
	this._submit();
},

_triggerSubmission: function() {
	// triggered by pressing enter when a textinput has focus.
	// locates the default submit button and clicks it.
	var button = this._getDefaultSubmitButton();
	if (!button) return; // no submit button
	button._focus();
	this._onsubmit();
},

_onsubmit: function() {
	if (!this._fireEvent("onsubmit")) return; // was cancelled
	this._validate();
	if (this._isValid()) this._submit();
},

_validate: function() {
	if (System.hint) System.hint.hide();
	var focus = false;
	this._forEachElement(function(control) {
		if (control.get_willValidate()) {
			focus |= !control.checkValidity(!focus);
		}
	});
},

_isValid: function() {
	var elements = this.get_elements(), element;
	for (var i = 0; (element = elements[i]); i++) {
		if (!element.validity.valid) return false;
	}
	return true;
},

_submit: function() {
	// all submission is performed through a cloned form
	//  containing cloned elements.
	// this is due to the complexity of having elements
	//  bound to multiple forms, orphans and other WF2
	//  witchcraft

	// create the clones
	var form = this._cloneElement();
	form.style.display = "none";
	this._forEachElement(function(control) {
		if (control._isSuccessful()) {
			form.appendChild(control._cloneElement());
		}
	});
	// submit the form
	document.body.appendChild(form);
	form.submit();
	document.body.removeChild(form);
	// tidy up (this is for File controls)
	this._forEachElement(function(control) {
		control._afterSubmit();
	});
},

_getDefaultSubmitButton: function() {
	var elements = this.get_elements(), element;
	for (var i = 0; (element = elements[i]); i++) {
		if (wf2.Submit.TYPE.test(element.type)) {
			return Element.getImplementation(element);
		}
	}
}

});
// ===========================================================================
// Submit
// ===========================================================================

wf2.Submit.prototype.extend({

onclick: function() {
	event.returnValue = false;
	var form = Element.getImplementation(this.get_form());
	if (form) form._onsubmit();
}

});

wf2.Submit.TYPE = /^(submit|image)$/;
// ===========================================================================
// Data
// ===========================================================================

wf2.Data.prototype.extend({

onkeydown: function() {
	if (event.keyCode == 13) {
		this._triggerSubmission();
	} else {
		this.base();
	}
},

_triggerSubmission: function() {
	var form = Element.getImplementation(this.get_form());
	if (form) {
		this.dispatchChange();
		form._triggerSubmission();
		event.returnValue = false; // prevent default
	}
}

});
// ===========================================================================
// Scalar
// ===========================================================================

// a standard text box

wf2.Scalar.prototype.extend({

onmousedown: function() {
	this.element.focus();
	if (this.chrome) this.chrome.onmousedown();
},

onmouseup: function() {
	if (this.chrome) this.chrome.onmouseup();
},

onclick: function() {
	if (this.chrome) this.chrome.onclick();
},

ondblclick: function() {
	if (this.chrome) this.chrome.ondblclick();
},

onlosecapture: function() {
	if (this.chrome) this.chrome.onlosecapture();
},

onkeydown: function() {
	if (System.hint) System.hint.hide();
	if (this.chrome) this.chrome.onkeydown();
	else this.base();
},

ondeactivate: function() {
	if (System.hint) System.hint.hide();
},

onkeyup: function() {
	if (this.chrome) this.chrome.onkeyup();
},

onkeypress: function() {
	if (this.chrome) this.chrome.onkeypress();
},

onmousemove: function() {
	if (this.chrome) this.chrome.onmousemove();
},

onmouseover: function() {
	if (this.chrome) this.chrome.onmouseover();
},

onmouseout: function() {
	if (this.chrome) this.chrome.onmouseout();
},

onfocus: function() {
	if (this.chrome) this.chrome.onfocus();
},

onblur: function() {
	if (this.chrome) this.chrome.onblur();
},

onresize: function() {
	if (this.chrome) this.chrome.onresize();
},

onscroll: function() {
	if (this.chrome) this.chrome.onscroll();
}

});
// ===========================================================================
// Number
// ===========================================================================

wf2.Number.prototype.extend({

onpaste: function() {
	if (isNaN(clipboardData.getData("text"))) {
		event.returnValue = false;
	}
},

ondblclick: function () {
	// IE does not fire down up for dblclicks
	this.base();
	this.element.select();
},

onkeypress: function () {
	// this has no effect on UI

	if (!this._isEditable()) return;

	var preventDefault = true;
	var keyCode = event.keyCode;
	switch (keyCode) {
		case 69:  // E
			var range = document.selection.createRange();
			range.text = "e";
			range.collapse(false);
			range.select();
			break;
		case 101: // e
		case 45:  // MINUS
		case 46:  // DOT
		case 44:  // COMMA
			preventDefault = false;
	}
	if (keyCode >= 48 && keyCode <= 57) { // number
		preventDefault = false;
	}

	if (preventDefault) {
		event.returnValue = false;
	}
},

onmousewheel: function() {
	if (this.chrome) this.chrome.onmousewheel();
}

});
// ===========================================================================
// DateTime
// ===========================================================================

wf2.DateTime.prototype.extend({

onkeypress: function () {
	switch (event.keyCode) {
		// allow
//		case 47:  // SLASH
		case 58:  // COLON
			break;
		// disallow
		case 69:   // E
		case 101:  // e
		case 44:   // COMMA
			event.returnValue = false;
			break;
		default:
			this.base();
	}
}

});
// ===========================================================================
// Date
// ===========================================================================

wf2.Date.prototype.extend({

onkeypress: function () {
	switch (event.keyCode) {
		// disallow
		case 58:  // COLON
		case 46:  // DOT
			event.returnValue = false;
			break;
		default:
			this.base();
	}
}

});
// ===========================================================================
// Week
// ===========================================================================

wf2.Week.prototype.extend({

onkeypress: function () {
	switch (event.keyCode) {
		// allow
		case 119:  // w
			var range = document.selection.createRange();
			range.text = "W";
			range.collapse(false);
			range.select();
			event.returnValue = false;
		case 87:  // W
			break;
/*
		// disallow
		case 47:  // SLASH
		case 46:  // DOT
			event.returnValue = false;
			break;
*/
		default:
			this.base();
	}
}

});
// ===========================================================================
// Time
// ===========================================================================

wf2.Time.prototype.extend({

onkeypress: function () {
	switch (event.keyCode) {
		// disallow
//		case 47:  // SLASH
		case 45:  // MINUS
			event.returnValue = false;
			break;
		default:
			this.base();
	}
}

});
// ===========================================================================
// Popup
// ===========================================================================

wf2.Popup = wf2.Base.extend({
constructor: function(owner) {
	this.owner = owner;
	this.popup = window.createPopup();
	var document = this.popup.document;
	this.window = document.parentWindow;
	this.styleSheet = document.createStyleSheet();
	this.styleSheet.cssText = "body *{cursor:default}" + this.cssText;
	var body = this.body = document.body;
	body.id = "popup";

	// copy styles from the target element
	body.style.cssText = "overflow:hidden; margin:0; border:1px solid black;";
	body.onselectstart =
	body.oncontextmenu = function () { return false; };

	// create the contents
	body.innerHTML = this.innerHTML;

	if (owner) this.bind(owner);
},
dispose: function() {
	this.base();
	this.owner = null;
	this.element = null;
	this.popup = null;
	this.body = null;
	this.window = null;
	this.styleSheet = null;
},
popup: null,
owner: null,
element: null,
cssText: "",
value: "",
innerHTML: "",
body: null,
styleSheet: null,
closed: true,
closedAt: 0,
revalidateSize: true,
width: "base", // we also support "auto" (take size of content) or a number
height: "auto",	  // "auto" or a number
bind: function(owner) {
	// popup objects are re-used, so we provide a method to
	//  allow swapping of the "bound" element
	if (this.owner != owner) {
		this.owner = owner;
		var element = this.element = owner.element;
		this.revalidateSize = true;
		// copy font and colours
		var color = element.currentStyle.color;
		var backgroundColor = element.currentStyle.backgroundColor;
		var rect = element.getClientRects()[0];
		var fontSize = parseInt((rect.bottom - rect.top) * 0.5) + "px";

		var style = this.body.style;
		style.backgroundColor = backgroundColor;
		style.color = color;
		style.fontSize = fontSize;
		style.fontFamily = element.currentStyle.fontFamily;

		this.styleSheet.addRule(".value-col", "color:" + color + ";");
		this.styleSheet.addRule("td", "font-size:" + fontSize);
		this.styleSheet.addRule("th", "font-size:" + fontSize);
	}
},
hide: function() {
	this.popup.hide();
	delete System.popup;
	document.body.runtimeStyle.cursor = "";
	this.oninterval();
},
show: function(owner) {
	this.bind(owner);
	// make this the current popup
	System.popup = this;
	document.body.runtimeStyle.cursor = "default";

	var w = 2, h = 2;

	// size and position the popup window relative to the associated element
	var top = this.element.offsetHeight + 1; // TODO: Is there enough room below? Otherwise check above
	var left = 0; // TODO: RTL

	if (this.width == "base") {
		w = this.element.offsetWidth;
	} else if (this.width != "auto") {
		w = this.width;
	}
	if (this.height != "auto") {
		h = this.height;
	}

	// since we are reusing the popup the size might need to be revalidated
	if (this.width == "auto" || this.height == "auto") {
		if (this.revalidateSize) {
			this.popup.show(0, top, w, h, this.element);
		}
		if (this.width == "auto") {
			w = this.body.scrollWidth + 2;
		}
		if (this.height == "auto") {
			h = this.body.scrollHeight + 2;
		}
		scrollHeight = this.body.scrollHeight;
	}

	this.popup.show(0, top, w, h, this.element);
	this.revalidateSize = false;
	this.closed = false;
	this.startTimer();
},
toggle: function(owner) {
	if (this.isOpen()) {
		this.hide();
	} else {
		this.show(owner);
	}
},
isOpen: function() {
	this.oninterval();
	return this.popup.isOpen || new Date - this.closedAt <= 100;
},
onclick: function() {
	this.owner._setRawValue(this.value);
	this.hide();
	this.element.select();
},

onkeydown: function () {
	this._keydown = true;
},

onkeyup: function () {
	delete this._keydown;
},

oninterval: function () {
	var closed = !this.popup.isOpen;
	if (closed && this.closed != closed) {
		this.closed = closed;
		this.closedAt = new Date;
		this.stopTimer();
	}
},

getValue: function() {
},

setValue: function() {
}

});
//var Popup = this.Popup;
wf2.Popup.className = "Popup";
// ===========================================================================
// HintPopup
// ===========================================================================

wf2.HintPopup = wf2.Popup.extend({
constructor: function() {
	this.base();
	this.body.runtimeStyle.fontFamily = "Sans-Serif";
	this.body.onclick = this.onclick;
},

bind: function(element) {
	this.base(element);
	this.body.innerHTML = element.validity.toString().replace(/\n/g, "<br>");
},

onclick: function() {
	System.hint.hide();
},

// TODO: join string once done
cssText: "body{background:InactiveCaption!important;color:InactiveCaptionText!important;\n"+
	"  padding:0.5ex;cursor:default}"

});
//var HintPopup = this.HintPopup;
wf2.HintPopup.className = "HintPopup";
// boot
System.onload();
};
