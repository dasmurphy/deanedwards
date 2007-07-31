// ===========================================================================
// Spinner
// ===========================================================================

var Spinner = this.Spinner = Chrome.extend({
	stateCount: 6,
	
	getImageSrc: function () {
		return "spinner.png";
	}
}, {
	className: "Spinner"
});
