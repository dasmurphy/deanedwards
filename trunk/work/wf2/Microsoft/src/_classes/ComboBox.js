// ===========================================================================
// ComboBox
// ===========================================================================

var ComboBox = this.ComboBox = Chrome.extend({
	getImageSrc: function () {
		return "dropdown.png";
	},
	
	ondocumentready: function () {
		this.base();
		// load the popups module
		System.load("wf2-popups.js");
	}
});
