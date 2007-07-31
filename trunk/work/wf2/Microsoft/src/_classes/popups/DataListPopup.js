// ===========================================================================
// DataListPopup
// ===========================================================================

wf2.DataListPopup = wf2.Popup.extend({
	constructor: function(datalist) {
		this.base();
		this.datalist = datalist;
		// create additional styles
		this.body.style.cssText += ";overflow-y:auto";
	
		var self = this;
		this.window.onresize = function () {
			self.onresize();
		};
		this.body.onmouseover = this.body_onmouseover;
		this.body.onclick = this.body_onclick;
	},	
	
	cssText: "html,body{margin:0;padding:0;border:0;overflow:hidden;}" +
		"body{overflow-x:hidden;overflow-y:auto}" +
		".datalist-ui{width:100%;overflow-x:hidden;}" +
		"div{padding:0;width:100%;white-space:nowrap;}" +
		"span{padding:0 0.5em;}" +
		".selected{background-color:Highlight;}" +
		".selected span{color:HighlightText;}" +
		"span{/*font:icon;*/text-overflow:ellipsis;overflow:hidden;}" +
		"/*.value-col{color:WindowText;}*/" +
		".label-col{color:GrayText;}",
	innerHTML: "",
	
	selectedItem: null,
	
	dispose: function() {
		this.base();
		this.datalist = null;
	},
	
	bind: function(owner) {
		this.base(owner);
		this.setValue(owner._getRawValue());
		this.buildContent();
	},
	
	setValue: function(value) {
	},
	
	onresize: function () {
		var el = this.body;
		var cw = el.clientWidth;
		var valueColWidth = 0;
		var labelColWidth = 0;
		var rows = el.childNodes;
		var l = rows.length;
		var cells;
		for (var i = 0; i < l; i++) {
			cells = rows[i].childNodes;
			cells[0].style.width = "100%";
			if (cells.length > 1) {
				cells[1].style.width = "100%";
			}
		}
	
		for (var i = 0; i < l; i++) {
			cells = rows[i].childNodes;
			valueColWidth = Math.max(valueColWidth, cells[0].offsetWidth);
			if (cells.length > 1) {
				labelColWidth = Math.max(labelColWidth, cells[1].offsetWidth);
			}
		}
		if (valueColWidth + labelColWidth > cw) {
			valueColWidth = Math.ceil(valueColWidth / (valueColWidth + labelColWidth) * cw);
			labelColWidth = cw - valueColWidth;
		}
	
		for (var i = 0; i < l; i++) {
			cells = rows[i].childNodes;
			cells[0].style.width = valueColWidth + "px";
			if (cells.length > 1) {
				cells[1].style.width = labelColWidth + "px";
			}
		}
	},
	
	show: function (owner) {
		this.base(owner);
		this.onresize();
	},
	
	body_onmouseover: function () {
		var popup = System.popup;
		var event = popup.window.event;
		var element = event.srcElement;
		while (element && element.tagName != "DIV") {
			element = element.parentNode;
		}
		if (element && element.tagName == "DIV") {
			popup.select(element);
		}
	},
	
	body_onclick: function () {
		var p = System.popup;
		var e = p.popup.document.parentWindow.event;
		var el = e.srcElement;
		while (el != null && el.tagName != "DIV") {
			el = el.parentNode;
		}
		if (el && el.tagName == "DIV") {
			p.select(el);
		}
		p.onclick();
	},
	
	onclick: function () {
		this.value = this.selectedItem.value;
		this.base();
	},
	
	onkeydown: function () {
		var event = this.element.document.parentWindow.event;
		if (this.popup.isOpen) {
			switch (event.keyCode) {
				case 9:		// escape
					this.hide();
					break;
				case 13:	// enter
					this.onclick();
					event.returnValue = false;
					break;
				case 38:	// up-arrow
					if (this.selectedItem && this.selectedItem.previousSibling) {
						this.select(this.selectedItem.previousSibling);
					} else {
						this.select(this.body.lastChild);
					}
					event.returnValue = false;
					break;
				case 40:	// down-arrow
					if (this.selectedItem && this.selectedItem.nextSibling) {
						this.select(this.selectedItem.nextSibling);
					} else {
						this.select(this.body.firstChild);
					}
					event.returnValue = false;
					break;
				case 36:	// home
					this.select(this.body.firstChild);
					break;
				case 35:	// end
					this.select(this.body.lastChild);
					break;
			}
		} else {
			switch (event.keyCode) {
				case 38: // up-arrow
				case 40: // down-arrow
					this.show();
					event.returnValue = false;
					break;
			}
		}
	},
	
	select: function (srcEl) {
		if (this.selectedItem != srcEl && this.selectedItem) {
			this.selectedItem.className = "";
		}
		this.selectedItem = srcEl;
		if (srcEl) {
			srcEl.className = "selected";
			if (srcEl.offsetTop < srcEl.parentNode.scrollTop) {
				srcEl.scrollIntoView(true);
			} else if (srcEl.offsetTop + srcEl.offsetHeight > srcEl.parentNode.scrollTop + srcEl.parentNode.clientHeight) {
				srcEl.scrollIntoView(false);
			}
		}
	},
	
	buildContent: function () {
		var options = this.datalist.get_options();
		var b = this.body;
		b.innerText = "";
		var d = this.body.document;
		var l = options.length;
		var option, div, span, value;
		for (var i = 0; i < l; i++) {
			option = options[i];
			if (!option.disabled) {
				div = d.createElement("div");
				value = option.value || option.text;
				div.value = value;
				span = d.createElement("span");
				span.className = "value-col";
				// TODO: The text should reuse displayValue from the old code
				span.appendChild(d.createTextNode(value));
				div.appendChild(span);
				var label = option.label || option.innerText;
				if (label) {
					span = d.createElement("span");
					span.className = "label-col";
					span.appendChild(d.createTextNode(label));
					div.appendChild(span);
				}
				b.appendChild(div);
			}
		}
	}
});
