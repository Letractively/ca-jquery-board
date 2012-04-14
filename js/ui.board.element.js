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
                alsoResize: ".ui-board-element.ui-selected",
                
                // rewrite the default start and stop functions
                start: function ( ev, ui ) {
                    if (!$( ev.target ).hasClass( "ui-selected" )) {
                        $( ".ui-board-element.ui-selected" ).removeClass( "ui-selected" );
                    }
                },
                stop: function ( ev, ui ) {
                    // make the current element seleted
                    $( ev.target ).addClass( "ui-selected" );
                }
            },
            
            // the options for the dragging functions
            draggable: {
                // rewrite the default start and stop functions
                start: function ( ev, ui ) {
                    if (!$( ev.target ).hasClass( "ui-selected" )) {
                        $( ".ui-board-element.ui-selected" ).removeClass( "ui-selected" );
                    }
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
                    $( ".ui-board-element.ui-selected" ).not( ev.target ).each( function () {
                        $( this ).animate({
                            top: '+=' + div_top,
                            left: '+=' + div_left
                        }, animate);
                    });
                    
                    // make the current element seleted
                    $( ev.target ).addClass( "ui-selected" );
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
            
            // when clicking deselect all other selected elemens
            this.element.click( function ( ev ) {
                // if ctrl key is pressed, do not deselect
                if ( !ev.ctrlKey ) {
                    $( this ).siblings( "li.ui-board-element.ui-selected" )
                        .removeClass( "ui-selected" );
                }
                $( this ).addClass( "ui-selected" );
            });
            
            // if board is in snap mode, make it's new objects snap
            if (board.board( "option", "grid-snap" )) {
                var grid = board.board( "option", "grid" );
                
                this.element.resizable( "option", "grid", grid );
                this.element.draggable( "option", "grid", grid );
            }
            
            // if we are not in edit mode disable the dragging and resizing
            //  options
            if (!board.board( "option", "edit" )) {
                this.element.resizable( "disable" );
                this.element.draggable( "disable" );
            }
            
            // update all other optional data and value
            this.update();
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
        
        // react to option changes after initialization
        setData: function( key, value ) {
            // set data in dataset
            this.element.data( key, value);
            
            // keep the elements dataset uptodate
            this.element.attr( "data-" + key, value);
            
            // call triger for setting data
            // if the triger return true stop here
            //  used to set up custom options
            if ( this._getBoard().triggerHandler( "setData" , {"ui": this.element, "key":key, "value":value} ) ) {
                return;
            }
            
            // if we nead to redraw, redraw
            switch ( key ) {
                case "id":
                    if (value) {
                        this.element.attr( "id", value );
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
                        this.element.css( "top", value );
                    } else {
                        this.element.css( "top", "0px");
                    }
                    break;
                case "x":
                    if (value) {
                        this.element.css( "left", value );
                    } else {
                        this.element.css( "left", "0px" );
                    }
                    break;
                 case "h":
                    if (value) {
                        this.element.height( value );
                    }
                    break;
                case "w":
                    if (value) {
                        this.element.width( value );
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
            
            // update the position data elements
            //  they may have changed while dragging and resizing
            this.element.data( "x", this.element.css( "left" ) );
            this.element.data( "y", this.element.css( "top" ) );
            this.element.data( "w", this.element.css( "width" ) );
            this.element.data( "h", this.element.css( "height" ) );
        },
        
        stringify: function() {
            // update none data-set data
            this.updateData();
            
            // create the JSON string
            var json = '{"index":"' + this.element.index() +'"';
            $.each( this.element.data(), function ( k, v ) {
                // add all data elements except the administrative data
                //  e.g. index, prev and objects
                if ( typeof v !== "object" && k.slice( 0, 4 ) !== "prev" && k !== "index" ) {
                    json += ',"' + k + '":"' + v + '"';
                }
            });
            json += '}';
            
            return json;
        },
        
        update: function( data ) {
            var el = this;
            
            // init the data object
            // if we did not get any data, use the elements initial data
            if ( typeof data !== "object" ) {
                data = this.element.data();
            }
            
            // loop on all data elements and insert them to the element
            $.each(data, function ( k, v ) {
                el.setData( k, v );
            });
        }
    });
})(jQuery);

