/*
 * User-guide clips (<video> inside a .vy-shot figure). They carry no autoplay attribute: this script
 * plays each one while it is on screen and pauses it when it scrolls away, and leaves every clip on
 * its first frame, with its controls, for a reader whose system asks for reduced motion. Without
 * JavaScript the controls still work.
 */
(function () {
  var clips = document.querySelectorAll('.vy-shot video');
  if (!clips.length) return;
  var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (still || !('IntersectionObserver' in window)) return;
  var seen = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) e.target.play().catch(function () {});
      else e.target.pause();
    });
  }, { threshold: 0.3 });
  clips.forEach(function (v) { v.muted = true; seen.observe(v); });
})();
