(function(){
  const nav = document.querySelector('.navbar, #navbar');
  if (nav) {
    const setPadding = () => document.body.style.paddingTop = `${nav.offsetHeight}px`;
    setPadding();
    window.addEventListener('resize', setPadding);
  }
})()

// ...existing code...
(function(){
  function init(){
    const nav = document.querySelector('.navbar, #navbar');
    if (!nav) return;
    const setPadding = () => document.body.style.paddingTop = `${nav.offsetHeight}px`;
    setPadding();
    window.addEventListener('resize', setPadding);
    if ('ResizeObserver' in window) {
      const ro = new ResizeObserver(setPadding);
      ro.observe(nav);
    } else {
      let last = nav.offsetHeight;
      setInterval(() => {
        if (nav.offsetHeight !== last) { last = nav.offsetHeight; setPadding(); }
      }, 300);
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
// ...existing code...