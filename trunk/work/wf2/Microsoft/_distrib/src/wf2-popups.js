new function() {
var wf2 = window.wf2;
var System = wf2.System.prototype;
// wf2 classes
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

// TODO: This is just dummy data
innerHTML: "",
	//'<div><span class="value-col">http://www.ietf.org/rfc/rfc2045</span><span class="label-col">MIME: Format of Internet Message Bodies</span></div>' +
	//'<div><span class="value-col">http://www.w3.org/TR/html4/d</span><span class="label-col">HTML 4.01 Specification</span></div>' +
	//'<div><span class="value-col">http://www.w3.org/TR/xforms/slice8.html#ui-commonelems-hint</span><span class="label-col">Form Controls</span></div>' +
	//'<div><span class="value-col">http://www.w3.org/TR/SVG/</span><span class="label-col">Scalable Vector Graphics (SVG) 1.1 Specification</span></div>' +
	//'<div><span class="value-col">http://www.w3.org/TR/SVG/feature.html</span><span class="label-col">Feature Sets - SVG 1.1 - 20030114</span></div>' +
	//'<div><span class="value-col">http://www.unix-systems.org/version3/</span><span class="label-col">The Single UNIX Specification, Version 3</span></div>',

// TODO: join string once done
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


selectedItem: null,

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
//var DataListPopup = this.DataListPopup;
wf2.DataListPopup.className = "DataListPopup";
// ===========================================================================
// DatePopup
// ===========================================================================

wf2.DatePopup = wf2.Popup.extend({
constructor: function() {
	this.base();
//	this.currentDate = DatePopup.simplifyDate(new Date);
//	this.selectedDate = DatePopup.simplifyDate(new Date); // plug in initialization later

	// all of these will need to be cleaned up on unload
	var document = this.popup.document;
	this.topLabel = document.getElementById("topLabel");
	this.grid = document.getElementById("grid");

	// hook up events
	var self = this;
	this.body.onclick =
	this.body.ondblclick =
	this.grid.onmousedown =
	this.grid.onmouseover =
	this.grid.onmouseout =
	this.body.onmousewheel = function() {
		self.handleEvent(self.window.event);
	};
},
dispose: function() {
	this.body.onclick =
	this.body.ondblclick =
	this.grid.onmousedown =
	this.grid.onmouseover =
	this.grid.onmouseout =
	this.body.onmousewheel = null;

	this.base();
	this.topLabel =
	this.grid = null;
},

firstDay: 0,
type: "date",

innerHTML: "<div id=dp><div class=header><table class=headerTable>\n"+
	"<tr><td><a id=previousYear href=# hidefocus>7</a></td>\n"+
	"<td><a id=previousMonth href=# hidefocus>3</a></td>\n"+
	"<td class=labelContainer><span id=topLabel>0</span></td>\n"+
	"<td><a id=nextMonth href=# hidefocus>4</a></td>\n"+
	"<td><a id=nextYear href=# hidefocus>8</a></td></tr></table></div>\n"+
	"<div id=grid><table class=gridTable cellspacing=0>\n"+
	"<tr class=daysRow><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td></tr>\n"+
	"<tr><td class=upperLine colspan=7></td></tr>\n"+
	"<tr><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td></tr>\n"+
	"<tr><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td></tr>\n"+
	"<tr><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td></tr>\n"+
	"<tr><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td></tr>\n"+
	"<tr><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td></tr>\n"+
	"<tr><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td></tr></table></div></div>",

cssText: "#dp{background:Window;width: 100%;}\n"+
	"td{font-family:SmallCaption;text-align:center;color:WindowText;font-weight:normal;padding:0}\n"+
	".header{background:Highlight;padding:0;border-bottom:1px solid WindowText}\n"+
	".headerTable{width:100%}\n"+
	".gridTable{width:100%}\n"+
	".gridTable td{width:14.3%}\n"+
	".gridTable.daysRow td{border-bottom:1px solid ThreeDDarkShadow;font-weight:bold}\n"+
	".upperLine{width:100%;height:2px;overflow:hidden;background:transparent}\n"+
//	".current,.current td{background:InactiveCaption;color:InactiveCaptionText}\n"+
	".selected,.selected td{background:Highlight;color:HighlightText}\n"+
//	".other, .current .other, .selected .other{color:GrayText}\n"+
	".other, .selected .other{color:GrayText}\n"+
	"td.labelContainer{width:100%;padding:0}\n"+
	"#topLabel{color:HighlightText;display:block;font-weight:bold;width:100%}\n"+
	"a{border:2px outset #fff;font-weight:normal;background:ButtonFace;font-family:Webdings;"+
		"font-size:10px;line-height:9px;width:14px;height:14px;color:black;text-decoration:none;padding:1px 2px 2px 1px}",

bind: function(owner) {
	this.base(owner);
	this.selection = null;
	this.type = owner.type;
	this.firstDay = (this.type == "week") ? wf2.Week.MONDAY : wf2.Week.firstDay;
	var date = owner.value;
	if (isNaN(date)) date = owner._getStartValue();
	this.setValue(date, true);
},

setValue: function(date, refresh) {
	// do not update if not really changed
	//date = DatePopup.simplifyDate(new Date(date));
	date = new Date(date);
	if (refresh || !DatePopup.isSameDay(this.selectedDate, date)) {
		this.selectedDate = date;
		this._updateTable();
		this._setTopLabel();
	}
},

getValue: function() {
	return new Date(this.selectedDate); // create a new instance
},

_updateTable: function() {
	var i, str = "", rows = 6, cols = 7;
//	var currentDate = this.currentDate;
	var selectedDate = this.selectedDate;

	// build matrix of objects describing the cells in the table
	var d = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1, 12);
	var d2 = new Date(d);
	d.setDate(d.getDate() - (d.getDay() - this.firstDay));
	// we need to ensure that we do not start after the first of the month
	if (d > d2) {
		d.setDate(d.getDate() - 7);
	}

	var NBSP = String.fromCharCode(160);
	var cells = [];
	for (var y = 0; y < rows; y++) {
		cells[y] = [];
		for (var x = 0; x < cols; x++) {
			var text = d.getDate();
			cells[y][x] = {
				text: (y == 5 && text < 20 && (!x || cells[y][0].text == NBSP)) ? NBSP : text,
				date: String(d.valueOf()),
				selected: DatePopup.isSameDay(selectedDate, d),
//				current: currentDate && DatePopup.isSameDay(currentDate, d),
				other: !DatePopup.isSameMonth(selectedDate, d)
			};
			d.setDate(d.getDate() + 1);
		}
	}

	// fix day letter order if not standard
	var weekDays = wf2.Week.days;
	if (this.firstDay) {
		weekDays = [];
		for (i = 0; i < 7; i++) {
			weekDays[i] = wf2.Week.days[(i + this.firstDay) % 7];
		}
	}

	// update text in days row
	var tds = this.grid.firstChild.tBodies[0].rows[0].cells;
	for (i = 0; i < cols; i++) {
		tds[i].innerText = weekDays[i];
	}

	// update the text nodes and class names
	var trs = this.grid.firstChild.tBodies[0].rows;
	var tmpCell, cell;
	for (var y = 0; y < rows; y++) {
		for (var x = 0; cell = cells[y][x]; x++) {
			tmpCell = trs[y + 2].cells[x];
			if (x == 0) { // only reset row className once per row
				tmpCell.parentNode.className = "";
			}
			tmpCell.className = "";
			if (cell.other) {
				tmpCell.className += " other";
			}
//			if (cell.current) {
//				this._highlightCurrent(tmpCell);
//			}
			if (cell.selected) {
				this._highlightSelection(tmpCell);
			}
			tmpCell.innerText = cell.text;
			tmpCell.timeStamp = cell.date;
		}
	}
},

_setTopLabel: function() {
	var text = wf2.Date.months[this.selectedDate.getMonth()] + " " + this.selectedDate.getFullYear();
	this.topLabel.innerText = text;
},

_highlightSelection: function(selection) {
	selection = this._getParentCell(selection);
	if (!selection) return;
	if (this.selection) {
		this.selection.className = this.selection.className.replace(/\sselected/g, "");
	}
	if (this.type == "week") {
		selection = selection.parentNode;
	}
	selection.className += " selected";
	this.selection = selection;
},
/*
_highlightCurrent: function(cell) {
	var selection = this._getParentCell(cell);
	if (!selection) return;
	if (this.type == "week") {
		selection = selection.parentNode;
	}
	selection.className += " current";
}, */

_getParentCell: function(element) {
	while (element && element.tagName != "TD" && (element = element.parentElement)) continue;
	return (element && !isNaN(parseInt(element.innerText))) ? element : null;
},

_getDateFromMouseEvent: function(event) {
	// find td
	var cell = this._getParentCell(event.srcElement);
	if (cell) {
		// always select Monday for "week"
		if (this.type == "week") {
			cell = cell.parentNode.cells[0];
		}
		return new Date(Number(cell.timeStamp));
	}
},

onkeydown: function() {
	this.base();
	var event = this.element.document.parentWindow.event;
	if (event.altKey || event.ctrlKey || event.shiftKey) {
		return;
	}
	var d = new Date(this.selectedDate);
	switch (event.keyCode) {
		case 13: // enter
			this.value = this.selectedDate;
			this.onclick();
			break;
		case 34: // page down
			d.setMonth(d.getMonth() + 1);
			break;
		case 33: // page up
			d.setMonth(d.getMonth() - 1);
			break;
		case 37: // left-arrow
			if (this.type != "week") {
				d.setDate(d.getDate() - 1);
				break;
			}
		case 38: // up-arrow
			if (!event.altKey) {
				d.setDate(d.getDate() - 7);
			}
			break;
		case 39: // right-arrow
			if (this.type != "week") {
				d.setDate(d.getDate() + 1);
				break;
			}
		case 40: // down-arrow
			if (!event.altKey) {
				d.setDate(d.getDate() + 7);
			}
			break;
	}
	this.setValue(d);
},

handleEvent: function(event) {
	if (this._keydown && event.type != "click") return;
	switch (event.type) {
		case "dblclick":
			if (event.srcElement.tagName != "A") break;
		case "click":
			this.handleClick(event);
			break;

		case "mousedown":
			var d = this._getDateFromMouseEvent(event);
			if (d && (DatePopup.isSameMonth(d, this.selectedDate) || this.type == "week")) {
				// don't use setValue here because we don't need the redraw
				this.selectedDate = d;
			}
			break;

		// ie6 extension
		case "mousewheel":
			var n = - event.wheelDelta / 120;
			var d = new Date(this.selectedDate);
			var m = d.getMonth() + n;
			d.setMonth(m);
			this.setValue(d);
			event.returnValue = false;
			break;

		case "mouseover":
			var d = this._getDateFromMouseEvent(event);
			if (d && DatePopup.isSameMonth(d, this.selectedDate) || this.type == "week") {
				this._highlightSelection(event.srcElement);
			}
			break;
	}
},

handleClick: function(event) {
	var d = new Date(this.selectedDate);
	switch (event.srcElement.id) {
		case "previousMonth":
			d.setMonth(d.getMonth() - 1);
			break;

		case "nextMonth":
			d.setMonth(d.getMonth() + 1);
			break;

		case "nextYear":
			d.setMonth(d.getMonth() + 12);
			break;

		case "previousYear":
			d.setMonth(d.getMonth() - 12);
			break;

		default:
			d = this._getDateFromMouseEvent(event);
			if (d && (DatePopup.isSameMonth(d, this.selectedDate) || this.type == "week")) {
				this.value = this.selectedDate;
				this.onclick();
			}
			return;
	}
	this.setValue(d);
}
});
var DatePopup = wf2.DatePopup;
DatePopup.className = "DatePopup";

DatePopup.isSameDay = function(d1, d2) {
	return d1.getDate() == d2.getDate() &&
		d1.getMonth() == d2.getMonth() &&
		d1.getFullYear() == d2.getFullYear();
};

DatePopup.isSameMonth = function(d1, d2) {
	return d1.getMonth() == d2.getMonth() &&
		d1.getFullYear() == d2.getFullYear();
};
/*
DatePopup.simplifyDate = function(d) {
	d.setHours(12);
	d.setMinutes(0);
	d.setSeconds(0);
	d.setMilliseconds(0);
	return d;
}; */
};
