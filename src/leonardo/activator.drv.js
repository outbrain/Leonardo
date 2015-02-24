function activatorDirective($compile) {
  return {
    restrict: 'A',
    link: function(scope, elem) {
      var el = $('<div ng-click="activate()" class="leonardo-activator"></div>');

      var win = $([
      '<div class="leonardo-window">',
        '<div class="leonardo-header">Leonardo Configuration</div>',
          '<window-body></window-body>',
        '</div>',
      '</div>'
      ].join(''));

      $compile(el)(scope);
      $compile(win)(scope);

      $(elem).append(el);
      $(elem).append(win);

      win[0].addEventListener( 'webkitTransitionEnd', function() {
        if (!document.body.classList.contains('pull-top')){
          document.body.classList.add("pull-top-closed");
        }
      }, false );

      scope.activate = function(){
        if (!document.body.classList.contains('pull-top')) {
          document.body.classList.add('pull-top');
          document.body.classList.remove('pull-top-closed');
        }
        else {
          document.body.classList.remove('pull-top');
        }
      };
    }
  };
}

export default activatorDirective