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
 
/* example plugin board element */
(function( $ ) {

    // elment flower
    $.ui.board.prototype.options.plugins.push( {
        type: "flower",
        
        // init the element object, creates the object view
        // called once, when the object is created or edited
        setData: function ( d ) {
            var cont = false;
             
            switch ( d.key ) {
                case "type":
                    var url = "example-img/objects/flower-1.png";
                            
                    // remove the default value label
                    d.ui.find( "p.value" ).remove();
                    
                    // insert the flower image
                    d.ui.board_element( "setData", "color", "transparent" );
                    d.ui.children( "img.background" ).remove();
                    d.ui.append( "<img class=\"background\" src=\"" + url + "\"/>" );
                    
                    // do not continue to the default handeler
                    cont = true;
                    break;
                default:
                    // continue to the default handeler
                    cont = false;
                    break;
            }
            
            return cont;
        },
        
        // called each time the elment gets a new value
        // update the object view
        setValue: function ( d ) {
            // if this is not a number do not change the view
            if ( !$.isNumeric( d.value ) ) {
                return true;
            }
            
            var value = parseInt( d.value );
            var url = "example-img/objects/flower-" + (value % 4 + 1) + ".png";
            d.ui.children( "img.background" ).attr( "src", url);
            
            // do not continue to the default handeler
            return true;
        }
    } );
    
    // elment cloud
    $.ui.board.prototype.options.plugins.push( {
        type: "cloud",
        
        setData: function ( d ) {
            var cont = false;
             
            switch ( d.key ) {
                case "type":
                    var url = "example-img/objects/cloud-1.png";
                    
                    // remove the default value label
                    d.ui.find( "p.value" ).remove();
                    
                    // insert the flower image
                    d.ui.board_element( "setData", "color", "transparent" );
                    d.ui.children( "img.background" ).remove();
                    d.ui.append( '<img class="background" src="' + url + '"/>' );
                    
                    // do not continue to the default handeler
                    cont = true;
                    break;
                default:
                    // continue to the default handeler
                    cont = false;
                    break;
            }
            
            return cont;
        },
        
        setValue: function ( d ) {
            var url = "example-img/objects/cloud-1.png";
            var url_sunny = "example-img/objects/cloud-2.png";
            
            // we can only have one sun, set all other clouds to be
            // witout sun
            d.ui.siblings( "[data-type=cloud]" )
                .children( "img.background" ).attr( "src", url );
            
            // set this cloud to be sunny no mutter whats its value is
            d.ui.children( "img.background" ).attr( "src", url_sunny );
            
            // do not continue to the default handeler
            return true;
        }
    } );
    
    // elment tree
    $.ui.board.prototype.options.plugins.push( {
        type: "tree",
        
        setData: function ( d ) {
            var cont = false;
             
            switch ( d.key ) {
                case "type":
                    var url = "example-img/objects/tree.png";
                    
                    // remove the default value label
                    d.ui.find( "p.value" ).remove();
                    
                    // insert the tree image
                    d.ui.board_element( "setData", "color", "transparent" );
                    d.ui.children( "img.background" ).remove();
                    d.ui.append( '<img class="background" src="' + url + '"/>' );
                    
                    // do not continue to the default handeler
                    cont = true;
                    break;
                default:
                    // continue to the default handeler
                    cont = false;
                    break;
            }
            
            return cont;
        },
        
        setValue: function ( d ) {
            // do not continue to the default handeler
            return true;
        }
    } );
})(jQuery);

