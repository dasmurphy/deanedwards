// ===========================================================================
// Chrome
// ===========================================================================

var Chrome = this.Chrome = Base.extend({
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
}, {
	className: "Chrome",
	
	themes: {
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
	},
	
	detect: function() {
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
	}
});
