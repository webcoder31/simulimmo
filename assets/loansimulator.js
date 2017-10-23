/**
 * LOANSIMULATOR / jQuery Plugin
 * An interactive loan simulator
 *
 * Copyright © 2017 - Thierry Thiers <webcoder31@gmail.com>
 *
 * This  software  is governed  by  the CeCILL-C  license under French  law  and
 * abiding  by the rules of distribution of free  software. You can  use, modify
 * and/or redistribute the software under the terms  of the  CeCILL-C license as
 * circulated by CEA, CNRS and INRIA at the following URL:
 *
 * http://www.cecill.info
 *
 * As a counterpart to the access to the source code  and rights to copy, modify
 * and redistribute  granted by  the  license, users are  provided  only with  a
 * limited  warranty and  the software's author,  the  holder  of  the  economic
 * rights, and the successive licensors have only limited liability.
 *
 * In this respect, the user's  attention is drawn to the risks  associated with
 * loading, using, modifying and/or  developing or reproducing  the software  by
 * the user in light of its specific status of free software, that may mean that
 * it is complicated to manipulate,  and that also  therefore means  that it  is
 * reserved  for  developers   and  experienced  professionals  having  in-depth
 * computer  knowledge. Users  are  therefore  encouraged to load  and  test the
 * software's suitability as  regards  their requirements in conditions enabling
 * the security of their systems and/or data to be  ensured and, more generally,
 * to use and operate it in the same conditions as regards security.
 *
 * The  fact  that you are  presently  reading  this  means  that you  have  had
 * knowledge of the CeCILL-C license and that you accept its terms.
 *
 * @author    Thierry Thiers <webcoder31@gmail.com>
 * @copyright 2017 - Thierry Thiers <webcoder31@gmail.com>
 * @license   http://www.cecill.info  CeCILL-C License
 * @version   v1.0.0
 */

