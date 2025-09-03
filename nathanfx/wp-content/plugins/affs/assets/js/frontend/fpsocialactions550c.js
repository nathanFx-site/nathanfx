/* Social Action */

jQuery( function( $ ) {
    var FSSocialAction = {
        init : function() {
            $( document ).on( 'click' , '.fp_share_button' , this.share_url_in_fb ) ;
            $( document ).on( 'click' , '.fs_copy_clipboard_image' , this.copy_to_clipboard ) ;
            $( document ).on( 'click' , '.fs_static_copy_clipboard_image' , this.copy_to_static_clipboard ) ;
        } ,
        share_url_in_fb : function() {
            var obj = {
                method : 'feed' ,
                display : 'popup' ,
                link : $( this ).attr( 'data-href' ) ,
                redirect_uri : fs_social_action_params.redirecturl ,
            } ;
            FB.ui( obj , function( response ) {
                if( response != null ) {
                    alert( fs_social_action_params.success_msg ) ;
                } else {
                    alert( fs_social_action_params.cancel_msg ) ;
                }
            } ) ;
        } ,
        copy_to_clipboard : function( event ) {

            event.preventDefault() ;
            var $this = $( event.currentTarget ) ;

            var temp = $( '<input>' ) ;
            $( 'body' ).append( temp ) ;
            var url = $this.attr( 'data-url' ) ;
            temp.val( url ).select() ;
            document.execCommand( 'copy' ) ;

            if( $this.closest( 'td' ).find( '.fs_copy_message' ).length ) {
                /*Copy Link Message for Landing Pages Link*/
                $this.closest( 'td' ).find( '.fs_copy_message' ).css( { display : 'block' } ).delay( 1200 ).fadeOut() ;
            } else {
                /*Copy Link Message in Generate Link*/
                $( '.fs_display_generated_link' ).find( '.fs_copy_message' ).css( { display : 'block' } ).delay( 1200 ).fadeOut() ;
            }

            temp.remove() ;
        } ,
        copy_to_static_clipboard : function( event ) {
            event.preventDefault() ;
            var $this = $( event.currentTarget ) ;

            var temp = $( '<input>' ) ;
            $( 'body' ).append( temp ) ;
            var url = $this.attr( 'data-url' ) ;
            temp.val( url ).select() ;
            document.execCommand( 'copy' ) ;
            
            if( $( 'div.fs_static_copy_message' ).length ) {
                /*Copy Link Message for Landing Pages Link*/
                $( 'div.fs_static_copy_message' ).css( { display : 'block' } ).delay( 1200 ).fadeOut() ;
            } else {
                /*Copy Link Message in Generate Link*/
                $( '.fs_display_generated_campaign_link' ).find( 'div.fs_static_copy_message' ).css( { display : 'block' } ).delay( 1200 ).fadeOut() ;
            }

            temp.remove() ;
        }
    } ;
    FSSocialAction.init() ;
} ) ;