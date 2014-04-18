/* This Source Code Form is subject to the terms of the Mozilla Public License,
v. 2.0. If a copy of the MPL was not distributed with this file, You can obtain
one at http://mozilla.org/MPL/2.0/. */

/*
* Thanks to Dave Townsend of Mozilla for his Restartless Extension framework.
*/

const Cc = Components.classes;
const Ci = Components.interfaces;

/*
* addOptionsStyle()
*
* Adjusts the TabBar according to current user preferences.
*/
function addOptionsStyle( window, prefs ) {
  let document = window.document;
  let toolbar = document.getElementById("TabsToolbar");
  
  if (document.getElementById("main-window").getAttribute("sizemode") === "maximized")
  {
    var paddingTop = prefs.getIntPref("fstabbarpaddingtop");
    var paddingRight = prefs.getIntPref("fstabbarpaddingright");
    toolbar.style.paddingTop = Math.min(paddingTop, 300) + "px";
    toolbar.style.paddingRight = Math.min(paddingRight, 700) + "px";
  };
  if (document.getElementById("main-window").getAttribute("sizemode") === "normal")
  {
    var paddingTop = prefs.getIntPref("wintabbarpaddingtop");
    var paddingRight = prefs.getIntPref("wintabbarpaddingright")
    toolbar.style.paddingTop = Math.min(paddingTop, 300) + "px";
    toolbar.style.paddingRight = Math.min(paddingRight, 700) + "px";
  };
};

/*
* removeOptionsStyle()
*
* Resets TabBar adjustments back to normal (zero padding).
*/
function removeOptionsStyle( window, prefs ) {
  let document = window.document;
  let toolbar = document.getElementById("TabsToolbar");
  toolbar.style.paddingTop = "0px";
  toolbar.style.paddingRight = "0px";
};

/*
* loadMainStyleSheet()
*
* Registers style.css with browser.xul.
*/
function loadMainStyleSheet() {
  let sss = Cc["@mozilla.org/content/style-sheet-service;1"]
            .getService(Components.interfaces.nsIStyleSheetService);
  let ios = Cc["@mozilla.org/network/io-service;1"]
            .getService(Components.interfaces.nsIIOService);
  let srcCSS = ios.newURI('chrome://lighterwtaustralis/content/style.css', null, null);
  if(!sss.sheetRegistered(srcCSS, sss.USER_SHEET)) {
      sss.loadAndRegisterSheet(srcCSS, sss.USER_SHEET);
  };
};

/*
* unloadMainStyleSheet()
*
* Unregisters style.css with browser.xul.
*/
function unloadMainStyleSheet() {
  let sss = Cc["@mozilla.org/content/style-sheet-service;1"]
            .getService(Components.interfaces.nsIStyleSheetService);
  let ios = Cc["@mozilla.org/network/io-service;1"]
            .getService(Components.interfaces.nsIIOService);
  let srcCSS = ios.newURI('chrome://lighterwtaustralis/content/style.css', null, null);
  if(sss.sheetRegistered(srcCSS, sss.USER_SHEET)) {
    sss.unregisterSheet(srcCSS, sss.USER_SHEET);
  };
};

/*
* WindowListener
*
* Singleton class which enumerates open browser windows and targets them,
* individually or as a group.
*/
var WindowListener = {
  setupBrowserUI: function(window) {
    addOptionsStyle(window, this.prefs);
    loadMainStyleSheet();
  },

  setupObserver: function() {
    let prefs = Cc["@mozilla.org/preferences-service;1"]
         .getService(Components.interfaces.nsIPrefService)
         .getBranch("extensions.lighterwtaustralis.");         
    prefs.addObserver("", this, false);
    this.prefs = prefs;
  },
  
  removeObserver: function() {
    this.prefs.removeObserver("", this);
  },
  
  observe: function(subject, topic, data) {
    if (topic!="nsPref:changed") {
      return;
    };
    
    let prefs = Cc["@mozilla.org/preferences-service;1"]
         .getService(Components.interfaces.nsIPrefService)
         .getBranch("extensions.lighterwtaustralis."); 
    
    let wm = Cc["@mozilla.org/appshell/window-mediator;1"].
           getService(Ci.nsIWindowMediator);
           
    let windows = wm.getEnumerator("navigator:browser");
    while (windows.hasMoreElements()) {
      let domWindow = windows.getNext().QueryInterface(Ci.nsIDOMWindow);
      addOptionsStyle( domWindow, prefs );
    };
  },
  
  tearDownBrowserUI: function(window) {
    let prefs = Cc["@mozilla.org/preferences-service;1"]
         .getService(Components.interfaces.nsIPrefService)
         .getBranch("extensions.lighterwtaustralis.");
    prefs.removeObserver("", this);
    removeOptionsStyle(window, prefs);
    unloadMainStyleSheet();
  },

  onOpenWindow: function(xulWindow) {
    let domWindow = xulWindow.QueryInterface(Ci.nsIInterfaceRequestor)
                             .getInterface(Ci.nsIDOMWindow);

    domWindow.addEventListener("load", function listener() {
      domWindow.removeEventListener("load", listener, false);
      
      if (domWindow.document.documentElement.getAttribute("windowtype") == "navigator:browser")
      {
        WindowListener.setupBrowserUI(domWindow);
        let check = WindowListener.onWindowChange;
        domWindow.addEventListener("sizemodechange", function() {
          check(domWindow);
        }, false);
      };
    }, false);
  },
  
  onWindowChange: function(domWindow) {
    domWindow.setTimeout(function() {
      WindowListener.observe("", "nsPref:changed", "");
    }, 50);
  },

  onCloseWindow: function(xulWindow) {
  },

  onWindowTitleChange: function(xulWindow, newTitle) {
  }
}

