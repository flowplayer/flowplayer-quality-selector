# Flowplayer quality selector plugin

This plugin adds manual video quality selection to Flowplayer HTML5.

## Usage

See: https://flowplayer.org/docs/plugins.html#quality-selector

- [prerequisites](https://flowplayer.org/docs/plugins.html#quality-selector-prerequisites)
- [loading the assets](https://flowplayer.org/docs/plugins.html#quality-selector-assets)
- [configuration](https://flowplayer.org/docs/plugins.html#quality-selector-configuration)

## Demos

- [quality selector with video from Flowplayer Drive](https://flowplayer.org/demos/qsel/)
- [quality selector outside Drive](http://demos.flowplayer.org/scripting/qsel.html)

## Building the plugin

Build requirement:

- [nodejs](https://nodejs.org) with [npm](https://www.npmjs.com)

```sh
cd flowplayer-quality-selector
make deps
make
```

## Compatibility

The plugin requires Flowplayer HTML5 version 6.0.0 or greater.

With version 5.x load the following assets (no longer developed):

```html
<link rel="stylesheet" href="//flowplayer.org/drive/quality-selector.css">

<!-- ... -->

<script src="//flowplayer.org/drive/quality-selector.js"></script>
```

## Add change selector capability

Was added change separator capability (default was a "-")

```javascript
 clip: {
    title: 'Peter Griffin Shock Suit',
    //-> change default
    separator: '_', 
    clearPath: false,
    //->quality selector plugin configuration
    qualities: ["360p", "480p", "720p"],
    //->...
 }
```
