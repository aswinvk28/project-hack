/**
 * @file
 * Contains UX enchancements for codefilter.module.
 */

(function ($) {

  Drupal.behaviors.codefilter = {
    attach: function (context) {
      // Provide expanding text boxes when code blocks are too long.
      $(".codeblock.nowrap-expand", context).each(function () {
        var contents_width = $('code', this).width();
        var width = $(this).width();
        if (contents_width > width) {
          $(this).hover(
            function () {
              // Add a small right margin to width.
              $(this).animate({width: (contents_width + 20) + "px"}, 250, function () {
                $(this).css('overflow-x', 'visible');
              });
            },
            function () {
              $(this).css('overflow-x', 'hidden').animate({width: width + "px"}, 250);
            }
          );
        }
      });
    }
  }

})(jQuery);

;/*})'"*/
;/*})'"*/
/**
 * Timeago is a jQuery plugin that makes it easy to support automatically
 * updating fuzzy timestamps (e.g. "4 minutes ago" or "about 1 day ago").
 *
 * @name timeago
 * @version 1.4.1
 * @requires jQuery v1.2.3+
 * @author Ryan McGeary
 * @license MIT License - http://www.opensource.org/licenses/mit-license.php
 *
 * For usage and examples, visit:
 * http://timeago.yarp.com/
 *
 * Copyright (c) 2008-2013, Ryan McGeary (ryan -[at]- mcgeary [*dot*] org)
 */

(function (factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['jquery'], factory);
  } else {
    // Browser globals
    factory(jQuery);
  }
}(function ($) {
  $.timeago = function(timestamp) {
    if (timestamp instanceof Date) {
      return inWords(timestamp);
    } else if (typeof timestamp === "string") {
      return inWords($.timeago.parse(timestamp));
    } else if (typeof timestamp === "number") {
      return inWords(new Date(timestamp));
    } else {
      return inWords($.timeago.datetime(timestamp));
    }
  };
  var $t = $.timeago;

  $.extend($.timeago, {
    settings: {
      refreshMillis: 60000,
      allowPast: true,
      allowFuture: false,
      localeTitle: false,
      cutoff: 0,
      strings: {
        prefixAgo: null,
        prefixFromNow: null,
        suffixAgo: "ago",
        suffixFromNow: "from now",
        inPast: 'any moment now',
        seconds: "less than a minute",
        minute: "about a minute",
        minutes: "%d minutes",
        hour: "about an hour",
        hours: "about %d hours",
        day: "a day",
        days: "%d days",
        month: "about a month",
        months: "%d months",
        year: "about a year",
        years: "%d years",
        wordSeparator: " ",
        numbers: []
      }
    },

    inWords: function(distanceMillis) {
      if(!this.settings.allowPast && ! this.settings.allowFuture) {
          throw 'timeago allowPast and allowFuture settings can not both be set to false.';
      }

      var $l = this.settings.strings;
      var prefix = $l.prefixAgo;
      var suffix = $l.suffixAgo;
      if (this.settings.allowFuture) {
        if (distanceMillis < 0) {
          prefix = $l.prefixFromNow;
          suffix = $l.suffixFromNow;
        }
      }

      if(!this.settings.allowPast && distanceMillis >= 0) {
        return this.settings.strings.inPast;
      }

      var seconds = Math.abs(distanceMillis) / 1000;
      var minutes = seconds / 60;
      var hours = minutes / 60;
      var days = hours / 24;
      var years = days / 365;

      function substitute(stringOrFunction, number) {
        var string = $.isFunction(stringOrFunction) ? stringOrFunction(number, distanceMillis) : stringOrFunction;
        var value = ($l.numbers && $l.numbers[number]) || number;
        return string.replace(/%d/i, value);
      }

      var words = seconds < 45 && substitute($l.seconds, Math.round(seconds)) ||
        seconds < 90 && substitute($l.minute, 1) ||
        minutes < 45 && substitute($l.minutes, Math.round(minutes)) ||
        minutes < 90 && substitute($l.hour, 1) ||
        hours < 24 && substitute($l.hours, Math.round(hours)) ||
        hours < 42 && substitute($l.day, 1) ||
        days < 30 && substitute($l.days, Math.round(days)) ||
        days < 45 && substitute($l.month, 1) ||
        days < 365 && substitute($l.months, Math.round(days / 30)) ||
        years < 1.5 && substitute($l.year, 1) ||
        substitute($l.years, Math.round(years));

      var separator = $l.wordSeparator || "";
      if ($l.wordSeparator === undefined) { separator = " "; }
      return $.trim([prefix, words, suffix].join(separator));
    },

    parse: function(iso8601) {
      var s = $.trim(iso8601);
      s = s.replace(/\.\d+/,""); // remove milliseconds
      s = s.replace(/-/,"/").replace(/-/,"/");
      s = s.replace(/T/," ").replace(/Z/," UTC");
      s = s.replace(/([\+\-]\d\d)\:?(\d\d)/," $1$2"); // -04:00 -> -0400
      s = s.replace(/([\+\-]\d\d)$/," $100"); // +09 -> +0900
      return new Date(s);
    },
    datetime: function(elem) {
      var iso8601 = $t.isTime(elem) ? $(elem).attr("datetime") : $(elem).attr("title");
      return $t.parse(iso8601);
    },
    isTime: function(elem) {
      // jQuery's `is()` doesn't play well with HTML5 in IE
      return $(elem).get(0).tagName.toLowerCase() === "time"; // $(elem).is("time");
    }
  });

  // functions that can be called via $(el).timeago('action')
  // init is default when no action is given
  // functions are called with context of a single element
  var functions = {
    init: function(){
      var refresh_el = $.proxy(refresh, this);
      refresh_el();
      var $s = $t.settings;
      if ($s.refreshMillis > 0) {
        this._timeagoInterval = setInterval(refresh_el, $s.refreshMillis);
      }
    },
    update: function(time){
      var parsedTime = $t.parse(time);
      $(this).data('timeago', { datetime: parsedTime });
      if($t.settings.localeTitle) $(this).attr("title", parsedTime.toLocaleString());
      refresh.apply(this);
    },
    updateFromDOM: function(){
      $(this).data('timeago', { datetime: $t.parse( $t.isTime(this) ? $(this).attr("datetime") : $(this).attr("title") ) });
      refresh.apply(this);
    },
    dispose: function () {
      if (this._timeagoInterval) {
        window.clearInterval(this._timeagoInterval);
        this._timeagoInterval = null;
      }
    }
  };

  $.fn.timeago = function(action, options) {
    var fn = action ? functions[action] : functions.init;
    if(!fn){
      throw new Error("Unknown function name '"+ action +"' for timeago");
    }
    // each over objects here and call the requested function
    this.each(function(){
      fn.call(this, options);
    });
    return this;
  };

  function refresh() {
    var data = prepareData(this);
    var $s = $t.settings;

    if (!isNaN(data.datetime)) {
      if ( $s.cutoff == 0 || Math.abs(distance(data.datetime)) < $s.cutoff) {
        $(this).text(inWords(data.datetime));
      }
    }
    return this;
  }

  function prepareData(element) {
    element = $(element);
    if (!element.data("timeago")) {
      element.data("timeago", { datetime: $t.datetime(element) });
      var text = $.trim(element.text());
      if ($t.settings.localeTitle) {
        element.attr("title", element.data('timeago').datetime.toLocaleString());
      } else if (text.length > 0 && !($t.isTime(element) && element.attr("title"))) {
        element.attr("title", text);
      }
    }
    return element.data("timeago");
  }

  function inWords(date) {
    return $t.inWords(distance(date));
  }

  function distance(date) {
    return (new Date().getTime() - date.getTime());
  }

  // fix for IE6 suckage
  document.createElement("abbr");
  document.createElement("time");
}));

