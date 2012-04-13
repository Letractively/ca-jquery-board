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
            border: "gray",
            border_width: "1px",
            border_style: "solid",
            grid: [50, 50],
            grid_show: false,
            grid_snap: false,
            animate: 100
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
            
            this._setOption( "grid", this.options.grid );
            this._setOption( "grid-show", this.options.grid_show );
            this._setOption( "grid-snap", this.options.grid_snap );
            
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
            
            // highjack the options that start with "element..." and "value..."
            //  use this options to manipulate the board elements
            if ( key.slice( 0, 7 ) === "element" ) {
                // this is an element data option
                // this options effect the board-elements
                
                // set the element
                var el = this.addElement();
                el.board_element( "update", value );
            } else if ( key.slice( 0, 3 ) === "val" ) {
                // this is an element value option
                // this options effect the board-elements
                
                var el = false;
                
                // get the elemants to set
                if ( typeof value.select === "string" ) {
                    // select: the string value is the selector
                    el = this.getElements( value.select )
                } else if ( typeof value.id === "string" ) {
                    // id: the string value is the element id
                    el = this.getElements( "#" + value.id )
                } else if ( typeof value.cl === "string" ) {
                    // cl: the string value is the element class
                    el = this.getElements( "." + value.cl )
                } else if ( typeof value.key === "string" ) {
                    // key: the string value is a data key,value pair
                    var pair = value.key.match(/^(.+)=(.+)$/);
                    if ( pair) {
                        el = this.getElements( "[data-" + pair[1] + "=" + pair[2] + "]" );
                    }
                }
                
                // if we found an elemant to set, then set it's value
                if ( typeof el === "object" ) {
                    // if no state, asume normal
                    if ( typeof value.state !== "string" ) {
                        value.state = "normal";
                    }
                    
                    // set the elemets value
                    el.board_element( "setValue", value.value, value.state );
                }
            } else {
                // regular options
                // this options effect the board
                
                switch ( key ) {
                    case "edit":
                        var elements = this.getElements();
                        
                        this.options[ key ] = value;
                        
                        if ( value ) {
                            elements.resizable( "enable" );
                            elements.draggable( "enable" );
                        } else {
                            elements.resizable( "disable" );
                            elements.draggable( "disable" );
                        }
                        break;
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
                    case "grid":
                        this.options[ key ] = value;
                        // update grid
                        this._updateGridView();
                        break;
                    case "grid-snap":
                        var grid = this.options[ "grid" ];
                        var elements = this.getElements();
                        
                        this.options[ key ] = value;
                        
                        if ( value ) {
                            elements.resizable( "option", "grid", grid );
                            elements.draggable( "option", "grid", grid );
                        } else {
                            elements.resizable( "option", "grid", false );
                            elements.draggable( "option", "grid", false );
                        }
                        break;
                    case "grid-show":
                        this.options[ key ] = value;
                        // update grid
                        this._updateGridView();
                        break;
                    default:
                        this.options[ key ] = value;
                        break;
                }
            }
        },
        
        _updateGridView: function() {
            // remove old grid elemants
            this.element.children( "div.grid-box" ).remove();
            
            if ( this.options[ "grid-show" ] ) {
                var x;
                var y;
                var x_step = this.options[ "grid" ][0];
                var y_step = this.options[ "grid" ][1];
                var w = this.element.width();
                var h = this.element.height();
                
                // get the elemants list
                var element_list = this.element.children( "ul.ui-board-elements-list" );
                
                // create the grid main div and insert it before the elemants list
                var element_grid = $( '<div class="grid-box"></div>' );
                element_list.before( element_grid );
                
                // draw the grid lines
                for (x = x_step; x < w; x += x_step) {
                    element_grid.append( '<div class="grid_lines" style="height:' + h + 'px;left:' + x + 'px"></div>' );
                }
                for (y = y_step; y < h; y += y_step) {
                    element_grid.append( '<div class="grid_lines" style="width:' + w + 'px;top:' + y + 'px"></div>' );
                }
            }
        },
        
        _isElement: function( el ) {
            // if this is not an object, it is not an element
            if ( typeof el !== "object" ) {
                return false;
            }
            
            return el.hasClass( "ui-board-element" );
        },
        
        getElements: function( selector ) {
            if ( typeof selector !== "string" ) {
                selector = "";
            }
            
            return this.element
                .children( "ul.ui-board-elements-list" )
                .children( "li.ui-board-element" + selector);
        },
        
        getSelected: function() {
            return this.getElements( ".ui-selected" );
        },
        
        stringify: function() {
            var image = this.options[ "image" ];
            var json = '{';
            
            // default options
            json += ',"color":"' + this.options[ "color" ] + '"';
            json += ',"border":"' + this.options[ "border" ] + '"';
            if ( image ) {
                json += ',"image":"' + image + '"';
            } else {
                json += ',"image":false';
            }
            
            // stringify all the elments
            this.getElements().each( function () {
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
                // regular options will be implemented on the board.
                //
                // options that effect the elements starts with:
                //      element - effect element static data
                //      value - effect element dynamic view
                el._setOption( k, v );
            });
        },
        
        // add / delete elements
        addElement: function( el ) {
            // if no element, create a new element
            if ( typeof el !== "object" ) {
                el = $( "<li></li>" );
            }
            
            // append the new element to the list
            this.element.find( "ul" ).append( el );
            el.board_element();
            
            // return the new element
            return el;
        },
        
        delElement: function( el ) {
            // if no element, use the selected element
            if ( typeof el !== "object") {
                el = this.getSelected();
            }
            
            if ( !this._isElement( el ) ) {
                return;
            }
            
            el.remove();
        },
        
        delAll: function() {
            // remove the old elements list
            this.element.find( "ul.ui-board-elements-list" ).remove();
            
            // create a new empty elements list
            this.element.append( '<ul class="ui-board-elements-list"></ul>' );
        },
        
        // selections
        selectAll: function() {
            this.getElements().addClass( "ui-selected" );
        },
        
        unSelectAll: function () {
            this.getSelected().removeClass( "ui-selected" );
        },
    });
})(jQuery);
