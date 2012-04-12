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

/* drawing board align and distriute elements extention */
(function( $ ) {
    $.extend($.ui.board.prototype, {
        _getElementsToArange: function( el ) {
            // if no element, use the selected element
            if ( typeof el !== "object") {
                el = this.getSelected();
            }
            
            // if no element selected or just one element, 
            // use the all elemants
            if ( typeof el !== "object" || el.length < 2 ) {
                el = this.getElements();
            }
            
            return el;
        },
        
        _getLeftElement: function( el ) {
            // try to get the elements to arange
            el = this._getElementsToArange( el );
            
            if ( !this._isElement( el ) ) {
                return;
            }
            
            var foundElement = false;
            
            el.each( function () {
                if ( !foundElement || 
                    parseInt( foundElement.css( "left" ) ) > parseInt( $( this ).css( "left" ) )) {
                    foundElement = $( this );
                }
            });
            
            return foundElement;
        },
        
        _getRightElement: function( el ) {
            // try to get the elements to arange
            el = this._getElementsToArange( el );
            
            if ( !this._isElement( el ) ) {
                return;
            }
            
            var foundElement = false;
            
            el.each( function () {
                if ( !foundElement || 
                    parseInt( foundElement.css( "left" ) ) < parseInt( $( this ).css( "left" ) )) {
                    foundElement = $( this );
                }
            });
            
            return foundElement;
        },
        
        _getTopElement: function( el ) {
            // try to get the elements to arange
            el = this._getElementsToArange( el );
            
            if ( !this._isElement( el ) ) {
                return;
            }
            
            var foundElement = false;
            
            el.each( function () {
                if ( !foundElement || 
                    parseInt( foundElement.css( "top" ) ) > parseInt( $( this ).css( "top" ) )) {
                    foundElement = $( this );
                }
            });
            
            return foundElement;
        },
        
        _getBottomElement: function( el ) {
            // try to get the elements to arange
            el = this._getElementsToArange( el );
            
            if ( !this._isElement( el ) ) {
                return;
            }
            
            var foundElement = false;
            
            el.each( function () {
                if ( !foundElement || 
                    parseInt( foundElement.css( "top" ) ) < parseInt( $( this ).css( "top" ) )) {
                    foundElement = $( this );
                }
            });
            
            return foundElement;
        },
        
        _sortElements: function ( el, direction ) {
            var elements_list = this.element.children( "ul.ui-board-elements-list");
            
            el.sort( function( a, b ){
                // direction can be:
                //  top - for sorting from up to down
                //  left - for sorting from left to right
                var key_a = parseInt( $( a ).css( direction ) );
                var key_b = parseInt( $( b ).css( direction ) );
                
                return ( key_a < key_b ) ? 1 : 0;
            }).appendTo( elements_list );
        },
        
        alignVerticalTop: function( el ) {
            // try to get the elements to arange
            el = this._getElementsToArange( el );
            
            if ( !this._isElement( el ) ) {
                return;
            }
            
            var top_el = this._getTopElement( el );
            var top = parseInt( $( top_el ).css( "top" ) );
            var duration = this.options.animate;
            
            el.each( function () {
                $( this ).animate( {top: top}, duration );
            });
        },
        
        alignVerticalBottom: function( el ) {
            // try to get the elements to arange
            el = this._getElementsToArange( el );
            
            if ( !this._isElement( el ) ) {
                return;
            }
            
            var bottom_el = this._getBottomElement( el );
            var top = parseInt( $( bottom_el ).css( "top" ) );
            var height = $( bottom_el ).height();
            var duration = this.options.animate;
            
            el.each( function () {
                var h = $( this ).height();
                $( this ).animate( {top: ( top + height - h )}, duration );
            });
        },
        
        alignVerticalCenter: function( el ) {
            // try to get the elements to arange
            el = this._getElementsToArange( el );
            
            if ( !this._isElement( el ) ) {
                return;
            }
            
            var bottom_el = this._getBottomElement( el );
            var top = parseInt( $( bottom_el ).css( "top" ) );
            var height = $( bottom_el ).height();
            var duration = this.options.animate;
            
            el.each( function () {
                var h = $( this ).height();
                $( this ).animate( {top: ( top + height - h / 2 )}, duration );
            });
        },
        
        alignHorizontalLeft: function( el ) {
            // try to get the elements to arange
            el = this._getElementsToArange( el );
            
            if ( !this._isElement( el ) ) {
                return;
            }
            
            var left_el = this._getLeftElement( el );
            var left = parseInt( $( left_el ).css( "left" ) );
            var duration = this.options.animate;
            
            el.each( function () {
                $( this ).animate( {left: left}, duration );
            });
        },
        
        alignHorizontalRight: function( el ) {
            // try to get the elements to arange
            el = this._getElementsToArange( el );
            
            if ( !this._isElement( el ) ) {
                return;
            }
            
            var right_el = this._getRightElement( el );
            var left = parseInt( $( right_el ).css( "left" ) );
            var width = $( right_el ).width();
            var duration = this.options.animate;
            
            el.each( function () {
                var w = $( this ).width();
                $( this ).animate( {left: ( left + width - w )}, duration );
            });
        },
        
        alignHorizontalCenter: function( el ) {
            // try to get the elements to arange
            el = this._getElementsToArange( el );
            
            if ( !this._isElement( el ) ) {
                return;
            }
            
            var left_el = this._getLeftElement( el );
            var left = parseInt( $( left_el ).css( "left" ) );
            var width = $( left_el ).width();
            var duration = this.options.animate;
            
            el.each( function () {
                var w = $( this ).width();
                $( this ).animate( {left: ( left + width - w / 2 )}, duration );
            });
        },
        
        distributeHorizontalLeft: function( el ) {
            // try to get the elements to arange
            el = this._getElementsToArange( el );
            
            if ( !this._isElement( el ) ) {
                return;
            }
            
            // sort elemants by their left
            this._sortElements( el, "left" );
            
            var left_el = this._getLeftElement( el );
            var right_el = this._getRightElement( el );
            
            var left = parseInt( $( left_el ).css( "left" ) );
            var right = parseInt( $( right_el ).css( "left" ) );
            var duration = this.options.animate;
            
            var n = el.length;
            var x = right;
            var step = (right - left) / (n - 1);
            
            el.each( function () {
                $( this ).animate( {left: x}, duration );
                x -= step;
            });
        },
        
        distributeVerticalTop: function( el ) {
            // try to get the elements to arange
            el = this._getElementsToArange( el );
            
            if ( !this._isElement( el ) ) {
                return;
            }
            
            // sort elemants by their top
            this._sortElements( el, "top" );
            
            var top_el = this._getTopElement( el );
            var bottom_el = this._getBottomElement( el );
            
            var top = parseInt( $( top_el ).css( "top" ) );
            var bottom = parseInt( $( bottom_el ).css( "top" ) );
            var duration = this.options.animate;
            
            var n = el.length;
            var y = bottom;
            var step = (bottom - top) / (n - 1);
            
            el.each( function () {
                $( this ).animate( {top: y}, duration );
                y -= step;
            });
        },
        
        alignGrid: function( el ) {
            // try to get the elements to arange
            el = this._getElementsToArange( el );
            
            if ( !this._isElement( el ) ) {
                return;
            }
            
            var duration = this.options.animate;
            var step_x = this.options.grid[0];
            var step_y = this.options.grid[1];
            
            el.each( function () {
                var x = parseInt( $( this ).position().left / step_x + 0.5 ) * step_x;
                var y = parseInt( $( this ).position().top / step_y + 0.5 ) * step_y;
                
                $( this ).animate( {top: y, left: x}, duration );
            });
        }
        
    });
})(jQuery);