;/*})'"*/
;/*})'"*/
(function ($) {

  // Enable Timago only if a user's browser has localStorage support.
  // They must be able to double click it to enable/disable at will.
  var localStorage = 'localStorage' in window && typeof window.localStorage !== 'undefined' && window['localStorage'] !== null;
  var timeagoEnabled = localStorage ? (typeof window.localStorage['drupalorgCommentTimeago'] !== 'undefined' && window.localStorage['drupalorgCommentTimeago'] === 'false' ? false : true) : false;

  // Callback for toggling timestamps between set dates and relative time.
  function toggleTimes () {
    var $element = $(this);

    // Retrieve the original created date.
    var createdDate = $element.attr('data-created-date');
    if (!createdDate) {
      createdDate = $element.text();
      $element.attr('data-created-date', createdDate);
    }

    // Determine which title to use.
    var title = timeagoEnabled ? Drupal.t('!created_date (click to toggle)', {
      '!created_date': createdDate
    }) : Drupal.t('Click to show time ago');

    // Configure the timestamp accordingly.
    $element
      .attr('title', title)
      .timeago(timeagoEnabled ? undefined : 'dispose')
      .text(!timeagoEnabled ? createdDate : undefined);
  }

  Drupal.behaviors.drupalorgCrosssite = {
    attach: function (context) {
      $(context).find('.comments').once('timeago', function () {
        var $times = $(this).find('.comment .submitted time');
        $times
          // Initialize all timestamps.
          .each(toggleTimes)
          // Click to toggle all timestamps at the same time.
          .bind('click', function () {
            timeagoEnabled = !timeagoEnabled;
            if (localStorage) {
              window.localStorage['drupalorgCommentTimeago'] = timeagoEnabled;
            }
            $times.each(toggleTimes);
          });
      });
    }
  };

  Drupal.behaviors.drupalorgCrosssiteCookieConsent = {
    attach: function (context) {
      var gdpr, gdprEdit;

      if (!(context instanceof HTMLDocument)) {
        return;
      }

      if (Drupal.drupalorgCrosssite.doNotTrack()) {
        return;
      }

      // Above header.
      if ((gdpr = context.getElementById('drupalorg-crosssite-gdpr')) && !gdpr.classList.contains('processed')) {
        gdpr.classList.add('processed');

        if (Drupal.drupalorgCrosssite.consentStatus() === null) {
          gdpr.classList.add('prompt');
          gdpr.addEventListener('click', function (e) {
            if (e.target.classList.contains('yes')) {
              Drupal.drupalorgCrosssite.setConsent(true);
            }
            else if (e.target.classList.contains('no')) {
              Drupal.drupalorgCrosssite.setConsent(false);
            }
            else {
              return;
            }
            gdpr.classList.remove('prompt');
          });
        }
      }
      // Edit on /terms.
      if ((gdprEdit = context.getElementById('drupalorg-crosssite-gdpr-edit')) && !gdprEdit.classList.contains('processed')) {
        gdprEdit.classList.add('processed');

        if (Drupal.drupalorgCrosssite.consentStatus() !== null) {
          gdprEdit.classList.add('prompt');
          gdprEdit.classList.add(Drupal.drupalorgCrosssite.consentStatus());
          gdprEdit.addEventListener('click', function (e) {
            if (e.target.classList.contains('yes')) {
              Drupal.drupalorgCrosssite.setConsent(true);
            }
            else if (e.target.classList.contains('no')) {
              Drupal.drupalorgCrosssite.setConsent(false);
            }
            else {
              return;
            }
            gdprEdit.classList.remove('optin', 'optout');
            gdprEdit.classList.add(Drupal.drupalorgCrosssite.consentStatus());
          });
        }
      }
    }
  };

  Drupal.drupalorgCrosssite = {
    doNotTrack: function () {
      return navigator.doNotTrack == "yes" || navigator.doNotTrack == "1" || navigator.msDoNotTrack == "1" || window.doNotTrack == "1";
    },
    consentStatus: function () {
      return $.cookie('cookieConsent');
    },
    canTrack: function () {
      return !this.doNotTrack() && (!Drupal.settings.drupalorgCrosssiteConsentNeeded || this.consentStatus() === 'optin');
    },
    setConsent: function (consent) {
      $.cookie('cookieConsent', consent ? 'optin' : 'optout', {
        expires: consent ? 365 : 0,
        path: '/',
        domain: document.domain.replace(/^.*((\.[^.]+){2})$/, '$1'),
        secure: true
      });
    }
  };

})(jQuery)

