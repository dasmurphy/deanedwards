// timestamp: Tue, 01 May 2007 23:37:24
/*
	base2.js - copyright 2007, Dean Edwards
	http://www.opensource.org/licenses/mit-license
*/

var base2 = {};

// You know, writing a javascript library is awfully time consuming.

new function(_) { ////////////////////  BEGIN: CLOSURE  ////////////////////

// =========================================================================
// base2/Base.js
// =========================================================================

// version 1.1

var Base = function() {
	// call this method from any other method to invoke that method's ancestor
};

Base.prototype = {	
	extend: function(source) {
		if (arguments.length > 1) { // extending with a name/value pair
			var ancestor = this[source];
			var value = arguments[1];
			if (typeof value == "function" && ancestor && /\bbase\b/.test(value)) {
				var method = value;				
				value = function() { // override
					var previous = this.base;
					this.base = ancestor;
					var returnValue = method.apply(this, arguments);
					this.base = previous;
					return returnValue;
				};
				value.method = method;
				value.ancestor = ancestor;
			}
			this[source] = value;
		} else if (source) { // extending with an object literal
			var extend = Base.prototype.extend;
			if (Base._prototyping) {
				var key, i = 0, members = ["constructor", "toString", "valueOf"];
				while (key = members[i++]) if (source[key] != Object.prototype[key]) {
					extend.call(this, key, source[key]);
				}
			} else if (typeof this != "function") {
				// if the object has a customised extend() method then use it
				extend = this.extend || extend;
			}			
			// copy each of the source object's properties to this object
			for (key in source) if (!Object.prototype[key]) {
				extend.call(this, key, source[key]);
			}
		}
		return this;
	},

	base: Base
};

Base.extend = function(_instance, _static) { // subclass
	var extend = Base.prototype.extend;
	
	// build the prototype
	Base._prototyping = true;
	var proto = new this;
	extend.call(proto, _instance);
	delete Base._prototyping;
	
	// create the wrapper for the constructor function
	var constructor = proto.constructor;
	var klass = proto.constructor = function() {
		if (!Base._prototyping) {
			if (this._constructing || this.constructor == klass) { // instantiation
				this._constructing = true;
				constructor.apply(this, arguments);
				delete this._constructing;
			} else { // casting
				var object = arguments[0];
				if (object != null) {
					(object.extend || extend).call(object, proto);
				}
				return object;
			}
		}
	};
	
	// build the class interface
	for (var i in Base) klass[i] = this[i];
	klass.ancestor = this;
	klass.base = Base.base;
	klass.prototype = proto;
	klass.toString = this.toString;
	extend.call(klass, _static);
	// class initialisation
	if (typeof klass.init == "function") klass.init();
	return klass;
};

// initialise
Base = Base.extend({
	constructor: function() {
		this.extend(arguments[0]);
	}
}, {
	ancestor: Object,
	base: Base,
	
	implement: function(_interface) {
		if (typeof _interface == "function") {
			// if it's a function, call it
			_interface(this.prototype);
		} else {
			// add the interface using the extend() method
			this.prototype.extend(_interface);
		}
		return this;
	}
});

// =========================================================================
// lang/main.js
// =========================================================================

var Legacy = typeof $Legacy == "undefined" ? {} : $Legacy;

var K = function(k) {return k};

var assert = function(condition, message, Err) {
	if (!condition) {
		throw new (Err || Error)(message || "Assertion failed.");
	}
};

var assertType = function(object, type, message) {
	if (type) {
		var condition = typeof type == "function" ? instanceOf(object, type) : typeof object == type;
		assert(condition, message || "Invalid type.", TypeError);
	}
};

var copy = function(object) {
	var fn = new Function;
	fn.prototype = object;
	return new fn;
};

var format = function(string) {
	// replace %n with arguments[n]
	// e.g. format("%1 %2%3 %2a %1%3", "she", "se", "lls");
	// ==> "she sells sea shells"
	// only supports nine replacements: %1 - %9
	var args = arguments;
	return String(string).replace(/%([1-9])/g, function(match, index) {
		return index < args.length ? args[index] : match;
	});
};

var $instanceOf = Legacy.instanceOf || new Function("o,k", "return o instanceof k");
var instanceOf = function(object, klass) {
	assertType(klass, "function", "Invalid 'instanceOf' operand.");
	if ($instanceOf(object, klass)) return true;
	// handle exceptions where the target object originates from another frame
	//  this is handy for JSON parsing (amongst other things)
	if (object != null) switch (klass) {
		case Object:
			return true;
		case Number:
		case Boolean:
		case Function:
		case String:
			return typeof object == typeof klass.prototype.valueOf();
		case Array:
			// this is the only troublesome one
			return !!(object.join && object.splice && !arguments.callee(object, Function));
		case Date:
			return !!object.getTimezoneOffset;
		case RegExp:
			return String(object.constructor.prototype) == String(new RegExp);
	}
	return false;
};
	
var match = function(string, expression) {
	// same as String.match() except that this function will return an empty 
	// array if there is no match
	return String(string).match(expression) || [];
};

var RESCAPE = /([\/()[\]{}|*+-.,^$?\\])/g;
var rescape = function(string) {
	// make a string safe for creating a RegExp
	return String(string).replace(RESCAPE, "\\$1");
};

var $slice = Array.prototype.slice;
var slice = function(object) {
	// slice an array-like object
	return $slice.apply(object, $slice.call(arguments, 1));
};

var TRIM = /^\s+|\s+$/g;
var trim = function(string) {
	return String(string).replace(TRIM, "");	
};

// =========================================================================
// lang/extend.js
// =========================================================================

var base = function(object, args) {
	// invoke the base method with all supplied arguments
	return object.base.apply(object, args);
};

var extend = function(object) {
	assert(object != Object.prototype, "Object.prototype is verboten!");
	return Base.prototype.extend.apply(object, slice(arguments, 1));
};

// =========================================================================
// lang/assignID.js
// =========================================================================

var $ID = 1;
var assignID = function(object) {
	// assign a unique id
	if (!object.base2ID) object.base2ID = "b2_" + $ID++;
	return object.base2ID;
};

// =========================================================================
// lang/forEach.js
// =========================================================================

if (typeof StopIteration == "undefined") {
	StopIteration = new Error("StopIteration");
}

var forEach = function(object, block, context) {
	if (object == null) return;
	if (typeof object == "function") {
		// functions are a special case
		var fn = Function;
	} else if (typeof object.forEach == "function" && object.forEach != arguments.callee) {
		// the object implements a custom forEach method
		object.forEach(block, context);
		return;
	} else if (typeof object.length == "number") {
		// the object is array-like
		forEach.Array(object, block, context);
		return;
	}
	forEach.Function(fn || Object, object, block, context);
};

// these are the two core enumeration methods. all other forEach methods
//  eventually call one of these two.

forEach.Array = function(array, block, context) {
	var i, length = array.length; // preserve
	if (typeof array == "string") {
		for (i = 0; i < length; i++) {
			block.call(context, array.charAt(i), i, array);
		}
	} else {
		for (i = 0; i < length; i++) {
			block.call(context, array[i], i, array);
		}
	}
};

forEach.Function = Legacy.forEach || function(fn, object, block, context) {
	// enumerate an object and compare its keys with fn's prototype
	for (var key in object) {
		if (fn.prototype[key] === undefined) {
			block.call(context, object[key], key, object);
		}
	}
};

// =========================================================================
// base2/Base/forEach.js
// =========================================================================

Base.forEach = function(object, block, context) {
	forEach.Function(this, object, block, context);
};

// =========================================================================
// base2/../Function.js
// =========================================================================

// some browsers don't define this

Function.prototype.prototype = {};


// =========================================================================
// base2/../String.js
// =========================================================================

// fix String.replace (Safari/IE5.0)

if ("".replace(/^/, String)) {
	extend(String.prototype, "replace", function(expression, replacement) {
		if (typeof replacement == "function") { // Safari doesn't like functions
			if (instanceOf(expression, RegExp)) {
				var regexp = expression;
				var global = regexp.global;
				if (global == null) global = /(g|gi)$/.test(regexp);
				// we have to convert global RexpExps for exec() to work consistently
				if (global) regexp = new RegExp(regexp.source); // non-global
			} else {
				regexp = new RegExp(rescape(expression));
			}
			var match, string = this, result = "";
			while (string && (match = regexp.exec(string))) {
				result += string.slice(0, match.index) + replacement.apply(this, match);
				string = string.slice(match.index + match[0].length);
				if (!global) break;
			}
			return result + string;
		} else {
			return base(this, arguments);
		}
	});
}

// =========================================================================
// base2/Abstract.js
// =========================================================================

var Abstract = Base.extend({
	constructor: function() {
		throw new TypeError("Class cannot be instantiated.");
	}
});

// =========================================================================
// base2/Module.js
// =========================================================================

// based on ruby's Module class and Mozilla's Array generics:
//   http://www.ruby-doc.org/core/classes/Module.html
//   http://developer.mozilla.org/en/docs/New_in_JavaScript_1.6#Array_and_String_generics

// A Module is used as the basis for creating interfaces that can be
// applied to other classes. *All* properties and methods are static.
// When a module is used as a mixin, methods defined on what would normally be
// the instance interface become instance methods of the target object.

// Modules cannot be instantiated. Static properties and methods are inherited.

var Module = Abstract.extend(null, {
	extend: function(_interface, _static) {
		// extend a module to create a new module
		var module = this.base();
		// inherit static methods
		forEach (this, function(property, name) {
			if (!Module[name] && name != "init") {
				extend(module, name, property);
			}
		});
		// implement module (instance AND static) methods
		module.implement(_interface);
		// implement static properties and methods
		extend(module, _static);
		// Make the submarine noises Larry!
		if (typeof module.init == "function") module.init();
		return module;
	},
	
	implement: function(_interface) {
		// implement an interface on BOTH the instance and static interfaces
		var module = this;
		if (typeof _interface == "function") {
			module.base(_interface);
			forEach (_interface, function(property, name) {
				if (!Module[name] && name != "init") {
					extend(module, name, property);
				}
			});
		} else {
			// create the instance interface
			Base.forEach (extend({}, _interface), function(property, name) {
				// instance methods call the equivalent static method
				if (typeof property == "function") {
					property = function() {
						base; // force inheritance
						return module[name].apply(module, [this].concat(slice(arguments)));
					};
				}
				if (!Module[name]) extend(this, name, property);
			}, module.prototype);
			// add the static interface
			extend(module, _interface);
		}
		return module;
	}
});


// =========================================================================
// base2/Enumerable.js
// =========================================================================

var Enumerable = Module.extend({
	every: function(object, test, context) {
		var result = true;
		try {
			this.forEach (object, function(value, key) {
				result = test.call(context, value, key, object);
				if (!result) throw StopIteration;
			});
		} catch (error) {
			if (error != StopIteration) throw error;
		}
		return !!result; // cast to boolean
	},
	
	filter: function(object, test, context) {
		return this.reduce(object, function(result, value, key) {
			if (test.call(context, value, key, object)) {
				result[result.length] = value;
			}
			return result;
		}, new Array2);
	},

	invoke: function(object, method) {
		// apply a method to each item in the enumerated object
		var args = slice(arguments, 2);
		return this.map(object, (typeof method == "function") ? function(item) {
			if (item != null) return method.apply(item, args);
		} : function(item) {
			if (item != null) return item[method].apply(item, args);
		});
	},
	
	map: function(object, block, context) {
		var result = new Array2;
		this.forEach (object, function(value, key) {
			result[result.length] = block.call(context, value, key, object);
		});
		return result;
	},
	
	pluck: function(object, key) {
		return this.map(object, function(item) {
			if (item != null) return item[key];
		});
	},
	
	reduce: function(object, block, result, context) {
		this.forEach (object, function(value, key) {
			result = block.call(context, result, value, key, object);
		});
		return result;
	},
	
	some: function(object, test, context) {
		return !this.every(object, function(value, key) {
			return !test.call(context, value, key, object);
		});
	}
}, {
	forEach: forEach
});

// =========================================================================
// base2/Array2.js
// =========================================================================

// The IArray module implements all Array methods.
// This module is not public but its methods are accessible through the Array2 object (below). 

var IArray = Module.extend({
	combine: function(keys, values) {
		// combine two arrays to make a hash
		if (!values) values = keys;
		return this.reduce(keys, function(object, key, index) {
			object[key] = values[index];
			return object;
		}, {});
	},
	
	copy: function(array) {
		return this.concat(array);
	},
	
	contains: function(array, item) {
		return this.indexOf(array, item) != -1;
	},
	
	forEach: forEach.Array,
	
	indexOf: function(array, item, fromIndex) {
		var length = array.length;
		if (fromIndex == null) {
			fromIndex = 0;
		} else if (fromIndex < 0) {
			fromIndex = Math.max(0, length + fromIndex);
		}
		for (var i = fromIndex; i < length; i++) {
			if (array[i] === item) return i;
		}
		return -1;
	},
	
	insertAt: function(array, item, index) {
		this.splice(array, index, 0, item);
		return item;
	},
	
	insertBefore: function(array, item, before) {
		var index = this.indexOf(array, before);
		if (index == -1) this.push(array, item);
		else this.splice(array, index, 0, item);
		return item;
	},
	
	lastIndexOf: function(array, item, fromIndex) {
		var length = array.length;
		if (fromIndex == null) {
			fromIndex = length - 1;
		} else if (from < 0) {
			fromIndex = Math.max(0, length + fromIndex);
		}
		for (var i = fromIndex; i >= 0; i--) {
			if (array[i] === item) return i;
		}
		return -1;
	},
	
	remove: function(array, item) {
		var index = this.indexOf(array, item);
		if (index != -1) this.removeAt(array, index);
		return item;
	},
	
	removeAt: function(array, index) {
		var item = array[index];
		this.splice(array, index, 1);
		return item;
	}
});

IArray.prototype.forEach = function(block, context) {
	forEach.Array(this, block, context);
};

IArray.implement(Enumerable);

forEach ("concat,join,pop,push,reverse,shift,slice,sort,splice,unshift".split(","), function(name) {
	IArray[name] = function(array) {
		return Array.prototype[name].apply(array, slice(arguments, 1));
	};
});

// create a faux constructor that augments the built-in Array object
var Array2 = function() {
	return IArray(this.constructor == IArray ? Array.apply(null, arguments) : arguments[0]);
};
// expose IArray.prototype so that it can be extended
Array2.prototype = IArray.prototype;

forEach (IArray, function(method, name, proto) {
	if (Array[name]) {
		IArray[name] = Array[name];
		delete IArray.prototype[name];
	}
	Array2[name] = IArray[name];
});

// =========================================================================
// base2/Hash.js
// =========================================================================

var HASH = "#" + Number(new Date);
var KEYS = HASH + "keys";
var VALUES = HASH + "values";

var Hash = Base.extend({
	constructor: function(values) {
		this[KEYS] = new Array2;
		this[VALUES] = {};
		this.merge(values);
	},

	copy: function() {
		var copy = new this.constructor(this);
		Base.forEach (this, function(property, name) {
			if (typeof property != "function" && name.charAt(0) != "#") {
				copy[name] = property;
			}
		});
		return copy;
	},

	// ancient browsers throw an error when we use "in" as an operator 
	//  so we must create the function dynamically
	exists: Legacy.exists || new Function("k", format("return('%1'+k)in this['%2']", HASH, VALUES)),

	fetch: function(key) {
		return this[VALUES][HASH + key];
	},

	forEach: function(block, context) {
		forEach (this[KEYS], function(key) {
			block.call(context, this.fetch(key), key, this);
		}, this);
	},

	keys: function(index, length) {
		var keys = this[KEYS] || new Array2;
		switch (arguments.length) {
			case 0: return keys.copy();
			case 1: return keys[index];
			default: return keys.slice(index, length);
		}
	},

	merge: function(values) {
		forEach (arguments, function(values) {
			forEach (values, function(value, key) {
				this.store(key, value);
			}, this);
		}, this);
		return this;
	},

	remove: function(key) {
		var value = this.fetch(key);
		this[KEYS].remove(String(key));
		delete this[VALUES][HASH + key];
		return value;
	},

	store: function(key, value) {
		if (arguments.length == 1) value = key;
		// only store the key for a new entry
		if (!this.exists(key)) {
			this[KEYS].push(String(key));
		}
		// create the new entry (or overwrite the old entry)
		this[VALUES][HASH + key] = value;
		return value;
	},

	toString: function() {
		return String(this[KEYS]);
	},

	union: function(values) {
		return this.merge.apply(this.copy(), arguments);
	},

	values: function(index, length) {
		var values = this.map(K);
		switch (arguments.length) {
			case 0: return values;
			case 1: return values[index];
			default: return values.slice(index, length);
		}
	}
});

Hash.implement(Enumerable);

// =========================================================================
// base2/Collection.js
// =========================================================================

// A Hash that is more array-like (accessible by index).

// Collection classes have a special (optional) property: Item
// The Item property points to a constructor function.
// Members of the collection must be an instance of Item.
// e.g.
//     var Dates = Collection.extend();                 // create a collection class
//     Dates.Item = Date;                               // only JavaScript Date objects allowed as members
//     var appointments = new Dates();                  // instantiate the class
//     appointments.add(appointmentId, new Date);       // add a date
//     appointments.add(appointmentId, "tomorrow");     // ERROR!

// The static create() method is responsible for all construction of collection items.
// Instance methods that add new items (add, store, insertAt, replaceAt) pass *all* of their arguments
// to the static create() method. If you want to modify the way collection items are 
// created then you only need to override this method for custom collections.

var Collection = Hash.extend({
	add: function(key, item) {
		// Duplicates not allowed using add().
		//  - but you can still overwrite entries using store()
		assert(!this.exists(key), "Duplicate key.");
		return this.store.apply(this, arguments);
	},

	count: function() {
		return this[KEYS].length;
	},

	indexOf: function(key) {
		return this[KEYS].indexOf(String(key));
	},

	insertAt: function(index, key, item) {
		assert(!this.exists(key), "Duplicate key.");
		this[KEYS].insertAt(index, String(key));
		return this.store.apply(this, slice(arguments, 1));
	},

	item: function(index) {
		return this.fetch(this[KEYS][index]);
	},

	removeAt: function(index) {
		return this.remove(this[KEYS][index]);
	},

	reverse: function() {
		this[KEYS].reverse();
		return this;
	},

	sort: function(compare) {
		if (compare) {
			var self = this;
			this[KEYS].sort(function(key1, key2) {
				return compare(self.fetch(key1), self.fetch(key2), key1, key2);
			});
		} else this[KEYS].sort();
		return this;
	},

	store: function(key, item) {
		if (arguments.length == 1) item = key;
		item = this.constructor.create.apply(this.constructor, arguments);
		return this.base(key, item);
	},

	storeAt: function(index, item) {
		//-dean: get rid of this?
		assert(index < this.count(), "Index out of bounds.");
		arguments[0] = this[KEYS][index];
		return this.store.apply(this, arguments);
	}
}, {
	Item: null, // if specified, all members of the Collection must be instances of Item
	
	create: function(key, item) {
		if (this.Item && !instanceOf(item, this.Item)) {
			item = new this.Item(key, item);
		}
		return item;
	},
	
	extend: function(_instance, _static) {
		var klass = this.base(_instance);
		klass.create = this.create;
		extend(klass, _static);
		if (!klass.Item) {
			klass.Item = this.Item;
		} else if (typeof klass.Item != "function") {
			klass.Item = (this.Item || Base).extend(klass.Item);
		}
		if (typeof klass.init == "function") klass.init();
		return klass;
	}
});

// =========================================================================
// base2/RegGrp.js
// =========================================================================

var RegGrp = Collection.extend({
	constructor: function(values, flags) {
		this.base(values);
		if (typeof flags == "string") {
			this.global = /g/.test(flags);
			this.ignoreCase = /i/.test(flags);
		}
	},

	global: true, // global is the default setting
	ignoreCase: false,

	exec: function(string, replacement) {
		if (arguments.length == 1) {
			var keys = this[KEYS];
			var values = this[VALUES];
			replacement = function(match) {
				if (!match) return "";
				var offset = 1, i = 0;
				// loop through the values
				while (match = values[HASH + keys[i++]]) {
					// do we have a result?
					if (arguments[offset]) {
						var replacement = match.replacement;
						switch (typeof replacement) {
							case "function":
								return replacement.apply(null, slice(arguments, offset));
							case "number":
								return arguments[offset + replacement];
							default:
								return replacement;
						}
					// no? then skip over references to sub-expressions
					} else offset += match.length + 1;
				}
			};
		}
		var flags = (this.global ? "g" : "") + (this.ignoreCase ? "i" : "");
		return String(string).replace(new RegExp(this, flags), replacement);
	},

	test: function(string) {
		return this.exec(string) != string;
	},
	
	toString: function() {
		var length = 0;
		return "(" + this.map(function(item) {
			// fix back references
			var expression = String(item).replace(/\\(\d+)/g, function($, index) {
				return "\\" + (1 + Number(index) + length);
			});
			length += item.length + 1;
			return expression;
		}).join(")|(") + ")";
	}
}, {
	IGNORE: "$0",
	
	init: function() {
		forEach ("add,exists,fetch,remove,store".split(","), function(name) {
			extend(this, name, function(expression) {
				if (instanceOf(expression, RegExp)) {
					expression = expression.source;
				}
				return base(this, arguments);
			});
		}, this.prototype);
	}
});

// =========================================================================
// base2/RegGrp/Item.js
// =========================================================================

RegGrp.Item = Base.extend({
	constructor: function(expression, replacement) {
		var ESCAPE = /\\./g;
		var STRING = /(['"])\1\+(.*)\+\1\1$/;
	
		expression = instanceOf(expression, RegExp) ? expression.source : String(expression);
		
		if (typeof replacement == "number") replacement = String(replacement);
		else if (replacement == null) replacement = "";
		
		// count the number of sub-expressions
		//  - add one because each pattern is itself a sub-expression
		this.length = match(expression.replace(ESCAPE, "").replace(/\[[^\]]+\]/g, ""), /\(/g).length;
		
		// does the pattern use sub-expressions?
		if (typeof replacement == "string" && /\$(\d+)/.test(replacement)) {
			// a simple lookup? (e.g. "$2")
			if (/^\$\d+$/.test(replacement)) {
				// store the index (used for fast retrieval of matched strings)
				replacement = parseInt(replacement.slice(1));
			} else { // a complicated lookup (e.g. "Hello $2 $1")
				// build a function to do the lookup
				var i = this.length + 1;
				var Q = /'/.test(replacement.replace(ESCAPE, "")) ? '"' : "'";
				replacement = replacement.replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\$(\d+)/g, Q +
					"+(arguments[$1]||" + Q+Q + ")+" + Q);
				replacement = new Function("return " + Q + replacement.replace(STRING, "$1") + Q);
			}
		}
		this.replacement = replacement;
		this.toString = function() {
			return expression || "";
		};
	},
	
	length: 0,
	replacement: ""
});

// =========================================================================
// base2/Namespace.js
// =========================================================================

var Namespace = Base.extend({
	constructor: function(_private, _public) {
		this.extend(_public);
		this.toString = function() {
			return format("[base2.%1]", this.name);
		};
		
		// initialise
		if (typeof this.init == "function") this.init();
		
		if (this.name != "base2") {
			this.namespace = format("var %1=base2.%1;", this.name);
		}
		
		var namespace = "var base=" + base + ";";
		var imports = ("base2,lang," + this.imports).split(",");
		_private.imports = Enumerable.reduce(imports, function(namespace, name) {
			if (base2[name]) namespace += base2[name].namespace;
			return namespace;
		}, namespace);
		
		var namespace = format("base2.%1=%1;", this.name);
		var exports = this.exports.split(",");
		_private.exports = Enumerable.reduce(exports, function(namespace, name) {
			if (name) {
				this.namespace += format("var %2=%1.%2;", this.name, name);
				namespace += format("if(!%1.%2)%1.%2=%2;base2.%2=%1.%2;", this.name, name);
			}
			return namespace;
		}, namespace, this);
		
		if (this.name != "base2") {
			base2.namespace += format("var %1=base2.%1;", this.name);
		}
	},

	exports: "",
	imports: "",
	namespace: "",
	name: ""
});

base2 = new Namespace(this, {
	name:    "base2",
	version: "0.8 (alpha)",
	exports: "Base,Abstract,Module,Enumerable,Array2,Hash,Collection,RegGrp,Namespace"
});

base2.toString = function() {
	return "[base2]";
};

eval(this.exports);

// =========================================================================
// base2/lang/namespace.js
// =========================================================================

var lang = new Namespace(this, {
	name:    "lang",
	version: base2.version,
	exports: "K,assert,assertType,assignID,copy,instanceOf,extend,format,forEach,match,rescape,slice,trim",
	
	init: function() {
		this.extend = extend;
		// add the Enumerable methods to the lang object
		forEach (Enumerable.prototype, function(method, name) {
			if (!Module[name]) {
				this[name] = function() {
					return Enumerable[name].apply(Enumerable, arguments);
				};
				this.exports += "," + name;
			}
		}, this);
	}
});

eval(this.exports);

base2.namespace += lang.namespace;

}; ////////////////////  END: CLOSURE  /////////////////////////////////////

new function(_) { ////////////////////  BEGIN: CLOSURE  ////////////////////

// =========================================================================
// BOM/object.js
// =========================================================================

// browser specific code

var element = document.createElement("span");
var jscript/*@cc_on=@_jscript_version@*/; // http://dean.edwards.name/weblog/2007/03/sniff/#comment85164

var BOM = {
	userAgent: "",

	init: function() {
		var MSIE/*@cc_on=true@*/;
		// initialise the user agent string
		var userAgent = navigator.userAgent;
		// fix opera's (and others) user agent string
		if (!MSIE) userAgent = userAgent.replace(/MSIE\s[\d.]+/, "");
		// close up the space between name and version number
		//  e.g. MSIE 6 -> MSIE6
		userAgent = userAgent.replace(/([a-z])[\s\/](\d)/gi, "$1$2");
		this.userAgent = navigator.platform + " " + userAgent;
	},

	detect: function(test) {
		var r = false;
		var not = test.charAt(0) == "!";
		test = test
			.replace(/^\!?(if\s*|platform\s+)?/, "")
			.replace(/^(["']?)([^\(].*)(\1)$/, "/($2)/i.test(BOM.userAgent)");
		try {
			eval("r=!!" + test);
		} catch (error) {
			// the test failed
		}
		return Boolean(not ^ r);
	}
};

// =========================================================================
// BOM/namespace.js
// =========================================================================

// browser specific code
base2.extend(BOM, {
	name:    "BOM",
	version: "0.9",
	exports: "detect,Window"
});
BOM = new base2.Namespace(this, BOM);

eval(this.imports);

// =========================================================================
// BOM/Base.js
// =========================================================================

var _extend = Base.prototype.extend;
Base.prototype.extend = function(source, value) {
	if (typeof source == "string" && source.charAt(0) == "@") {
		return BOM.detect(source.slice(1)) ? _extend.call(this, value) : this;
	}
	return _extend.apply(this, arguments);
};

// =========================================================================
// BOM/MSIE.js
// =========================================================================

// avoid memory leaks

if (BOM.detect("MSIE.+win")) {
	var $closures = {}; // all closures stored here
	
	BOM.$bind = function(method, element) {
		if (!element || element.nodeType != 1) {
			return method;
		}
		
		// unique id's for element and function
		var $element = element.uniqueID;
		var $method = assignID(method);
		
		// store the closure in a manageable scope
		$closures[$method] = method;			
		if (!$closures[$element]) $closures[$element] = {};		
		var closure = $closures[$element][$method];
		if (closure) return closure; // already stored
		
		// reset pointers
		element = null;
		method = null;
		
		// return a new closure with a manageable scope 
		var bound = function() {
			var element = document.all[$element];
			if (element) return $closures[$method].apply(element, arguments);
		};
		bound.cloneID = $method;
		$closures[$element][$method] = bound;
		return bound;
	};
	
	attachEvent("onunload", function() {
		$closures = null; // closures are destroyed when the page is unloaded
	});
}

// =========================================================================
// BOM/Window.js
// =========================================================================

var Window = Module.extend(null, {
	verify: function(window) {
		return (window && window.Infinity) ? window : null;
	},
	
	"@MSIE": {
		verify: function(window) {
			// A very weird bug...
			return (window == self) ? self : this.base();
		}
	}
});

eval(this.exports);

}; ////////////////////  END: CLOSURE  /////////////////////////////////////

new function(_) { ////////////////////  BEGIN: CLOSURE  ////////////////////

// =========================================================================
// DOM/namespace.js
// =========================================================================

var DOM = new base2.Namespace(this, {
	name:    "DOM",
	version: "0.9 (alpha)",
	imports: "BOM",
	exports: "Node,Document,Element,Traversal,AbstractView,Event,EventTarget,DocumentEvent,Selector,DocumentSelector,ElementSelector,StaticNodeList,ViewCSS,HTMLDocument,HTMLElement"
});

eval(this.imports);

// =========================================================================
// DOM/Interface.js
// =========================================================================

// The DOM.Interface module is the base module for defining DOM interfaces.
// Interfaces are defined with reference to the original W3C IDL.
// e.g. http://www.w3.org/TR/DOM-Level-3-Core/core.html#ID-1950641247

var Interface = Module.extend(null, {
	createDelegate: function(name) {
		// delegate a static method to the bound object
		//  e.g. for most browsers:
		//    EventTarget.addEventListener(element, type, func, capture) 
		//  forwards to:
		//    element.addEventListener(type, func, capture)
		this[name] = function(object) {
			var m = (object.base && object.base == object[name].ancestor) ? "base" : name;
			return object[m].apply(object, slice(arguments, 1));
		};
	},
	
	extend: function(_interface, _static) {
		// extend a module to create a new module
		var module = this.base();
		// implement delegates
		forEach (_interface, function(source, name) {
			if (typeof source == "function" && !module[name]) {
				module.createDelegate(name);
			} else if (name.charAt(0) == "@") {
				forEach (source, arguments.callee);
			}
		});
		// implement module (instance AND static) methods
		module.implement(_interface);
		// implement static properties and methods
		extend(module, _static);
		// Make the submarine noises Larry!
		if (typeof module.init == "function") module.init();
		return module;
	},
	
	"@!(element.addEventListener.apply)": {
		createDelegate: function(name) {
			// can't invoke Function.apply on COM object methods. Shame.
			//  (this is also required for Safari)
			this[name] = function(object) {
				var m = (object.base && object.base == object[name].ancestor) ? "base" : name;
				// unroll for speed
				switch (arguments.length) {
					case 1: return object[m]();
					case 2: return object[m](arguments[1]);
					case 3: return object[m](arguments[1], arguments[2]);
					case 4: return object[m](arguments[1], arguments[2], arguments[3]);
				}
				// use eval() if there are lots of arguments
				var args = [], i = arguments.length;
				while (i-- > 1) args[i - 1] = "arguments[" + i + "]";
				eval("var returnValue=object[m](" + args + ")");
				return returnValue;
			};
		}
	}
});

// =========================================================================
// DOM/Binding.js
// =========================================================================

var Binding = Interface.extend(null, {
	extend: function(_interface, _static) {
		// convoluted code here because some libraries add bind()
		//  to the Prototype and base2 can't tell the difference
		var bind = this.bind;
		if (_static) {
			bind = _static.bind || bind;
			delete _static.bind;
		}
		var binding = this.base(_interface, _static);
		extend(binding, "bind", bind);
		return binding;
	}
});

Binding.bind = function(object) {
	return this(object); // cast
};

// =========================================================================
// DOM/Traversal.js
// =========================================================================

// DOM Traversal. Just the basics.

var Traversal = Module.extend({
	getDefaultView: function(node) {
		return this.getDocument(node).defaultView;
	},
	
	getNextElementSibling: function(node) {
		// return the next element to the supplied element
		//  nextSibling is not good enough as it might return a text or comment node
		while (node && (node = node.nextSibling) && !this.isElement(node)) continue;
		return node;
	},

	getNodeIndex: function(node) {
		var index = 0;
		while (node && (node = node.previousSibling)) index++;
		return index;
	},
	
	getOwnerDocument: function(node) {
		// return the node's containing document
		return node.ownerDocument;
	},
	
	getPreviousElementSibling: function(node) {
		// return the previous element to the supplied element
		while (node && (node = node.previousSibling) && !this.isElement(node)) continue;
		return node;
	},

	getTextContent: function(node) {
		return node[Traversal.$TEXT];
	},

	isEmpty: function(node) {
		node = node.firstChild;
		while (node) {
			if (node.nodeType == 3 || this.isElement(node)) return false;
			node = node.nextSibling;
		}
		return true;
	},

	setTextContent: function(node, text) {
		return node[Traversal.$TEXT] = text;
	},
	
	"@MSIE": {
		getDefaultView: function(node) {
			return this.getDocument(node).parentWindow;
		},
	
		"@MSIE5": {
			// return the node's containing document
			getOwnerDocument: function(node) {
				return node.ownerDocument || node.document;
			}
		}
	}
}, {
	$TEXT: "textContent",
	
	contains: function(node, target) {
		return this.isDocument(node) ? node == this.getOwnerDocument(target) : node != target && node.contains(target);
	},
	
	getDocument: function(node) {
		// return the document object
		return this.isDocument(node) ? node : this.getOwnerDocument(node);
	},
	
	isDocument: function(node) {
		return Boolean(node && node.documentElement);
	},
	
	isElement: function(node) {
		return Boolean(node && node.attributes);
	},
	
	"@!(element.contains)": {
		contains: function(node, target) {
			while (target && (target = target.parentNode) && node != target) continue;
			return !!target;
		}
	},
	
	"@MSIE": {
		$TEXT: "innerText"
	},
	
	"@MSIE5": {
		isElement: function(node) {
			return this.base(node) && node.tagName != "!";
		}
	}
});

// =========================================================================
// core/Node.js
// =========================================================================

// http://www.w3.org/TR/DOM-Level-3-Core/core.html#ID-1950641247

var Node = Binding.extend({	
	"@!(element.compareDocumentPosition)" : {
		compareDocumentPosition: function(node, other) {
			// http://www.w3.org/TR/DOM-Level-3-Core/core.html#Node3-compareDocumentPosition
			
			if (Traversal.contains(node, other)) {
				return 4|16; // following|contained_by
			} else if (Traversal.contains(other, node)) {
				return 2|8; // preceding|contains
			}
			
			var nodeIndex = this.$getSourceIndex(node);
			var otherIndex = this.$getSourceIndex(other);
			
			if (nodeIndex < otherIndex) {
				return 4; // following
			} else if (nodeIndex > otherIndex) {
				return 2; // preceding
			}			
			return 0;
		}
	}
}, {
	$getSourceIndex: function(node) {
		// return a key suitable for comparing nodes
		var key = 0;
		while (node) {
			key = Traversal.getNodeIndex(node) + "." + key;
			node = node.parentNode;
		}
		return key;
	},
	
	"@(element.sourceIndex)": {	
		$getSourceIndex: function(node) {
			return node.sourceIndex;
		}
	}
});

	

// =========================================================================
// core/Document.js
// =========================================================================

var Document = Node.extend(null, {
	bind: function(document) { //-dean
		this.base(document);
//-		// automatically bind elements that are created using createElement()
//-		extend(document, "createElement", function(tagName) {
//-			return _bind(this.base(tagName));
//-		});
		AbstractView.bind(document.defaultView);
		return document;
	}
});

// provide these as pass-through methods
Document.createDelegate("createElement");

// =========================================================================
// core/Element.js
// =========================================================================

// http://www.w3.org/TR/DOM-Level-3-Core/core.html#ID-745549614

// I'm going to fix getAttribute() for IE here instead of HTMLElement.

// getAttribute() will return null if the attribute is not specified. This is
//  contrary to the specification but has become the de facto standard.

var Element = Node.extend({
	"@MSIE[67]": {
		getAttribute: function(element, name) {
			if (element.className === undefined || name == "href" || name == "src") {
				return this.base(element, name, 2);
			}
			var attribute = element.getAttributeNode(name);
			return attribute && attribute.specified ? attribute.nodeValue : null;
		}
	},
	
	"@MSIE5.+win": {
		getAttribute: function(element, name) {
			if (element.className === undefined || name == "href" || name == "src") {
				return this.base(element, name, 2);
			}
			var attribute = element.attributes[this.$htmlAttributes[name.toLowerCase()] || name];
			return attribute ? attribute.specified ? attribute.nodeValue : null : this.base(element, name);
		}
	}
}, {
	$htmlAttributes: "",
	
	init: function() {
		// these are the attributes that IE is case-sensitive about
		// convert the list of strings to a hash, mapping the lowercase name to the camelCase name.
		// combine two arrays to make a hash
		var keys = this.$htmlAttributes.toLowerCase().split(",");
		var values = this.$htmlAttributes.split(",");
		this.$htmlAttributes = Array2.combine(keys, values);
	},
	
	"@MSIE5.+win": {
		$htmlAttributes: "colSpan,rowSpan,vAlign,dateTime,accessKey,tabIndex,encType,maxLength,readOnly,longDesc"
	}
});

Element.createDelegate("setAttribute");

// =========================================================================
// core/bind.js
// =========================================================================

extend(DOM, {
	bind: function(node) {
		// apply a base2 DOM Binding to a native DOM node
		switch (node.nodeType) {
			case 1: return Element.bind(node);
			case 9: return Document.bind(node);
			default: return Node.bind(node);
		}
		return node;
	}
});

var _bound = {}; // nodes that have already been extended (keep this private)
var _bind = function(node) {
	if (node) {
		var uid = assignID(node);
		if (!_bound[uid]) {
			DOM.bind(node);
			_bound[uid] = true;
		}
	}
	return node;
};

// =========================================================================
// views/AbstractView.js
// =========================================================================

// This is just fluff for now.

var AbstractView = Binding.extend();


// =========================================================================
// events/Event.js
// =========================================================================

// http://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-Event

var Event = Binding.extend({	
	"@!(document.createEvent)": {
		initEvent: function(event, type, bubbles, cancelable) {
			event.type = type;
			event.bubbles = bubbles;
			event.cancelable = cancelable;
		},
		
		"@MSIE": {
			initEvent: function(event) {
				base(this, arguments);
				event.cancelBubble = !event.bubbles;
			},
			
			preventDefault: function(event) {
				if (event.cancelable !== false) {
					event.returnValue = false;
				}
			},
		
			stopPropagation: function(event) {
				event.cancelBubble = true;
			}
		}
	}
}, {
	"@MSIE": {
/*		bind: function(event) {
			//-dean: put more fixes here
			return this.base(event);
		}, */
		
		"Mac": {
			bind: function(event) {
				// Mac IE5 does not allow expando properties on the event object so
				//  we copy the object instead.
				return this.base(extend({
					preventDefault: function() {
						if (this.cancelable !== false) {
							this.returnValue = false;
						}
					}
				}, event));
			}
		},
		
		"Windows": {
			bind: function(event) {
				this.base(event);
				event.target = event.srcElement;
				return event;
			}
		}
	}
});

// =========================================================================
// events/EventTarget.js
// =========================================================================

// http://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-Registration-interfaces

var EventTarget = Interface.extend({
	"@!(element.addEventListener)": {
		addEventListener: function(target, type, listener) {
			// assign a unique id to both objects
			var $target = assignID(target);
			var $listener = listener.cloneID || assignID(listener);
			// create a hash table of event types for the target object
			var events = this.$all[$target];
			if (!events) events = this.$all[$target] = {};
			// create a hash table of event listeners for each object/event pair
			var listeners = events[type];
			var current = target["on" + type];
			if (!listeners) {
				listeners = events[type] = {};
				// store the existing event listener (if there is one)
				if (current) listeners[0] = current;
			}
			// store the event listener in the hash table
			listeners[$listener] = listener;
			if (current !== undefined) {
				target["on" + type] = this.$dispatch;
			}
		},
	
		dispatchEvent: function(target, event) {
			this.$dispatch.call(target, event);
		},
	
		removeEventListener: function(target, type, listener) {
			// delete the event listener from the hash table
			var events = this.$all[target.base2ID];
			if (events && events[type]) {
				delete events[type][listener.base2ID];
			}
		},
		
		"@MSIE.+win": {
			addEventListener: function(target, type, listener) {
				// avoid memory leaks
				this.base(target, type, this._bind(listener, target));
			},
			
			dispatchEvent: function(target, event) {
				event.target = target;
				try {
					target.fireEvent(event.type, event);
				} catch (error) {
					// the event type is not supported
					this.base(target, event);
				}
			}
		}
	}
}, {
	_bind: function(listener, context) {
		var bound = function() {
			return listener.apply(context, arguments);
		};
		bound.cloneID = assignID(listener);
		return bound;
	},
	
	// support event dispatch	
	"@!(element.addEventListener)": {
		$all : {},
		
		$dispatch: function(event) {
			var returnValue = true;
			// get a reference to the hash table of event listeners
			var events = EventTarget.$all[this.base2ID];
			if (events) {
				event = Event.bind(event); // fix the event object
				var listeners = events[event.type];
				// execute each event listener
				for (var i in listeners) {
					returnValue = listeners[i].call(this, event);
					if (event.returnValue === false) returnValue = false;
					if (returnValue === false) break;
				}
			}
			return returnValue;
		},
	
		"@MSIE": {
			$dispatch: function(event) {
				if (!event) {
					var window = Window.verify(this) || Traversal.getDefaultView(this);
					event = window.event;
				}
				return this.base(event);
			},
			
			"Windows": {
				_bind: function(listener, context) {
					return BOM.$bind(listener, context);
				}
			}
		}
	}
});

// sprinkle some sugar on the static methods

extend(EventTarget, {
	addEventListener: function(target, type, listener, context) {
		// useCapture is not allowed as it not cross-platform
		//  (although there may be a way to mimic it for IE)
		
		// allow a different execution context for the event listener
		if (context) listener = this._bind(listener, context);
		// call the default method
		this.base(target, type, listener, false);
	},

	dispatchEvent: function(target, event) {
		// allow the second argument to be a string identifying the type of
		//  event and construct an event object automatically, this is handy for
		//  custom events
		if (typeof event == "string") {
			var type = event;
			var document = Traversal.getDocument(target);
			event = DocumentEvent.createEvent(document, "Events");
			Event.initEvent(event, type, false, false);
		}
		// call the default method
		this.base(target, event);
	}
});

// =========================================================================
// events/DocumentEvent.js
// =========================================================================

// http://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-DocumentEvent
var DocumentEvent = Interface.extend({	
	"@!(document.createEvent)": {
		createEvent: function(document) {
			return Event.bind({});
		},
	
		"@(document.createEventObject)": {
			createEvent: function(document) {
				return Event.bind(document.createEventObject());
			}
		}
	},
	
	"@KHTML": {
		createEvent: function(document, type) {
			// a type of "Events" throws an error on Safari (need to check current builds)
			return this.base(document, type == "Events" ? "UIEvents" : type);
		}
	}
});

// =========================================================================
// events/DOMContentLoaded.js
// =========================================================================

// http://dean.edwards.name/weblog/2006/06/again

var DOMContentLoaded = new Base({
	fired: false,
	
	fire: function() {
		if (!DOMContentLoaded.fired) {
			DOMContentLoaded.fired = true;
			// this function might be called from another event handler so we'll user a timer
			//  to drop out of any current event.
			// eval a string for ancient browsers
			setTimeout("base2.EventTarget.dispatchEvent(document,'DOMContentLoaded')", 0);
		}
	},
	
	init: function() {
		// use the real event for browsers that support it (opera & firefox)
		EventTarget.addEventListener(document, "DOMContentLoaded", function() {
			DOMContentLoaded.fired = true;
		});
		// if all else fails fall back on window.onload
		EventTarget.addEventListener(window, "load", DOMContentLoaded.fire);
	},

	"@(addEventListener)": {
		init: function() {
			this.base();
			addEventListener("load", DOMContentLoaded.fire, false);
		}
	},

	"@(attachEvent)": {
		init: function() {
			this.base();
			attachEvent("onload", DOMContentLoaded.fire);
		}
	},

	"@MSIE.+win": {
		init: function() {
			this.base();
			// Matthias Miller/Mark Wubben/Paul Sowden/Me
			document.write("<script id=__ready defer src=//:><\/script>");
			document.all.__ready.onreadystatechange = function() {
				if (this.readyState == "complete") {
					this.removeNode(); // tidy
					DOMContentLoaded.fire();
				}
			};
		}
	},
	
	"@KHTML": {
		init: function() {
			this.base();
			// John Resig
			var timer = setInterval(function() {
				if (/loaded|complete/.test(document.readyState)) {
					clearInterval(timer);
					DOMContentLoaded.fire();
				}
			}, 100);
		}
	}
});

DOMContentLoaded.init();

// =========================================================================
// style/ViewCSS.js
// =========================================================================

// http://www.w3.org/TR/DOM-Level-2-Style/css.html#CSS-ViewCSS

var ViewCSS = Interface.extend({
	"@!(getComputedStyle)": {
		getComputedStyle: function(view, element) {
			// pseudoElement parameter is not supported
			return element.currentStyle; //-dean - fix this object too
		}
	}
}, {
	toCamelCase: function(string) {
		return String(string).replace(/\-([a-z])/g, function(match, chr) {
			return chr.toUpperCase();
		});
	}
});

// =========================================================================
// style/bind.js
// =========================================================================

extend(Document, {
	"@!(document.defaultView)": {
		bind: function(document) {
			this.base(document);
			document.defaultView = Traversal.getDefaultView(document);
			return document;
		}
	}
});

// =========================================================================
// selectors-api/NodeSelector.js
// =========================================================================

// http://www.w3.org/TR/selectors-api/

var NodeSelector = Interface.extend({
	"@!(element.matchSingle)": { // future-proof
		matchAll: function(node, selector) {
			return new Selector(selector).exec(node);
		},
		
		matchSingle: function(node, selector) {
			return new Selector(selector).exec(node, 1);
		}
	}
});

// automatically bind objects retrieved using the Selectors API

extend(NodeSelector.prototype, {
	matchAll: function(selector) {
		return extend(this.base(selector), "item", function(index) {
			return _bind(this.base(index));
		});
	},
	
	matchSingle: function(selector) {
		return _bind(this.base(selector));
	}
});

// =========================================================================
// selectors-api/DocumentSelector.js
// =========================================================================

// http://www.w3.org/TR/selectors-api/#documentselector

var DocumentSelector = NodeSelector.extend();


// =========================================================================
// selectors-api/ElementSelector.js
// =========================================================================

// more Selectors API sensibleness

var ElementSelector = NodeSelector.extend({
	"@!(element.matchesSelector)": { // future-proof
		matchesSelector: function(element, selector) {
			return new Selector(selector).test(element);
		}
	}
});


// =========================================================================
// selectors-api/StaticNodeList.js
// =========================================================================

// http://www.w3.org/TR/selectors-api/#staticnodelist

// A wrapper for an array of elements or an XPathResult.
// The item() method provides access to elements.
// Implements Enumerable so you can forEach() to your heart's content... :-)

var StaticNodeList = Base.extend({
	constructor: function(nodes) {
		nodes = nodes || [];
		this.length = nodes.length;
		this.item = function(index) {
			return nodes[index];
		};
	},
	
	length: 0,
	
	forEach: function(block, context) {
		var length = this.length; // preserve
		for (var i = 0; i < length; i++) {
			block.call(context, this.item(i), i, this);
		}
	},
	
	item: function(index) {
		// defined in the constructor function
	},
	
	"@(XPathResult)": {
		constructor: function(nodes) {
		//-	if (nodes instanceof XPathResult) { // doesn't work in Safari
			if (nodes && nodes.snapshotItem) {
				this.length = nodes.snapshotLength;
				this.item = function(index) {
					return nodes.snapshotItem(index);
				};
			} else this.base(nodes);
		}
	}
});

StaticNodeList.implement(Enumerable);

// =========================================================================
// selectors-api/Selector.js
// =========================================================================

// This object can be instantiated, however it is probably better to use
// the matchAll/matchSingle methods on DOM nodes.

// There is no public standard for this object. It just separates the NodeSelector
//  interface from the complexity of the Selector parsers.

var Selector = Base.extend({
	constructor: function(selector) {
		this.toString = function() {
			return trim(selector);
		};
	},
	
	exec: function(context, single) {
	//	try {
			var result = this.$evaluate(context || document, single);
	//	} catch (error) { // probably an invalid selector =)
	//		throw new SyntaxError(format("'%1' is not a valid CSS selector.", this));
	//	}
		return single ? result : new StaticNodeList(result);
	},
	
	test: function(element) {
		//-dean: improve this for simple selectors
		element.setAttribute("b2_test", true);
		var selector = new Selector(this + "[b2_test]");
		var result = selector.exec(Traversal.getOwnerDocument(element), 1);
		element.removeAttribute("b2_test");
		return result == element;
	},
	
	$evaluate: function(context, single) {
		return Selector.parse(this)(context, single);
	}
});

// =========================================================================
// selectors-api/Parser.js
// =========================================================================
	
var Parser = RegGrp.extend({
	constructor: function() {
		base(this, arguments);
		this.cache = {};
		this.sorter = new RegGrp;
		this.sorter.add(/:not\([^)]*\)/, RegGrp.IGNORE);
		this.sorter.add(/([ >](\*|[\w-]+))([^: >+~]*)(:\w+-child(\([^)]+\))?)([^: >+~]*)/, "$1$3$6$4");
	},
	
	cache: null,
	ignoreCase: true,
	
	escape: function(selector) {
		// remove strings
		var strings = this._strings = [];
		return this.optimise(this.format(String(selector).replace(Parser.ESCAPE, function(string) {
			strings.push(string.slice(1, -1));
			return "%" + strings.length;
		})));
	},
	
	format: function(selector) {
		return selector
			.replace(Parser.WHITESPACE, "$1")
			.replace(Parser.IMPLIED_SPACE, "$1 $2")
			.replace(Parser.IMPLIED_ASTERISK, "$1*$2");
	},
	
	optimise: function(selector) {
		// optimise wild card descendant selectors
		return this.sorter.exec(selector.replace(Parser.WILD_CARD, ">* "));
	},
	
	parse: function(selector) {
		return this.cache[selector] ||
			(this.cache[selector] = this.unescape(this.exec(this.escape(selector))));
	},
	
	unescape: function(selector) {
		// put string values back
		return format(selector, this._strings);
	}
}, {
	ESCAPE:           /(["'])[^\1]*\1/g,
	IMPLIED_ASTERISK: /([\s>+~,]|[^(]\+|^)([#.:@])/g,
	IMPLIED_SPACE:    /(^|,)([^\s>+~])/g,
	WHITESPACE:       /\s*([\s>+~(),]|^|$)\s*/g,
	WILD_CARD:        /\s\*\s/g,
	
	_nthChild: function(match, args, position, last, not, and, mod, equals) {
		// ugly but it works
		last = /last/i.test(match) ? last + "+1-" : "";
		if (!isNaN(args)) args = "0n+" + args;
		else if (args == "even") args = "2n";
		else if (args == "odd") args = "2n+1";
		args = args.split(/n\+?/);
		var a = (args[0] == "") ? 1 : (args[0] == "-") ? -1 : parseInt(args[0]);
		var b = parseInt(args[1]) || 0;
		var not = a < 0;
		if (not) {
			a = -a;
			if (a == 1) b++;
		}
		var query = format(a == 0 ? "%3%7" + (last + b) : "(%4%3-%2)%6%1%70%5%4%3>=%2", a, b, position, last, and, mod, equals);
		if (not) query = not + "(" + query + ")";
		return query;
	}
});

// =========================================================================
// selectors-api/Selector/operators.js
// =========================================================================

Selector.operators = {
	"=":  "%1=='%2'",
	"~=": /(^| )%1( |$)/,
	"|=": /^%1(-|$)/,
	"^=": /^%1/,
	"$=": /%1$/,
	"*=": /%1/
};

Selector.operators[""] = "%1!=null";

// =========================================================================
// selectors-api/Selector/pseudoClasses.js
// =========================================================================

Selector.pseudoClasses = { //-dean: lang()
	"checked":     "e%1.checked",	
	"contains":    "Traversal.getTextContent(e%1).indexOf('%2')!=-1",	
	"disabled":    "e%1.disabled",	
	"empty":       "Traversal.isEmpty(e%1)",	
	"enabled":     "e%1.disabled===false",	
	"first-child": "!Traversal.getPreviousElementSibling(e%1)",
	"last-child":  "!Traversal.getNextElementSibling(e%1)",	
	"only-child":  "!Traversal.getPreviousElementSibling(e%1)&&!Traversal.getNextElementSibling(e%1)",	
	"root":        "e%1==Traversal.getDocument(e%1).documentElement"	
/*	"lang": function(element, lang) {
		while (element && !element.getAttribute("lang")) {
			element = element.parentNode;
		}
		return element && lang.indexOf(element.getAttribute("lang")) == 0;
	}, */
};

// =========================================================================
// selectors-api/Selector/parse.js
// =========================================================================

// CSS parser - converts CSS selectors to DOM queries.

// Hideous code but it produces fast DOM queries.
// Respect due to Alex Russell and Jack Slocum for inspiration.

// TO DO:
// * sort nodes into document order (comma separated queries only)

new function(_) {	
	// some constants
	var MSIE = BOM.detect("MSIE");
	var MSIE5 = BOM.detect("MSIE5");
	var INDEXED = BOM.detect("(element.sourceIndex)") ;
	var VAR = "var p%2=0,i%2,e%2,n%2=e%1.";
	var ID = INDEXED ? "e%1.sourceIndex" : "assignID(e%1)";
	var TEST = "var g=" + ID + ";if(!p[g]){p[g]=1;";
	var STORE = "r[r.length]=e%1;if(s)return e%1;";
	var FN = "fn=function(e0,s){indexed={};var r=[],p={},reg=[%1]," +
		"d=Traversal.getDocument(e0),c=d.body?'toUpperCase':'toString';";
	
	// IE confuses the name attribute with id for form elements,
	// use document.all to retrieve all elements with name/id instead
	var getElementById = MSIE ? function(document, id) {
		var result = document.all[id] || null;
		// returns a single element or a collection
		if (!result || result.id == id) return result;
		// document.all has returned a collection of elements with name/id
		for (var i = 0; i < result.length; i++) {
			if (result[i].id == id) return result[i];
		}
		return null;
	} : function(document, id) {
		return document.getElementById(id);
	};
	
	// register a node and index its children
	//  store the indexes in a hash, it is faster to augment the element itself but
	//  that just seems dirty
	var indexed = {};
	function register(element) {
		var uid = INDEXED ? element.sourceIndex : assignID(element);
		if (!indexed[uid]) {
			var elements = indexed[uid] = {};
			var children = MSIE ? element.children || element.childNodes : element.childNodes;
			var index = 0;
			var child;
			for (var i = 0; (child = children[i]); i++) {
				if (Traversal.isElement(child)) {
					elements[INDEXED ? child.sourceIndex : assignID(child)] = ++index;
				}
			}
			elements.length = index;
		}
		return uid;
	};
	
	// variables used by the parser
	var fn;
	var index; 
	var reg; // a store for RexExp objects
	var wild; // need to flag certain wild card selectors as MSIE includes comment nodes
	var list; // are we processing a node list?
	var dup; // possible duplicates?
	var cache = {}; // store parsed selectors
	
	// a hideous parser
	var parser = new Parser({
		"^ \\*:root": function(match) {
			wild = false;
			var replacement = "e%2=d.documentElement;if(Traversal.contains(e%1,e%2)){";
			return format(replacement, index++, index);
		},
		" (\\*|[\\w-]+)#([\\w-]+)": function(match, tagName, id) {
			wild = false;
			var replacement = "var e%2=getElementById(d,'%4');if(";
			if (tagName != "*") replacement += "e%2.nodeName=='%3'[c]()&&";
			replacement += "Traversal.contains(e%1,e%2)){";
			if (list) replacement += format("i%1=n%1.length;", list);
			return format(replacement, index++, index, tagName, id);
		},
		" (\\*|[\\w-]+)": function(match, tagName) {
			dup++; // this selector may produce duplicates
			wild = tagName == "*";
			var replacement = VAR;
			// IE5.x does not support getElementsByTagName("*");
			replacement += (wild && MSIE5) ? "all" : "getElementsByTagName('%3')";
			replacement += ";for(i%2=0;(e%2=n%2[i%2]);i%2++){";
			return format(replacement, index++, list = index, tagName);
		},
		">(\\*|[\\w-]+)": function(match, tagName) {
			var children = MSIE && list;
			wild = tagName == "*";
			var replacement = VAR;
			// use the children property for MSIE as it does not contain text nodes
			//  (but the children collection still includes comments).
			// the document object does not have a children collection
			replacement += children ? "children": "childNodes";
			if (!wild && children) replacement += ".tags('%3')";
			replacement += ";for(i%2=0;(e%2=n%2[i%2]);i%2++){";
			if (wild) {
				replacement += "if(e%2.nodeType==1){";
				wild = MSIE5;
			} else {
				if (!children) replacement += "if(e%2.nodeName=='%3'[c]()){";
			}
			return format(replacement, index++, list = index, tagName);
		},
		"([+~])(\\*|[\\w-]+)": function(match, combinator, tagName) {
			var replacement = "";
			if (wild && MSIE) replacement += "if(e%1.tagName!='!'){";
			wild = false;
			var direct = combinator == "+";
			if (!direct) {
				replacement += "while(";		
				dup = 2; // this selector may produce duplicates
			}
			replacement += "e%1=Traversal.getNextElementSibling(e%1)";
			replacement += (direct ? ";" : "){") + "if(e%1";
			if (tagName != "*") replacement += "&&e%1.nodeName=='%2'[c]()";
			replacement += "){";
			return format(replacement, index, tagName);
		},
		"#([\\w-]+)": function(match, id) {
			wild = false;
			var replacement = "if(e%1.id=='%2'){";		
			if (list) replacement += format("i%1=n%1.length;", list);
			return format(replacement, index, id);
		},
		"\\.([\\w-]+)": function(match, className) {
			wild = false;
			// store RegExp objects - slightly faster on IE
			reg.push(new RegExp("(^|\\s)" + rescape(className) + "(\\s|$)"));
			return format("if(reg[%2].test(e%1.className)){", index, reg.length - 1);
		},
		":not\\((\\*|[\\w-]+)?([^)]*)\\)": function(match, tagName, filters) {
			var replacement = (tagName && tagName != "*") ? format("if(e%1.nodeName=='%2'[c]()){", index, tagName) : "";
			replacement += parser.exec(filters);
			return "if(!" + replacement.slice(2, -1).replace(/\)\{if\(/g, "&&") + "){";
		},
		":nth(-last)?-child\\(([^)]+)\\)": function(match, last, args) {
			wild = false;
			last = format("indexed[p%1].length", index);
			var replacement = "if(p%1!==e%1.parentNode.";
			replacement += INDEXED ? "sourceIndex" : "base2ID";
			replacement += ")p%1=register(e%1.parentNode);var i=indexed[p%1][" + ID + "];if(";
			return format(replacement, index) + Parser._nthChild(match, args, "i", last, "!", "&&", "%", "==") + "){";
		},
		":([\\w-]+)(\\(([^)]+)\\))?": function(match, pseudoClass, $2, args) {
			return "if(" + format(Selector.pseudoClasses[pseudoClass], index, args || "") + "){";
		},
		"\\[([\\w-]+)\\s*([^=]?=)?\\s*([^\\]]*)\\]": function(match, attr, operator, value) {
			if (operator) {
				if (attr == "class") attr == "className";
				else if (attr == "for") attr == "htmlFor";
				attr = format("(e%1.getAttribute('%2')||e%1['%2'])", index, attr);
			} else {
				attr = format("Element.getAttribute(e%1,'%2')", index, attr);
			} 
			var replacement = Selector.operators[operator || ""];
			if (instanceOf(replacement, RegExp)) {
				reg.push(new RegExp(format(replacement.source, rescape(parser.unescape(value)))));
				replacement = "reg[%2].test(%1)";
				value = reg.length - 1;
			}
			return "if(" + format(replacement, attr, value) + "){";
		}
	});
	
	// return the parse() function
	Selector.parse = function(selector) {
		if (!cache[selector]) {
			reg = []; // store for RegExp objects
			fn = "";
			var selectors = parser.escape(selector).split(",");
			forEach(selectors, function(selector, label) {
				index = list = dup = 0; // reset
				var block = parser.exec(selector);
				if (wild && MSIE) { // IE's pesky comment nodes
					block += format("if(e%1.tagName!='!'){", index);
				}
				var store = (label || dup > 1) ? TEST : "";
				block += format(store + STORE, index);
				var braces = match(block, /\{/g).length;
				while (braces--) block += "}";
				fn += block;
			});
			eval(format(FN, reg) + parser.unescape(fn) + "return s?null:r}");
			cache[selector] = fn;
		}
		return cache[selector];
	};
};

// =========================================================================
// DOM/implementations.js
// =========================================================================

AbstractView.implement(ViewCSS);

Document.implement(DocumentSelector);
Document.implement(DocumentEvent);
Document.implement(EventTarget);

Element.implement(ElementSelector);
Element.implement(EventTarget);

// =========================================================================
// html/HTMLDocument.js
// =========================================================================

// http://www.whatwg.org/specs/web-apps/current-work/#htmldocument
// http://www.whatwg.org/specs/web-apps/current-work/#getelementsbyclassname

var HTMLDocument = Document.extend({
	"@!(document.nodeType)": {
		nodeType: 9
	},
	
	"@!(document.getElementsByClassName)": { // firefox3?
		getElementsByClassName: function(document, classNames) {
			return this.matchAll(document, "." + classNames.join("."));
		}
	}
}, {
	// http://www.whatwg.org/specs/web-apps/current-work/#activeelement	
	"@(document.activeElement===undefined)": {
		bind: function(document) {
			this.base(document);
			document.activeElement = null;
			document.addEventListener("focus", function(event) { //-dean: is onfocus good enough?
				document.activeElement = event.target;
			}, false);
			return document;
		}
	}
});

// =========================================================================
// html/HTMLElement.js
// =========================================================================

// http://www.whatwg.org/specs/web-apps/current-work/#getelementsbyclassname

var HTMLElement = Element.extend({
	addClass: function(element, className) {
		if (!this.hasClass(element, className)) {
			element.className += (element.className ? " " : "") + className;
			return className;
		}
	},
	
	hasClass: function(element, className) {
		var regexp = new RegExp("(^|\\s)" + className + "(\\s|$)");
		return regexp.test(element.className);
	},

	removeClass: function(element, className) {
		var regexp = new RegExp("(^|\\s)" + className + "(\\s|$)");
		element.className = element.className.replace(regexp, "$2");
		return className;
	},
	
	"@!(element.getElementsByClassName)": { // firefox3?
		getElementsByClassName: function(element, classNames) {
			return this.matchAll(element, "." + classNames.join("."));
		}
	}	
}, {
	bindings: {},
	tags: "*",
	
	extend: function() {
		// maintain HTML element bindings.
		// this allows us to map specific interfaces to elements by reference
		// to tag name.
		var binding = base(this, arguments);
		var tags = (binding.tags || "").toUpperCase().split(",");
		forEach (tags, function(tagName) {
			HTMLElement.bindings[tagName] = binding;
		});
		return binding;
	},
	
	"@!(element.ownerDocument)": {
		bind: function(element) {
			this.base(element);
			element.ownerDocument = Traversal.getOwnerDocument(element);
			return element;
		}
	}
});

// =========================================================================
// html/bind.js
// =========================================================================

extend(DOM, "bind", function(node) {
	if (typeof node.className == "string") {
		// it's an HTML element, use bindings based on tag name
		(HTMLElement.bindings[node.tagName] || HTMLElement).bind(node);
	} else if (node.body !== undefined) {
		HTMLDocument.bind(node);
	} else {
		this.base(node);
	}
	return node;
});

eval(this.exports);

}; ////////////////////  END: CLOSURE  /////////////////////////////////////

new function(_) { ////////////////////  BEGIN: CLOSURE  ////////////////////

// =========================================================================
// JSB/namespace.js
// =========================================================================

var JSB = new base2.Namespace(this, {
	name:    "JSB",
	version: "0.6",
	imports: "DOM",
	exports: "Binding,Rule,RuleList"
});

eval(this.imports);

// =========================================================================
// JSB/Call.js
// =========================================================================
	
var Call = function(context, method, args, rank) {		
	this.call = function() {
		method.apply(context, args);
	};
	this.rank = rank || 100;
};

// =========================================================================
// JSB/System.js
// =========================================================================

var System = new Base({
	ready: false,
	_deferred: new Array2,

	defer: function(method, rank) {
		// defers a method call until DOMContentLoaded
		var deferred = function() {
			if (System._deferred) {
				System._deferred.push(new Call(this, method, arguments, rank));				
			} else {
				method.apply(this, arguments);
			}
		};
		return deferred;
	},
	
	onload: function() {
		// call deferred calls
		if (!System.ready) {
			System.ready = true;
			DOM.bind(document);
			System._deferred.sort(function(a, b) {
				return a.rank - b.rank;
			});
			System._deferred.invoke("call");
			delete System._deferred;
			setTimeout(function() { // jump out of the current event
				EventTarget.dispatchEvent(document, "ready");
			}, 0);
		}
	}
});

// initialise the system
EventTarget.addEventListener(document, "DOMContentLoaded", System.onload);

// =========================================================================
// JSB/Event.js
// =========================================================================

extend(Event, {
	PATTERN: /^on(DOMContentLoaded|[a-z]+)$/,
	
	cancel: function(event) {
		event.stopPropagation();
		event.preventDefault();
		return false;
	}
});

// =========================================================================
// JSB/HTMLElement.js
// =========================================================================

extend(HTMLElement.prototype, "extend", function(name, value) {
	// automatically attach event handlers when extending
	if (!Base._prototyping && Event.PATTERN.test(name) && typeof value == "function") {
		EventTarget.addEventListener(this, name.slice(2), value);
		return this;
	}
	if (arguments.length == 2 && name == "style") {
		extend(this.style, value);
		return this;
	}
	return base(this, arguments);
});

// =========================================================================
// JSB/EventTarget.js
// =========================================================================

extend(EventTarget, {	
	addEventListener: function(target, type, listener, context) {
		// allow elements to pick up document events (e.g. ondocumentclick)
		if (type.indexOf("document") == 0) {
			type = type.slice(8);
			context = target;
			target = Traversal.getOwnerDocument(target);
		}
		// call the default method
		this.base(target, type, listener, context);
	},

	removeEventListener: function(target, type, listener) {
		if (type.indexOf("document") == 0) {
			type = type.slice(8);
			target = Traversal.getOwnerDocument(target);
		}
		this.base(target, type, listener);
	}
});


// =========================================================================
// JSB/Binding.js
// =========================================================================

// Remember: a binding is a function

var Binding = Abstract.extend();


// =========================================================================
// JSB/Rule.js
// =========================================================================

var Rule = Base.extend({
	constructor: function(selector, binding) {
		// create the selector object
		this.selector = instanceOf(selector, Selector) ?
			selector : new Selector(selector);
		// create the binding
		if (typeof binding != "function") {
			binding = Binding.extend(binding);
		}
		this.binding = binding;
		// create the bind method
		var bound = {}; // don't bind more than once
		this.bind = function(element) {
			var uid = assignID(element);
			if (!bound[uid]) {
				bound[uid] = true;
				binding(DOM.bind(element));
			}
		};
		this.apply();
	},
	
	binding: null,
	selector: null,
	
	apply: System.defer(function() {
		// execution of this method is deferred until the DOMContentLoaded event
		forEach (this.selector.exec(document), this.bind);
	}),
	
	bind: function(element) {
		// defined in the constructor function
	},
	
	refresh: function() {
		this.apply();
	},
	
	toString: function() {
		return String(this.selector);
	}
});

// =========================================================================
// JSB/RuleList.js
// =========================================================================

// A collection of Rule objects

var RuleList = Collection.extend({
	constructor: function(rules) {
		this.base(rules);
		this.globalize(); //-dean: make this optional
	},
	
	globalize: System.defer(function() {
		var COMMA = /\s*,\s*/;
		var ID = /^#[\w-]+$/;
		// execution of this method is deferred until the DOMContentLoaded event
		forEach (this, function(rule, selector) {
			// add all ID selectors to the global namespace
			forEach (selector.split(COMMA), function(selector) {
				if (ID.test(selector)) {
					var name = ViewCSS.toCamelCase(selector.slice(1));
					window[name] = Document.matchSingle(document, selector);
				}
			});
		});
	}, 10),
	
	refresh: function() {
		this.invoke("refresh");
	}
}, {
	Item: Rule
});

eval(this.exports);

}; ////////////////////  END: CLOSURE  /////////////////////////////////////

new function(_) { ////////////////////  BEGIN: CLOSURE  ////////////////////

// =========================================================================
// /Colorizer.js
// =========================================================================

eval(base2.namespace);

var DEFAULT = "@0";
var IGNORE  = RegGrp.IGNORE;

Colorizer = RegGrp.extend({
	constructor: function(values, patterns, properties) {
		this.patterns = patterns || {};
		this.extend(properties);
		this.base(values);
	},
	
	patterns: null,
	tabStop: 4,
	urls: true,

	copy: function() {
		var colorizer = this.base();
		colorizer.patterns = copy(this.patterns);
		return colorizer;
	},
	
	exec: function(text) {
		text = this.base(this.escape(text));
		if (!arguments[1]) {
			text = this._parseWhiteSpace(text);
			if (this.urls) text = Colorizer.urls.exec(text);
		}
		return this.unescape(text);
	},

	escape: function(text) {
		return String(text).replace(/</g, "\x01").replace(/&/g, "\x02");
	},

	store: function(pattern, replacement) {
		if (!instanceOf(pattern, RegGrp.Item)) {
			if (typeof replacement == "string") {
				replacement = replacement.replace(/@(\d)/, function(match, index) {
					return format(Colorizer.$FORMAT, pattern, index);
				});
			}
			pattern = this.patterns[pattern] || Colorizer.patterns[pattern] || pattern;
			if (instanceOf(pattern, RegExp)) pattern = pattern.source;
			pattern = this.escape(pattern);
		}
		this.base(pattern, replacement);
	},

	unescape: function(text) {
		return text.replace(/\x01/g, "&lt;").replace(/\x02/g, "&amp;");
	},

	_parseWhiteSpace: function(text) {
		// fix tabs and spaces
		var tabStop = this.tabStop;
		if (tabStop > 0) {
			var tab = Array(tabStop + 1).join(" ");
			return text.replace(Colorizer.TABS, function(match) {
				match = match.replace(Colorizer.TAB, tab);
				if (tabStop > 1) {
					var padding = (match.length - 1) % tabStop;
					if (padding) match = match.slice(0, -padding);
				}
				return match.replace(/ /g, "&nbsp;");
			});
		}
	},

	"@MSIE": {
		_parseWhiteSpace: function(text) {
			return this.base(text).replace(/\r?\n/g, "<br>");
		}
	}
}, {
	$FORMAT: '<span class="%1">$%2</span>',
	DEFAULT: DEFAULT,
	IGNORE:  IGNORE,	
	TAB:     /\t/g,
	TABS:    /\n([\t \xa0]+)/g,
	
	init: function() {
		// patterns that are defined as Arrays represent
		//  groups of other patterns. Build those groups.
		forEach (this.patterns, function(pattern, name, patterns) {
			if (instanceOf(pattern, Array)) {
				patterns[name] = reduce(pattern, function(group, name) {
					group.add(patterns[name]);
					return group;
				}, new RegGrp);
			}
		});
		this.urls = this.patterns.urls.copy();
		this.urls.storeAt(0, '<a href="mailto:$0">$0</a>');
		this.urls.storeAt(1, '<a href="$0">$0</a>');
	},
	
	patterns: {
		block_comment: /\/\*[^*]*\*+([^\/][^*]*\*+)*\//,
		email:         /([\w.+-]+@[\w.-]+\.\w+)/,
		line_comment:  /\/\/[^\r\n]*/,
		number:        /\b[+-]?(\d*\.?\d+|\d+\.?\d*)([eE][+-]?\d+)?\b/,
		string1:       /'(\\.|[^'\\])*'/,
		string2:       /"(\\.|[^"\\])*"/,
		url:           /(http:\/\/+[\w\/\-%&#=.,?+$]+)/,
		
		comment:       ["block_comment", "line_comment"],
		string:        ["string1", "string2"],
		urls:          ["email", "url"]
	},
	
	urls: null,
	
	"@KHTML": {
		$FORMAT: '<span class="%1">$$%2</span>'
	}
});

// =========================================================================
// /schemes/xml.js
// =========================================================================

Colorizer.xml = new Colorizer({
	comment:       DEFAULT,
	cdata:         IGNORE,
	pi:            DEFAULT,
	tag:           "$1@2",
	attribute:     '@1=<span class="attribute value">$2</span>',
	entity:        DEFAULT,
	text:          IGNORE
}, {
	attribute:     /(\w+)=("[^"]*"|'[^']*')/,
	cdata:         /<!\[CDATA\[([^\]]|\][^\]]|\]\][^>])*\]\]>/,
	comment:       /<!\s*(--([^-]|[\r\n]|-[^-])*--\s*)>/,
	entity:        /&#?\w+;/,
	pi:            /<\?[\w-]+[^>]+>/, // processing instruction
	tag:           /(<\/?)([\w:-]+)/,
	text:          /[>;][^<>&]*/
}, {
	tabStop:       1
});

// =========================================================================
// /schemes/html.js
// =========================================================================

Colorizer.html = new Colorizer({
	conditional:   DEFAULT,
	doctype:       DEFAULT,
	inline:        function(match, tagName, attributes, cdata) {
		// ignore text contained between <script> and <style> tags
		return Colorizer.html.processCDATA(tagName, attributes, cdata);
	}
}, {
	conditional:   /<!(--)?\[[^\]]*\]>|<!\[endif\](--)?>/, // conditional comments
	doctype:       /<!DOCTYPE[^>]+>/,
	inline:        /<(script|style)([^>]*)>((\\.|[^\\])*)<\/\1>/
}, {
	tabStop:       1,
	CDATA:         '&lt;<span class="tag">%1</span>%2&gt;%3&lt;/<span class="tag">%1</span>&gt;',
	processCDATA:  function(tagName, attributes, cdata) {
		return format(this.CDATA, tagName, this.exec(attributes, true), cdata);
	}
});

Colorizer.html.merge(Colorizer.xml);

// =========================================================================
// /schemes/css.js
// =========================================================================

Colorizer.css = new Colorizer({
	comment:       DEFAULT,
	at_rule:       DEFAULT,
	bracketed:     IGNORE,
	selector:      "@1{",
	special:       "@1:",
	property:      '@1:<span class="property value">$2</span>'
}, {
	at_rule:       /@[\w\s]+/,
	bracketed:     /\([^'\x22)]*\)/,
	comment:       Colorizer.patterns.block_comment,
	property:      /(\w[\w-]*\s*):([^;}]+)/,
	special:       /(\-[\w-]*\s*):/,
	selector:      /([\w-:\[.#][^{};]*)\{/
});

// =========================================================================
// /schemes/javascript.js
// =========================================================================

Colorizer.javascript = new Colorizer({
	string:        DEFAULT,
	conditional:   DEFAULT,
	comment:       DEFAULT,
	regexp:        "$1@2",
	number:        DEFAULT,
	special:       DEFAULT,
	global:        DEFAULT,
	keyword:       DEFAULT
}, {
	conditional:   /\/\*@if\s*\([^\)]*\)|\/\*@[\s\w]*|@\*\/|\/\/@\w+|@else[\s\w]*/, // conditional comments
	global:        /\b(clearInterval|clearTimeout|constructor|document|escape|hasOwnProperty|Infinity|isNaN|NaN|parseFloat|parseInt|prototype|setInterval|setTimeout|toString|unescape|valueOf|window)\b/,
	keyword:       /\b(&&|\|\||arguments|break|case|continue|default|delete|do|else|false|for|function|if|in|instanceof|new|null|return|switch|this|true|typeof|var|void|while|with|undefined)\b/,
	regexp:        /([\[(\^=,{}:;&|!*?]\s*)(\/(\\\/|[^\/*])(\\.|[^\/\n\\])*\/[mgi]*)/, /* -- */
	special:       /\b(alert|catch|confirm|eval|finally|prompt|throw|try)\b/
});

// =========================================================================
// /schemes/html-multi.js
// =========================================================================

Colorizer["html-multi"] = Colorizer.html.union({
	inline: function(match, tagName, attributes, cdata) {
		// highlight text contained between <script> and <style> tags
		var engine = tagName == "style" ? "css" : "javascript";
		cdata = Colorizer[engine].exec(cdata, true);
		cdata = format('<span class="%1">%2</span>', engine, cdata);
		return Colorizer.html.processCDATA(tagName, attributes, cdata);
	}
});

}; ////////////////////  END: CLOSURE  /////////////////////////////////////

// =========================================================================
// /bindings.js
// =========================================================================
eval(base2.namespace);
eval(DOM.namespace);
eval(JSB.namespace);

var ATTRIBUTE = /(\w+)=([^"'\s]+)/g;
var QUOTE = '<blockquote cite="#%1">\n%3\n<address>' +
	'<a href="#%1" rel="bookmark">%2</a></address>\n</blockquote>';
var TIDY = new RegGrp({
    "(<\\/?)(\\w+)([^>]*)": function($, lt, tagName, attributes) {
    	return lt + tagName.toLowerCase() + attributes.replace(ATTRIBUTE, function($, attribute, value) {
			return attribute.toLowerCase() + '"' + value + '"';
		});
	},
    "&nbsp;": " "
});

Colorizer.javascript.store("\\b(assignID|base|base2|base2ID|every|extend|filter|forEach|" +
	"format|implement|instanceOf|invoke|K|map|pluck|reduce|rescape|slice|some|trim)\\b",
		'<span class="base2">$0</span>');

function updateFlag() {
	// update the "required" flag adjacent to an <input> or <textrea>
	this.nextSibling.style.color = this.value ? "#898E79" : "#A03333";
};

new RuleList({
	"pre": {
		ondocumentready: function() {
			var names = this.className.split(/\s+/);
			for (var i = 0; i < names.length; i++) {
				// use the first class name that matches a highlighter
				var engine = names[i];
				var colorizer = Colorizer[engine];
				if (instanceOf(colorizer, Colorizer)) {
					var textContent = Traversal.getTextContent(this);
					this.setAttribute("originalText", textContent);
					this.innerHTML = colorizer.exec(textContent);
					this.addClass("highlight");
					if (engine == "html-multi") this.addClass("html");
					break;
				}
			}
		}
	},
	
	"input.required,textarea.required": {
		ondocumentready: updateFlag,		
		ondocumentmouseup: updateFlag,		
		ondocumentkeyup: updateFlag
	},
	
	"li.comment:not(.disabled)": {
		ondocumentready: function() {
			// create the <button> element
			var comment = this;
			var button = document.createElement("button");
			Traversal.setTextContent(button, "Quote");
			comment.appendChild(button);
			button.onclick = function() {
				var textarea = document.matchSingle("textarea");
				var id = comment.id;
				var cite = comment.matchSingle("cite:last-child");
				var author = Traversal.getTextContent(cite) || "comment #" + id;
				// tidy the WordPress formatted text
				author = author.replace(/(^\s*comment(\s+by)?\s)|(\s\W\s.*$)/gi, "");
				// grab text text selection (if any)
				var selectedText = "";
				if (window.getSelection) {
					selectedText = String(window.getSelection());
				} else if (document.selection) {
					selectedText = document.selection.createRange().text;
				}
				if (selectedText) {
					// use the selected text
			    	var quote = "<p>" + trim(selectedText) + "</p>";
				} else {
					// grab the entire comment's html
					var text = comment.matchSingle("div.comment-text").cloneNode(true);
					// strip syntax-highlighting
					forEach (Element.matchAll(text, "pre"), function(pre) {
						Traversal.setTextContent(pre, pre.getAttribute("originalText"));
						pre.removeAttribute("originalText");
						pre.removeAttribute("style");
						pre.removeAttribute("base2ID");
					});
					// remove smilies
					forEach (Element.matchAll(text, "img"), function(img) {
						img.parentNode.replaceChild(document.createTextNode(img.alt), img);
					});
					// tidy the html
			    	quote = trim(TIDY.exec(text.innerHTML));
				}
				// create <blockquote> html
				var html = format(QUOTE, id, author, quote);
				// update the comment form
				textarea.value = trim(textarea.value + "\n" + html);
				textarea.focus();
			};
		},
		
		onmouseover: function() {
			this.matchSingle("button").style.visibility = "visible";
		},
		
		onmouseout: function() {
			this.matchSingle("button").style.visibility = "";
		}
	}
});
