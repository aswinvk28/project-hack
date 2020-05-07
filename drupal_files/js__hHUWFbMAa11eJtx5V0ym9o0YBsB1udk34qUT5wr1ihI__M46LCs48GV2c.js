(function ($) {
  $(document).ready(function() {
    var windowsize = $(window).width(),
      contentWidth = $('#content').width();
    var machineName = $("#banner").find('.cta a').attr('class');
    var storage = localStorage.getItem(machineName);

    if (storage != 'closed') {
      $("#banner").css('display', 'block').prepend( "<a class='close'>Close</a>" );
      $(".close").click(function() {
        $('#banner').hide();
        localStorage.setItem(machineName, 'closed');
      });
    }

    if ($('body.drupalorg-site-api').length) {
      var $apiFunctionSignature = $('#api-function-signature'),
        apiFunctionSignatureWidth = $apiFunctionSignature.width();

      if (apiFunctionSignatureWidth > contentWidth || (apiFunctionSignatureWidth < 500 && apiFunctionSignatureWidth === contentWidth)) {
        $apiFunctionSignature.addClass('mobile-table');
      }

      // Use mobile tables for narrow views tables.
      $('table.views-table').each(function() {
        var $this = $(this);
        if ($this.width() < 500 && $this.width() === contentWidth) {
          $this.addClass('mobile-table');
        }
      });
    }
    else {
      $('table').not('#forum table').not('.page-user-track table').not('#project-usage-project-releases').each(function() {
        var $this = $(this);

        if ($this.parents('#drupalorg-issue-credit-form').length) {
          // Do not use mobile tables for Credit & Comitting.
          return;
        }

        if (this.id === 'project-usage-project-api') {
          // Do not use mobile tables on project usage.
          return;
        }

        if ($this.hasClass('project-issue') && windowsize >= 760) {
          // Do not use mobile tables issue tables on wider screens.
          return;
        }

        // If the table is wider than the width of the window.
        if ($this.width() > windowsize) {
          $this.addClass('mobile-table');
        }
      });
    }

    if ($('body.node-type-guide').length || $('body.node-type-documentation').length) {
      $("#tabs").addClass('js');
      $("#tabs ul li:first-child").prepend( "<span class='toggle'>Toggle</span>" );
      $(".toggle").click(function() {
        $('#tabs').toggleClass('clicked')
      });
    }

    // Main navigation menu accessibility.
    $('#navigation-inner .button > a, #navigation-inner .expanded > a:first-child').focus(function (e) {
      // Delay to reduce double-triggering with click event.
      setTimeout(function () {
        e.target.parentElement.classList.add('menu-expanded');
      }, 100);
    }).click(function (e) {
      e.target.parentElement.classList.toggle('menu-expanded');
      e.preventDefault();
    }).parent().find('a').andSelf().blur(function () {
      // Wait for next element to gain focus.
      setTimeout(function () {
        var trigger = document.querySelector('#navigation-inner .menu-expanded');
        // Check if focused element is still in the expanded menu.
        if (trigger !== null && !trigger.contains(document.activeElement)) {
          trigger.classList.remove('menu-expanded');
        }
      }, 10);
    });

    // Click to expand search.
    $('#search-block-form').submit(function (e) {
      var $header = $(this).parents('#nav-header');
      if (!$header.hasClass('search-expanded')) {
        $header.addClass('search-expanded');
        this.querySelector('input[type="text"]').focus();
        e.preventDefault();
      }
    }).find('input').blur(function () {
      // Wait for next element to gain focus.
      setTimeout(function () {
        var trigger = document.querySelector('#nav-header.search-expanded');
        // Check if focused element is still in the expanded menu.
        if (trigger !== null && !trigger.querySelector('#search-block-form').contains(document.activeElement)) {
          trigger.classList.remove('search-expanded');
        }
      }, 150);
    });
    // Skip to search a11y link.
    $('.skip-link-search').click(function (e) {
      $('#search-block-form').submit();
      e.preventDefault();
    });

    // Accordion.
    document.querySelectorAll('.accordion > h3').forEach(function (header) {
      var content = header.nextElementSibling,
        id = header.getAttribute('id'),
        contentId = id + '-content';

      header.parentNode.classList.add('accordion-processed');
      content.setAttribute('id', contentId);
      content.setAttribute('hidden', '');
      header.innerHTML = '<button aria-expanded="false" aria-controls="' + Drupal.checkPlain(contentId) + '">' + header.innerHTML + '</button>';
      header.querySelector('button').addEventListener('click', function (e) {
        if (e.target.getAttribute('aria-expanded') === 'true') {
          e.target.setAttribute('aria-expanded', 'false');
          e.target.parentNode.nextElementSibling.setAttribute('hidden', '');
        }
        else {
          e.target.setAttribute('aria-expanded', 'true');
          e.target.parentNode.nextElementSibling.removeAttribute('hidden');
          history.replaceState(null, null, '#' + e.target.parentNode.getAttribute('id'));
        }
      });

      // Expand if linked to with hash.
      if (window.location.hash === '#' + id) {
        header.querySelector('button').click();
      }
    });
  });
})(jQuery);

;/*})'"*/
;/*})'"*/
