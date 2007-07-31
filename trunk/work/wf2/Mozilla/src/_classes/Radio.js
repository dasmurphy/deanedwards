// ===========================================================================
// Radio
// ===========================================================================

var Radio = this.Radio = this.Boolean.extend({
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
}, {
	className: "Radio"
});
