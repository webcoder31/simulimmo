// Extends jQuery functions with isOnScreen() which indicates whether an element
// is currently visible in the viewport or not.
$.fn.isOnScreen = function(){

    var win = $(window);

    var viewport = {
        top : win.scrollTop(),
        left : win.scrollLeft()
    };
    viewport.right = viewport.left + win.width();
    viewport.bottom = viewport.top + win.height();

    var bounds = this.offset();
    bounds.right = bounds.left + this.outerWidth();
    bounds.bottom = bounds.top + this.outerHeight();

    return (!(viewport.right < bounds.left || viewport.left > bounds.right || viewport.bottom < bounds.top || viewport.top > bounds.bottom));

};

// Rezize banner according to various situations.
function resizeBanner(fullscreen)
{
    if (fullscreen === undefined) {
       fullscreen = false;
    }

    var newHeight;

    var scrollTop = $(window).scrollTop();

    var navbarHeight = $('#header .uk-navbar').outerHeight();
    var bannerHeight = $('#banner').outerHeight();

    var winHeight = $(window).height()
    var maxHeight = Math.round(winHeight / 3);
    var minHeight = Math.round(maxHeight / 2);

    // Determine new banner height and corresponding height for the sticky
    // placeholder.
    if (fullscreen)
    {
        // Make the banner full screen (navbar remains visible).
        newHeight = winHeight - navbarHeight;
    }
    else if (scrollTop <= 0)
    {
        // Make the banner 1/3 of window height when we're at the top of the
        // document.
        newHeight = maxHeight;
    }
    else if (scrollTop > navbarHeight + minHeight)
    {
        // Make the banner height 1/6 of window height when document is scrolled
        // down to 1/6 of window height plus the navbar height.
        newHeight = minHeight;
    }
    else
    {
        // Adjust banner height to intermediary height when document is scrolled
        // between top and 1/3 of window height.
        newHeight = maxHeight - scrollTop;
    }

    if(newHeight != $('#banner').height())
    {
        // Banner new height is different from the current one.
        // So animate banner height to reach the new one and update
        // stickyplaceholder height.
        $('#banner').stop().animate(
                {
                    'height': newHeight + "px"
                },
                {
                    duration: 500,
                    easing: 'linear',
                    step: function () {
                        //$('.uk-sticky-placeholder').height(newHeight + navbarHeight);
                    },
                    done: function () {
                        //$('.uk-sticky-placeholder').height(newHeight + navbarHeight);
                    }
                }
            );

        // Animate font size of banner text according to new banner height.
        if (! fullscreen)
        {
            var ratio = window.innerWidth <= 640 ? 1 : 1.4;
            var fontSize = (1.625 * ratio * newHeight + 0.5 * newHeight / ratio) / maxHeight;
            $('#banner h1').stop().animate(
                    {
                        'font-size': fontSize + "rem"
                    },
                    {
                        duration: 350,
                        easing: 'linear'
                    }
                );
        }
    }
}


