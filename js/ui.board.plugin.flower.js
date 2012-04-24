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
        
        // options that this plugin requirs to be set first
        // and by this order
        optionWhiteList: [ "w", "h", "color" ],
        
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
                    
                    // we nead to manualy re-set the edit data, it is on the update function
                    // black list and will not be called on normal update
                    d.ui.board_element( "setData", "edit", d.ui.data( "edit" ) );
                    
                    // do not continue to the default handeler
                    cont = true;
                    break;
                case "edit":
                    if ( d.value ) {
                        // if we are in editing mode: anable editing of size
                        // and position
                        d.ui.resizable( "enable" );
                        d.ui.draggable( "enable" );
                        
                        // unbind the click handler for view mode
                        d.ui.unbind( "click" );
                        
                        // bind the click handler: in edit mode,
                        d.ui.click( function ( ev, el ) {
                            // if shiftKey is pressed and we have an edit dialog, show it
                            if ( ev.shiftKey && typeof $(this).board_element( "runEditDialog" ) !== "undefined" ) {
                                $(this).board_element( "runEditDialog", [ 
                                    { title:"Type", id:"type", 
                                        widget:"autocomplete", widget_data:{ source: ["normal"] },
                                        validator: {min: 3, max: 7} }, 
                                    { title: "Background color", id: "color" }] );
                            }
                            
                            // clicking deselect all other selected elemens
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
                        d.ui.resizable( "disable" );
                        d.ui.draggable( "disable" );
                        
                        // unbind the click handler for edit mode
                        d.ui.unbind( "click" );
                        
                        // bind the click handler: in view mode,
                        // clicking set the value
                        d.ui.click( function ( ev ) {
                            // get the element curret value
                            var value = parseInt( $( this ).board_element( "option", "value" ));
                            
                            // increase value by one
                            value += 1;
                            
                            // set the new value to the elemant
                            $(this).board_element( "setValue", value );
                        });
                    }
                    
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
                    d.ui.append( "<img class=\"background\" src=\"" + url + "\"/>" );
                    
                    // we nead to manualy re-set the edit data, it is on the update function
                    // black list and will not be called on normal update
                    d.ui.board_element( "setData", "edit", d.ui.data( "edit" ) );
                    
                    // do not continue to the default handeler
                    cont = true;
                    break;
                case "edit":
                    if ( d.value ) {
                        // if we are in editing mode: anable editing of size
                        // and position
                        d.ui.resizable( "enable" );
                        d.ui.draggable( "enable" );
                        
                        // unbind the click handler for view mode
                        d.ui.unbind( "click" );
                        
                        // bind the click handler: in edit mode,
                        // clicking deselect all other selected elemens
                        d.ui.click( function ( ev ) {
                            // if shiftKey is pressed and we have an edit dialog, show it
                            if ( ev.shiftKey && typeof $( this ).board_element( "runEditDialog" ) === "function" ) {
                                $( this ).board_element( "runEditDialog" )();
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
                        d.ui.resizable( "disable" );
                        d.ui.draggable( "disable" );
                        
                        // unbind the click handler for edit mode
                        d.ui.unbind( "click" );
                        
                        // bind the click handler: in view mode,
                        // clicking set the value
                        d.ui.click( function ( ev ) {
                            // set the new value to the elemant
                            $(this).board_element( "setValue", 1 );
                        });
                    }
                    
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
        
        setValue: function ( d ) {
            // do not continue to the default handeler
            return true;
        }
    } );
})(jQuery);

