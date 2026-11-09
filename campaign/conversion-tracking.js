// Google Ads click conversion for campaign phone links and submit buttons.
function gtag_report_conversion(url) {
  var callback = function () {
    if (typeof(url) != 'undefined') {
      window.location = url;
    }
  };
  gtag('event', 'conversion', {
    'send_to': 'AW-18564146239/0R2uCNuNkbUdEL_IiZRF',
    'event_callback': callback
  });
  return false;
}

document.querySelectorAll('a[href^="tel:"], .lead-form button[type="submit"]').forEach(function (control) {
  control.addEventListener('click', function () {
    // Keep native dialing and form validation working even if tracking is blocked.
    gtag_report_conversion();
  });
});