// // Initialize.
$(document).ready(function() {

    // Is it mobile device?
    var isMobileDevice = /Android|BB|BB10|BlackBerry|iPad|iPhone|iPod|Kindle|mobi|nexus 7|opera mini|PlayBook|Silk|tablet|webOS|Windows Phone/i.test(navigator.userAgent);

    // Register event listeners to handle window scrolling and resizing.
    $(window).on('scroll', function() {
            if(! $('banner').hasClass('tweaked'))
            {
                resizeBanner();
            }
        });

    // Handle window resizing to automatically resize banner.
    // Here we delay the call to the resizeConfigurators() function because
    // window takes a bit to maximize / restaure using buttons in the
    // top right corner of the browser.
    $(window).on('resize', function() {
            window.setTimeout(function() {
                    resizeBanner();
                }, 150);
        });

    // Manage font size of paragraph "insurance" whether it is stacked or not.
    $(window).on('resize', function() {
            if (window.innerWidth <= 960) {
                $('#insurance').removeClass('uk-text-small uk-text-justify');
            }
            else
            {
                $('#insurance').addClass('uk-text-small uk-text-justify');
            }
        });

    // Register click event listener on all <a> elements pointing to document
    // anchors in order to keep track of the location in the browser history
    // because it is disabled by UIkit when it make use of scroll feature.
    $('a[href^="#anchor-"]').on('click', function() {
        window.setTimeout(function(el) {
                    window.location = $(el).attr('href');
                }, 0, this);
        });

    // Scroll to top when accordion item is clicked.
    $('.uk-accordion-title').on('click', function() {
            $('html, body').animate({
                    scrollTop: window.innerWidth <= 640 ? 0 : $('#anchor-section-simulator').offset().top
                }, 500);
        });

    // Collapse all accordion items on start.
    UIkit.accordion($('#section-simulator .uk-accordion')).toggle(0, true);


    function beautifyNumber(x) {
        x = Math.round(x);
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    }

    // Initialize loan simulator plugin for monthly fees calculation.
    $('#loan-monthly-fees-form').loansimulator({
            'onUpdate': function(data) {
                    $('#loan-monthly-fees-form .loan-monthly-fees').text(beautifyNumber(data.monthlyFees) + ' €');
                    $('#loan-monthly-fees-form .loan-total-amount').text(beautifyNumber(data.loanAmount) + ' €');
                    $('#loan-monthly-fees-form .loan-interest-amount').text(beautifyNumber(data.interestAmount) + ' €');
                    $('#loan-monthly-fees-form .loan-insurance-amount').text(beautifyNumber(data.insuranceAmount) + ' €');
                },
            'onError': function(error) {
                    $('#loan-monthly-fees-form .loan-monthly-fees').text('### €');
                    $('#loan-monthly-fees-form .loan-total-amount').text('### €');
                    $('#loan-monthly-fees-form .loan-interest-amount').text('### €');
                    $('#loan-monthly-fees-form .loan-insurance-amount').text('### €');
                }
        });

    // Initialize loan simulator plugin for borrowed capital calculation.
    $('#loan-borrowed-capital-form').loansimulator({
            'onUpdate': function(data) {
                    $('#loan-borrowed-capital-form .loan-borrowed-capital').text(beautifyNumber(data.borrowedCapital) + ' €');
                    $('#loan-borrowed-capital-form .loan-total-amount').text(beautifyNumber(data.loanAmount) + ' €');
                    $('#loan-borrowed-capital-form .loan-interest-amount').text(beautifyNumber(data.interestAmount) + ' €');
                    $('#loan-borrowed-capital-form .loan-insurance-amount').text(beautifyNumber(data.insuranceAmount) + ' €');
                },
            'onError': function(error) {
                    $('#loan-borrowed-capital-form .loan-borrowed-capital').text('### €');
                    $('#loan-borrowed-capital-form .loan-total-amount').text('### €');
                    $('#loan-borrowed-capital-form .loan-interest-amount').text('### €');
                    $('#loan-borrowed-capital-form .loan-insurance-amount').text('### €');
                }
        });

    // Initialize loan simulator plugin for borrowed capital calculation.
    $('#loan-loan-duration-form').loansimulator({
            'onUpdate': function(data) {
                    $('#loan-loan-duration-form .loan-loan-duration').text(beautifyNumber(data.loanDuration) + ' ANS');
                    $('#loan-loan-duration-form .loan-total-amount').text(beautifyNumber(data.loanAmount) + ' €');
                    $('#loan-loan-duration-form .loan-interest-amount').text(beautifyNumber(data.interestAmount) + ' €');
                    $('#loan-loan-duration-form .loan-insurance-amount').text(beautifyNumber(data.insuranceAmount) + ' €');
                },
            'onError': function(error) {
                    $('#loan-loan-duration-form .loan-loan-duration').text('### €');
                    $('#loan-loan-duration-form .loan-total-amount').text('### €');
                    $('#loan-loan-duration-form .loan-interest-amount').text('### €');
                    $('#loan-loan-duration-form .loan-insurance-amount').text('### €');
                }
        });

    // Emit a resize event to trigger components size calculation.
    $(window).resize();
});
