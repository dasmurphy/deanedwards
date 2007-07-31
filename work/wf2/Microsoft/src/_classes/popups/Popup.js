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
		body.style.cssText = "overflow:hidden;margin:0;border:1px solid black;";
		body.onselectstart =
		body.oncontextmenu = function(){return false};
	
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
