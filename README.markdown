remix.js
========

[The Echo Nest Remix API][echo-nest-remix] for JavaScript.

This library implements a subset of the remix API using JavaScript and Flash. It provides

 * a simple interface to load and analyze tracks using The Echo Nest’s API
 * a set of JavaScript classes to help write scripts that generate remixes using analysis data
 * a Flash player that can play generated remixes in real time

Roadmap
=======

This project currently relies on version 3 of The Echo Nest API, which is no longer supported. The `nest.js` file implements the track up load methods in JavaScript, but requires bleeding-edge browser features. The Flash API classes need to be updated to support version 4 of the API.

For browsers that support it, remix.js should run entirely in JavaScript. Currently, this is just Chrome Developer Channel. Other browsers will fall back on Flash for certain features. remix.js should make this as transparent as possible.

Running
=======

To run locally in your browser, you will need to instruct Flash to trust the
files. Use the [Global Security Settings manager][global-security-settings] to
add the folder containing the SWF to the list of trusted locations.

License
=======

Copyright 2010-2011 Ryan Berdeen. All rights reserved.  
Distributed under the terms of the MIT License.  
See accompanying file LICENSE.txt

[echo-nest-remix]: http://code.google.com/p/echo-nest-remix/
[global-security-settings]: http://www.macromedia.com/support/documentation/en/flashplayer/help/settings_manager04a.html
