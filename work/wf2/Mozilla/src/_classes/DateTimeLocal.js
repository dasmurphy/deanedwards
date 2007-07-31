// ===========================================================================
// DateTimeLocal
// ===========================================================================

var DateTimeLocal = this.DateTimeLocal = DateTime.extend({
	type: "datetime-local",
	
	_format: function(datetime) {
		return DateTimeLocal.format(datetime);
	},
	
	_parse: function(string) {
		return DateTimeLocal.parse(string);
	}
}, {
	className: "DateTimeLocal",
	
	format: function(datetime) {
		return wf2.Date.format(datetime) + "T" + Time.format(datetime);
	},
	
	parse: function(string) {
		var parts = String(string).split("T");
		var date = wf2.Date.parse(parts[0]);
		var datetime = Time.parse(parts[1]);
		datetime.setFullYear(date.getFullYear());
		datetime.setMonth(date.getMonth());
		datetime.setDate(date.getDate());
		return datetime;
	}
});