/*
* startup()
*
* Required by Mozilla for Bootstrapped Extensions.
*
* Called whenever extension is installed, enabled, or the browser launches.
*/

function startup(data, reason) {
  WindowListener.setupObserver();
  let wm = Cc["@mozilla.org/appshell/window-mediator;1"].
           getService(Ci.nsIWindowMediator);
           
  let windows = wm.getEnumerator("navigator:browser");
  while (windows.hasMoreElements()) {
    let domWindow = windows.getNext().QueryInterface(Ci.nsIDOMWindow);
    WindowListener.setupBrowserUI(domWindow);
    let check = WindowListener.onWindowChange;
    domWindow.addEventListener("sizemodechange", function() {
      check(domWindow);
    }, false);
  };
  wm.addListener(WindowListener);
};

/*
* shutdown()
*
* Required by Mozilla for Bootstrapped Extensions.
*
* Called whenever extension is disabled, removed, or the browser shuts down.
*/
function shutdown(data, reason) {
  if (reason == APP_SHUTDOWN) {
    return;
  };
  WindowListener.removeObserver();
  let wm = Cc["@mozilla.org/appshell/window-mediator;1"].
           getService(Ci.nsIWindowMediator);
           
  let windows = wm.getEnumerator("navigator:browser");
  
  while (windows.hasMoreElements()) {
    let domWindow = windows.getNext().QueryInterface(Ci.nsIDOMWindow);
    let check = WindowListener.onWindowChange;
    domWindow.removeEventListener("sizemodechange", function() {
      check(domWindow);
    }, false);
    WindowListener.tearDownBrowserUI(domWindow);
  }
  
  wm.removeListener(WindowListener);
};

/*
* install()
*
* Required by Mozilla for Bootstrapped Extensions.
*
* Called when the application is added to Firefox. In this case, it checks to
* see if about:config entries are present and, if not, sets them.
*/
function install(data, reason) {

  var prefServiceBranch = Components.classes["@mozilla.org/preferences-service;1"]
                               .getService(Components.interfaces.nsIPrefService).getBranch("");
  if(!prefServiceBranch.getPrefType('extensions.lighterwtaustralis.fstabbarpaddingtop')){
    prefServiceBranch.setIntPref('extensions.lighterwtaustralis.fstabbarpaddingtop', 0);
  };
  if(!prefServiceBranch.getPrefType('extensions.lighterwtaustralis.fstabbarpaddingright')){
    prefServiceBranch.setIntPref('extensions.lighterwtaustralis.fstabbarpaddingright', 0);
  };
  if(!prefServiceBranch.getPrefType('extensions.lighterwtaustralis.wintabbarpaddingtop')){
    prefServiceBranch.setIntPref('extensions.lighterwtaustralis.wintabbarpaddingtop', 0);
  };
  if(!prefServiceBranch.getPrefType('extensions.lighterwtaustralis.wintabbarpaddingright')){
    prefServiceBranch.setIntPref('extensions.lighterwtaustralis.wintabbarpaddingright', 0);
  };
};

/*
* uninstall()
*
* Required by Mozilla for Bootstrapped Extensions.
*
* Called when the application is removed from Firefox.
*/
function uninstall(data, reason) {

};