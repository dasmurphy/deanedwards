
// ===========================================================================
// Factory
// ===========================================================================

var Factory = this.Factory = Admin.extend({
	constructor: function() {
	},
	
	DIVIDER: "======================================================================",
	
	createHTC: function(klass) {
		// constants
		var IGNORE = new Base;
		var PROPERTY = /^get_/;
		var WRITEABLE = "set_";
		var EVENT = /^on/;
		var SCRIPT = "script";
	
		var prototype = klass.valueOf.prototype;
		var jscript = ["var e = new wf2." + klass.className + "(element)"];
	
		this.header();
		System.print("<component>");
		for (var i in prototype) {
			if (typeof prototype[i] == "function" && typeof IGNORE[i] == "undefined") {
				if (PROPERTY.test(i)) {
					var name = i.slice(4);
					var property = '<property name="' + name + '" get="' + i + '"';
					jscript.push('function ' + i + '(){return e.' + i + '()}');
					if (typeof prototype[WRITEABLE + name]) {
						property += ' put="set_' + name + '"';
						jscript.push('function set_' + name + '(v){return e.set_' + name + '(v)}');
					}
					property += '/>';
					System.print(property);
				} else if (EVENT.test(i)) {
					System.print('<attach event="' + i + '" onevent="e.' + i + '()"/>');
				} else {
					System.print('<method name="' + i + '"/>');
					var text = String(prototype[i]);
					var args = text.slice(text.indexOf("("), text.indexOf(")") + 1);
					jscript.push('function ' + i + args + '{return e.' + i + args + '}');
				}
			}
		}
		System.print('<script language="jscript">');
		System.print(jscript.join(";\n"));
		System.print('</' + SCRIPT + '>');
		System.print('</component>');
	},
	
	classDef: function(klass) {
		// write out a class definition
		System.print(new meta.Class(klass.name, klass, klass.ancestor));
	},
	
	build: function() {
		if (this.checkSupport()) {
			window.attachEvent("onload", function() {
				setTimeout(function() {
					System.sysout = this.bootScript();
					gotoBookmark();
				}, 0);
			});
		}
	},
	 
	header: function() {
		System.print("<!-- Web Forms 2.0 (for Internet Explorer) version " + this.version + " -->");
		System.print("<!-- generated: " + (new Date) + " -->");
	},
	
	bootScript: function() {
		return "var wf2 = new function() {" + wf2 + "};"
	},
	
	createAllHTCs: function(klass) {
		if (!klass) klass = Base;
		for (var i in wf2) {
			if (typeof wf2[i] == "function") {
				var prototype = wf2[i].valueOf.prototype;
				var htc = prototype.tagName;
				if (htc) {
					if (htc == "INPUT") {
						if (!prototype.type) continue;
						htc += "-" + prototype.type;
					}
					System.print(this.DIVIDER);
					System.print(htc.toLowerCase() + ".htc");
					System.print(this.DIVIDER);
					this.createHTC(wf2[i]);
				}
			}
		}
	}
}, {
	className: "Factory"
});
