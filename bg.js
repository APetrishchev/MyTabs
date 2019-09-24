/*******************************************************************************
 * errBreak
 ******************************************************************************/
var errBreak = function() {return {name: 'break'}};

/*******************************************************************************
 * eh_onMessage
 ******************************************************************************/
function eh_onMessage(request, sender, sendResponse) {
  switch(request.type) {
    //--------------------------------------------------------------------------
    case 'err':
      console.log('........................................');
      console.log(request.err);
      console.log('........................................');
      break;
    //--------------------------------------------------------------------------
    case 'log':
      for (var idx = 0; idx < request.args.length; idx++)
        console.log(request.args[idx]);
      break;
    //--------------------------------------------------------------------------
    case 'getRoot':
      sendResponse({root: root});
      break;
  }
  return true;
}

/*******************************************************************************
 * eh_onTabUpdated
 ******************************************************************************/
function eh_onTabUpdated(tab) {
  try {
    return
    if(tab.url == 'chrome://newtab/')
      return;
    console.log('Update tab: ['+tab.windowId+'.'+tab.id+'] '+tab.title);
    var grps = JSON.parse(localStorage.getItem('MyTabs'));
    var winId = tab.windowId;
    for(var grpName in grps) {
      for(var tabUrl in grps[grpName]) {
        if(tabUrl == tab.url && !grps[grpName][tabUrl][winId]) {
          grps[grpName][tabUrl][winId] = {};
          grps[grpName][tabUrl][winId].tabId = tab.id;
          localStorage.setItem('MyTabs', JSON.stringify(grps));
          throw new errBreak();
        };
      };
    };
    //var tabUrl = tab.url;
    //grps['Not grouped'][tabUrl] = {};
    //grps['Not grouped'][tabUrl].title = tab.title;
    //grps['Not grouped'][tabUrl][winId] = tab.id 
    //localStorage.setItem('MyTabs', JSON.stringify(grps));
  }
  catch(err) {
    if(!err.name == 'break')
      console.log(err.toString(), err.stack);
  };

};

/*******************************************************************************
 * eh_onTabRemoved
 ******************************************************************************/
function eh_onTabRemoved(tabId, removeInfo) {
  try {
    var grps = JSON.parse(localStorage.getItem('MyTabs'));
    var winId = removeInfo.windowId;
    for(var grpName in grps) {
      for(var tabUrl in grps[grpName]) {
        if(grps[grpName][tabUrl][winId] && grps[grpName][tabUrl][winId].tabId == tabId) {
          console.log('Close tab: ['+winId+'.'+tabId+'] '+grps[grpName][tabUrl].title);
          delete(grps[grpName][tabUrl][winId]);
          localStorage.setItem('MyTabs', JSON.stringify(grps));
          window.activeInfo = null;
          throw new errBreak();
        };
      };
    };
  }
  catch(err) {
    if(!err.name == 'break')
      console.log(err.toString(), err.stack);
  };
};

/*******************************************************************************
 * eh_onActivated
 ******************************************************************************/
async function eh_onActivated(activeInfo) {
  //----------------------------------------------------------------------------
  var grps = JSON.parse(localStorage.getItem('MyTabs'));
  try {
    var winId = window.activeInfo.windowId;
    var tabId = window.activeInfo.tabId;
    for(var grpName in grps) {
      for(var tabUrl in grps[grpName]) {
        if(grps[grpName][tabUrl][winId] && grps[grpName][tabUrl][winId].tabId == tabId) {
          console.log('Deactivated tab: ['+winId+'.'+tabId+'] '+grps[grpName][tabUrl].title);
          grps[grpName][tabUrl][winId].tmr = setTimeout(
            function(winId, tabId, title) {
              chrome.tabs.discard(tabId, (tab) => {
                console.log('Discarded tab: ['+winId+'.'+tabId+'] '+title)
              });
            },
            30000,
            winId,
            tabId,
            grps[grpName][tabUrl].title
          );
          throw new errBreak();
        };
      };
    };
  }
  catch(err) {
    if(!err.name == 'break')
      console.log(err.toString(), err.stack);
  };
  //----------------------------------------------------------------------------
  try {
    window.activeInfo = activeInfo;
    var winId = activeInfo.windowId;
    var tabId = activeInfo.tabId;
    for(var grpName in grps) {
      for(var tabUrl in grps[grpName]) {
        if(grps[grpName][tabUrl][winId] && grps[grpName][tabUrl][winId].tabId == tabId) {
          console.log('Activated tab: ['+winId+'.'+tabId+'] '+grps[grpName][tabUrl].title);
          if(grps[grpName][tabUrl][winId].tmr) {
            clearTimeout(grps[grpName][tabUrl][winId].tmr);
            delete(grps[grpName][tabUrl][winId].tmr);
          };
          throw new errBreak();
        };
      };
    };
  }
  catch(err) {
    if(!err.name == 'break')
      console.log(err.toString(), err.stack);
  };
  localStorage.setItem('MyTabs', JSON.stringify(grps));
};

/*******************************************************************************
 * init
 ******************************************************************************/
var root = {};
(async () => {
  try {
    var title = 'MyTabs';
    root.localStorage = title
    var folders = await chrome.bookmarks.search({title: title});
    if(folders)
      var rootGroup = folders[0];
    //else {
    //  let folder = await chrome.bookmarks.create({parentId: '1', title: title});
    //  var rootGroup = folder;
    //};
    root.bookmarks = rootGroup
    //--------------------------------------------------------------------------
    // читать localStorage
    var grps = JSON.parse(localStorage.getItem('MyTabs'));
    if(!grps) {
      grps = {'Not grouped': {}}
    };
    //--------------------------------------------------------------------------
    // копировать закладки из bookmarks в localStorage по группам
    var folders = await chrome.bookmarks.getChildren(rootGroup.id);
    for(var idx in folders) {
      var grpName = folders[idx].title;
      if(!grps[grpName]) {
        grps[grpName] = {};
        var items = await chrome.bookmarks.getChildren(folders[idx].id);
        for(var idy in items) {
          var tabUrl = items[idy].url;
          grps[grpName][tabUrl] = {};
          grps[grpName][tabUrl].title = items[idy].title;
        };
      };
    };
    //--------------------------------------------------------------------------
    // перезаписать localStorage
    localStorage.setItem('MyTabs', JSON.stringify(grps));
    //--------------------------------------------------------------------------
    // 
    chrome.runtime.onMessage.addListener(eh_onMessage);
    chrome.tabs.onCreated.addListener(eh_onTabUpdated);
    //chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    //  eh_onTabUpdated(tab);
    //});
    chrome.tabs.onRemoved.addListener(eh_onTabRemoved);
    chrome.tabs.onActivated.addListener(eh_onActivated);
    //chrome.tabs.onHighlighted.addListener(function (highlightInfo) {console.log('Highlight:', highlightInfo)});
  }
  catch(err) {
    console.log(err.toString(), err.stack);
  };
})();
