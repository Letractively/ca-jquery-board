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
            grid_snap: false
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
            } else if ( key.slice( 0, 5 ) === "value" ) {
                // this is an element value option
                // this options effect the board-elements
                
                // set the element value
                if ( typeof value.state !== "string" ) {
                    value.state = "normal";
                }
                $("#" + value.id).board_element( "setValue", value.value, value.state );
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
            if (typeof el !== "object") {
                return false;
            }
            
            return el.hasClass( "ui-board-element" );
        },
        
        getElements: function() {
            return this.element
                .children( "ul.ui-board-elements-list" )
                .children( "li.ui-board-element" );
        },
        
        getSelected: function() {
            return this.element
                .children( "ul.ui-board-elements-list" )
                .children( "li.ui-board-element.ui-selected" );
        },
        
        stringify: function() {
            var json = '{';
            
            // default options
            json += '"image":"' + this.options[ "image" ] + '"';
            json += ',"color":"' + this.options[ "color" ] + '"';
            json += ',"border":"' + this.options[ "border" ] + '"';
            
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
        
        // copy / paste elements
        copy: function( el ) {
            // if no element, use the selected element
            if ( typeof el !== "object") {
                el = this.getSelected();
            }
            
            // clone current elements to clipboard
            if ( this._isElement( el ) ) {
                // make sure the x,y,w,h of the elements are up to date
                el.board_element( "updateData" );
                    
                // copy to clipboard with data
                this._clipbaord = el.clone(true);
            }
        },
        
        pasteSize: function( el ) {
            // if no element, use the selected element
            if ( typeof el !== "object") {
                el = this.getSelected();
            }
            
            // paste size from clipboard to elment
            if ( this._isElement( el ) && this._isElement( this._clipbaord ) ) {
                var w = parseInt( this._clipbaord.data( "w" ) );
                var h = parseInt( this._clipbaord.data( "h" ) );
                
                el.board_element( "setData", "w", w );
                el.board_element( "setData", "h", h );
            }
        },
        
        pasteStyle: function( el, source ) {
            // if no element, use the selected element
            if ( typeof el !== "object") {
                el = this.getSelected();
            }
            
            // if no source, use clipboard
            if ( typeof source !== "object") {
                source = this._clipbaord;
            }
            
            // paste style from clipboard to elment
            if ( this._isElement( el ) && this._isElement( this._clipbaord ) ) {
                $.each( source.board_element( "getData" ), function ( k, v ) {
                    // add all data except the administrative data
                    // id and position
                    //  e.g. id, index, prev ...
                    if ( typeof v !== "object" && k.slice( 0, 4 ) !== "prev" && 
                        k !== "index" && k !== "id" && 
                        k !== "x" && k !== "y" && k !== "w" && k !== "h" ) {
                            el.board_element( "setData", k, v);
                    }
                });
            }
        },
        
        paste: function() {
            // if we have data in the clipboard
            if ( this._isElement( this._clipbaord ) ) {
                var board = this;
                var offset_x = parseInt( this._clipbaord.data( "x" ) ) - 50;
                var offset_y = parseInt( this._clipbaord.data( "y" ) ) - 50;
                
                // remove all selections
                $( ".ui-board-element.ui-selected" ).removeClass( "ui-selected" );
                    
                // copy the clipboard
                this._clipbaord.each( function () {
                    var x = parseInt( $(this).data( "x" ) );
                    var y = parseInt( $(this).data( "y" ) );
                    var w = parseInt( $(this).data( "w" ) );
                    var h = parseInt( $(this).data( "h" ) );
                    var new_element = board.addElement();
                    
                    // make current element a selected one
                    new_element.addClass( "ui-selected" );
                    
                    // set initial position and sise
                    new_element.board_element( "setData", "x", x - offset_x);
                    new_element.board_element( "setData", "y", y - offset_y);
                    new_element.board_element( "setData", "w", w );
                    new_element.board_element( "setData", "h", h );
                    
                    // copy data
                    board.pasteStyle(new_element, $(this));
                });
            }
        },
        
        // add / delete elements
        addElement: function( el ) {
            // if no element, create a new element
            if ( typeof el !== "object") {
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
        
        // order elment functions
        topElement: function( el ) {
            // if no element, use the selected element
            if ( typeof el !== "object") {
                el = this.getSelected();
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
                el = this.getSelected();
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
                el = this.getSelected();
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
                el = this.getSelected();
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
