/* global fs_affiliates_dashboard_params */

jQuery(function ($) {

    //File Upload
    if ($('.fs_affiliates_file_upload').length) {
        $('.fs_affiliates_file_upload').each(function (e) {

            var data = [{
                    name: 'action',
                    value: 'fs_affiliates_file_upload',
                },
                {
                    name: 'key',
                    value: $(this).attr('name')
                }];
            $(this).fileupload({
                url: fs_affiliates_dashboard_params.ajax_url,
                type: 'POST',
                async: false,
                formData: function (form) {
                    return data;
                },
                dataType: 'json',
                done: function (e, data) {
                    if (data.result.success === true) {
                        var html;
                        html = '<p class="fs_affiliates_uploaded_file_name"><b>' + data.files[0].name + '</b>';
                        html += '<span class="fs_affiliates_delete_uploaded_file" style="color:red;margin-left:10px;cursor: pointer;">[x]';
                        html += '<input type="hidden" class="fs_affiliates_remove_file" value=' + data.files[0].name + ' /></span></p>';

                        $(this).closest('div').find('.fs_affiliates_display_file_names').append(html);
                    } else {
                        $('.fs_affiliates_display_file_names').append('<span class="fs_affiliates_error_msg_for_upload" style="color:red;">' + data.result.data.error + '</span>');
                        $('.fs_affiliates_error_msg_for_upload').delay(3000).fadeOut();
                    }
                }
            });
        });
    }

    var FS_Dashboard = {
        init: function () {
            this.trigger_on_page_load();

            $(document).on('change', '#aff_change_slug', this.modifiy_slug);
            $(document).on('change', '#fs_affiliates_payment_method', this.payment_method_change);
            $(document).on('click', '#fs_affiliates_form_save', this.affiliates_form_save);
            $(document).on('click', '#fs_affiliates_form_send_mail', this.affiliates_form_send_mail);
            $(document).on('click', '.fs_affiliates_delete_uploaded_file', this.remove_uploaded_file);
            $(document).on('click', '.fs_affiliates_delete_table_uploaded_file', this.remove_table_uploaded_file);
            $(document).on('click', '.fs_request_unpaid_commission', this.get_unpaid_commissions);
            $(document).on('focusout', 'input[name=fs_new_campaign]', this.validate_campaign_name);
            // Pagination.
            $(document).on('click', '.fs-pagination', this.pagination);
            // Search products.
            $(document).on('click', '.fs-product-commission-search-btn', this.search_product);
            $(document).on('change', '.fs-affiliate-referral-commission', this.select_transfer_commission_referral_id);
            $(document).on('change', '.fs-select-all-referral-commission-ids', this.select_all_transfer_commission_referral_ids);
            $(document).on('click', '.fs-commission-transfer-to-wallet-btn', this.affiliate_commission_transfer_to_wallet);
            // Date Filters
            $(document).on('change', '.fs-date-filter-type', this.date_filter_type);
        },

        /**
         * Trigger on page load
         * 
         * @since 1.0.0      
         * @param event event 
         */
        trigger_on_page_load: function () {
            FS_Dashboard.aff_payment_method_common('#fs_affiliates_payment_method');
            this.show_or_hide_for_modifiy_slug();
            this.toggle_date_filter_type('.fs-date-filter-type');

        },
        /**
         * Payment method change
         * 
         * @since 1.0.0      
         * @param event event 
         */
        payment_method_change: function (event) {
            event.preventDefault();
            var $this = $(event.currentTarget);
            FS_Dashboard.aff_payment_method_common($this);
        }, 
        /**
         * Date filter type
         * 
         * @since 1.0.0      
         * @param event event 
         */
        date_filter_type: function (event) {
            event.preventDefault();
            FS_Dashboard.toggle_date_filter_type( $(event.currentTarget));
        },
        /**
         * Toggle date filter type
         * 
         * @since 1.0.0      
         * @param element $this 
         */
        toggle_date_filter_type: function ($this) {            
            if ('custom_range' === $($this).val()) {
                $('.fs-custom-date-range').show();
            } else {
                $('.fs-custom-date-range').hide();
            }
        },
        /**
         * Affiliates payment method common
         * 
         * @since 1.0.0      
         * @param {event} event  
         */
        aff_payment_method_common: function ($this) {
            $('.fs_affiliates_validation_error').hide();
            $('.affiliate-pay').hide();
            var selected_val = $($this).val();
            if (selected_val == 'paypal') {
                $('.affiliate-paypal-pay').show();
            } else if (selected_val == 'direct') {
                $('.affiliate-direct-pay').show();
            } else if (selected_val == 'wallet') {
                $('.affiliate-wallet-pay').show();
            }
        },
        /**
         * Remove uploaded file
         * 
         * @since 1.0.0      
         * @param {event} event  
         */
        remove_uploaded_file: function (event) {
            event.preventDefault();
            var $this = $(event.currentTarget);

            var data = {
                action: 'fs_affiliates_remove_uploaded_file',
                key: $($this).closest('div').find('.fs_affiliates_uploaded_file_key').val(),
                file_name: $($this).find('.fs_affiliates_remove_file').val(),
            };
            $.post(fs_affiliates_dashboard_params.ajax_url, data, function (response) {
                if (true === response.success) {
                    $($this).closest('p.fs_affiliates_uploaded_file_name').remove();
                } else {
                    window.alert(response.data.error);
                }
            });
        },
        /**
         * Remove table uploaded file
         * 
         * @since 1.0.0      
         * @param {event} event  
         */
        remove_table_uploaded_file: function (event) {
            event.preventDefault();
            var $this = $(event.currentTarget);

            var data = {
                action: 'fs_affiliates_remove_uploaded_file',
                key: $($this).find('.fs_affiliates_uploaded_file_key').val(),
                file_name: $($this).find('.fs_affiliates_remove_file').val(),
            };
            $.post(fs_affiliates_dashboard_params.ajax_url, data, function (response) {
                if (true === response.success) {
                    $($this).closest('tr').remove();
                } else {
                    window.alert(response.data.error);
                }
            });
        },
        /**
         * Affiliates form save
         * 
         * @since 1.0.0      
         * @param {event} event  
         */
        affiliates_form_save: function (event) {
            var affilate_id = $('#fs_affiliates_current_id').val();
            var pay_method = $('#fs_affiliates_payment_method').val();
            var paypal_email = $('#fs_affiliates_paypal_email').val();
            var paypal_bank = $('#fs_affiliates_bank_details').val();
            var emailReg = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,10})?$/;

            $('.fs_affiliates_validation_error').hide();

            if (pay_method == 'direct') {
                if (paypal_bank === '') {
                    $('.fs_affiliates_detail_validate').show();
                    return false;
                }
            } else if (pay_method == 'paypal') {
                if (paypal_email == '' || !emailReg.test(paypal_email)) {
                    $('.fs_affiliates_email_validate').show();
                    return false;
                }
            }

            var data = {
                action: "fs_affiliates_pay_method_change",
                fs_affiliate_current_id: affilate_id,
                fs_affiliates_payment_method: pay_method,
                fs_affiliates_paypal_email: paypal_email,
                fs_affiliates_bank_details: paypal_bank,
                fs_security: fs_affiliates_dashboard_params.pay_save_nonce,

            }
            jQuery.post(fs_affiliates_dashboard_params.ajax_url, data,
                    function (response) {
                        if (true === response.success) {
                            if (response.data.content == 'success') {
                                $('#fs_affiliates_msg_success').remove();
                                $('#fs_affiliates_pay_msg_wraper').append('<span id="fs_affiliates_msg_success" class="fs_affiliates_msg_success"><i class="fa fa-check"></i>Success!!!</span>');
                                $('#fs_affiliates_pay_msg_wraper').show();
                            }
                        } else {
                            window.alert(response.data.error);
                        }
                    }
            );
        },
        /**
         * Modify slug
         * 
         * @since 1.0.0         
         */
        modifiy_slug: function () {
            FS_Dashboard.show_or_hide_for_modifiy_slug();
        },
        /**
         * Show or hide for modify slug
         * 
         * @since 1.0.0
         * @param event event
         */
        show_or_hide_for_modifiy_slug: function () {
            if (jQuery('#aff_change_slug').is(':checked') == true) {
                jQuery('#aff_new_slug').closest('p').show();
            } else {
                jQuery('#aff_new_slug').closest('p').hide();
            }
        },
        /**
         * Affiliates form send mail
         * 
         * @since 1.0.0
         * @param event event
         */
        affiliates_form_send_mail: function (event) {

            var refer_mails = $('#fs_affiliates_refer_mails').val();
            var refer_mail_subject = $('#fs_affiliates_refer_mail_subject').val();
            var refer_mail_content = $('#fs_affiliates_refer_mail_content').val();
            var hidden_id = $('#fs_affiliates_hidden_id').val();

            var splited = refer_mails.split('|');
            var emailReg = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;

            $('.fs_affiliates_msg_success').hide();

            $('.fs_affiliates_msg_fails').hide();

            $('.fs_affiliates_refer_friend_validation_error').hide();

            if (refer_mails == '') {
                $('.fs_affiliates_refer_mail_validate').show();
                return false;
            } else {
                $.each(splited, function (key, value) {
                    if (!emailReg.test(value)) {
                        $('.fs_affiliates_refer_mail_validate').show();
                        return false;
                    }
                });
            }


            if (refer_mail_subject === '') {
                $('.fs_affiliates_refer_subject_validate').show();
                return false;
            }

            if (refer_mail_content === '') {
                $('.fs_affiliates_refer_content_validate').show();
                return false;
            }

            var data = {
                action: "fs_affiliates_referafriend_mails",
                refer_mails: refer_mails,
                refer_mail_subject: refer_mail_subject,
                refer_mail_content: refer_mail_content,
                hidden_id: hidden_id,
                fs_security: fs_affiliates_dashboard_params.pay_save_nonce,

            }
            jQuery.post(fs_affiliates_dashboard_params.ajax_url, data,
                    function (response) {
                        var trimmed_response = Number(jQuery.trim(response));
                        $('.fs_affiliates_refer_friend_validation_error').hide();
                        if (trimmed_response > 0) {
                            $('.fs_affiliates_refer_mail_success').show();
                        } else {
                            $('.fs_affiliates_refer_mail_fails').show();
                        }
                    }
            );
        }, 
        /**
         * Get unpaid commission
         * 
         * @since 1.0.0         
         */
        get_unpaid_commissions: function () {
            if (confirm(fs_affiliates_dashboard_params.request_submit_confirm)) {
                var data = {
                    action: "fsunpaidcommission",
                    affiliateid: $(this).attr('data-affiliateid'),
                    fs_security: fs_affiliates_dashboard_params.unpaid_commission,

                }
                $.post(fs_affiliates_dashboard_params.ajax_url, data, function (response) {
                    if (true === response.success) {
                        $("<div><span class='fs_affiliates_msg_success'><i class='fa fa-check'></i> " + response.data.content + " </span></div>").insertBefore('.fs_affiliates_form');
                    } else {
                        $("<div><span class='fs_affiliates_msg_fails_post'><i class='fa fa-exclamation-triangle'></i> " + response.data.error + "</span></div>").insertBefore('.fs_affiliates_form');
                    }
                });
            }
            return false;
        },
        /**
         * Pagination
         * 
         * @since 9.3.0
         * @param event event
         */
        pagination: function (event) {
            event.preventDefault();
            var $this = $(event.currentTarget),
                    wrapper = $this.closest('.fs_affiliates_form'),
                    table = $this.closest('table.fs_affiliates_frontend_table'),
                    filter = table.prev('.fs-frontend-filter'),                    
                    selected_page = $this.data('page');
                 
            var data = ({
                action: 'fs_pagination_action',
                selected_page: selected_page,
                table_name: table.data('table_name'),
                display_type: $('.fs_affiliates_frontend_table').data('display_type') ,
                s: filter.find('.fs-frontend-search').val(),
                fs_filter: $('.fs-date-filter-type').val(),
                fs_security: fs_affiliates_dashboard_params.pagination_action_nonce
            });
            
            $.post(fs_affiliates_dashboard_params.ajax_url, data, function (res) {
                if (true === res.success) {                   
                    wrapper.find('table').remove();
                    wrapper.replaceWith(res.data.html);
                } else {
                    alert(res.data.error);
                }
            }
            );
        },
        /**
         * Search Product
         * 
         * @since 9.3.0
         * @param event event
         */
        search_product: function (event) {
            event.preventDefault();
            var $this = $(event.currentTarget),
                    wrapper = $this.closest('.fs-product-commission-wrapper')                                 

            var data = ({
                action: 'fs_search_action',
                s: wrapper.find('.fs-frontend-search').val(),
                product_id: wrapper.find('.fs-product-id').val(),
                fs_security: fs_affiliates_dashboard_params.filter_search_nonce
            });

            $.post(fs_affiliates_dashboard_params.ajax_url, data, function (res) {
                if (true === res.success) {
                    wrapper.find('table').remove();
                    wrapper.html(res.data.html);
                } else {
                    alert(res.data.error);
                }
            }
            );
        },
        /**
         * Validate campaign name
         * 
         * @since 1.0.0
         * @param event event
         */
        validate_campaign_name: function (event) {
            event.preventDefault();
            var $this = $(event.currentTarget);

            if ($this.val().indexOf(" ") !== -1) {
                var $without_whitespace = $this.val().replace(/\s/g, '');
                $this.val($without_whitespace);
            }
        },

        /**
         * Select affiliate referral id for transfer commission to wallet.
         * 
         * @since 10.0.0
         * @param {object} event 
         */
        select_transfer_commission_referral_id(event) {
            event.preventDefault();
            let $this = $(event.currentTarget);
            var $referral_id = $this.val(),
                    $amount = 0;

            if (!$referral_id) {
                return;
            }

            $('input[name="fs_affiliate_referral_commission_ids"]:checked').each(function () {
                $amount = $amount + $(this).data('amount');
            });

            FS_Dashboard.handle_commission_transfer_to_wallet_button($amount);
        },

        /**
         * Select all affiliate referral ids for transfer commission to wallet.
         * 
         * @since 10.0.0
         * @param {event} event 
         */
        select_all_transfer_commission_referral_ids(event) {
            event.preventDefault();
            let $this = $(event.currentTarget);
            var $amount = 0;

            $('input[name="fs_affiliate_referral_commission_ids"]').prop('checked', $($this).is(':checked'));
            $('input[name="fs_affiliate_referral_commission_ids"]:checked').each(function () {
                $amount = $amount + $(this).data('amount');
            });

            FS_Dashboard.handle_commission_transfer_to_wallet_button($amount);
        },

        /**
         * Handle commission transfer to wallet button.
         * 
         * @since 10.0.0
         * @param {float} $amount 
         */
        handle_commission_transfer_to_wallet_button($amount) {
            let $disable = $amount ? false : true;

            $('.fs-commission-transfer-to-wallet-btn .fs-commission-transfer-to-wallet-amount').html(FS_Dashboard.format_price_html($amount));
            $('.fs-commission-transfer-to-wallet-btn').prop('disabled', $disable);
        },

        /**
         * Affiliate commission transfer via wallet.
         * 
         * @since 10.0.0
         * @param {event} event 
         */
        affiliate_commission_transfer_to_wallet(event) {
            event.preventDefault();
            let $this = $(event.currentTarget),
                    $table = $('.fs-affiliate-commission-transfer-to-wallet-table');

            if (!confirm(fs_affiliates_dashboard_params.commission_transfer_to_wallet_confirm_msg)) {
                return false;
            }

            var $referral_ids = [];
            $('input[name="fs_affiliate_referral_commission_ids"]:checked').each(function () {
                $referral_ids.push(this.value);
            });

            if (!$referral_ids) {
                return;
            }

            FS_Dashboard.block($table);
            let data = ({
                action: 'fs_transfer_commission_to_wallet_by_affiliate',
                referral_ids: $referral_ids,
                fs_security: fs_affiliates_dashboard_params.commission_transfer_to_wallet_nonce
            });

            $.post(fs_affiliates_dashboard_params.ajax_url, data, function (res) {
                if (true === res.success) {
                    alert(res.data.success);
                    window.location.reload(true);
                }

                $('.fs-commission-transfer-to-wallet-btn').hide();
                FS_Dashboard.unblock($table);
            });
        },

        /**
         * Format price HTML.
         * 
         * @since 10.0.0
         * @param {float} $price_amount 
         */
        format_price_html($price_amount) {
            var $price_html = '<span class="woocommerce-Price-amount amount"><span class="woocommerce-Price-currencySymbol">' + fs_affiliates_dashboard_params.currency + '</span>' + $price_amount + '</span>';

            switch (fs_affiliates_dashboard_params.currency_pos) {
                case 'right_space':
                    $price_html = '<span class="woocommerce-Price-amount amount">' + $price_amount + '<span class="woocommerce-Price-currencySymbol"> ' + fs_affiliates_dashboard_params.currency + '</span></span>';
                    break;
                case 'right':
                    $price_html = '<span class="woocommerce-Price-amount amount">' + $price_amount + '<span class="woocommerce-Price-currencySymbol">' + fs_affiliates_dashboard_params.currency + '</span></span>';
                    break;
                case 'left_space':
                    $price_html = '<span class="woocommerce-Price-amount amount"><span class="woocommerce-Price-currencySymbol">' + fs_affiliates_dashboard_params.currency + '</span> ' + $price_amount + '</span>';
                    break;
            }

            return $price_html;
        },
        /**
         * Block
         * 
         * @since 1.0.0
         * @param {int} id 
         */
        block(id) {
            $(id).block({
                message: null,
                overlayCSS: {background: '#fff', opacity: 0.6},
            });
        },

        /**
         * Un Block
         * 
         * @since 1.0.0
         * @param {int} id 
         */
        unblock(id) {
            $(id).unblock();
        },
    };
    FS_Dashboard.init();

    if ($('.fs_affiliates_frontend_dashboard').length) {

        $('ul.submenu').hide();
        $('ul > li, ul.submenu > li').hover(function () {
            if ($('> ul.submenu', this).length > 0) {
                $('> ul.submenu', this).stop().slideDown('slow');
            }
        }, function () {
            if ($('> ul.submenu', this).length > 0) {
                $('> ul.submenu', this).stop().slideUp('slow');
            }
        });
    }

});
