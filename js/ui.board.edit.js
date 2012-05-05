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

/* drawing board copy / paste extention */
(function( $ ) {
    $.extend($.ui.board.prototype, {

        copy: function( el ) {
            // if no element, use the selected element
            if ( typeof el !== "object" ) {
                el = this.getSelected();
            }
            
            // clone current elements to clipboard
            if ( this._isElement( el ) ) {
                // make sure the x,y,w,h of the elements are up to date
                el.board_element( "updateData" );
                    
                // copy to clipboard with data
                this._clipbaord = el.clone( true );
            }
        },
        
        pasteSize: function( el ) {
            // if no element, use the selected element
            if ( typeof el !== "object" ) {
                el = this.getSelected();
            }
            
            // paste size from clipboard to elment
            if ( this._isElement( el ) && this._isElement( this._clipbaord ) ) {
                var w = parseInt( this._clipbaord.data( "w" ), 10 );
                var h = parseInt( this._clipbaord.data( "h" ), 10 );
                
                el.board_element( "setData", "w", w );
                el.board_element( "setData", "h", h );
            }
        },
        
        pasteStyle: function( el, source ) {
            // if no element, use the selected element
            if ( typeof el !== "object" ) {
                el = this.getSelected();
            }
            
            // if no source, use clipboard
            if ( typeof source !== "object" ) {
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
                var offset_x = parseInt( this._clipbaord.data( "x" ), 10 ) - 50;
                var offset_y = parseInt( this._clipbaord.data( "y" ), 10 ) - 50;
                
                // remove all selections
                $( ".ui-board-element.ui-selected" ).removeClass( "ui-selected" );
                
                // copy the clipboard
                this._clipbaord.each( function () {
                    var x = parseInt( $(this).data( "x" ), 10 );
                    var y = parseInt( $(this).data( "y" ), 10 );
                    var w = parseInt( $(this).data( "w" ), 10 );
                    var h = parseInt( $(this).data( "h" ), 10 );
                    var new_element = board.addElement();
                    
                    // set initial position and sise
                    new_element.board_element( "setData", "x", x - offset_x );
                    new_element.board_element( "setData", "y", y - offset_y );
                    new_element.board_element( "setData", "w", w );
                    new_element.board_element( "setData", "h", h );
                    
                    // copy data
                    board.pasteStyle(new_element, $(this));
                    
                    // make current element a selected one
                    new_element.addClass( "ui-selected" );
                    new_element.children().addClass( "ui-selected" );
                });
            }
        }
    });
})(jQuery);
