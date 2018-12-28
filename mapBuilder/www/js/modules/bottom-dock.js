// Hide/show bottom dock on hover out/in (with small delay)
export default $(function() {
    var lizBottomDockTimer;
    var lizBottomDockTimeHoverOut = 100;
    var lizBottomDockTimeHoverIn = 50;
    // if( 'bottomDockTimeHoverOut' in lizMap.config.options )
    //   lizBottomDockTimeHoverOut = lizMap.config.options.bottomDockTimeHoverOut;
    // if( 'bottomDockTimeHoverIn' in lizMap.config.options )
    //   lizBottomDockTimeHoverIn = lizMap.config.options.bottomDockTimeHoverIn;

    $('#bottom-dock').hover(
      // hover in
      function() {
        if(lizBottomDockTimer) {
            clearTimeout(lizBottomDockTimer);
            lizBottomDockTimer = null;
        }
        $(this).removeClass('half-transparent');
        lizBottomDockTimer = setTimeout(function() {
          showBottomDockContent();
          return false;
        }, lizBottomDockTimeHoverIn);
      },
      // mouse out
      function(){
        if(lizBottomDockTimer) {
            clearTimeout(lizBottomDockTimer);
            lizBottomDockTimer = null;
        }
        $(this).addClass('half-transparent');
        lizBottomDockTimer = setTimeout(function() {
          // if ( !bottomDockGlued &&!lizMap.checkMobile()){
            hideBottomDockContent();
          // }
          return false;
        }, lizBottomDockTimeHoverOut);
      }
    );

    function showBottomDockContent(){
      $('#bottom-dock').addClass('visible');
      return false;
    }
    function hideBottomDockContent(){
      $('#bottom-dock').removeClass('visible').focus();
      return false;
    }

    $('#hideBottomDock').on("click", function(){
      $('#bottom-dock').hide();
      $('.bottom-dock').removeClass('active');
    });
});
