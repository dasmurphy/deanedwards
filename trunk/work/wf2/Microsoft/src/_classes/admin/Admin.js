// ===========================================================================
// Admin
// ===========================================================================

var Admin = this.Admin = Base.extend({
	constructor: function Admin() {
		/* execute this to get the test console */
		var console = new Console;
	
		/* execute this to generate an HTC for a given class */
		//var factory = new Factory;
		//factory.classDef(Form);
		//factory.createHTC(Form);
		//factory.createAllHTCs();
	},
	
	about: "\n This development is intended for Internet Explorer on a Win32 platform.\n\n The OO framework is being used to model DHTML Behaviors and other scripted\n components required by the Web Forms 2.0 implementation.\n\n http://whatwg.org/specs/web-forms/current-work/\n\n This model is \"live\". You can edit the classes and objects. To see the effect\n select \"Run\". If you are not using Internet Explorer you will just see this\n message.\n\n ---\n\n Web Forms 2.0 for Internet Explorer by Dean, Olav, Erik, Dimitri and \"Gary\" - 2005.\n\n http://webforms2.org/",
	version: "0.1a",
	
	checkSupport: function() {
		// Is this Internet Explorer? Or a wannabe?
		/*@cc_on @*/
		/*@if (@_win32) {
			return true;
		}
		/*@end @*/
		System.sysout = this.about;
		return false;
	}
}, {
	className: "Admin"
});