(function ($, window, document, undefined) {

    // Plugin name.
    var pluginName = 'loansimulator';

    // Plugin default settings.
    var defaults = {

        // Borrowed capital field parameters.
        borrowedCapitalInputSelector: '.ls-borrowedCapitalInput',
        borrowedCapitalSliderSelector: '.ls-borrowedCapitalSlider',
        borrowedCapitalDefault: 100000,
        borrowedCapitalMin: 5000,
        borrowedCapitalMax: 400000,
        borrowedCapitalStep: 5000,

        // Loan duration field parameters.
        loanDurationInputSelector: '.ls-loanDurationInput',
        loanDurationSliderSelector: '.ls-loanDurationSlider',
        loanDurationDefault: 15,
        loanDurationMin: 2,
        loanDurationMax: 30,
        loanDurationStep: 1,

        // Interest rate field parameters.
        interestRateInputSelector: '.ls-interestRateInput',
        interestRateSliderSelector: '.ls-interestRateSlider',
        interestRateDefault: 1.75,
        interestRateMin: 0,
        interestRateMax: 10,
        interestRateStep: 0.05,

        // Insurance rate field parameters.
        insuranceRateInputSelector: '.ls-insuranceRateInput',
        insuranceRateSliderSelector: '.ls-insuranceRateSlider',
        insuranceRateDefault: 0.45,
        insuranceRateMin: 0,
        insuranceRateMax: 1,
        insuranceRateStep: 0.05,

        // Monthly fees field parameters.
        monthlyFeesInputSelector: '.ls-monthlyFeesInput',
        monthlyFeesSliderSelector: '.ls-monthlyFeesSlider',
        monthlyFeesDefault: 1000,
        monthlyFeesMin: 100,
        monthlyFeesMax: 5000,
        monthlyFeesStep: 100,

        // CSS class to apply to input field on invalid entered value
        invalidValueCss: 'ls-invalidValue',

        // Number of decimal in data passed to hook onUpdate().
        precision: 2,

        // Hooks
        onUpdate: function(data) {},
        onError: function(error) {}
    };


    // Create a plugin instance for the given DOM element.
    function Plugin(element, options)
    {
        // Merge user options with plugin default settings
        this.settings = $.extend({}, defaults, options);
        var settings = this.settings;

        // Convert all non function settings to functions.
        $.each(this.settings, function(option, value)
        {
            if(! $.isFunction(value)) {
                settings[option] = function() {
                    return value;
                };
            }
        });

        // What to calculate.
        this.fieldToCalculate = null;

        // Get loan form.
        this.loanForm = element;

        // Create field objects from what it's under the loan form in the DOM.
        this.fields = {
            'borrowedCapital': {
                input: $(this.loanForm).find(this.settings.borrowedCapitalInputSelector())[0],
                slider: $(this.loanForm).find(this.settings.borrowedCapitalSliderSelector())[0],
                default: this.settings.borrowedCapitalDefault(),
                min: this.settings.borrowedCapitalMin(),
                max: this.settings.borrowedCapitalMax(),
                step: this.settings.borrowedCapitalStep(),
                getValue: function() {},
                isProvided: false
            },

            'loanDuration': {
                input: $(this.loanForm).find(this.settings.loanDurationInputSelector())[0],
                slider: $(this.loanForm).find(this.settings.loanDurationSliderSelector())[0],
                default: this.settings.loanDurationDefault(),
                min: this.settings.loanDurationMin(),
                max: this.settings.loanDurationMax(),
                step: this.settings.loanDurationStep(),
                getValue: function() {},
                isProvided: false
            },

            'interestRate': {
                input: $(this.loanForm).find(this.settings.interestRateInputSelector())[0],
                slider: $(this.loanForm).find(this.settings.interestRateSliderSelector())[0],
                default: this.settings.interestRateDefault(),
                min: this.settings.interestRateMin(),
                max: this.settings.interestRateMax(),
                step: this.settings.interestRateStep(),
                getValue: function() {},
                isProvided: false
            },

            'insuranceRate': {
                input: $(this.loanForm).find(this.settings.insuranceRateInputSelector())[0],
                slider: $(this.loanForm).find(this.settings.insuranceRateSliderSelector())[0],
                default: this.settings.insuranceRateDefault(),
                min: this.settings.insuranceRateMin(),
                max: this.settings.insuranceRateMax(),
                step: this.settings.insuranceRateStep(),
                getValue: function() {},
                isProvided: false
            },

            'monthlyFees': {
                input: $(this.loanForm).find(this.settings.monthlyFeesInputSelector())[0],
                slider: $(this.loanForm).find(this.settings.monthlyFeesSliderSelector())[0],
                default: this.settings.monthlyFeesDefault(),
                min: this.settings.monthlyFeesMin(),
                max: this.settings.monthlyFeesMax(),
                step: this.settings.monthlyFeesStep(),
                getValue: function() {},
                isProvided: false
            }
        };


        // Resolves scope conflicts.
        var that = this;

        // Loop on field objects.
        $.each(this.fields, function(fieldName, params)
        {
            // Are field DOM elements provided ?
            params.isProvided = params.input && params.slider;

            if(params.isProvided)
            {
                // Implements method to get field value.
                params.getValue = function() {
                    return params.input.value;
                };

                // Create jQueryUI slider.
                $(params.slider).slider({
                    range: 'min',
                    value: params.default,
                    min: params.min,
                    max: params.max,
                    step: params.step,
                    slide: function(event, ui) {
                        $(params.input).val(ui.value);
                        $(params.input).removeClass(settings.invalidValueCss);
                        that.calculate();
                    }
                });

                // Set input field initial default value.
                $(params.input).val(params.default);

                // On keyup, check input value.
                $(params.input).on('keyup', function () {
                    if (isNaN(this.value))
                    {
                        // Non numeric value.
                        $(this).addClass(settings.invalidValueCss);
                        that.inputError();
                    }
                    else if (this.value < params.min)
                    {
                        // Value is too low.
                        $(this).addClass(settings.invalidValueCss);
                        $(params.slider).slider('value', params.min);
                        that.inputError();
                    }
                    else if (this.value > params.max)
                    {
                        // Value is too high.
                        $(this).addClass(settings.invalidValueCss);
                        $(params.slider).slider('value', params.max);
                        that.inputError();
                    }
                    else
                    {
                        // Valid value.
                        $(this).val(Math.max(Math.min(this.value, $(params.slider).slider('option', 'max')), $(params.slider).slider('option', 'min')));
                        $(params.slider).slider('value', this.value);
                        $(this).removeClass(settings.invalidValueCss);
                        that.calculate();
                    }
                });

                // On blur, reset input to default value if current one is not valid.
                $(params.input).on('blur', function () {
                    if (isNaN(this.value) || this.value < params.min || this.value > params.max)
                    {
                        // Invalid value.
                        $(this).removeClass(settings.invalidValueCss);
                        $(params.slider).slider('value', params.default);
                        $(params.input).val(params.default);
                        that.calculate();
                    }
                });
            }
            else if (that.fieldToCalculate)
            {
                console.log('[LOANSIMULATOR] INITIALIZATION ERROR: Some fields are missing.');
                return null;
            }
            else
            {
                // Field to calculate found.
                that.fieldToCalculate = fieldName;
            }
        });

        if (that.fieldToCalculate == undefined)
        {
            console.log('[ LOANSIMULATOR ] INITIALIZATION ERROR: Too much fields provided.');
            return null;
        }

        switch(this.fieldToCalculate)
        {
            case 'monthlyFees':
                break;

            case 'borrowedCapital':
                break;

            case 'loanDuration':
                break;

            default:
               console.log('[ LOANSIMULATOR ] INITIALIZATION ERROR: Fields mismacth.');
               return null;
        }

        // Initialize DOM element values.
        that.calculate();
    }


    // Plugin prototype (act as a POO class).
    Plugin.prototype =
    {
        // Manage inalid value errors.
        inputError: function(error)
        {
            // TODO

            // Build error object and call hook.
            var result = null;
            this.settings.onError(result);
        },


        // Commpute loan data.
        calculate: function()
        {
            // Prepare data to pass to onUpdate() hook with already known values.
            var data = {
                'borrowedCapital': null,
                'loanDuration': null,
                'interestRate': null,
                'insuranceRate': null,
                'monthlyFees': null,
                'loanAmount': null,
                'interestAmount': null,
                'insuranceAmount': null,
                'totalAmount': null
            };

            // Calculate desired data.
            switch(this.fieldToCalculate)
            {
                case 'monthlyFees':
                    $.extend(data,
                        {
                            'borrowedCapital': this.fields.borrowedCapital.getValue(),
                            'loanDuration': this.fields.loanDuration.getValue(),
                            'interestRate': this.fields.interestRate.getValue(),
                            'insuranceRate': this.fields.insuranceRate.getValue()
                        },
                        this.calculateMonthlyFees()
                    );
                    break;

                case 'borrowedCapital':
                    $.extend(data,
                        {
                            'loanDuration': this.fields.loanDuration.getValue(),
                            'interestRate': this.fields.interestRate.getValue(),
                            'insuranceRate': this.fields.insuranceRate.getValue(),
                            'monthlyFees': this.fields.monthlyFees.getValue()
                        },
                        this.calculateBorrowedCapital()
                    );
                    break;

                case 'loanDuration':
                    $.extend(data,
                        {
                            'borrowedCapital': this.fields.borrowedCapital.getValue(),
                            'interestRate': this.fields.interestRate.getValue(),
                            'insuranceRate': this.fields.insuranceRate.getValue(),
                            'monthlyFees': this.fields.monthlyFees.getValue(),
                        },
                        this.calculateLoanDuration()
                    );
                    break;

                default:
                    // Should not occurs.
                   console.log('[ LOANSIMULATOR ] UNEXPECTED ERROR: Dont know what to calculate.');
            }

            // Format data values (keep only 2 decimals).
            for (var key in data)
            {
                if(data.hasOwnProperty(key))
                {
                    data[key] = Number.parseFloat(data[key]).toFixed(this.settings.precision());
                }
            }

            // Trigger hook passing it formated data.
            this.settings.onUpdate(data);
        },


        // Calculate monthly fees.
        calculateMonthlyFees: function()
        {
            // Get borrowed capital.
            var borrowedCapital = this.fields.borrowedCapital.getValue();

            // Get percentage yearly interest rate and convert it to numeric monthly interest rate.
            var interestRateForMonth = this.fields.interestRate.getValue() / 1200.;

            // Get loan duration and convert it from years to months.
            var loanDurationInMonths = this.fields.loanDuration.getValue() * 12.;

            // Calculate basic monthly fees.
            var monthlyFees = borrowedCapital / loanDurationInMonths;

            // If interestRateForMonth -> 0
            // then, we use coef -> 1 + loanDurationInMonths * interestRateForMonth.
            if (interestRateForMonth > 1.e-7)
            {
                var coef = Math.pow(1. + interestRateForMonth, loanDurationInMonths);
                monthlyFees = borrowedCapital * interestRateForMonth * coef / (coef - 1.);
            }

            // Calculate insurance monthly cost.
            var insuranceMonthlyCost = (borrowedCapital * this.fields.insuranceRate.getValue() * 0.01) / 12;

            // Calculate and return desired data.
            var res = {
                'monthlyFees': monthlyFees + insuranceMonthlyCost,
                'loanAmount': loanDurationInMonths * (monthlyFees + insuranceMonthlyCost) - borrowedCapital,
                'interestAmount': loanDurationInMonths * monthlyFees - borrowedCapital,
                'insuranceAmount': loanDurationInMonths * insuranceMonthlyCost,
                'totalAmount': loanDurationInMonths * (monthlyFees + insuranceMonthlyCost)
            };

            return res;
        },


        // Calculate monthly fees.
        calculateBorrowedCapital: function()
        {
            // Get percentage yearly interest rate and convert it to numeric monthly interest rate.
            var interestRateForMonth = this.fields.interestRate.getValue() / 1200.;

            // Get loan duration and convert it from years to months.
            var loanDurationInMonths = this.fields.loanDuration.getValue() * 12.;

            // Get monthly fees.
            var monthlyFees = this.fields.monthlyFees.getValue();

            // Calculate basic borrowed capital.
            var borrowedCapital = loanDurationInMonths * monthlyFees;

            // If interestRateForMonth -> 0
            // then, we use coef -> 1 + loanDurationInMonths * interestRateForMonth.
            if (interestRateForMonth > 1.e-7)
            {
                var coef = Math.pow(1. + interestRateForMonth, loanDurationInMonths);
                borrowedCapital = monthlyFees * (coef - 1.) / (interestRateForMonth * coef);
            }

            // Calculate insurance monthly cost.
            var insuranceMonthlyCost = (borrowedCapital * this.fields.insuranceRate.getValue() * 0.01) / 12;

            // Calculate and return desired data.
            var res = {
                'borrowedCapital': borrowedCapital - (loanDurationInMonths * insuranceMonthlyCost),
                'loanAmount': loanDurationInMonths * monthlyFees - borrowedCapital + loanDurationInMonths * insuranceMonthlyCost,
                'interestAmount': loanDurationInMonths * monthlyFees - borrowedCapital,
                'insuranceAmount': loanDurationInMonths * insuranceMonthlyCost,
                'totalAmount': loanDurationInMonths * (monthlyFees + insuranceMonthlyCost)
            };

            return res;
        },


        // Calculate monthly fees.
        calculateLoanDuration: function()
        {
            // Get borrowed capital.
            var borrowedCapital = this.fields.borrowedCapital.getValue();

            // Convert percentage yearly interest rate to numeric monthly interest rate.
            var interestRateForMonth = this.fields.interestRate.getValue() / 1200.;

            // Get monthly fees.
            var monthlyFees = this.fields.monthlyFees.getValue();

            // Calculate insurance monthly cost.
            var insuranceMonthlyCost = (borrowedCapital * this.fields.insuranceRate.getValue() * 0.01) / 12;

            // Calculate loan duration.
            var loanDurationInMonths;
            if (monthlyFees < borrowedCapital * interestRateForMonth)
            {
                loanDurationInMonths = 0.;
            }
            else if (monthlyFees > borrowedCapital * (1. + interestRateForMonth))
            {
                loanDurationInMonths = 0.;
            }
            else
            {
                if (interestRateForMonth > 1.e-7)
                {
                    loanDurationInMonths = (Math.log((monthlyFees - insuranceMonthlyCost)) - Math.log((monthlyFees - insuranceMonthlyCost) - borrowedCapital * interestRateForMonth)) / Math.log(1. + interestRateForMonth);
                }
                else
                {
                    loanDurationInMonths = borrowedCapital / (monthlyFees - insuranceMonthlyCost);
                }
            }

            // Calculate insurance monthly cost.
            var insuranceMonthlyCost = (borrowedCapital * this.fields.insuranceRate.getValue() * 0.01) / 12;

            // Calculate and return desired data.
            var res = {
                'loanDuration': loanDurationInMonths / 12,
                'loanAmount': loanDurationInMonths * (monthlyFees - insuranceMonthlyCost) - borrowedCapital + loanDurationInMonths * insuranceMonthlyCost,
                'interestAmount': loanDurationInMonths * (monthlyFees - insuranceMonthlyCost) - borrowedCapital,
                'insuranceAmount': loanDurationInMonths * insuranceMonthlyCost,
                'totalAmount': loanDurationInMonths * (monthlyFees + insuranceMonthlyCost)
            };

            return res;
        }
    };


    // Create plugin instances for each selected DOM elements.
    $.fn[pluginName] = function(options)
    {
        var args = Array.prototype.slice.call(arguments, 1);

        return this.each(function()
        {
            if (!$.data(this, 'plugin_' + pluginName))
            {
                $.data(this, 'plugin_' + pluginName, new Plugin(this, options));
            }
            else if (Plugin.prototype[options])
            {
                $.data(this, 'plugin_' + pluginName)[options].apply(
                    $.data(this, 'plugin_' + pluginName), args
                );
            }
        });
    }

})(jQuery, window, document);
