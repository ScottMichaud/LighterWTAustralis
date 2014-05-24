/* This Source Code Form is subject to the terms of the Mozilla Public License,
v. 2.0. If a copy of the MPL was not distributed with this file, You can obtain
one at http://mozilla.org/MPL/2.0/. */

/*
* Thanks to Dave Townsend of Mozilla for his Restartless Extension framework.
* Removed in Version 1.1, but was still helpful before that time.
*/


const Cc = Components.classes;
const Ci = Components.interfaces;

/*
* loadMainStyleSheet()
*
* Registers styleX.css with browser.xul.
*/
function loadMainStyleSheet() {
  let osString = Cc["@mozilla.org/xre/app-info;1"]
               .getService(Ci.nsIXULRuntime).OS;
  let urlString = "";
  switch (osString) {
    case "WINNT":
    urlString = 'chrome://lighterwtaustralis/content/styleWin';
    break;
    case "Linux":
    urlString = 'chrome://lighterwtaustralis/content/styleLinux';
    break;
    case "Darwin":
    urlString = 'chrome://lighterwtaustralis/content/styleMac';
    break;
    default: //Probably something 'NIX or BSD, why not?
    urlString = 'chrome://lighterwtaustralis/content/styleLinux';
  }
  
  let prefs = Cc["@mozilla.org/preferences-service;1"]
         .getService(Ci.nsIPrefService)
         .getBranch("extensions.lighterwtaustralis.");
         
  if (!prefs.getBoolPref("enabletheme"))
  {
    urlString = urlString + "None";
  };
  
  urlString = urlString + ".css";
  
  let sss = Cc["@mozilla.org/content/style-sheet-service;1"]
            .getService(Ci.nsIStyleSheetService);
  let ios = Cc["@mozilla.org/network/io-service;1"]
            .getService(Ci.nsIIOService);
  let srcCSS = ios.newURI(urlString, null, null);
  if(!sss.sheetRegistered(srcCSS, sss.USER_SHEET)) {
      sss.loadAndRegisterSheet(srcCSS, sss.USER_SHEET);
  };
};

/*
* unloadMainStyleSheet()
*
* Unregisters styleX.css with browser.xul.
*/
function unloadMainStyleSheet() {
  let osString = Cc["@mozilla.org/xre/app-info;1"]
               .getService(Ci.nsIXULRuntime).OS;
  let urlString = "";
  switch (osString) {
    case "WINNT":
    urlString = 'chrome://lighterwtaustralis/content/styleWin';
    break;
    case "Linux":
    urlString = 'chrome://lighterwtaustralis/content/styleLinux';
    break;
    case "Darwin":
    urlString = 'chrome://lighterwtaustralis/content/styleMac';
    break;
    default: //That's what up there did.
    urlString = 'chrome://lighterwtaustralis/content/styleLinux';
  }
  
  let prefs = Cc["@mozilla.org/preferences-service;1"]
         .getService(Ci.nsIPrefService)
         .getBranch("extensions.lighterwtaustralis.");
  
  urlString2 = urlString;
  
  if (prefs.getBoolPref("enabletheme"))
  {
    urlString = urlString + "None";
  };
  
  urlString = urlString + ".css";
  urlString2 = urlString2 + ".css";
  
  let sss = Cc["@mozilla.org/content/style-sheet-service;1"]
            .getService(Ci.nsIStyleSheetService);
  let ios = Cc["@mozilla.org/network/io-service;1"]
            .getService(Ci.nsIIOService);
  let srcCSS = ios.newURI(urlString, null, null);
  let srcCSS2 = ios.newURI(urlString2, null, null);
  if(sss.sheetRegistered(srcCSS, sss.USER_SHEET)) {
    sss.unregisterSheet(srcCSS, sss.USER_SHEET);
  };
  if(sss.sheetRegistered(srcCSS2, sss.USER_SHEET)) {
    sss.unregisterSheet(srcCSS2, sss.USER_SHEET);
  };
};

