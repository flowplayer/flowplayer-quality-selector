/*!

   Flowplayer HTML5 quality selector plugin

   Copyright (c) 2016, Flowplayer Oy

   Released under the MIT License:
   http://www.opensource.org/licenses/mit-license.php

   revision: $GIT_ID$

*/

(function () {
  'use strict';
  var extension = function(flowplayer) {
    flowplayer(function(api, root) {
      var bean = flowplayer.bean
       ,  common = flowplayer.common
       ,  explicitSrc = false
       ,  hlsjs = false;

      if (api.conf.hlsjs !== false) {
          flowplayer.engines.forEach(function (engine) {
              if (engine.engineName === 'hlsjs' && engine.canPlay('application/x-mpegurl', api.conf)) {
                  hlsjs = true;
              }
          });
      }

      //only register once
      if (api.pluginQualitySelectorEnabled) return;
      api.pluginQualitySelectorEnabled = true;

      if (!flowplayer.support.inlineVideo) return; // No inline video

      if (api.conf.qualities) {
        api.conf.qualities = typeof api.conf.qualities === 'string' ? api.conf.qualities.split(',') : api.conf.qualities;
      }

      bean.on(root, 'click', '.fp-quality-selector li', function(ev) {
        var elem = ev.currentTarget;
        if (!common.hasClass(elem, 'active')) {
          var currentTime = api.finished ? 0 : api.video.time
           ,  quality = elem.getAttribute('data-quality')
           ,  src;
          src = processClip(api.video, quality);
          api.quality = quality;
          if (!src) return;
          explicitSrc = true;
          if (hlsjs && src.hlsjs !== false && !api.live && currentTime && quality === 'abr') {
              src.hlsjs = {startPosition: currentTime};
          }
          api.load(src, function() {
            //Make sure api is not in finished state anymore
            explicitSrc = false;
            api.finished = false;
            if (currentTime && !api.live && !(src.hlsjs && src.hlsjs.startPosition)) {
              api.seek(currentTime, function() {
                api.resume();
              });
            } else if (src.hlsjs) {
              src.hlsjs.startPosition = 0;
            }
          });
        }
      });

      api.on('load', function(ev, api, video) {
        api.qualities = video.qualities || api.conf.qualities || [];
        api.defaultQuality = video.defaultQuality || api.conf.defaultQuality;
        if (typeof api.qualities === 'string') api.qualities = api.qualities.split(',');
        if (!api.quality) return; // Let's go with default quality
        var desiredQuality = findOptimalQuality(api.quality, api.qualities)
         ,  newClip = processClip(video, desiredQuality, !explicitSrc);
        if (!explicitSrc && newClip) {
          ev.preventDefault();
          api.loading = false;
          api.load(newClip);
        }

      }).on('ready', function(ev, api, video) {
        var quality = /mpegurl/i.test(video.type) ? 'abr' :  getQualityFromSrc(video.src, api.qualities) || Math.min(video.height, video.width) + 'p';
        removeAllQualityClasses();
        common.addClass(root, 'quality-' + quality);
        var ui = common.find('.fp-ui', root)[0];
        common.removeNode(common.find('.fp-quality-selector', ui)[0]);
        if (api.qualities.length < 2) return;
        api.quality = quality;
        var selector = common.createElement('ul', {'class': 'fp-quality-selector'});
        ui.appendChild(selector);
        if (hasABRSource(video) && canPlay('application/x-mpegurl') || api.conf.swfHls) {
          selector.appendChild(common.createElement('li', {'data-quality': 'abr', 'class': quality === 'abr' ? 'active' : ''}, 'Auto'));
        }
        api.qualities.forEach(function(q) {
          selector.appendChild(common.createElement('li', {'data-quality': q.quality || q, 'class': (q.quality || q) == quality ? 'active': ''}, q.quality || q));
        });

      }).on('unload', function() {
        removeAllQualityClasses();
        common.removeNode(common.find('.fp-quality-selector', root)[0]);

      });


      function hasABRSource(video) {
        return video.sources.some(function(src) {
          return /mpegurl/i.test(src.type);
        });
      }


      function canPlay(type) {
        var videoTag = document.createElement('video');
        return !!videoTag.canPlayType(type).replace('no', '');
      }

      function getQualityFromSrc(src, qualities) {
        if (typeof qualities[0] === 'object') {
          var f = /([^\/]*?)(\.([a-zA-Z0-9]*))?$/.exec(src);
          return qualities.find(function (q) { return q.src === f[1]; }).quality;
        } else {
          var m = /-(\d+p)(\.(mp4|webm))?$/.exec(src);
          if (!m) return;
          if (qualities.indexOf(m[1]) === -1) return;
          return m[1];
        }
      }

      function removeAllQualityClasses() {
        if (!api.qualities || !api.qualities.length) return;
        common.removeClass(root, 'quality-abr');
        api.qualities.forEach(function(quality) {
          common.removeClass(root, 'quality-' + (quality.quality || quality));
        });
      }

      function findOptimalQuality(previousQuality, newQualities) {
        if (previousQuality === 'abr') return 'abr';
        var a = parseInt(previousQuality, 10), ret;
        if (isNaN(a)) {
          newQualities.forEach(function (quality, i) {
            if (typeof quality === 'object') quality = quality.quality;
            if (previousQuality === quality) {
              ret = quality;
            }
          });
        } else {
          newQualities.forEach(function (quality, i) {
            if (typeof quality === 'object') quality = quality.quality;
            var nextQuality = newQualities[i + 1];
            if (typeof nextQuality === 'object') nextQuality = nextQuality.quality;
            if (parseInt(quality, 10) <= a && (parseInt(nextQuality, 10) > a || !nextQuality)) { // Is between or higher than final
              ret = quality;
            }
          });
        }
        if (!ret) ret = api.defaultQuality; // The best we can do: the default quality
        return ret;
      }

      function processClip(video, quality, clean) {
        var changed = false, re
         ,  isDefaultQuality = quality === api.defaultQuality
         ,  currentQuality = api.quality || Math.min(api.video.height, api.video.width) + 'p';
        if (currentQuality === api.defaultQuality) {
          re = /(.+?)((\.(mp4|webm)$|$))/;
        }
        else {
          re = /(-\d+p)?((\.(mp4|webm)$|$))/;
        }
        var newSources = video.sources.map(function(src) {
          if (quality === 'abr' || (clean && isDefaultQuality) || /mpegurl/i.test(src.type)) return src;
          var n = {
            type: src.type,
            src: typeof api.qualities[0] === 'object' ? 
              src.src.replace(/[^\/]*?(\.([a-zA-Z0-9]*)$|$)/, api.qualities.find(function (q) { return q.quality === quality; }).src + '$1') : 
              src.src.replace(re, currentQuality === api.defaultQuality ?
                                 '$1-' + quality + '$2' :
                                   isDefaultQuality ? '$2' : '-' + quality + '$2')
          };
          if (n.src !== src.src) changed = true;
          return n;
        });
        var newSourcesStr = JSON.stringify(newSources);
        newSources.sort(function(a, b) {
          var re = /mpegurl/i, ret;
          if (quality === 'abr') ret = re.test(b.type) - re.test(a.type);
          else ret = re.test(a.type) - re.test(b.type);
          return ret;
        });
        changed = changed || JSON.stringify(newSources) !== newSourcesStr;
        var clip = flowplayer.extend({}, video, {
          sources: newSources
        });


        return changed ? clip : false;
      }

    });
  };

  if (typeof module === 'object' && module.exports) module.exports = extension;
  else if (window.flowplayer) extension(window.flowplayer);
}());
