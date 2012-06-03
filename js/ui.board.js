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
        // do not set options - elements or values.
        // this names are reserved for options that effect the board elements.
        // options that effect the elements are:
        //      elements - effect element static data
        //      values - effect element dynamic view
        options: {
            edit: false,
            image: false,
            color: "white",
            border: "gray",
            "border-width": "1px",
            "border-style": "solid",
            grid: [50, 50],
            "grid-show": false,
            "grid-snap": false,
            animate: 100,
            zoom: 1,
            plugins: []
        },
        
        // used to store copy / paste data
        _clipbaord: false,
        
        // initialize the plugin
        _create: function() {
            // add custom class
            this.element.addClass( "ui-board" );
            
            // create the elements list
            this.element.append( '<ul class="ui-board-elements-list"></ul>' );
            
            // make the board selectable
            this.element.selectable({ cancel: ".ui-board-elements-list" });
            
            // run actions for all the default options, if needed
            this.update( this.options );
        },

        destroy: function() {
            this.element
            .removeClass( 'ui-board' )
            .text( '' );

            // call the base destroy function
            $.Widget.prototype.destroy.call( this );
        },

        _selectElement: function( value ) {
            // find elments in the board using a value object
            var el = false;
                
            // get the elemants to set
            if ( typeof value.select === "string" ) {
                // select: the string value is the selector
                el = this.getElements( value.select );
            } else if ( typeof value.id === "string" ) {
                // id: the string value is the element id
                el = this.getElements( "#" + value.id );
            } else if ( typeof value.cl === "string" ) {
                // cl: the string value is the element class
                el = this.getElements( "." + value.cl );
            } else if ( typeof value.key === "string" ) {
                // key: the string value is a data key,value pair
                var pair = value.key.match(/^(.+)=(.+)$/);
                if ( pair ) {
                    el = this.getElements( "[data-" + pair[1] + "=" + pair[2] + "]" );
                }
            }
            
            return el
        },
        
        // react to option changes after initialization
        _setOption: function( key, value ) {
            var el;
            
            // highjack the options that start with "element..." and "value..."
            //  use this options to manipulate the board elements
            if ( key === "elements" ) {
                // this is an elements data option
                // this options effect group of board-elements
                // patch by (yair c.)
                
                // set the elements
                var board = this;
                $.each( value, function(){
                    el = board.addElement();
                    el.board_element( "update", this );
                });
            } else if ( key === "values" ) {
                // this is an elements value option
                // this options effect group of board-elements
                
                // set the elements
                var board = this;
                $.each( value, function(){
                    // find elments in the board using the value object
                    el = board._selectElement( this );
                    
                    // if we found an elemant to set, then set it's value
                    if ( el.length !== 0 ) {
                        // set the elemets value
                        el.board_element( "setValue", this.value, this.state );
                    }
                });
            } else {
                // regular options
                // this options effect the board
                var elements;
                
                switch ( key ) {
                    case "edit":
                        elements = this.getElements();
                        
                        this.options.edit = value;
                        
                        // propagate the edit option to all the board elemants
                        elements.board_element( "setData", "edit", value );
                        
                        break;
                    case "image":
                        this.options.image = value;
                        
                        this.element.children( "img.background" ).remove();
                        if (value) {
                            this.element.prepend( '<img class="background" src="' + value + '"/>' );
                        }
                        break;
                    case "color":
                        this.options.color = value;
                        if (value) {
                            this.element.css( "background-color" , value );
                        } else {
                            this.element.css( "background-color", "transparent" );
                        }
                        break;
                    case "border":
                        this.options.border = value;
                        if (value) {
                            this.element.css( "border-color", value );
                        } else {
                            this.element.css( "border-color", "transparent" );
                        }
                        break;
                    case "border-width":
                        this.options[ "border-width" ] = value;
                        if (value) {
                            this.element.css( "border-width", value );
                        } else {
                            this.element.css( "border-width", "1px" );
                        }
                        break;
                    case "border-style":
                        this.options[ "border-style" ] = value;
                        if (value) {
                            this.element.css( "border-style", value );
                        } else {
                            this.element.css( "border-style", "solid" );
                        }
                        break;
                    case "grid":
                        this.options.grid = value;
                        
                        // re-set the sanpping
                        if ( this.options[ "grid-snap" ] ) {
                            elements = this.getElements();
                            
                            elements.resizable( "option", "grid", value );
                            elements.draggable( "option", "grid", value );
                        }
                        
                        // update grid
                        this._updateGridView();
                        break;
                    case "grid-snap":
                        var grid = this.options.grid;
                        elements = this.getElements();
                        
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
                    case "plugin":
                        if ( typeof value === "object" ) {
                            this.options.plugins.push( value );
                        }
                        break;
                    default:
                        this.options[ key ] = value;
                        break;
                }
            }
        },
        
        plugins: function () {
            return this.options.plugins
        },
        
        plugins_clear: function () {
            this.options.plugins.length = 0;
        },
        
        _updateGridView: function() {
            // remove old grid elemants
            this.element.children( "div.grid-box" ).remove();
            
            if ( this.options[ "grid-show" ] ) {
                var x;
                var y;
                var x_step = this.options.grid[0];
                var y_step = this.options.grid[1];
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
            return this.getElements( ".ui-selected:not(.ui-state-disabled)" );
        },
        
        stringify: function() {
            var image = this.options.image;
            var json = '{';
            
            // default options
            json += '"color":"' + this.options.color + '"';
            json += ',"border":"' + this.options.border + '"';
            json += ',"zoom":' + this.options.zoom + '';
            if ( image ) {
                json += ',"image":"' + image + '"';
            } else {
                json += ',"image":false';
            }
            
            // build the elements list
            json += ',"elements":[' + $.map( this.getElements(), function( el ){
              return $( el ).board_element( "stringify" );
            }).join( "," ) + ']}';
            
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
                // options that effect the elements are:
                //      elements - effect element static data
                //      values - effect element dynamic view
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
            this.element.children( "ul.ui-board-elements-list" ).append( el );
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
            this.element.children( "ul.ui-board-elements-list" ).remove();
            
            // create a new empty elements list
            this.element.append( '<ul class="ui-board-elements-list"></ul>' );
        },
        
        // selections
        selectAll: function() {
            this.getElements().addClass( "ui-selected" );
        },
        
        unSelectAll: function () {
            this.getSelected().removeClass( "ui-selected" );
        }
    });
})(jQuery);
