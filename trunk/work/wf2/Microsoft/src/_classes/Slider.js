// ===========================================================================
// Slider
// ===========================================================================

var Slider = this.Slider = ProgressBar.extend({	
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
}, {
	HORIZONTAL_WIDTH: 3000,
	HORIZONTAL_HEIGHT: 21,
	VERTICAL_WIDTH: 22,
	VERTICAL_HEIGHT: 3000,
	THUMB_WIDTH: 11,
	THUMB_HEIGHT: 11,
	HORIZONTAL: 1,
	VERTICAL: 2
});
