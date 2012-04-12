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

/* drawing board order elements extention */
(function( $ ) {
    $.extend($.ui.board.prototype, {
        topElement: function( el ) {
            // if no element, use the selected element
            if ( typeof el !== "object" ) {
                el = this.getSelected();
            }
            
            if ( !this._isElement( el ) ) {
                return;
            }
            
            var element_list = this.element.children( "ul.ui-board-elements-list" );
            
            el.each( function () {
                $(this).detach();
                element_list.append( $(this) );
            });
        },
        
        bottomElement: function (el) {
            // if no element, use the selected element
            if ( typeof el !== "object" ) {
                el = this.getSelected();
            }
            
            if ( !this._isElement( el ) ) {
                return;
            }
            
            var element_list = this.element.children( "ul.ui-board-elements-list" );
            
            el.each( function () {
                $(this).detach();
                element_list.prepend( $(this) );
            });
        },
        
        upElement: function (el) {
            // if no element, use the selected element
            if ( typeof el !== "object" ) {
                el = this.getSelected();
            }
            
            if ( !this._isElement( el ) ) {
                return;
            }
            
            var next = el.next().not( el );
            
            if ( this._isElement( next ) ) {
                el.each( function () {
                    $(this).detach();
                    next.after( $(this) );
                });
            }
        },
        
        downElement: function( el ) {
            // if no element, use the selected element
            if ( typeof el !== "object" ) {
                el = this.getSelected();
            }
            
            if ( !this._isElement( el ) ) {
                return;
            }
            
            var prev = el.prev().not( el );
            
            if ( this._isElement( prev ) ) {
                el.each( function () {
                    $(this).detach();
                    prev.before( $(this) );
                });
            }
        }
    });
})(jQuery);
