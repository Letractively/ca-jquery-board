/*
 * jQuery UI Board 1.0
 * 
 * Copyright (c) 2012 Yaacov Zamir (kobi.zamir at gmail)
 *
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * Depends:
 *	ui.draggable.js
 *	ui.resizable.js
 *	ui.selectable.js
 *	ui.core.js
 */

/* drawing board */
(function( $ ) {
    $.widget( "ui.board", {
        // set default values
        // do not set options that start with element or value.
        // this names are reserved for options that effect the board elements.
        // options that effect the elements starts with:
        //      element - effect element static data
        //      value - effect element dynamic view
        options: {
            edit: false,
            image: false,
            color: "white",
            border: false,
            border_width: "1px",
            border_style: "solid"
        },
        
        // used to store copy / paste data
        _clipbaord: false,
        
        // initialize the plugin
        _create: function() {
            // add custom class
            this.element.addClass( "ui-board" );
            
            // set initial options
            this._setOption( "border-width", this.options.border_width );
            this._setOption( "border-style", this.options.border_style );
            
            this._setOption( "color", this.options.color );
            this._setOption( "border", this.options.border );
            this._setOption( "image", this.options.image );
            
            // create the elements list
            this.element.append( '<ul class="ui-board-elements-list"></ul>' );
            
            // make the board selectable
            this.element.selectable();
        },

        destroy: function() {
            this.element
            .removeClass( 'ui-board' )
            .text( '' );

            // call the base destroy function
            $.Widget.prototype.destroy.call( this );
        },

        // react to option changes after initialization
        _setOption: function( key, value ) {
            
            // highjack options that start with "element..." and "value..."
            //  use this options to manipulate the board elements
            if ( key.slice( 0, 7 ) === "element" ) {
                // this is an element data object
                
                // set the element
                var new_element = this.addElement();
                new_element.board_element( "update", value );
            } else if ( key.slice( 0, 5 ) === "value" ) {
                // this is an element value
                
                // set the element value
                if ( typeof value.state !== "string" ) {
                    value.state = "normal";
                }
                $("#" + value.id).board_element( "setValue", value.value, value.state );
            
            } else {
                // regular options
                switch ( key ) {
                    case "image":
                        this.options[ key ] = value;
                        
                        this.element.children( "img.background" ).remove();
                        if (value) {
                            this.element.append( '<img class="background" src="' + value + '"/>' );
                        }
                        
                        break;
                    case "color":
                        this.options[ key ] = value;
                        if (value) {
                            this.element.css( "background-color" , value );
                        } else {
                            this.element.css( "background-color", "transparent" );
                        }
                        break;
                    case "border":
                        this.options[ key ] = value;
                        if (value) {
                            this.element.css( "border-color", value );
                        } else {
                            this.element.css( "border-color", "transparent" );
                        }
                        break;
                    case "border-width":
                        this.options[ key ] = value;
                        if (value) {
                            this.element.css( "border-width", value );
                        } else {
                            this.element.css( "border-width", "1px" );
                        }
                        break;
                    case "border-style":
                        this.options[ key ] = value;
                        if (value) {
                            this.element.css( "border-style", value );
                        } else {
                            this.element.css( "border-style", "solid" );
                        }
                        break;
                    default:
                        this.options[ key ] = value;
                        break;
                }
            }
        },
        
        _isElement: function( el ) {
            // if this is not an object, it is not an element
            if (typeof el !== "object") {
                return false;
            }
            
            return el.hasClass( "ui-board-element" );
        },
        
        _getSelected: function() {
            return this.element.find( "li.ui-board-element.ui-selected" );
        },
        
        stringify: function() {
            var json = '{';
            
            // default options
            json += '"image":"' + this.options[ "image" ] + '"';
            json += ',"color":"' + this.options[ "color" ] + '"';
            json += ',"border":"' + this.options[ "border" ] + '"';
            
            // stringify all the elments
            $( "li.ui-board-element" ).each( function () {
                json += ',"element' + $( this ).index() + '":' + $( this ).board_element( "stringify" );
            });
            
            json += '}';
            
            return json;
        },
        
        load: function( data ) {
            // delete all elements
            this.delAll();
            
            // load new data
            this.update(data);
        },
        
        update: function( data ) {
            var el = this;
            
            // init the data object
            // if this is a string parse it
            if ( typeof data === "string" ) {
                data = $.parseJSON(data);
            }
            
            // if this is not an object, asume it is empty
            if ( typeof data !== "object" ) {
                data = {};
            }
            
            // loop on all data elements and insert them to the element
            $.each(data, function ( k, v ) {
                // set option will check for element options
                // and implement them on the board elements
                // regular options will be implemented on the board
                // options that effect the elements starts with:
                //      element - effect element static data
                //      value - effect element dynamic view
                el._setOption( k, v );
            });
        },
        
        // copy / paste elements
        copy: function( el ) {
            // if no element, use the selected element
            if ( typeof el !== "object") {
              el = this._getSelected();
            }
            
            // clone current elements to clipboard
            if ( this._isElement( el ) ) {
                this._clipbaord = el.clone();
            }
        },
        
        paste: function() {
            // if we have data in the clipboard
            if ( this._isElement( this._clipbaord ) ) {
                // copy the clipboard
                var new_element = this._clipbaord.clone();
                this.element.find( "ul" ).append(new_element);
                
                // append the new copy
                $( ".ui-board-element.ui-selected" ).removeClass( "ui-selected" );
                new_element.addClass( "ui-selected" );
                new_element.board_element();
            }
        },
        
        // add / delete elements
        addElement: function() {
            // create a new element
            el = $( "<li></li>" );
            
            // append the new element to the list
            this.element.find( "ul" ).append( el );
            el.board_element();
            
            // return the new element
            return el;
        },
        
        delElement: function( el ) {
            // if no element, use the selected element
            if ( typeof el !== "object") {
              el = this._getSelected();
            }
            
            if ( !this._isElement( el ) ) {
                return;
            }
            
            el.remove();
        },
        
        delAll: function() {
            // remove the old elements list
            this.element.find( "ul" ).remove();
            
            // create a new empty elements list
            this.element.append( '<ul class="ui-board-elements-list"></ul>' );
        },
        
        // selections
        selectAll: function() {
            $( ".ui-board-element" ).addClass( "ui-selected" );
        },
        
        unSelectAll: function () {
            $( ".ui-board-element.ui-selected" ).removeClass( "ui-selected" );
        },
        
        // order elment functions
        topElement: function( el ) {
            // if no element, use the selected element
            if ( typeof el !== "object") {
              el = this._getSelected();
            }
            
            if ( !this._isElement( el ) ) {
                return;
            }
            
            el.detach();
            this.element.find( "ul" ).append( el );
        },
        
        bottomElement: function (el) {
            // if no element, use the selected element
            if ( typeof el !== "object") {
              el = this._getSelected();
            }
            
            if ( !this._isElement( el ) ) {
                return;
            }
            
            el.detach();
            this.element.find( "ul" ).prepend(el);
        },
        
        upElement: function (el) {
            // if no element, use the selected element
            if ( typeof el !== "object") {
              el = this._getSelected();
            }
            
            if ( !this._isElement( el ) ) {
                return;
            }
            
            var next = el.next();
            if ( this._isElement( next ) ) {
                el.detach();
                next.after( el );
            }
        },
        
        downElement: function( el ) {
            // if no element, use the selected element
            if ( typeof el !== "object") {
              el = this._getSelected();
            }
            
            if ( !this._isElement( el ) ) {
                return;
            }
            
            var prev = el.prev();
            if ( this._isElement( prev ) ) {
                el.detach();
                prev.before( el );
            }
        }
    });
})(jQuery);