var StyleManager = {
  cssHeader: "@-moz-document url(chrome://browser/content/browser.xul){",
  cssFooter: "}",
  
  getCss: function() {
    return this.cssHeader + this.cssMiddle + this.cssFooter;
  },
  
  setCss: function() {
    var mPaddingTop = this.prefs.getIntPref("fstabbarpaddingtop");
    var mPaddingRight = this.prefs.getIntPref("fstabbarpaddingright");
    var wPaddingTop = this.prefs.getIntPref("wintabbarpaddingtop");
    var wPaddingRight = this.prefs.getIntPref("wintabbarpaddingright");
    
    let osString = Cc["@mozilla.org/xre/app-info;1"]
               .getService(Ci.nsIXULRuntime).OS;
               
    if (osString === "Darwin") {
      wPaddingTop = 0; //Disable top padding for "windowed mode" in Mac OSX. Too buggy.
    };
    
    this.cssMiddle = "#main-window[sizemode=maximized] #TabsToolbar{padding-top:" +
    Math.min(mPaddingTop, 300) + "px !important;padding-right:" + Math.min(mPaddingRight, 700) + 
    "px !important}#main-window[sizemode=normal] #TabsToolbar{padding-top:" +
    Math.min(wPaddingTop, 300) + "px !important ;padding-right:" + Math.min(wPaddingRight, 700) +
    "px !important}";
  },
  
  registerStyleSheet: function() {
    this.setCss(); //Update CSS string.
    
    let urlString = "data:text/css," + escape(this.getCss());
    
    let sss = Cc["@mozilla.org/content/style-sheet-service;1"]
              .getService(Ci.nsIStyleSheetService);
    let ios = Cc["@mozilla.org/network/io-service;1"]
              .getService(Ci.nsIIOService);
    let srcCSS = ios.newURI(urlString, null, null);
    if(!sss.sheetRegistered(srcCSS, sss.USER_SHEET)) {
        sss.loadAndRegisterSheet(srcCSS, sss.USER_SHEET);
    };
  },
  
  unregisterStyleSheet: function() {
    let urlString = "data:text/css," + escape(this.getCss());
   
    let sss = Cc["@mozilla.org/content/style-sheet-service;1"]
              .getService(Ci.nsIStyleSheetService);
    let ios = Cc["@mozilla.org/network/io-service;1"]
              .getService(Ci.nsIIOService);
    let srcCSS = ios.newURI(urlString, null, null);
    if(sss.sheetRegistered(srcCSS, sss.USER_SHEET)) {
      sss.unregisterSheet(srcCSS, sss.USER_SHEET);
    };
  },
  
  setupObserver: function() {
    let prefs = Cc["@mozilla.org/preferences-service;1"]
         .getService(Ci.nsIPrefService)
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
    
    this.unregisterStyleSheet();
    this.registerStyleSheet();
    unloadMainStyleSheet();
    loadMainStyleSheet();
  }
};

/*
* startup()
*
* Required by Mozilla for Bootstrapped Extensions.
*
* Called whenever extension is installed, enabled, or the browser launches.
*/
function startup( data, reason ) {
  loadMainStyleSheet();
  StyleManager.setupObserver();
  StyleManager.setCss();
  StyleManager.registerStyleSheet();
};

/*
* shutdown()
*
* Required by Mozilla for Bootstrapped Extensions.
*
* Called whenever extension is disabled, removed, or the browser shuts down.
*/
function shutdown( data, reason ) {
  if (reason == APP_SHUTDOWN) {
    return; //Save a few cycles on shutdown
  };
  
  unloadMainStyleSheet();
  StyleManager.removeObserver();
  StyleManager.unregisterStyleSheet();
};

/*
* install()
*
* Required by Mozilla for Bootstrapped Extensions.
*
* Called when the application is added to Firefox. 
* In this case, it checks to see if about:config entries are present 
* and, if not, sets them.
*/
function install( data, reason ) {
  var prefServiceBranch = Components.classes["@mozilla.org/preferences-service;1"]
                               .getService(Components.interfaces.nsIPrefService).getBranch("");
  if(!prefServiceBranch.getPrefType('extensions.lighterwtaustralis.fstabbarpaddingtop')){
    prefServiceBranch.setIntPref('extensions.lighterwtaustralis.fstabbarpaddingtop', 0);
  };
  if(!prefServiceBranch.getPrefType('extensions.lighterwtaustralis.fstabbarpaddingright')){
    prefServiceBranch.setIntPref('extensions.lighterwtaustralis.fstabbarpaddingright', 0);
  };
  if(!prefServiceBranch.getPrefType('extensions.lighterwtaustralis.wintabbarpaddingtop')){
    prefServiceBranch.setIntPref('extensions.lighterwtaustralis.wintabbarpaddingtop', 15);
  };
  if(!prefServiceBranch.getPrefType('extensions.lighterwtaustralis.wintabbarpaddingright')){
    prefServiceBranch.setIntPref('extensions.lighterwtaustralis.wintabbarpaddingright', 0);
  };
  if(!prefServiceBranch.getPrefType('extensions.lighterwtaustralis.enabletheme')){
    prefServiceBranch.setBoolPref('extensions.lighterwtaustralis.enabletheme', true);
  };
};

/*
* uninstall()
*
* Required by Mozilla for Bootstrapped Extensions.
*
* Called when the application is removed from Firefox.
* In this case, nothing needs to be done.
*/
function uninstall( data, reason ) {

};