;/*})'"*/
;/*})'"*/
(function ($) {
  var issueForm = document.getElementById('project-issue-ajax-form');

  /**
   * A placeholder to save the currently focused input between AJAX requests.
   */
  Drupal.projectIssueFocusedInput = false;

  /**
   * Persistent input focus (retains the proper focus after AJAX replacements).
   */
  Drupal.behaviors.projectIssueFocusedInput = {
    attach: function (context) {
      var $context = $(context);
      var inputs = ':input:not([type="hidden"],:submit)';
      // Only bind a top level click event once to remove the stored focus if
      // element is not an input.
      $('body').once('project-issue-focused-input', function () {
        $(this).bind('mousedown', function (e) {
          if (!$(e.target).is(inputs)) {
            Drupal.projectIssueFocusedInput = false;
          }
        });
      });
      if (Drupal.projectIssueFocusedInput) {
        // Do not use $context here, focused input could not be part of it.
        $(':input[name="' + Drupal.projectIssueFocusedInput + '"]').focus();
      }
      // Bind various events on input elements to ensure we save the
      // proper currently focused element.
      var $inputs = $context.find(inputs)
        .bind({
          'keydown': function (e) {
            var code = (e.keyCode ? e.keyCode : e.which);
            // Detect tab keystroke.
            if (code === 9) {
              // Obtain the name of the next input element in the DOM
              // structure.
              Drupal.projectIssueFocusedInput = $inputs.eq(parseInt($inputs.index($(this)), 10) + 1).attr('name');
            }
          },
          'mousedown': function () {
            Drupal.projectIssueFocusedInput = $(this).attr('name');
          },
          'focus': function () {
            Drupal.projectIssueFocusedInput = $(this).attr('name');
          }
        });
    }
  };

  /**
   * Persistent issue fieldsets (keeps them open/closed between HTTP requests).
   */
  Drupal.behaviors.projectIssuePersistentFieldsets = {
    attach: function () {
      // Only continue if localStorage is supported in the browser.
      if ('localStorage' in window && typeof window.localStorage !== 'undefined' && window['localStorage'] !== null) {
        // Only bind once.
        $('#project-issue-ajax-form').once('issue-form', function () {
          var prefix = $(this).parents('[id]').attr('id');
          $('fieldset.collapsible', this).each(function() {
            var $fieldset = $(this);
            var id = prefix + '.' + $fieldset.attr('id');
            // If the ID of the fieldset is present in localStorage, change open status.
            if (typeof window.localStorage[id] !== 'undefined') {
              if (window.localStorage[id] == 'true') { // localStorage casts to string.
                $fieldset.removeClass('collapsed');
              }
              else {
                $fieldset.addClass('collapsed');
              }
            }
            // Bind the "collapsed" event to change the localStorage value.
            $fieldset.bind('collapsed', function(e) {
              window.localStorage[id] = !e.value;
            });
          });
        });
      }
    }
  };

  /**
   * Jump to the actual preview and the form.
   */
  if (issueForm !== null && issueForm.querySelector('.preview, table.diff') !== null) {
    window.location.hash = issueForm.id;
  }

  /**
   * Toggle issue tag descriptions.
   */
  Drupal.behaviors.projectIssueTagDescriptionToggle = {
    attach: function () {
      var link = document.querySelector('#about-tags-link:not(.project-issue-processed)'),
        descriptions;

      if (link) {
        link.classList.add('project-issue-processed');

        descriptions = link.parentElement.querySelector('#about-tags');
        descriptions.classList.toggle('element-invisible');
        link.addEventListener('click', function (e) {
          descriptions.classList.toggle('element-invisible');
          e.stopPropagation();
        });
        // Hide on click outside.
        document.addEventListener('click', function (e) {
          if (!descriptions.classList.contains('element-invisible') && !descriptions.contains(e.target)) {
            descriptions.classList.add('element-invisible');
          }
        });
      }
    }
  };

})(jQuery);

