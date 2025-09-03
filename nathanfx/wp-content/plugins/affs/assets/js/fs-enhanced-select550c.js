/* global fs_enhanced_select_params */

jQuery(function ($) {
    'use strict';

    function fs_get_enhanced_select_format_string( ) {
        return {
            'language': {
                errorLoading: function () {
                    return fs_enhanced_select_params.i18n_searching;
                },
                inputTooLong: function (args) {
                    var overChars = args.input.length - args.maximum;

                    if (1 === overChars) {
                        return fs_enhanced_select_params.i18n_input_too_long_1;
                    }

                    return fs_enhanced_select_params.i18n_input_too_long_n.replace('%qty%', overChars);
                },
                inputTooShort: function (args) {
                    var remainingChars = args.minimum - args.input.length;

                    if (1 === remainingChars) {
                        return fs_enhanced_select_params.i18n_input_too_short_1;
                    }

                    return fs_enhanced_select_params.i18n_input_too_short_n.replace('%qty%', remainingChars);
                },
                loadingMore: function () {
                    return fs_enhanced_select_params.i18n_load_more;
                },
                maximumSelected: function (args) {
                    if (args.maximum === 1) {
                        return fs_enhanced_select_params.i18n_selection_too_long_1;
                    }

                    return fs_enhanced_select_params.i18n_selection_too_long_n.replace('%qty%', args.maximum);
                },
                noResults: function () {
                    return fs_enhanced_select_params.i18n_no_matches;
                },
                searching: function () {
                    return fs_enhanced_select_params.i18n_searching;
                }
            }
        };
    }

    try {
        $(document.body).on('fs-affiliates-select-init', function () {
            if ($('select.fs_affiliates_select2').length) {
                //Select2 with customization
                $('select.fs_affiliates_select2').each(function () {
                    var select2_args = {
                        allowClear: $(this).data('allow_clear') ? true : false,
                        placeholder: $(this).data('placeholder'),
                        minimumResultsForSearch: 10,
                    };

                    select2_args = $.extend(select2_args, fs_get_enhanced_select_format_string());

                    $(this).select2(select2_args);
                });
            }
            if ($('select.fs_affiliates_select2_search').length) {
                //Multiple select with ajax search
                $('select.fs_affiliates_select2_search').each(function () {
                    var select2_args = {
                        allowClear: $(this).data('allow_clear') ? true : false,
                        placeholder: $(this).data('placeholder'),
                        minimumInputLength: $(this).data('minimum_input_length') ? $(this).data('minimum_input_length') : 3,
                        escapeMarkup: function (m) {
                            return m;
                        },
                        ajax: {
                            url: fs_enhanced_select_params.ajax_url,
                            dataType: 'json',
                            delay: 250,
                            data: function (params) {
                                return {
                                    term: params.term,
                                    action: $(this).data('action') ? $(this).data('action') : '',
                                    fs_security: $(this).data('nonce') ? $(this).data('nonce') : fs_enhanced_select_params.search_nonce,
                                };
                            },
                            processResults: function (data) {
                                var terms = [];
                                if (data) {
                                    $.each(data, function (id, term) {
                                        terms.push({
                                            id: id,
                                            text: term
                                        });
                                    });
                                }
                                return {
                                    results: terms
                                };
                            },
                            cache: true
                        }
                    };

                    select2_args = $.extend(select2_args, fs_get_enhanced_select_format_string());

                    $(this).select2(select2_args);
                });
            }

            if ($('.fs_datepicker').length) {
                $('.fs_datepicker').on(
                        'change',
                        function ( ) {
                            if ($(this).val() === '') {
                                $(this).next(".fs_alter_datepicker_value").val('');
                            }
                        }
                );
                $('.fs_datepicker').each(
                        function ( ) {
                            $(this).datepicker(
                                    {
                                        altField: $(this).next(".fs_alter_datepicker_value"),
                                        altFormat: 'yy-mm-dd',
                                        changeMonth: true,
                                        changeYear: true,
                                        showButtonPanel: true,
                                        showOn: "button",
                                        buttonImage: fs_enhanced_select_params.calendar_image,
                                        buttonImageOnly: true
                                    }
                            );
                        }
                );
            }
        });

        $(document.body).trigger('fs-affiliates-select-init');
    } catch (err) {
        window.console.log(err);
    }

});