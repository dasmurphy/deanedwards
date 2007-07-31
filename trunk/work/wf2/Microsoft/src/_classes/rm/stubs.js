// ===========================================================================
// Add
// ===========================================================================

this.Add = wf2.Button.extend({
constructor: function(component) {
	this.base(component);
},
type: "add"
});
var Add = this.Add;
Add.className = "Add";

// ===========================================================================
// MoveDown
// ===========================================================================

this.MoveDown = wf2.Button.extend({
constructor: function(component) {
	this.base(component);
},
type: "move-down"
});
var MoveDown = this.MoveDown;
MoveDown.className = "MoveDown";

// ===========================================================================
// MoveUp
// ===========================================================================

this.MoveUp = wf2.Button.extend({
constructor: function(component) {
	this.base(component);
},
type: "move-up"
});
var MoveUp = this.MoveUp;
MoveUp.className = "MoveUp";

// ===========================================================================
// Remove
// ===========================================================================

this.Remove = wf2.Button.extend({
constructor: function(component) {
	this.base(component);
},
type: "remove"
});
var Remove = this.Remove;
Remove.className = "Remove";