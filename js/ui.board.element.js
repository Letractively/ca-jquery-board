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
 
/* board element */
(function( $ ) {
    $.widget( "ui.board_element", {
        // set default values
        options: {
            // default value
            value: 0,
            animate: 100,
            
            // the options for the resize functions
            resizable: {
                // draw resize handels on element corners
                handles: 'ne, se, sw, nw',
                
                // also resize all selected elements
                alsoResize: ".ui-board-element.ui-selected:not(.ui-state-disabled)",
                
                // rewrite the default start and stop functions
                start: function ( ev, ui ) {
                    var el = $(ev.target);
                    if ( !el.is("li") ) {
                        el = el.parent();
                    }
                    
                    // if ctrl key is pressed, do not deselect
                    if ( !ev.ctrlKey && !el.hasClass( "ui-selected" ) ) {
                        $( this ).siblings( "li.ui-board-element.ui-selected" )
                            .removeClass( "ui-selected" );
                    }
                    
                    // make the current element seleted
                    $( ui.helper ).addClass( "ui-selected" );
                }
            },
            
            // the options for the dragging functions
            draggable: {
                // rewrite the default start and stop functions
                start: function ( ev, ui ) {
                    var el = $(ev.target);
                    if ( !el.is("li") ) {
                        el = el.parent();
                    }
                    
                    // if ctrl key is pressed, do not deselect
                    if ( !ev.ctrlKey && !el.hasClass( "ui-selected" ) ) {
                        $( this ).siblings( "li.ui-board-element.ui-selected" )
                            .removeClass( "ui-selected" );
                    }
                    
                    // make the current element seleted
                    $( ui.helper ).addClass( "ui-selected" );
                },
                stop: function ( ev, ui ) {
                    var animate = $( this ).board_element("option", "animate");
                    
                    // calculate element drag offset
                    var div_top = ui.position.top - ui.originalPosition.top;
                    var div_left = ui.position.left - ui.originalPosition.left;
                    
                    // if we are in snap mode, adjast offset
                    var grid = $(this).draggable("option","grid");
                    if ( grid ) {
                        div_top = Math.round( div_top / grid[1] ) * grid[1];
                        div_left = Math.round( div_left / grid[0] ) * grid[0];
                    }
                    
                    // also drag all other selected elements
                    $( ".ui-board-element.ui-selected:not(.ui-state-disabled)" ).not( ".ui-draggable-dragging" ).each( function () {
                        $( this ).animate({
                            top: '+=' + div_top,
                            left: '+=' + div_left
                        }, animate);
                    });
                }
            }
        },
        
        // get the main board
        _getBoard: function () {
            return this.element.parent().parent();
        },
        
        // initialize the plugin
        _create: function() {
            var board = this._getBoard();
            
            // add custom class
            this.element.addClass( "ui-board-element" );
            
            this.element.resizable( this.options.resizable );
            this.element.draggable( this.options.draggable );
            
            // update all other optional data
            this.update();
            
            // set options that are inherited from the board_
            
            // if board is in snap mode, make it's new objects snap
            if (board.board( "option", "grid-snap" )) {
                var grid = board.board( "option", "grid" );
                
                this.element.resizable( "option", "grid", grid );
                this.element.draggable( "option", "grid", grid );
            }
            
            // set this elemnt editing mode using the parent board exit option
            this.setData( "edit", board.board( "option", "edit" ) );
        },
        
        destroy: function() {
            this.element
            .removeClass('ui-board-element');

            // call the base destroy function
            $.Widget.prototype.destroy.call( this );
        },

        // react to option changes after initialization
        _setOption: function( key, value ) {
            switch ( key ) {
                case "value":
                    this.options.value = value;
                    this.setValue( value ,"normal" );
                    break;
                case "animate":
                    this.options.animate = parseInt( value, 10 );
                    break;
                default:
                    this.options[ key ] = value;
                    break;
            }
        },
        
        _findPlugin: function () {
            // get this elements type
            var element_type = this.element.data( "type" );
            var plugin = false;
            
            // check all plugins for a plugin to match this type
            $.each( this._getBoard().board( "plugins" ), function () {
                if ( element_type === this.type ) {
                    plugin = this;
                }
            });
            
            return plugin;
        },
        
        // react to option changes after initialization
        setData: function( key, value ) {
            if (value === 'null'){
                value = null;
            }
            
            // set data in dataset
            this.element.data( key, value );
            
            // keep the elements dataset uptodate
            this.element.attr( "data-" + key, value);
            
            // call triger for setting data
            // if the triger return true stop here
            //  used to set up custom options
            if ( this._getBoard().triggerHandler( "setData" , {"ui": this.element, "key":key, "value":value} ) ) {
                return;
            }
            
            // check for a plugin matchin this elments type
            var plugin = this._findPlugin();
            
            // if this plugin has a setData function, use it
            // if it return true, stop here
            if ( plugin && $.isFunction( plugin.setData ) ) {
                if ( plugin.setData( {"ui": this.element, "key":key, "value":value} ) ) {
                    return;
                }
            }
            
            // if we nead to redraw, redraw
            switch ( key ) {
                case "id":
                    if (value) {
                        this.element.attr( "id", value );
                    }
                    break;
                case "edit":
                    if ( value ) {
                        // if we are in editing mode: anable editing of size
                        // and position
                        this.element.resizable( "enable" );
                        this.element.draggable( "enable" );
                        
                        // bind the click handler: in edit mode,
                        // clicking deselect all other selected elemens
                        this.element.click( function ( ev ) {
                            // if shiftKey is pressed and we have an edit dialog, show it
                            if ( ev.altKey && typeof $( this ).board_element( "runEditDialog" ) !== "undefined" ) {
                                $( this ).board_element( "runEditDialog" );
                            }
                            
                            // if ctrl key is pressed, do not deselect
                            if ( !ev.ctrlKey && !$( this ).hasClass( "ui-selected" ) ) {
                                $( this ).siblings( "li.ui-board-element.ui-selected" )
                                    .removeClass( "ui-selected" );
                            }
                            $( this ).addClass( "ui-selected" );
                        });
                    } else {
                        // if we are not in editing mode, disable editing size
                        // and position
                        this.element.resizable( "disable" );
                        this.element.draggable( "disable" );
                        
                        // unbind the click handler for edit mode
                        this.element.unbind( "click" );
                    }
                    
                    break;
                case "image":
                    this.element.children( "img.background" ).remove();
                    if (value) {
                        this.element.append( '<img class="background" src="' + value + '"/>' );
                    }
                    break;
                case "color":
                    if (value) {
                        this.element.css( "background-color", value);
                    } else {
                        this.element.css( "background-color", "transparent" );
                    }
                    break;
                case "border":
                    if (value) {
                        this.element.css( "border-color", value );
                    } else {
                        this.element.css( "border-color", "transparent" );
                    }
                    break;
                case "border-width":
                    if (value) {
                        this.element.css( "border-width", value );
                    } else {
                        this.element.css( "border-width", "1px" );
                    }
                    break;
                case "border-style":
                    if (value) {
                        this.element.css( "border-style", value );
                    } else {
                        this.element.css( "border-style", "solid" );
                    }
                    break;
                case "y":
                    if (value) {
                        var zoom = this._getBoard().board( "option", "zoom" );
                        
                        // convert string like "123px" to 123
                        value = parseInt( value, 10 );
                        this.element.css( "top", value * zoom );
                    } else {
                        this.element.css( "top", "0px");
                    }
                    break;
                case "x":
                    if (value) {
                        var zoom = this._getBoard().board( "option", "zoom" );
                        
                        // convert string like "123px" to 123
                        value = parseInt( value, 10 );
                        this.element.css( "left", value * zoom );
                    } else {
                        this.element.css( "left", "0px" );
                    }
                    break;
                 case "h":
                    if (value) {
                        var zoom = this._getBoard().board( "option", "zoom" );
                        
                        // convert string like "123px" to 123
                        value = parseInt( value, 10 );
                        this.element.height( value * zoom );
                        this.element.css( "line-height", value * zoom + "px");
                    }
                    break;
                case "w":
                    if (value) {
                        var zoom = this._getBoard().board( "option", "zoom" );
                        
                        // convert string like "123px" to 123
                        value = parseInt( value, 10 );
                        this.element.width( value * zoom );
                    }
                    break;
                default:
                    break;
            }
        },
        
        getData: function( key ) {
            // update none data-set data
            this.updateData();
            
            // return the data
            return this.element.data( key );
        },
        
        setValue: function( value, state ) {
            
            // update value and state options
            if ( typeof state === "string" ) {
                this.options.state = state;
            }
            if ( typeof value === "number" ) {
             this.options.value = value;
            }
            
            // call triger for setting the elment value value
            // if the triger return true stop here
            //  used to set up custom view for a value
            if ( this._getBoard().triggerHandler( "setValue" , {"ui": this.element, "value":value, "state":state} ) ) {
                return;
            }
            
            // check for a plugin matchin this elments type
            var plugin = this._findPlugin();
            
            // if this plugin has a setValue function, use it
            // if it return true, stop here
            if ( plugin && $.isFunction( plugin.setValue ) ) {
                if ( plugin.setValue( {"ui": this.element, "value":value, "state":state} ) ) {
                    return;
                }
            }
            
            // write text on object
            if ( this.element.children( "p.value" ).length === 0 ) {
                this.element.append( '<p class="value"></p>' );
            }
            
            this.element.children( "p.value" ).text( this.options.value );
        },
        
        updateData: function() {
            // update element id
            if ( typeof this.element.attr( "id" ) === "string" ) {
                // if we have an id, use it
                this.element.data( "id", this.element.attr( "id" ) );
            } else {
                // if we do not have an id, invent a simple one
                // based on the element index
                this.element.data( "id", "el" + this.element.index() );
            }
            
            // get board zoom
            var zoom = this._getBoard().board( "option", "zoom" );
            
            // update the position data elements
            //  they may have changed while dragging and resizing
            this.element.data( "x", Math.round( parseInt( this.element.css( "left" ), 10 ) / zoom ) );
            this.element.data( "y", Math.round( parseInt( this.element.css( "top" ), 10 ) / zoom ) );
            this.element.data( "w", Math.round( parseInt( this.element.css( "width" ), 10 ) / zoom ) );
            this.element.data( "h", Math.round( parseInt( this.element.css( "height" ), 10 ) / zoom ) );
        },
        
        stringify: function() {
            // update none data-set data
            this.updateData();
            
            // black listed options that we do not want to stringify
            var black_list = ["edit", "index", "resizable", "draggable", "selectableItem", "board_element"];
            
            // create the JSON string
            var json = '{"index":"' + this.element.index() +'"';
            $.each( this.element.data(), function ( k, v ) {
                // add all data elements except the administrative data
                //  e.g. black listed
                if ( $.inArray( k, black_list) === -1 ) {
                    // check for strings and excape them
                    if ( typeof v === 'string' ){
                        // escape " and \
                        v = v.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
                    }
                    json += ',"' + k + '":"' + v + '"';
                }
            });
            json += '}';
            
            return json;
        },
        
        update: function( data ) {
            var el = this;
            
            // black list options that we do not want to update
            var black_list = ["edit", "type", "index", "resizable", "draggable", "droppable", "selectableItem", "board_element"];
            
            // white list options that we want to update before other options
            var white_list = [];
            
            // init the data object
            // if we did not get any data, use the elements initial data
            if ( typeof data !== "object" ) {
                data = this.element.data();
            }
            
            // if one of the data keys is type, set it first,
            // we use the type to react to other data elements
            if ( typeof data.type === "string" ) {
                el.setData( "type", data.type );
            }
            
            // check for a plugin matchin this elments type
            var plugin = this._findPlugin();
            
            // if this plugin has a white list of options: use them
            if ( plugin && ( typeof plugin.optionWhiteList === "object" ) ) {
                white_list = plugin.optionWhiteList;
            }
            
            // if one of the data keys is in the white list, set it now,
            $.each( white_list, function ( i, k ) {
                if ( typeof data[ k ] !== "undefined" ) {
                    el.setData( k, data[ k ] );
                }
            });
            
            // loop on all data elements and insert them to the element
            $.each(data, function ( k, v ) {
                // add all data elements except the administrative data
                //  e.g. white listed and black listed options
                if ( $.inArray( k, black_list ) === -1 &&
                    $.inArray( k, white_list ) === -1 ) {
                        el.setData( k, v );
                }
            });
        }
    });
})(jQuery);

