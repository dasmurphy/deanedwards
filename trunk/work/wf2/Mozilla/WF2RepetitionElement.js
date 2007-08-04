
// Tearoffs not created yet for these elements
// Not namespace aware yet.

const REPETITION_NONE          = 0;
const REPETITION_TEMPLATE      = 1;
const REPETITION_BLOCK         = 2;

const MAX_VALUE                = Math.pow(2, 32) - 1;

const IGNORE_NAME              = /[\[\u02d1\u00b7\]]/;
const SAFE_NAME                = /([\/(){}|*+-.,^$?\\])/g;

const XPATH_INDEXED_ATTRIBUTES = "./descendant::*/attribute::*[contains(translate(.,'\u02d1','['), '[')]";

// ==========================================================================
// WF2ButtonElement
// ==========================================================================

function WF2RepetitionElement() {
  //
};

WF2RepetitionElement.prototype = new _WF2Tearoff()._extend({
  tearoff:               Components.interfaces.nsIDOMWF2RepetitionElementTearoff,
  classID: Components.ID("{a916a573-b75a-4e89-9721-4c7039ddcdc8}"),
  contractID:            "@mozilla.org/wf2/repetition-element-tearoff;1",
  classDescription:      "WF2 Repetition Element Tearoff",
  
  init: function(outer) {
    this.outerElement = outer;    
    
    if (this._isActiveTemplate) {
      // maintain the mimimum number of blocks
      var i = 0;
      var start = this.repeatStart;
      while (i++ < start) {
        this.addRepetitionBlock(null);
      };
      i = this.repetitionBlocks.length;
      while (i++ < this.repeatMin) {
        this.addRepetitionBlock(null);
      }
    }
  },
  
  /* public constants */
  
  get REPETITION_NONE()      {return REPETITION_NONE;},
  get REPETITION_TEMPLATE()  {return REPETITION_TEMPLATE;},
  get REPETITION_BLOCK()     {return REPETITION_BLOCK;},

  /* public properties */
  
  get repetitionType() {
    if (this.outerElement.hasAttribute("repeat")) {
      var repeat = this.outerElement.getAttribute("repeat");
      if (repeat == "template") {
        return REPETITION_TEMPLATE;
      }
      if (this._testValidIndex(repeat)) {
        return REPETITION_BLOCK;
      }
    }
    return this.REPETITION_NONE;
  },
  set repetitionType(val) {
    switch (val) {
      case REPETITION_NONE:
        this.outerElement.removeAttribute("repeat");
        break;
      case REPETITION_TEMPLATE:
        this.outerElement.setAttribute("repeat", "template");
        break;
      case REPETITION_BLOCK:
        this.outerElement.setAttribute("repeat", this.repetitionIndex);
        break;
      default:
        throw DOMException.NOT_SUPPORTED_ERR;
    }
    return val;
  },
  
  get repetitionIndex() {
    switch (this.repetitionType) {
      case REPETITION_TEMPLATE:
        return this._index;
      case REPETITION_BLOCK:
        return Number(this.getAttribute(repeat));
      default:
        return 0;
    }
  },  
  set repetitionIndex(val) {
    switch (this.repetitionType) {
      case REPETITION_TEMPLATE:
        this._index = val;
        break;
      case REPETITION_BLOCK:
        this.setAttribute("repeat", val);
        break;
    }
    return val;
  },
  
  get repetitionTemplate() {
    if (this._isBlock) {
      if (this.outerElement.hasAttribute("repeat-template")) {
        var templateId = this.outerElement.getAttribute("repeat-template");
        var template = this.outerElement.ownerDocument.getElementById(templateId);
      } else {
        template = this.outerElement;
        while ((template = template.nextSibling) && template.repetitionType != REPETITION_TEMPLATE) {
          continue;
        }
      }
      if (template && template.repetitionType == REPETITION_TEMPLATE) {
         return template;
      }
    }
    return null;
  },
  
  get repetitionBlocks() {
    if (this._isTemplate) {
      var blocks = {
        get length() {
          return length;
        }
      };
      var length = 0;
      var block = this.outerElement.parentNode.firstChild;
      while (block) {
        if (block.repetitionTemplate == this.outerElement) {
          blocks[length++] = block;
        }
        block = block.nextSibling;
      }
      return blocks;
    }
    return null;
  },
  
  get repeatStart() {
    if (this.outerElement.hasAttribute("repeat-start")) {
      var value = Number(this.outerElement.getAttribute("repeat-start"));
      if (this._testValidIndex(value)) {
        return value;
      }
    }
    return 1;
  },
  set repeatStart(val) {
    if (val == 1) {
      this.outerElement.removeAttribute("repeat-start");
    } else {
      this.outerElement.setAttribute("repeat-start", val);
    }
    return val;
  },
  
  get repeatMin() {
    if (this.outerElement.hasAttribute("repeat-min")) {
      var value = Number(this.outerElement.getAttribute("repeat-min"));
      if (this._testValidIndex(value)) {
        return value;
      }
    }
    return 0;
  },
  set repeatMin(val) {
    if (val == 0) {
      this.outerElement.removeAttribute("repeat-min");
    } else {
      this.outerElement.setAttribute("repeat-min", val);
    }
    return val;
  },
  
  get repeatMax() {
    if (this.outerElement.hasAttribute("repeat-max")) {
      var value = Number(this.outerElement.getAttribute("repeat-max"));
      if (this._testValidIndex(value)) {
        return value;
      }
    }
    return MAX_VALUE;
  },
  set repeatMax(val) {
    if (val == MAX_VALUE) {
      this.outerElement.removeAttribute("repeat-max");
    } else {
      this.outerElement.setAttribute("repeat-max", val);
    }
    return val;
  },
  
  /* public methods */
           
  addRepetitionBlock: function(refNode) {
    assertArity(arguments);
    
    if (this._isActiveTemplate) {      
      // count the preceding repetition blocks
      var count = 0;
      var block = this.outerElement;
      while (block = block.previousSibling) {
        if (block.repetitionTemplate == this.outerElement) {
          if (block.repetitionIndex >= this.repetitionIndex) {
            this.repetitionIndex = block.repetitionIndex + 1;
          }
          count++;
        }
      }
      
      // quit if we have reached the maximum limit
      if (count >= this.repeatMax) {
        return null;
      }
      
      // if this method was called by addRepetitionBlockByIndex()
      // then use its index
      if (arguments.callee.caller == this.addRepetitionBlockByIndex) {
        var index = arguments[1];
        if (index > this.repetitionIndex) {
          this.repetitionIndex = index;
        }
      }
     
      // clone this template and initialise the new block
      var block = this.outerElement.cloneNode(true);
      block.removeAttribute("repeat-start");
      block.removeAttribute("repeat-min");
      block.removeAttribute("repeat-max");
      block.setAttribute("repeat", this.repetitionIndex);
      
      // replace [indexed] expressions
      // we have to do this for all attribute nodes
      // special characters used by the repetiton model:
      //    '[', '\u02d1', '\u00b7', ']'
      var name = IGNORE_NAME.test(this.outerElement.id) ? "" : this.outerElement.id;
      if (name) {
        var attribute;
        var safeName = name.replace(SAFE_NAME, "\\$1");
        var pattern = new RegExp("[\\[\\u02d1]" + safeName + "[\\u00b7\\]]", "g");
        var attributes = this._evaluate(XPATH_INDEXED_ATTRIBUTES, XPathResult.UNORDERED_NODE_ITERATOR_TYPE, block);
        while (attribute = attributes.iterateNext()) {
          attribute.value = attribute.value.replace(pattern, this.repetitionIndex);
        }
        block.setAttribute("repeat-template", name);
        block.removeAttribute("id");
      }
      
      // insert the node
      if (refNode == null) {
        refNode = this.outerElement;
        while (refNode.previousSibling && refNode.previousSibling.repetitionType != REPETITION_BLOCK) {
          refNode = refNode.previousSibling
        }
      } else {
        refNode = refNode.nextSibling;
      }
      refNode.parentNode.insertBefore(block, refNode);
      
      // maintain the index
      this.repetitionIndex++;
     
      // fire the "added" event
      this._dispatchTemplateEvent(this.outerElement, "added", block);
      
      // return the newly created block
      return block;
    }
    return null;
  },
  
  addRepetitionBlockByIndex: function(refNode, index) {
    assertArity(arguments);
    
    return this.addRepetitionBlock(refNode, index);
  },
  
  moveRepetitionBlock: function(distance) {
    assertArity(arguments);
    
    if (this._isBlock) { 
      if (!distance) return;
     
      var target = this.outerElement;
      var template = this.repetitionTemplate;
     
      if (distance < 0) {
        while (distance < 0 && target.previousSibling && target.previousSibling.repetitionType != REPETITION_TEMPLATE) {
          target = target.previousSibling;
          if (target.repetitionType == REPETITION_BLOCK) {
            distance++;
          }
        }
      } else {
        while (distance > 0 && target.nextSibling && target.nextSibling.repetitionType != REPETITION_TEMPLATE) {
          target = target.nextSibling;
          if (target.repetitionType == REPETITION_BLOCK) {
            distance--;
          }
        }
        target = target.nextSibling;
      }
     
      // move the block
      this.outerElement.parentNode.insertBefore(this.outerElement, target);
     
      if (template) { // not an orphan
        this._dispatchTemplateEvent(template, "moved", this.outerElement);
      }
    }
  },
  
  removeRepetitionBlock: function() {
    if (this._isBlock) {
      var template = this.repetitionTemplate;
      
      this.outerElement.parentNode.removeChild(this.outerElement);
     
      if (template) { // not an orphan
        this._dispatchTemplateEvent(template, "removed", this.outerElement);
        
        // maintain the mimimum number of blocks
        var length = template.repetitionBlocks.length;
        while (length++ < template.repeatMin) {
          template.addRepetitionBlock(null);
        }
      }
    }
  },

  /* private properties */
  
  _index: 0,
  
  get _isActiveTemplate() {
    var parentNode = this.outerElement.parentNode;
    return this._isTemplate && parentNode && parentNode.nodeType == this.ELEMENT_NODE;
  },
  
  get _isTemplate() {
    return this.repetitionType == REPETITION_BLOCK;
  },
  
  get _isBlock() {
    return this.repetitionType == REPETITION_TEMPLATE;
  },

  /* private nethods */
  
  _dispatchTemplateEvent: function(template, type, affectedElement) {
      //var event = template.ownerDocument.createEvent("RepetitionEvents");
      var event = template.ownerDocument.createEvent("Events");
      event.initEvent(type, true, false);
      event.element = affectedElement;
      template.dispatchEvent(event);
  },
  
  _testValidIndex: function(index) {
    return index && !isNaN(index) && index >= 0 && index < MAX_VALUE;
  }
};
