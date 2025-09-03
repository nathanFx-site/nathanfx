/* global fs_affiliates_form_params */

jQuery( function ( $ ) {

    var FS_Affiliates = {
        init : function () {

            $( document.body ).on( 'fs-affiliates-generate-link' , this.generate_affiliate_url ) ;

            this.trigger_on_page_load() ;

            $( document ).on( 'focusout' , '.fs_affiliates_user_name' , this.validate_user_name ) ;
            $( document ).on( 'focusout' , '.fs_affiliates_user_email' , this.validate_user_email ) ;
            $( document ).on( 'change' , '.user_selection_type' , this.toggle_user_selection_type ) ;
            $( document ).on( 'change' , '.fs_affiliates_link_generator_type' , this.link_generator_type ) ;
            $( document ).on( 'click' , '.fs_affiliates_generate_affiliate_link' , this.generate_affiliate_url ) ;
            $( document ).on( 'click' , '.fs_affiliates_generate_campaign_affiliate_link' , this.generate_campaign_affiliate_url ) ;
            $( document ).on( 'click' , '.fs_affiliates_referral_code_notice .fs_affiliates_referral_code_link' , this.show_apply_referral_code ) ;
            $( document ).on( 'change' , '#fs_affiliates_form_show' , this.affiliates_form_show_slidedown ) ;
            $( document ).on( 'change' , '#createaccount' , this.woo_createaccount_change ) ;
            $( document ).on( 'click' , '.fs_form_submit_button' , this.validate_form_submit ) ;
        } , trigger_on_page_load : function () {           
            this.link_generator_type() ;
            this.static_url_display() ;
            this.get_user_selection_type( '.user_selection_type' ) ;

            /*Load Social Action for Landing Pages in Affiliate Link Section*/
            if ( $( '.fs_affiliates_landing_page_table' ).find( '.fs_landing_pages_link' ).length ) {
                FS_Affiliates.load_sdk_for_social_action() ;
            }

            if ( fs_affiliates_form_params.is_checkout_page ) {
                this.woo_createaccount_change_event( '#createaccount' ) ;
            }
        } , affiliates_form_show_slidedown : function ( ) {
            $( '.fs_affiliates_reg_form_my_account' ).toggle( ) ;
        } , toggle_user_selection_type : function ( event ) {
            event.preventDefault() ;
            var $this = $( event.currentTarget ) ;
            FS_Affiliates.get_user_selection_type( $this ) ;
        } ,
        validate_form_submit : function( event ){            
            var $this = $( event.currentTarget ) ;
            $this.attr( 'disabled' , 'disabled' ) ;
            $this.parents( 'form' ).submit() ;
        },
        woo_createaccount_change : function ( event ) {
            event.preventDefault( ) ;
            var $this = $( event.currentTarget ) ;
            FS_Affiliates.woo_createaccount_change_event( $this ) ;
        } ,

        show_apply_referral_code : function () {
            $( '.fs_affiliates_apply_referral_code' ).toggle() ;
        } ,
        woo_createaccount_change_event : function ( $this ) {
            if ( $( $this ).prop( 'checked' ) == true || ( ( $( '#createaccount' ).length == 0 ) && ( $( '#account_username' ).length || $( '#account_password' ).length ) ) ) {
                $( '.fs_affiliates_checkbox_wrapper' ).show() ;
                if ( $( '#fs_affiliates_form_show' ).prop( 'checked' ) == true ) {
                    $( '.fs_affiliates_reg_form_my_account' ).show() ;
                }
            } else {
                $( '.fs_affiliates_checkbox_wrapper' ).hide() ;
                $( '.fs_affiliates_reg_form_my_account' ).hide() ;
            }
        } ,
        get_user_selection_type : function ( $this ) {
            var type = $( $this ).val() ;
            if ( typeof type == 'undefined' )
                return ;

            if ( type == 'new' ) {
                $( '.fs_affiliates_separate_account' ).closest( 'p' ).show() ;
                $( '.fs_affiliates_separate_account' ).removeAttr( 'disabled' ) ;
            } else {
                $( '.fs_affiliates_separate_account' ).closest( 'p' ).hide() ;
                $( '.fs_affiliates_separate_account' ).attr( 'disabled' , 'disabled' ) ;
            }
        }
        , validate_user_name : function ( event ) {
            event.preventDefault() ;
            var $this = $( event.currentTarget ) ;

            if ( $this.val().indexOf( " " ) !== -1 ) {
                var $without_whitespace = $this.val().replace( /\s/g , '' ) ;
                $this.val( $without_whitespace ) ;
            }

            var $p = $( $this ).closest( 'p' ) ;
            $( $p ).find( '.fs_affiliates_notice' ).remove() ;

            var html = '<div class="fs_affiliates_notice">%s</div>' ;
            if ( $( $this ).val() == '' ) {
                $( $this ).after( html.replace( /%s/g , fs_affiliates_form_params.username_validation_msg ) ) ;
                return false ;
            }

            FS_Affiliates.block( $( $this ).closest( 'p' ) ) ;

            var data = {
                action : 'fs_affiliates_username_validation' ,
                name : $( $this ).val() ,
                fs_security : fs_affiliates_form_params.username_nonce
            } ;
            $.post( fs_affiliates_form_params.ajax_url , data , function ( response ) {
                if ( true === response.success ) {
                    $( $this ).after( html.replace( /%s/g , response.data.content ) ) ;
                } else {
                    window.alert( response.data.error ) ;
                }
                FS_Affiliates.unblock( $( $this ).closest( 'p' ) ) ;
            } ) ;
            return true ;
        }
        , validate_user_email : function ( event ) {
            event.preventDefault() ;
            var $this = $( event.currentTarget ) ;
            var $p = $( $this ).closest( 'p' ) ;
            $( $p ).find( '.fs_affiliates_notice' ).remove() ;

            var html = '<div class="fs_affiliates_notice">%s</div>' ;
            if ( $( $this ).val() == '' ) {
                $( $this ).after( html.replace( /%s/g , fs_affiliates_form_params.useremail_validation_msg ) ) ;
                return false ;
            }

            FS_Affiliates.block( $( $this ).closest( 'p' ) ) ;

            var data = {
                action : 'fs_affiliates_useremail_validation' ,
                email : $( $this ).val() ,
                fs_security : fs_affiliates_form_params.useremail_nonce
            } ;
            $.post( fs_affiliates_form_params.ajax_url , data , function ( response ) {
                if ( true === response.success ) {
                    $( $this ).after( html.replace( /%s/g , response.data.content ) ) ;
                } else {
                    window.alert( response.data.error ) ;
                }
                FS_Affiliates.unblock( $( $this ).closest( 'p' ) ) ;
            } ) ;
            return true ;
        } , generate_affiliate_url : function () {
            var campaign_for_affiliate = $( '.campaign_for_affiliate' ).val() ;
            var campaign_for_product = $( '.campaign_for_product' ).val() ;
            var affiliate_url = ( '2' == fs_affiliates_form_params.referral_url_type ) ? fs_affiliates_form_params.static_referral_url : $( '.fs_url_to_generate_affiliate_link' ).val() ;
            var linkgeneratortype = $( '.fs_affiliates_link_generator_type' ).val() ;
            var product = $( '#productid' ).val() ;

            var data = {
                action : 'fs_affiliates_generate_affiliate_url' ,
                campaign_for_affiliate : campaign_for_affiliate ,
                campaign_for_product : campaign_for_product ,
                product : product ,
                url : affiliate_url ,
                linkgeneratortype : linkgeneratortype ,
                fs_security : fs_affiliates_form_params.url_nonce
            } ;
            $.post( fs_affiliates_form_params.ajax_url , data , function ( response ) {
                if ( true === response.success ) {
                    FS_Affiliates.load_sdk_for_social_action() ;
                    $( '.fs_display_generated_link' ).html( response.data.content ) ;
                } else {
                    window.alert( response.data.error ) ;
                }
            } ) ;
        } ,
        generate_campaign_affiliate_url : function () {
            var campaign_for_affiliate = $( '.campaign_for_affiliate' ).val() ;

            if ( '' == campaign_for_affiliate ) {
                alert( fs_affiliates_form_params.empty_campain_msg ) ;
                return ;
            }

            var campaign_for_product = $( '.campaign_for_product' ).val() ;
            var affiliate_url = ( '2' == fs_affiliates_form_params.referral_url_type ) ? fs_affiliates_form_params.static_referral_url : $( '.fs_url_to_generate_affiliate_link' ).val() ;
            var linkgeneratortype = $( '.fs_affiliates_link_generator_type' ).val() ;
            var product = $( '#productid' ).val() ;

            var data = {
                action : 'fs_affiliates_generate_affiliate_url' ,
                campaign_for_affiliate : campaign_for_affiliate ,
                campaign_for_product : campaign_for_product ,
                product : product ,
                url : affiliate_url ,
                button_type : 'static' ,
                linkgeneratortype : linkgeneratortype ,
                fs_security : fs_affiliates_form_params.url_nonce
            } ;
            $.post( fs_affiliates_form_params.ajax_url , data , function ( response ) {
                if ( true === response.success ) {
                    FS_Affiliates.load_sdk_for_social_action() ;
                    $( '.fs_display_generated_campaign_link' ).html( response.data.content ) ;
                } else {
                    window.alert( response.data.error ) ;
                }
            } ) ;
        } ,
        load_sdk_for_social_action : function () {
            if ( fs_affiliates_form_params.fbappid != '' && fs_affiliates_form_params.fbshare == 'yes' ) {
                window.fbAsyncInit = function () {
                    FB.init( {
                        appId : fs_affiliates_form_params.fbappid ,
                        xfbml : true ,
                        version : 'v3.0'
                    } ) ;
                } ;
                ( function ( d , s , id ) {
                    var js , fjs = d.getElementsByTagName( s )[0] ;
                    if ( d.getElementById( id ) )
                        return ;
                    js = d.createElement( s ) ;
                    js.id = id ;
                    js.src = "https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v3.0" ;
                    fjs.parentNode.insertBefore( js , fjs ) ;
                }( document , 'script' , 'facebook-jssdk' ) ) ;
            }
            if ( fs_affiliates_form_params.tweet == 'yes' ) {
                !function ( d , s , id ) {
                    var js , fjs = d.getElementsByTagName( s )[0] , p = /^http:/.test( d.location ) ? 'http' : 'https' ;

                    /*Commented for Insert Widgets Multiple Times in Affiliate Link Section*/
//                    if( !d.getElementById( id ) ) {
                    js = d.createElement( s ) ;
                    js.id = id ;
                    js.src = p + '://platform.twitter.com/widgets.js' ;
                    fjs.parentNode.insertBefore( js , fjs ) ;
//                    }
                }( document , 'script' , 'twitter-wjs' ) ;
            }
            if ( fs_affiliates_form_params.gplusshare == 'yes' ) {
                window.___gcfg = {
                    lang : 'en-US' ,
                    parsetags : 'onload'
                } ;
            }
        } ,
        link_generator_type : function () {

            if ( $( '.fs_affiliates_link_generator_type' ).val() == '2' ) {
                $( '.show_if_affiliate_link_generator' ).hide() ;
                $( '.show_if_product_link_generator' ).show() ;
            } else {
                $( '.show_if_product_link_generator' ).hide() ;
                $( '.show_if_affiliate_link_generator' ).show() ;
            }
        } , getUrlParameter : function ( $url_var ) {
            var page_url = location.search.substring( 1 ) ,
                    url_sub_var = page_url.split( '&' ) ,
                    sub_parameter_name ,
                    i ;

            for ( i = 0 ; i < url_sub_var.length ; i++ ) {
                sub_parameter_name = url_sub_var[i].split( '=' ) ;

                if ( sub_parameter_name[0] === $url_var ) {
                    return sub_parameter_name[1] === undefined ? true : decodeURIComponent( sub_parameter_name[1] ) ;
                }
            }
        } , static_url_display : function () {
            if ( typeof fs_affiliates_form_params === 'undefined' ) {
                return false ;
            }

            if ( 'affiliate_link' == FS_Affiliates.getUrlParameter( 'fs_section' ) && '2' == fs_affiliates_form_params.referral_url_type ) {
                setTimeout( function () {
                    $( document.body ).trigger( 'fs-affiliates-generate-link' ) ;
                } , 200 ) ;
            }
        } , block : function ( id ) {
            $( id ).block( {
                message : null ,
                overlayCSS : {
                    background : '#fff' ,
                    opacity : 0.6
                }
            } ) ;
        } ,
        unblock : function ( id ) {
            $( id ).unblock() ;
        } ,
    } ;
    FS_Affiliates.init() ;
} ) ;
