/*
 * jQuery UI Board 1.0
 * 
 * Copyright (c) 2012 Yaacov Zamir (kobi.zamir at gmail)
 *
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * Depends:
 *    ui.draggable.js
 *    ui.resizable.js
 *    ui.selectable.js
 *    ui.core.js
 */

/* drawing board edit form for elements extension */
(function( $ ) {
    // dialog functions and validations shamelessly stolen from jquery ui
    // demo and examples page
    createDialog = function () {
        dialog = $( "<div id=\"ui-board-dialog-form\" title=\"Update element\"></div>" );
        tips = $( "<p class=\"validateTips\"></p>" );
        dialog.append( tips );
        $( "body" ).prepend( dialog );
        
        dialog.dialog({
            autoOpen: true,
            height: "auto",
            width: 300,
            modal: false,
            resizable: false,
            buttons: {
                "Update": function() {
                    var bValid = true;
                    allFields = dialog.find( "input" );
                    tips.text("");
                    allFields.removeClass( "ui-state-error" );
                    
                    // validate data fieldes
                    allFields.each( function() { bValid = bValid && $( this ).data( "validator" )(); } );

                    if ( bValid ) {
                        // find the current elemant for this dialog
                        var el = dialog.find( "form" ).data( "element" );
                        
                        // update element with new data
                        allFields.each( function() { 
                            el.board_element( "setData", $( this ).attr( "name" ), $( this ).val() ); 
                        });
                        
                        $( this ).dialog( "close" );
                    }
                },
                Cancel: function() {
                    $( this ).dialog( "close" );
                }
            },
            close: function() {
                allFields = dialog.find( "input" );
                tips.text( "" );
                allFields.val( "" ).removeClass( "ui-state-error" );
            }
        });
    }
    
    updateTips = function( t ) {
        tips = $( "#ui-board-dialog-form>p.validateTips" );
        tips
            .text( t )
            .addClass( "ui-state-highlight" );
        setTimeout(function() {
            tips.removeClass( "ui-state-highlight", 1500 );
        }, 500 );
    }
        
    validatorFuncations = function( el, n, data ) {
        function checkLength( o, n, min, max ) {
            if ( o.val().length > max || o.val().length < min ) {
                o.addClass( "ui-state-error" );
                updateTips( "Length of " + n + " must be between " +
                    min + " and " + max + "." );
                return false;
            } else {
                return true;
            }
        }

        function checkRegexp( o, regexp, n ) {
            if ( !( regexp.test( o.val() ) ) ) {
                o.addClass( "ui-state-error" );
                updateTips( n );
                return false;
            } else {
                return true;
            }
        }
        
        return function () { 
            var bValid = true;
            
            if ( data && data.min && data.max ) {
                bValid = bValid && checkLength( el, n, data.min, data.max );
            }
            if ( data && data.regexp && data.message ) {
                bValid = bValid && checkRegexp( el, data.regexp, data.message );
            }
            
            return bValid;
        };
    }
    
    $.extend($.ui.board_element.prototype, {
        form: function( data_list ) {
            var el = this.element;
            var black_list = ["index", "resizable", "draggable", "value", "disabled",
                "selectableItem", "board_element", "x", "y", "w", "h", "edit"];
            
            // if no element, use the selected element
            if ( typeof data_list === "undefined" ) {
                data_list = $.map( el.data(), function ( v, k ) {
                    if ( $.inArray( k, black_list) === -1 ) {
                        return k;
                    } else {
                        return null;
                    }
                });
            }
            
            // create a from with a fieldset
            var form = $( "<form></form>", { "class": "element_dialog_form" } );
            var fieldset = $( "<fieldset></fieldset>" );
            
            // populate the form with elments data
            $.each( data_list, function ( i, data ) {
                // this is a simple list of data keys, make current key string into a dict
                if ( typeof data === "string" ) {
                    data = { 
                        "id": data, 
                        "title": data,
                        "validator": false
                    };
                }
                
                // create a label and an input
                var label = $( "<label></label>", { 
                    "text": data.title, 
                    "for": data.id 
                });
                
                var input = $( "<input type=\"text\"/>" ).attr( {
                    "name": data.id, 
                    "class": "text",
                    "value": el.data( data.id )
                });
                
                // if we have a widget name, use it
                if ( typeof data.widget === "string" ) {
                    input[ data.widget ]( data.widget_data );
                }
                
                // attache a validator function to the input
                input.data( "validator", validatorFuncations( input, data.title, data.validator ) );
                
                // append label and input to the form
                fieldset.append( label );
                fieldset.append( input );
            });
            
            form.append( fieldset );
            
            // set the elment this form belongs to
            form.data( "element", el );
             
            return form;
        },
        
        runEditDialog: function ( data_list ) {
            // if no dialog div is present in this page, create one
            if ( $( "#ui-board-dialog-form" ).length === 0 ) {
                createDialog();
            }
            
            var dialog = $( "#ui-board-dialog-form" );
            
            // update the form part of this dialog
            dialog.children( "form.element_dialog_form" ).remove();
            dialog.append( this.form( data_list ) );
            
            // show the dialog
            dialog.dialog( "open" );
        }
    });
})(jQuery);
