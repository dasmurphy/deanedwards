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
