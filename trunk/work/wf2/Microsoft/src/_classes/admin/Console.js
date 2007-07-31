// ===========================================================================
// Console
// ===========================================================================

var Console = this.Console = Admin.extend({
	constructor: function() {
		if (this.checkSupport()) {
			this.window = document.createElement("div");
			this.window.innerHTML = this.innerHTML;
			this.window.style.cssText = this.cssText;
	
			var styleSheet = document.createStyleSheet();
			styleSheet.cssText = "#sp_form,#sp_form *{behavior:none!important}";
	
			window.console = this;
	
			System.scripts = {
				"wf2-onload.js": true,
				"wf2-popups.js": true,
				"locale/en.js": true
			};
	
			window.attachEvent("onload", function() {
				setTimeout(function() {
					System.boot("../src/");
					window.console.open();
				}, 0);
			});
		}
	},
	
	cssText: "position: absolute;\ntop: 0;\nleft: 0;\ntext-align: center;\npadding: 2em;\nbackground-color: #CCC;",
	innerHTML: "<p style=\"text-align:right\"><a href=\"javascript:void(console.close())\">Close</a></p>\n"+
		"<div style=\"border:4px solid black;height:480px;text-align:left;padding:2em;background:#EEE\">\n"+
		"<form enctype=\"multipart/form-data\" method=\"post\" action=\"http://software.hixie.ch/utilities/cgi/test-tools/echo\" target=\"iframe\">\n"+
		"<table>\n<thead>\n<tr><th>&nbsp;</th><th>autofocus</th><th>read-only</th><th>disabled</th></tr>\n</thead>\n"+
		"<tbody>\n<tr>\n<td>text</td>\n<td><input name=\"text_1\" type=\"text\" value=\"text\" autofocus></td>\n"+
		"<td><input name=\"text_2\" type=\"text\" value=\"text\" readonly></td>\n"+
		"<td><input name=\"text_3\" type=\"text\" value=\"text\" disabled></td>\n</tr>\n"+
		"<tr>\n<td>number</td>\n<td><input name=\"number_1\" type=\"number\" value=\"50\" autofocus></td>\n"+
		"<td><input name=\"number_2\" type=\"number\" value=\"50\" readonly></td>\n"+
		"<td><input name=\"number_3\" type=\"number\" value=\"50\" disabled></td>\n</tr>\n"+
		"<tr>\n<td>range</td>\n<td><input name=\"range_1\" type=\"range\" value=\"50\" autofocus></td>\n"+
		"<td><input name=\"range_2\" type=\"range\" value=\"50\" readonly></td>\n"+
		"<td><input name=\"range_3\" type=\"range\" value=\"50\" disabled></td>\n</tr>\n"+
		"<tr>\n<td>date</td>\n<td><input name=\"date_1\" type=\"date\" value=\"2005-10-08\" autofocus></td>\n"+
		"<td><input name=\"date_2\" type=\"date\" value=\"2005-10-08\" readonly></td>\n"+
		"<td><input name=\"date_3\" type=\"date\" value=\"2005-10-08\" disabled></td>\n</tr>\n"+
		"<tr>\n<td>datalist</td>\n<td><input name=\"list_1\" type=\"text\" list=\"datalist_1\" autofocus></td>\n"+
		"<td><input name=\"list_2\" type=\"text\" list=\"datalist_1\" readonly></td>\n"+
		"<td><input name=\"list_3\" type=\"text\" list=\"datalist_1\" disabled></td>\n</tr>\n</tbody>\n</table>\n"+
		"<p><button name=\"submit_1\" type=\"submit\" value=\"Submit\">Submit</button></p>\n</form>\n"+
		"<iframe name=\"iframe\" src=\"http://software.hixie.ch/utilities/cgi/test-tools/echo\" width=\"100%\"></iframe>\n"+
		"<p><datalist id=\"datalist_1\"></datalist></p>\n</div>",
	window: null,
	
	close: function() {
		document.body.removeChild(this.window);
		document.forms[0].style.visibility = "";
		this.tidy();
	},
	
	open: function() {
		this.window.style.pixelHeight = document.documentElement.clientHeight;
		document.forms[0].style.visibility = "hidden";
		document.body.appendChild(this.window);
		System.onload();
	},
	
	tidy: function() {
		System.dispose();
		System.path = "";
		System.scripts = {};
		Element.all = {};
		Form.map = {};
	}
}, {
	className: "Console"
});
