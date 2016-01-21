# Flowplayer quality selector plugin

This plugin adds manual video quality selection to Flowplayer HTML5.

## Usage

See: https://flowplayer.org/docs/plugins.html#quality-selector

- [prerequisites](https://flowplayer.org/docs/plugins.html#quality-selector-prerequisites)
- [loading the assets](https://flowplayer.org/docs/plugins.html#quality-selector-assets)
- [configuration](https://flowplayer.org/docs/plugins.html#quality-selector-configuration)

## Demos

- [quality selector with video from Flowplayer Drive](https://flowplayer.org/demos/qsel/)
- [quality selector outside Drive](http://demos.flowplayer.org/scripting/drive-qsel.html)

## Contributing

To build the plugin:

 * `npm install` - install dependencies
 * `npm run styl` - generate css for the widget
 * `npm run min` - generate the minified file

## Compatibility

The plugin requires Flowplayer HTML5 version 6.0.0 or greater.

With version 5.x load the following assets (no longer developed):

```html
<link rel="stylesheet" href="//flowplayer.org/drive/quality-selector.css">

<!-- ... -->

<script src="//flowplayer.org/drive/quality-selector.js"></script>
```
