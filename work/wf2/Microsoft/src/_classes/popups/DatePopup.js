// ===========================================================================
// DatePopup
// ===========================================================================

var DatePopup = wf2.DatePopup = wf2.Popup.extend({
	constructor: function() {
		this.base();
		
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
}, {
	isSameDay: function(d1, d2) {
		return d1.getDate() == d2.getDate() &&
			d1.getMonth() == d2.getMonth() &&
			d1.getFullYear() == d2.getFullYear();
	},
	
	isSameMonth: function(d1, d2) {
		return d1.getMonth() == d2.getMonth() &&
			d1.getFullYear() == d2.getFullYear();
	}
});
