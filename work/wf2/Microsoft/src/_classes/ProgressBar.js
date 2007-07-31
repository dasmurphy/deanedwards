// ===========================================================================
// Progress Bar
//
// The progress bar uses a value between 0 and 1 and it is up to the consumer to
// map this to a valid value range
//
// ===========================================================================

// TODO: Right to left should invert horizontal

var ProgressBar = this.ProgressBar = Chrome.extend({
	
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
}, {
	HEIGHT: 3000,
	WIDTH: 3000,
	CHUNK_WIDTH: 10,
	CHUNK_HEIGHT: 10,
	HORIZONTAL: 1,
	VERTICAL: 2
});

