(function () {
  'use strict';

  window.addEventListener('DOMContentLoaded', function (event) {
    var curtain = document.getElementById('block-drupalorg-site-curtain'),
      lastCurtainFocus = null,
      trapCurtainFocus = function (e) {
        if (Drupal.DrupalorgIgnoreUtilFocusChanges) {
          return;
        }
        if (curtain.contains(e.target)) {
          lastCurtainFocus = e.target;
        }
        else {
          Drupal.drupalorgFocusFirstDescendant(curtain);
          if (lastCurtainFocus == document.activeElement) {
            Drupal.drupalorgFocusLastDescendant(curtain);
          }
          lastCurtainFocus = document.activeElement;
        }
      },
      handleEscape = function (e) {
        if ((e.which || e.keyCode) === 27) {
          curtain.querySelector('.close button').click();
          e.stopPropagation();
        }
      };

    // Show site curtain when present, and local storage is available.
    if (curtain !== null && Drupal.drupalorgStorageAvailable('localStorage') && localStorage.getItem('curtain') !== Drupal.settings.drupalorgSiteCurtainDismissed) {
      curtain.addEventListener('click', function (e) {
        var target = e.target;
        while (target.tagName !== 'A' && target.tagName !== 'BUTTON' && target !== curtain) {
          target = target.parentNode;
        }
        if (target !== curtain) {
          // Dismiss the curtain.
          localStorage.setItem('curtain', Drupal.settings.drupalorgSiteCurtainDismissed);
          curtain.classList.remove('visible');
          document.getElementById('skip-link').focus();
          document.removeEventListener('focus', trapCurtainFocus, true);
          document.removeEventListener('keyup', handleEscape);
        }
      });
      document.addEventListener('focus', trapCurtainFocus, true);
      document.addEventListener('keyup', handleEscape);
      curtain.classList.add('visible');
      document.getElementById('block-drupalorg-site-curtain-heading').focus();
    }
  });
})();

;/*})'"*/
;/*})'"*/