;/*})'"*/
;/*})'"*/
(function ($) {
  // Toggle Failing classes / All.
  Drupal.behaviors.piftToggle = {
    attach: function (context, settings) {
      var $checkstyleToggle = $('.pift-checkstyle-toggle:not(.pift-checkstyle-toggle-processed)', context).addClass('pift-checkstyle-toggle-processed').click(function (e) {
        $('.pift-ci-checkstyle').toggle();
        e.preventDefault();
      });
      if (location.hash && location.hash.match(/^#cs-/)) {
        $checkstyleToggle.click();
      }

      $('.pift-ci-toggle:not(.pift-ci-toggle-processed) a', context).click(function (e) {
        if (!this.classList.contains('active')) {
          var $parent = $(this).parent();
          $parent.find('a').toggleClass('active');
          $parent.siblings('.pift-ci-results').toggleClass('pift-ci-hide-all-pass');
        }
        e.preventDefault();
      }).parent().addClass('pift-ci-toggle-processed');
    }
  };

  Drupal.behaviors.piftUpload = {
    attach: function (context, settings) {
      if (settings.file && settings.file.elements) {
        $.each(settings.file.elements, function(selector) {
          var extensions = settings.file.elements[selector];
          $(selector, context).bind('change', {extensions: extensions}, Drupal.pift.fileSelected);
        });
      }
    },
    detach: function (context, settings) {
      if (settings.file && settings.file.elements) {
        $.each(settings.file.elements, function(selector) {
          $(selector, context).unbind('change', Drupal.pift.fileSelected);
        });
      }
    }
  };

  Drupal.pift = Drupal.pift || {
    fileSelected: function (event) {
      if (Drupal.settings.piftRegex) {
        // Enable “Test with” field if the file matches piftRegex.
        $(this).parent().find("select[name*='[pift]']").attr('disabled', !(new RegExp(Drupal.settings.piftRegex)).test(this.value));
        // Select Do not test if filename matches.
        if (/do[-_]not[-_]test/.test(this.value)) {
          $(this).parent().find("select[name*='[pift]']").val(0);
        }
      }
    }
  };
})(jQuery);

;/*})'"*/
;/*})'"*/
(function ($) {
  Drupal.behaviors.drupalorgSearch = {
    attach: function (context, settings) {
      $('body.page-search #content-top-region form:not(.drupalorgSearch-processed)', context).addClass('drupalorgSearch-processed').each(function () {
        var $this = $(this);
        $this.find('select').change(function () {
          $this.submit();
        });
      });
    }
  };

  /**
   * Marketplace listing pages.
   */
  Drupal.behaviors.drupalorgMarketplace = {
    attach: function () {
      $('.view-drupalorg-organizations:not(.drupalorgMarketplace-processed)').addClass('drupalorgMarketplace-processed')
        .find('ul').each(function () {
          var $showMore = $('.show-more', this).hide(),
            $showLink = $('.show-link', this),
            $hideLink = $('.hide-link', this);

          $showLink.show().click(function (e) {
            $showMore.show();
            $showLink.hide();
            $hideLink.show();
            e.preventDefault();
          });
          $hideLink.click(function (e) {
            $showMore.hide();
            $showLink.show();
            $hideLink.hide();
            e.preventDefault();
          });
        });
    }
  };

  /**
   * Randomize children, used on Hosting PaaS and Enterprise pages.
   */
  Drupal.behaviors.drupalorgRandom = {
    attach: function (context) {
      $('.drupalorg-random:not(.drupalorg-random-processed)', context).addClass('drupalorg-random-processed').each(function () {
        var $this = $(this),
          elements = $this.children().get();
        for (var j, x, i = elements.length; i; j = Math.floor(Math.random() * i), x = elements[--i], elements[i] = elements[j], elements[j] = x);
        $this.html(elements);
      });
    }
  };

  /**
   * Load block content from other sites.
   */
  Drupal.behaviors.drupalorgBlockLoad = {
    attach: function () {
      var $block = $('#drupalorg-security-issues-placeholder');
      if ($block.length > 0) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', 'https://security.drupal.org/dofeed', true);
        xhr.withCredentials = true;
        xhr.onload = function () {
          $block.parent().html(this.responseText);
        };
        xhr.send();
      }
    }
  };

  /**
   * Code to run after the document is ready.
   */
  $(document).ready(function () {
    var $body = $('body');

    // Comment attribution display. This is a global bind and must only be ran
    // once.
    $body.bind('click', function (e) {
      var $clicked = $('.attribution', $(e.target).filter('.attribution-label')).toggleClass('element-invisible');
      $('.attribution-label .attribution').not($clicked).addClass('element-invisible');
    })
    .bind('touchstart', function (e) {
      $('.attribution-label .attribution').not($('.attribution', $(e.target).filter('.attribution-label'))).addClass('element-invisible');
    })
    .bind('state:visible', function (e) {
      // Focus the newly-visible element, if the focus-on-visible class is set.
      // Wait a millisecond because the clicked element may want the focus.
      if (e.target.classList.contains('focus-on-visible')) {
        window.setTimeout(function () {e.target.focus();}, 1);
      }
    });
    // For potential link GA event tracking. Attach mousedown, keyup,
    // touchstart events to document only and catch clicks on all elements.
    // Based on googleanalytics.js.
    if (typeof Drupal.googleanalytics !== 'undefined') {
      $body.bind('mousedown keyup touchstart', function(event) {
        // Catch the closest surrounding link of a clicked element.
        $(event.target).closest('a,area').each(function() {
          var $this = $(this);

          // Is the clicked URL internal?
          if (Drupal.googleanalytics.isInternal(this.href)) {
            // Look for interesting classes.
            for (var c in {'page-up':0, 'page-previous':0, 'page-next':0, 'upload-button':0, 'issue-button':0}) {
              if (this.classList.contains(c)) {
                ga('send', 'event', 'Navigation', 'Click on ' + c, $this.text());
                return;
              }
            }
            // Look for parents with interesting classes.
            for (var c in {
              '.book-navigation':0, '#block-book-navigation':0, // Book navigation
              '#nav-content':0, '.breadcrumb':0, '.tabs.primary':0, // General navigation
              '#project-issue-jumplinks':0, // Issue pages
              '#block-versioncontrol-project-project-maintainers':0, '#block-project-issue-issue-cockpit':0, // Project pages
              '#block-drupalorg-project-resources':0, '#block-drupalorg-project-development':0,
              '.project-info':0, '.view_all_releases':0, '.add_new_release':0, '.administer_releases':0
            }) {
              if ($this.parents(c).length) {
                ga('send', 'event', 'Navigation', 'Click on ' + c, $this.text());
                return;
              }
            }
          }
          else { // External link.
            // Look for interesting classes.
            for (var c in {'cke_button':0}) {
              if (this.classList.contains(c)) {
                ga('send', 'event', 'Navigation', 'Click on ' + c, $this.text());
                return;
              }
            }
            // Look for parents with interesting classes.
            for (var c in {
              // Membership campaign.
              '#block-drupalorg-membership-campaign':0
            }) {
              if ($this.parents(c).length) {
                ga('send', 'event', 'Navigation', 'Click on ' + c, $this.text());
                return;
              }
            }
          }
        });
      });
    }
  });

  /**
   * Issue comment attribution. See drupalorg_form_node_form_alter();
   */
  Drupal.behaviors.drupalorgIssueCommentAttribution = {
    attach: function (context) {
      // Comment attribution form.
      $('.group-issue-attribution', context).once('drupalorg-issue-comment-attribution', function () {
        var $fieldset = $(this),
          $summary = $(Drupal.settings.drupalOrg.defaultCommentAttribution),
          $notVolunteer = $('.field-name-field-attribute-as-volunteer .form-checkbox[value=0]', $fieldset),
          $attributeContributionTo = $('.field-name-field-attribute-contribution-to', $fieldset).attr('tabindex', 0).hide(),
          $attributeContributionToFields = $('input', $attributeContributionTo).change(function (e) {
            if (e.target.checked) {
              $notVolunteer.attr('checked', 'checked');
            }
          }),
          $summaryOrganization = $('.organization', $summary).click(function (e) {
            // Position & show bubble.
            $attributeContributionTo.css({
              'left': Math.max(0, $summaryOrganization.position().left + ($summaryOrganization.outerWidth() - $attributeContributionTo.outerWidth()) / 2) + 'px',
              'top': $summaryOrganization.position().top + $summaryOrganization.outerHeight() + 'px'
            }).show();
            $('.field-name-field-attribute-contribution-to button').focus();
            e.preventDefault();
          }),
          $forCustomer = $('.field-name-field-for-customer', $fieldset).attr('tabindex', 0).hide(),
          $forCustomerField = $('.form-text', $forCustomer).change(function (e) {
            if (e.target.value !== '') {
              $notVolunteer.attr('checked', 'checked');
            }
          }),
          $customerSuggestions = $('.customer-suggestion', $forCustomer).click(function (e) {
            // Add clicked suggestion.
            var newValue = $forCustomerField.val();
            if (newValue.length) {
              newValue += ', ';
            }
            $forCustomerField.val(newValue + $(e.target).data('string')).trigger('change');
            e.preventDefault();
          }),
          $summaryCustomer = $('.customer', $summary).click(function (e) {
            // Position & show bubble.
            $forCustomer.css({
              'left': Math.max(0, $summaryCustomer.position().left + ($summaryCustomer.outerWidth() - $forCustomer.outerWidth()) / 2) + 'px',
              'top': $summaryCustomer.position().top + $summaryCustomer.outerHeight() + 'px'
            }).show();
            $('.field-name-field-for-customer button').focus();
            e.preventDefault();
          });

        // Hide bubbles on clicks outside.
        $('body').click(function (e) {
          if ($summaryOrganization.get(0) !== e.target) {
            $attributeContributionTo.hide();
            // If an element in the bubble was the target, return focus to summary.
            if ($(e.target).parents().get().indexOf($attributeContributionTo.get(0)) !== -1) {
              $summaryOrganization.focus();
            }
          }
          if ($summaryCustomer.get(0) !== e.target && $forCustomerField.get(0) !== e.target) {
            $forCustomer.hide();
            // If an element in the bubble was the target, return focus to summary.
            if ($customerSuggestions.get().indexOf(e.target) !== -1) {
              $summaryCustomer.focus();
            }
          }
        });
        // … and focuses.
        $('input, textarea').focus(function (e) {
          if ($attributeContributionToFields.get().indexOf(e.target) === -1 && $forCustomerField.get(0) !== e.target) {
            $attributeContributionTo.hide();
            $forCustomer.hide();
          }
        });
        // … and close buttons.
        $('button', $fieldset).click(function (e) {
          $attributeContributionTo.hide();
          $forCustomer.hide();
          e.preventDefault();
        });

        // Summary text.
        $notVolunteer.siblings('label').empty().prepend($summary);
        $fieldset.drupalSetSummary(function () {}).bind('summaryUpdated', function () {
          var $organizations = $('input:checked + label', $attributeContributionTo),
            customers = $forCustomerField.val();
          if ($organizations.length) {
            $summaryOrganization.text($organizations.map(function () {
              return $.trim($(this).text());
            }).get().join(', '));
          }
          else {
            $summaryOrganization.text(Drupal.t('not applicable'));
          }
          $customerSuggestions.show();
          if (customers.length) {
            $summaryCustomer.text(customers.replace(/ \(\d+\)/g, ''));
            // Hide taken suggestions.
            $.each(customers.split(','), function (index, value) {
              if (value.match(/.*\(\d+\)\s*/)) {
                $customerSuggestions.filter('[data-string*="' + value.replace(/.*\((\d+)\)[\s"]*/, '$1') + '"]').hide();
              }
            });
          }
          else {
            $summaryCustomer.text(Drupal.t('not applicable'));
          }
        });
      });
    }
  };

  /**
   * Issue credit helping. See drupalorg_issue_credit_form().
   */
  Drupal.behaviors.drupalorgIssueCredit = {
    attach: function (context) {
      $('#drupalorg-issue-credit-form', context).once('drupalorg-issue-credit', function () {
        $('>legend', this).after('<div class="credit-summary"></div>');

        // Store command template.
        Drupal.settings.drupalorgIssueCreditTemplate = $('textarea[name=command]', this).val();
        Drupal.settings.drupalorgIssueCreditMessageTemplate = $('textarea[name=command-message]', this).val();

        // Attach event handlers.
        $('input[name=message]', this).keyup(Drupal.drupalorgUpdateIssueCredit);
        $('input[type=checkbox][id^=by-]', this).change(Drupal.drupalorgUpdateIssueCredit);
        $('input[name=author]', this).change(Drupal.drupalorgUpdateIssueCredit);
        $('input[name=add_credit]', this).change(Drupal.drupalorgUpdateIssueCredit);
        $('textarea[name=command], textarea[name=command-message]', this).click(function () {
          $(this).select();
        });

        // Initially fill out field.
        Drupal.drupalorgUpdateIssueCredit();
      });
    }
  };

  Drupal.drupalorgUpdateIssueCredit = function () {
    var $author = $('#drupalorg-issue-credit-form input[name=author]:checked'),
      addCredit = $('#drupalorg-issue-credit-form input[name=add_credit]').val(),
      message = $('#drupalorg-issue-credit-form input[name=message]').val(),
      byHtml = [];

    $('#drupalorg-issue-credit-form #by-' + $author.val()).attr('checked', 'checked');

    // Collect names for 'by …'
    var by = [];
    $('#drupalorg-issue-credit-form input[type=checkbox][id^=by-]' + (Drupal.settings.drupalOrg.isMaintainer ? ':checked' : '.saved-by-maintainer')).each(function () {
      var $this = $(this);
      if (by.indexOf($this.data('by')) === -1) {
        by.push($this.data('by'));
      }
      byHtml.push($.trim($this.next('label').html()));
    });
    if (typeof addCredit !== 'undefined' && addCredit !== '') {
      by = by.concat(addCredit.split(',').map($.trim));
    }

    // Fill out template. It has already been translated server-side.
    $('#drupalorg-issue-credit-form textarea[name=command]').val(Drupal.formatString(Drupal.settings.drupalorgIssueCreditTemplate, {
      '!message': message.replace(/'/g, "'\\''"),
      '!by': (by.length > 0 ? ' by ' + by.join(', ') : '').replace(/'/g, "'\\''"),
      '!author': $author.data('author').replace(/'/g, "'\\''")
    }));
    $('#drupalorg-issue-credit-form textarea[name=command-message]').val(Drupal.formatString(Drupal.settings.drupalorgIssueCreditMessageTemplate, {
      '!message': message,
      '!by': (by.length > 0 ? ' by ' + by.join(', ') : '')
    }));

    // Fill out credit summary.
    if (Drupal.settings.drupalOrg.isMaintainer) {
      if (byHtml.length) {
        $('#drupalorg-issue-credit-form .credit-summary').html(Drupal.t('<strong>Giving credit to</strong> !credits', {'!credits': byHtml.join(', ')}));
      }
      else {
        $('#drupalorg-issue-credit-form .credit-summary').html(Drupal.t('Expand and select contributors to give credit.'));
      }
    }
    else {
      if (byHtml.length) {
        if (Drupal.settings.drupalOrg.isFixed) {
          $('#drupalorg-issue-credit-form .credit-summary').html(Drupal.t('<strong>Credit given to</strong> !credits', {'!credits': byHtml.join(', ')}));
        }
        else {
          $('#drupalorg-issue-credit-form .credit-summary').html(Drupal.t('<strong>Draft credit given to</strong> !credits<br><small><em>Credit is assigned when maintainers comment, and granted when the issue is fixed.</em></small>', {'!credits': byHtml.join(', ')}));
        }
      }
      else {
        $('#drupalorg-issue-credit-form .credit-summary').html(Drupal.t('A maintainer has not commented and given credit yet.'));
      }
    }
  };

  Drupal.behaviors.drupalorgConfirm = {
    attach: function() {
      if (typeof(ga) !== 'function') {
        // Wait for GA load.
        setTimeout(Drupal.behaviors.drupalorgConfirm.attach, 1000);
        return;
      }

      $('.confirm-button-form').each(function () {
        // Send GA event if confirm form shown.
        ga('send', 'event', 'User confirm', 'Form shown');
      })
      .find('.form-submit').bind('mousedown keyup touchstart', function(event) {
        // Send GA event on click.
        ga('send', 'event', 'User confirm', 'Click', event.target.getAttribute('value'));
      });
    }
  };

  Drupal.behaviors.drupalorgSurveyBlock = {
    attach: function(context) {
      $('#block-drupalorg-documentation-survey', context).once('drupalorg-documentation-survey', function () {
        var $container = $(this),
          $frame = $('iframe', this).hide();
        $('.action-button', this).show().click(function () {
          $(this).hide();
          $frame.show();
          var interval = setInterval(function () {
            if (/thanks/.exec($frame.get(0).contentWindow.location.href)) {
              clearInterval(interval);
              $container.hide();
            }
          }, 5000);
        });
      });
    }
  };

  /**
   * Prevent multiple submits.
   */
  Drupal.behaviors.drupalorgPreventMultipleSubmit = {
    attach: function(context, settings) {
      if ($('form.prevent-multiple-submit-form').length) {
        $('body').once('multisub').delegate('form.prevent-multiple-submit-form', 'submit.formSubmitSingle', $.onFormSubmitSingle);
      }
    }
  };

  /**
   * “View file hashes” toggles on release pages.
   */
  Drupal.behaviors.drupalorgReleaseHashes = {
    attach: function (context) {
      $('.view-display-id-release_files_pane', context).once('drupalorgReleaseHashes', function () {
        var hashes = {},
          $filesPane = $(this);

        // Find hash types.
        $('.hash', this).parent().each(function () {
          var label = $('.views-label', this).text().replace(/: $/, '');
          $.each(this.classList, function () {
            if (this.match(/^views-field-field/)) {
              hashes[this] = label;
            }
          });
        });

        if (!$.isEmptyObject(hashes)) {
          var links = [],
            localStorage = 'localStorage' in window && typeof window.localStorage !== 'undefined' && window['localStorage'] !== null,
            $links;

          // Add “View file hashes” toggles.
          $.each(hashes, function (key, value) {
            links.push('<a href="javascript:void(0)" class="show-' + key + '">' + value + '</a>');
          });
          $links = $filesPane.parents('.panel-layout').find('.view-display-id-release_info_pane .views-row-last')
          .append('<div class="release-hash-links"><span class="views-label">' + Drupal.t('View file hashes: ') + '</span><span>' + links.join(', ') + '</span></div>')
          .find('a').click(function () {
            var $this = $(this);

            // Clear any existing classes.
            $.each(hashes, function (key, value) {
              $filesPane.removeClass('show-' + key);
            });
            $this.parents('.release-hash-links').find('.active').not($this).removeClass('active');

            // Toggle this link and update classes.
            if ($this.toggleClass('active').hasClass('active')) {
              $filesPane.removeClass('no-hashes').addClass(this.classList[0]);
              if (localStorage) {
                window.localStorage['drupalorgReleaseHashes'] = this.classList[0];
              }
            }
            else {
              $filesPane.addClass('no-hashes');
              if (localStorage) {
                window.localStorage.removeItem('drupalorgReleaseHashes');
              }
            }
          });
          if (localStorage && (typeof window.localStorage['drupalorgReleaseHashes'] !== 'undefined')) {
            $links.filter('.' + window.localStorage['drupalorgReleaseHashes']).click();
          }
        }
      });
    }
  };

  Drupal.behaviors.drupalorgMenu = {
    attach: function (context) {
      $('fieldset.menu-link-form', context).each(function () {
        var $link_title = $('.form-item-menu-link-title input', context);
        var $title = $(this).closest('form').find('.form-item-title input');
        // Bail out if we do not have all required fields.
        if (!($link_title.length && $title.length)) {
          return;
        }
        // More-agressively keep the titles consistent.
        $title.focus(function () {
          $link_title.removeData('menuLinkAutomaticTitleOveridden');
        });
      });
    }
  };

  Drupal.behaviors.projectPage = {
    attach: function (context) {
      // Hide all but the first download table headers.
      var list = document.querySelectorAll('.view-project-release-download-table thead');
      for (var i = 1; i < list.length; i++) {
        list[i].style.display = 'none';
      }
    }
  };

  Drupal.behaviors.hosting = {
    attach: function (context) {
      var block = document.getElementById('block-drupalorg-hosting-filter');
      if (block === null || block.classList.contains('drupalorg-processed')) {
        return;
      }
      block.classList.add('drupalorg-processed');
      // Hide non-present terms.
      var listings = document.querySelectorAll('.view-id-hosting li'),
        classes = [],
        links = block.querySelectorAll('.filter a');
      for (var i = 0; i < listings.length; i += 1) {
        for (var j = 0; j < listings[i].classList.length; j += 1) {
          classes.push(listings[i].classList.item(j));
        }
      }
      for (var i = 0; i < links.length; i += 1) {
        for (var j = 0; j < links[i].classList.length; j += 1) {
          if (/^term-/.test(links[i].classList.item(j))) {
            if (classes.indexOf(links[i].classList.item(j)) < 0) {
              links[i].parentElement.classList.add('element-invisible');
            }
            break;
          }
        }
      }
      // Override links.
      block.addEventListener('click', function (e) {
        var match, reallyActive, classes = [], show, matched, remaining = [];
        for (var i = 0; i < e.target.classList.length; i += 1) {
          if (/^term-/.test(e.target.classList.item(i))) {
            e.target.classList.toggle('really-active');
            // Find all active classes.
            reallyActive = block.querySelectorAll('.really-active');
            for (var j = 0; j < reallyActive.length; j += 1) {
              for (var k = 0; k < reallyActive[j].classList.length; k += 1) {
                if (/^term-/.test(reallyActive[j].classList.item(k))) {
                  classes.push(reallyActive[j].classList.item(k));
                  break;
                }
              }
            }
            for (var j = 0; j < listings.length; j += 1) {
              if (classes.length > 0) {
                // Filter list.
                matched = 0;
                for (var k = 0; k < listings[j].classList.length; k += 1) {
                  matched += classes.indexOf(listings[j].classList.item(k)) >= 0;
                }
                show = matched === classes.length;
              }
              else {
                // Show all.
                show = true;
              }
              if (show) {
                listings[j].classList.remove('element-invisible');
                for (var k = 0; k < listings[j].classList.length; k += 1) {
                  if (classes.indexOf(listings[j].classList.item(k)) === -1 && remaining.indexOf(listings[j].classList.item(k)) === -1) {
                    remaining.push(listings[j].classList.item(k))
                  }
                }
              }
              else {
                listings[j].classList.add('element-invisible');
              }
            }
            // Disable checkboxes that would diminish the remaining hosts to zero.
            for (var i = 0; i < links.length; i += 1) {
              if (links[i].parentElement.classList.contains('element-invisible')) {
                continue;
              }
              for (var j = 0; j < links[i].classList.length; j += 1) {
                if (/^term-/.test(links[i].classList.item(j))) {
                  if (remaining.indexOf(links[i].classList.item(j)) >= 0) {
                    links[i].classList.remove('disabled');
                  }
                  else {
                    links[i].classList.add('disabled');
                  }
                  break;
                }
              }
            }
            e.preventDefault();
            return;
          }
        }
      });
    }
  };

  Drupal.behaviors.editProfileShowOnComments = {
    attach: function(context) {
      if (body = document.querySelector('.page-user-edit:not(editProfileShowOnComments-processed)')) {
        body.classList.add('editProfileShowOnComments-processed');
        body.addEventListener('click', function (e) {
          if (e.target.classList.contains('show-comment-tab')) {
            e.preventDefault();
            $('#edit-group_user_comments').data('verticalTab').focus();
          }
        });
      }
    }
  };

  /**
   * Display a warning message if an organization name does not match exactly.
   */
  Drupal.behaviors.orgName = {
    attach: function (context, settings) {
      var orgs;

      if ((orgs = document.getElementById('edit-field-organizations')) && !orgs.classList.contains('processed')) {
        orgs.classList.add('processed');
        orgs.addEventListener('focusout', function (e) {
          if (e.target.attributes['name'] !== undefined && /\[field_organization_name]/.test(e.target.attributes['name'].value)) {
            $.ajax({
              url: Drupal.settings.basePath + 'api-d7/node.json',
              data: {
                type: 'organization',
                title: e.target.value
              },
              success: function (result) {
                e.target.parentNode.parentNode.parentNode.parentNode.getElementsByClassName('warning')[0].classList.toggle('element-hidden', result.list.length !== 0);
              }
            });
          }
        });
      }
    }
  };

  Drupal.drupalorgStorageAvailable = function (type) {
    var storage;
    try {
      storage = window[type];
      var x = '__storage_test__';
      storage.setItem(x, x);
      storage.removeItem(x);
      return true;
    }
    catch(e) {
      return e instanceof DOMException && (
        // everything except Firefox
        e.code === 22 ||
        // Firefox
        e.code === 1014 ||
        // test name field too, because code might not be present
        // everything except Firefox
        e.name === 'QuotaExceededError' ||
        // Firefox
        e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
        // acknowledge QuotaExceededError only if there's something already stored
        (storage && storage.length !== 0);
    }
  };

  Drupal.drupalorgFocusFirstDescendant = function (element) {
    for (var i = 0; i < element.childNodes.length; i++) {
      var child = element.childNodes[i];
      if (Drupal.drupalorgAttemptFocus(child) || Drupal.drupalorgFocusFirstDescendant(child)) {
        return true;
      }
    }
    return false;
  };

  Drupal.drupalorgFocusLastDescendant = function (element) {
    for (var i = element.childNodes.length - 1; i >= 0; i--) {
      var child = element.childNodes[i];
      if (Drupal.drupalorgAttemptFocus(child) || Drupal.drupalorgFocusLastDescendant(child)) {
        return true;
      }
    }
    return false;
  };

  Drupal.DrupalorgIgnoreUtilFocusChanges = false;
  Drupal.drupalorgAttemptFocus = function (element) {
    if (!Drupal.drupalorgIsFocusable(element)) {
      return false;
    }

    Drupal.DrupalorgIgnoreUtilFocusChanges = true;
    try {
      element.focus();
    }
    catch (e) { }
    Drupal.DrupalorgIgnoreUtilFocusChanges = false;
    return (document.activeElement === element);
  };

  Drupal.drupalorgIsFocusable = function (element) {
    if (element.tabIndex > 0 || (element.tabIndex === 0 && element.getAttribute('tabIndex') !== null)) {
      return true;
    }

    if (element.disabled) {
      return false;
    }

    switch (element.nodeName) {
      case 'A':
        return !!element.href && element.rel != 'ignore';

      case 'INPUT':
        return element.type != 'hidden' && element.type != 'file';

      case 'BUTTON':
      case 'SELECT':
      case 'TEXTAREA':
        return true;

      default:
        return false;
    }
  };
})(jQuery);

;/*})'"*/
;/*})'"*/
