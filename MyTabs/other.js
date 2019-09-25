/*******************************************************************************
 * DivElement
 ******************************************************************************/
class DivElement extends HTMLDivElement {

  /*****************************************************************************
   * DivElement.constructor
   ****************************************************************************/
  constructor(owner, className) {
    super();
    this.owner = owner;
    this.className = className;
  };

  /*****************************************************************************
   * DivElement.addClickEventHandler
   ****************************************************************************/
  addClickEventHandler(fn_onClick, fn_onDblClick) {
    this.owner.onClick = fn_onClick;
    this.owner.onDblClick = fn_onDblClick;
    this.addEventListener( 'click', this.eh_onClick.bind(this.owner, this), {once: true});
    this.addEventListener( 'dblclick', this.eh_onDblClick.bind(this.owner, this), {once: true});
  };

  /*****************************************************************************
   * DivElement.eh_onClick
   ****************************************************************************/
  eh_onClick(elm) {
    if(!this.dblClickTmr) {
      this.dblClickTmr = setTimeout(
        () => {
          clearTimeout(this.dblClickTmr)
          delete(this.dblClickTmr);
          if(this.onClick)
            this.onClick();
          elm.addEventListener( 'click', this.eh_onClick.bind(this), {once: true});
        },
        300
      );
    };
  };

  /*****************************************************************************
   * DivElement.eh_onDblClick
   ****************************************************************************/
  eh_onDblClick() {
    if(this.dblClickTmr) {
      clearTimeout(this.dblClickTmr)
      delete(this.dblClickTmr);
    };
    if(this.onDblClick)
      this.onDblClick();
    elm.addEventListener( 'click', this.eh_onClick.bind(this), {once: true});
    elm.addEventListener( 'dblclick', this.eh_onDblClick.bind(this), {once: true});
  };

};

/*******************************************************************************
 * Button
 ******************************************************************************/
class Button extends DivElement {

  /*****************************************************************************
   * Button.constructor
   ****************************************************************************/
  constructor(owner, className) {
    super(owner, className);
    this.addClickEventHandler(
      () => console.log('click'),
      () => console.log('dblclick')
    );
  };

};


/*******************************************************************************
 * console.log
 ******************************************************************************/
console.log_ = console.log;
console.log = function() {
  var args = [];
  for (var idx = 0; idx < arguments.length; idx++) {
    args.push(arguments[idx]);
    console.log_(arguments[idx]);
  };
  if(chrome && chrome.runtime)
    chrome.runtime.sendMessage({type: 'log', args: args});
};

/*******************************************************************************
 * sendError
 ******************************************************************************/
var sendError = function(err) {
  if(chrome && chrome.runtime)
    chrome.runtime.sendMessage({type: 'err', err: err.stack.toString()});
  console.log_('........................................');
  console.log_(err);
  console.log_('........................................');
};

/*******************************************************************************
 * sleep
 ******************************************************************************/
function sleep (dly, fn, args) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(fn(args)), dly)
  })
};

/*******************************************************************************
 * addEventHandler
 ******************************************************************************/
var addEventHandler = function(self, elm, evn, handler) {
  elm.addEventListener('click', function() {handler.call(self, elm)}, false);
};

/*******************************************************************************
 * clearElement
 ******************************************************************************/
var clearElement = function(elm) {
  while(elm.firstChild)
    elm.removeChild(elm.firstChild)
};

/*******************************************************************************
 * readKey
 ******************************************************************************/
const readKey = (elm) => new Promise(resolve => elm.addEventListener('keypress', resolve, {once: true}));

/*******************************************************************************
 * getFavicon
 ******************************************************************************/
function getFavicon(url) {
  return new Promise(function(resolve, reject) {
    var img = new Image();
    img.onload = function () {
      var canvas = document.createElement("canvas");
      canvas.width = this.width;
      canvas.height = this.height;

      var ctx = canvas.getContext("2d");
      ctx.drawImage(this, 0, 0);

      var dataURL = canvas.toDataURL("image/png");
      resolve(dataURL);
    };
    img.src = 'chrome://favicon/' + url;
  });
};

/*******************************************************************************
 * Spoiler
 ******************************************************************************/
class Spoiler {

  /*****************************************************************************
   * Spoiler.help
   ****************************************************************************/
  static get help() {return `Spoiler`};

  /*****************************************************************************
   * Spoiler.constructor
   ****************************************************************************/
  constructor(spl) {
    this.spoiler = spl;
  };

  /*****************************************************************************
   * Spoiler.addSpoiler
   ****************************************************************************/
  addSpoiler(parent) {
    this.header = document.createElement('div');
    this.header.className = 'SpoilerCollapsed';
    this.header.state = 0;
    this.header.addEventListener( 'click', this.toogle.bind(this), false);
    parent.appendChild(this.header);
    return this.header;
  };

  /*****************************************************************************
   * Spoiler.toogle
   ****************************************************************************/
  toogle() {
    if(this.state) {
      this.state = 0;
      this.header.className = 'SpoilerCollapsed';
      this.spoiler.style.display = 'none';
    }
    else {
      this.state = 1;
      this.header.className = 'SpoilerExpanded';
      this.spoiler.style.display = 'flex';
    };
  };

};


/*******************************************************************************
 * EditField
 ******************************************************************************/
class EditField {

  /*****************************************************************************
   * EditField.help
   ****************************************************************************/
  static get help() {return `EditField`};

  /*****************************************************************************
   *
   ****************************************************************************/
  static get IsPlaceholder() {return true};
  static get EventClick() {return 1};
  static get EventDblClick() {return 2};
  static get AddButtons() {return 4};

  /*****************************************************************************
   * EditField.constructor
   ****************************************************************************/
  constructor(className, behavior) {
    this.className = className || 'EditField';
    this.behavior = behavior;
    this.editEvent = this.behavior&(EditField.EventClick+EditField.EventDblClick);
  };

  /*****************************************************************************
   * EditField.addEditField
   ****************************************************************************/
  addEditField(parent, label, isPlaceholder) {
    var elm = document.createElement('div');
    elm.className = this.className;
    parent.appendChild(elm);
    //----------------------------------------------------------------------------
    this.editElm = document.createElement('div');
    this.editElm.addEventListener( 'click', this.eh_onClick.bind(this), {once: true});
    this.editElm.addEventListener( 'dblclick', this.eh_onDblClick.bind(this), {once: true});
    if(label) {
      if(isPlaceholder) {
        this.placeholder = label;
        this.editElm.className = this.className + '_Placeholder';
      }
      else
        this.editElm.className = this.className + '_Label';
      this.editElm.innerHTML = label;
    };
    elm.appendChild(this.editElm);
    if(this.behavior&EditField.AddButtons) {
      //--------------------------------------------------------------------------
      this.okBtnElm = document.createElement('div');
      this.okBtnElm.className = this.className + '_OkBtn';
      this.okBtnDisp = this.okBtnElm.style.display;
      this.okBtnElm.style.display = 'none';
      this.okBtnElm.addEventListener( 'click', this.ok.bind(this), {once: true});
      elm.appendChild(this.okBtnElm);
      //--------------------------------------------------------------------------
      this.canBtnElm = document.createElement('div');
      this.canBtnElm.className = this.className + '_CanselBtn';
      this.canBtnDisp = this.canBtnElm.style.display;
      this.canBtnElm.style.display = 'none';
      this.canBtnElm.addEventListener( 'click', this.cansel.bind(this), {once: true});
      elm.appendChild(this.canBtnElm);
    };
    return this.editElm;
  };

  /*****************************************************************************
   * EditField.edit
   ****************************************************************************/
  async edit() {
    this.editElm.addEventListener( 'blur', this.cansel.bind(this), {once: true});
    this.oldValue = this.editElm.innerHTML;
    this.editElmClassName = this.editElm.className;
    this.editElm.className = this.className + '_Edit';
    this.okBtnElm.style.display = this.okBtnDisp;
    this.canBtnElm.style.display = this.canBtnDisp;
    this.editElm.contentEditable = 'true';
    if(this.placeholder)
      this.editElm.innerHTML = '';
    else {
      var selection = window.getSelection();        
      var range = document.createRange();
      range.selectNodeContents(this.editElm);
      selection.removeAllRanges();
      selection.addRange(range);
    };
    this.editElm.focus();
    var chr;
    while(true) {
      chr = await readKey(this.editElm);
      if(chr.which == 13) {
        this.ok();
        break;
      }
      else if(chr.which == 27) {
        this.cansel();
        break;
      };
    };
  };

  /*****************************************************************************
   * EditField.ok
   ****************************************************************************/
  ok() {
    if(this.editEvent == EditField.EventClick && this.onClick)
      this.onClick(this.oldValue, this.editElm.innerHTML);
    else if(this.editEvent == EditField.EventDblClick && this.onDblClick)
      this.onDblClick(this.oldValue, this.editElm.innerHTML);
    this.editElm.contentEditable = 'false';
    if(this.placeholder) {
      this.editElm.className = this.className + '_Placeholder';
      this.editElm.innerHTML = this.placeholder;
    }
    else
      this.editElm.className = this.editElmClassName;
    this.okBtnElm.style.display = 'none';
    this.canBtnElm.style.display = 'none';
    this.editElm.addEventListener( 'click', this.eh_onClick.bind(this), {once: true});
    this.editElm.addEventListener( 'dblclick', this.eh_onDblClick.bind(this), {once: true});
  };

  /*****************************************************************************
   * EditField.cansel
   ****************************************************************************/
  cansel() {
    this.editElm.contentEditable = 'false';
    if(this.placeholder) {
      this.editElm.className = this.className + '_Placeholder';
      this.editElm.innerHTML = this.placeholder;
    }
    else
      this.editElm.className = this.editElmClassName;
    this.okBtnElm.style.display = 'none';
    this.canBtnElm.style.display = 'none';
    this.editElm.innerHTML = this.oldValue;
    this.editElm.addEventListener( 'click', this.eh_onClick.bind(this), {once: true});
    this.editElm.addEventListener( 'dblclick', this.eh_onDblClick.bind(this), {once: true});
  };

  /*****************************************************************************
   * EditField.eh_onClick
   ****************************************************************************/
  eh_onClick() {
    if(!this.editElm.dblClickTmr) {
      this.editElm.dblClickTmr = setTimeout(
        () => {
          clearTimeout(this.editElm.dblClickTmr)
          delete(this.editElm.dblClickTmr);
          if(this.editEvent == EditField.EventClick)
            this.edit();
          else {
            if(this.onClick)
              this.onClick();
            this.editElm.addEventListener( 'click', this.eh_onClick.bind(this), {once: true});
          };
        },
        300
      );
    };
  };

  /*****************************************************************************
   * EditField.eh_onDblClick
   ****************************************************************************/
  eh_onDblClick() {
    if(this.editElm.dblClickTmr) {
      clearTimeout(this.editElm.dblClickTmr)
      delete(this.editElm.dblClickTmr);
    };
    if(this.editEvent == EditField.EventDblClick)
      this.edit();
    else {
      if(this.onDblClick)
        this.onDblClick();
      this.editElm.addEventListener( 'click', this.eh_onClick.bind(this), {once: true});
      this.editElm.addEventListener( 'dblclick', this.eh_onDblClick.bind(this), {once: true});
    };
  };

};


/*******************************************************************************
 * CheckBox
 ******************************************************************************/
class CheckBox__ {

  /*****************************************************************************
   * CheckBox.help
   ****************************************************************************/
  static get help() {return `CheckBox`};

  /*****************************************************************************
   * CheckBox.constructor
   ****************************************************************************/
  constructor() {
    this.items = [];
  };

  /*****************************************************************************
   * CheckBox.addCheckBox
   ****************************************************************************/
  addCheckBox(prntElm, obj) {
    var elm = document.createElement('div');
    elm.className = 'CheckBoxUnmarked';
    elm.state = 0;
    elm.obj = obj;
    addEventHandler(this, elm, 'click', this.toogle);
    prntElm.appendChild(elm);
    return elm;
  };

  /*****************************************************************************
   * CheckBox.toogle
   ****************************************************************************/
  toogle(elm) {
    if(elm.state) {
      elm.state = 0;
      elm.className = 'CheckBoxUnmarked';
      for(var idx=0; idx<this.items.length; idx++) {
        if(elm.obj === this.items[idx])
          this.items.splice(idx, 1)
      };
    }
    else {
      elm.state = 1;
      elm.className = 'CheckBoxMarked';
      this.items.push(elm.obj);
    };
  };

};

/*******************************************************************************
 * CheckBox
 ******************************************************************************/
class CheckBox {

  /*****************************************************************************
   * CheckBox.help
   ****************************************************************************/
  static get help() {return `CheckBox`};

  /*****************************************************************************
   *
   ****************************************************************************/
  static get items() {
    if(!CheckBox.items_)
      CheckBox.items_ = [];
    return CheckBox.items_
  };

  /*****************************************************************************
   * CheckBox.constructor
   ****************************************************************************/
  constructor(obj, parent) {
    var items = (parent) ? parent.children : CheckBox.items;
    this.parent = parent;
    this.children = []
    this.index = items.length;
    this.state = 0;
    this.object = obj;
    this.element = null;
    items.push(this);
  };

  /*****************************************************************************
   * CheckBox.getElement
   ****************************************************************************/
  getElement() {
    this.element = document.createElement('div');
    this.element.className = 'CheckBoxUnmarked';
    this.element.addEventListener('click', this.toogle.bind(this), {once: true});
    return this.element;
  };

  /*****************************************************************************
   * CheckBox.toogle
   ****************************************************************************/
  toogle() {
    try {
      if(this.state) {
        this.element.className = 'CheckBoxUnmarked';
        this.unmark(this);
      }
      else {
        this.element.className = 'CheckBoxMarked';
        this.mark(this);
      };
      this.parentMark(this.parent);
      this.element.addEventListener('click', this.toogle.bind(this), {once: true});
console.log(this);
    }
    catch(err) {
      sendError(err);
    };
  };

  /*****************************************************************************
   * CheckBox.parentMark
   ****************************************************************************/
  parentMark(checkBox) {
    if(checkBox.parent)
      this.parentMark(checkBox.parent);
    if(checkBox.state === checkBox.children.length)
      checkBox.element.className = 'CheckBoxMarked';
    else if(checkBox.state === 0)
      checkBox.element.className = 'CheckBoxUnmarked';
    else
      checkBox.element.className = 'CheckBoxPartlyMarked';
  };

  /*****************************************************************************
   * CheckBox.unmark
   ****************************************************************************/
  unmark(checkBox) {
    if(!checkBox.children) {
      checkBox.state = 0;
      checkBox.element.className = 'CheckBoxUnmarked';
      return;
    }
    for(var idx in checkBox.children) {
      this.unmark(checkBox.children[idx]);
    };
    checkBox.state = 0;
    checkBox.element.className = 'CheckBoxUnmarked';
  };

  /*****************************************************************************
   * CheckBox.mark
   ****************************************************************************/
  mark(checkBox) {
    if(checkBox.children === []) {
      checkBox.state = -1;
      checkBox.element.className = 'CheckBoxMarked';
      return;
    }
    for(var idx in checkBox.children) {
      this.mark(checkBox.children[idx]);
      checkBox.state += 1;
    };
    checkBox.element.className = 'CheckBoxMarked';
  };

};

/*******************************************************************************
 * Tabs
 ******************************************************************************/
class Tabs {

  /*****************************************************************************
   * Tabs.help
   ****************************************************************************/
  static get help() {return `Tabs`};

  /*****************************************************************************
   *
   ****************************************************************************/
  static get notGrouped() {return 'Not grouped'};
  static get rootBm() {return 'MyTabs'};
  static get rootLs() {return 'MyTabs'};

  /*****************************************************************************
   * Tabs.getBookmark
   ****************************************************************************/
  static async getBookmark(title) {
    try {
      const bm = await chrome.bookmarks.search({title: Tabs.rootBm});
      const tree = await chrome.bookmarks.getChildren(bm[0].id);
      for(const item of tree) {
        if(item.title == title)
          return item;
      };
      return null;
    }
    catch(err) {
      sendError(err);
    };
  };

  /*****************************************************************************
   * Tabs.addGroup
   ****************************************************************************/
  async addGroup(grpName) {
    try {
      if(!grpName)
        return;
      var grps = JSON.parse(localStorage.getItem(Tabs.rootLs));
      grps[grpName] = {};
      localStorage.setItem(Tabs.rootLs, JSON.stringify(grps));
      var tabs = await chrome.bookmarks.search({title: Tabs.rootBm});
      var folder = await chrome.bookmarks.create({parentId: tabs[0].id, title: grpName});
      console.log('Added group:', folder);
      this.main();
    }
    catch(err) {
      sendError(err);
    };
  };

  /*****************************************************************************
   * Tabs.delGroup
   ****************************************************************************/
  async delGroup() {
    try {
      var grps = JSON.parse(localStorage.getItem(Tabs.rootLs));
      for(var idx in this.grpChkBox.items) {
        const grpName = this.grpChkBox.items[idx];
        console.log('Deleted group: '+grpName);
        delete(grps[grpName]);
        const bm = await Tabs.getBookmark(grpName);
        if(bm)
          await chrome.bookmarks.remove(bm.id);
      };
      localStorage.setItem(Tabs.rootLs, JSON.stringify(grps));
      this.main();
    }
    catch(err) {
      sendError(err);
    };
  };

  /*****************************************************************************
   * Tabs.renameGroup
   ****************************************************************************/
  async renameGroup(tabUrl, oldName, newName) {
    try {
      if(!newName)
        return;
      console.log('Rename group "'+oldName+'" to "'+newName+'"');
      var grps = JSON.parse(localStorage.getItem(Tabs.rootLs));
      grps[newName] = grps[oldName];
      delete(grps[oldName]);
      localStorage.setItem(Tabs.rootLs, JSON.stringify(grps));
      const bm = await chrome.bookmarks.search({title: oldName});
      await chrome.bookmarks.update(bm[0].id, {title: newName});
      self.main();
    }
    catch(err) {
      sendError(err);
    };
  };

  /*****************************************************************************
   * Tabs.addTab
   ******************************************************************************/
  async addTab(grpName, winId) {
    try {
      var tabs = await chrome.tabs.query({windowId: winId, active: true});
      var tab = tabs[0];
      var folders = await chrome.bookmarks.search({title: grpName});
      var item = await chrome.bookmarks.create({parentId: folders[0].id, title: tab.title, url: tab.url});
      var grps = JSON.parse(localStorage.getItem(Tabs.rootLs));
      var tabUrl = tab.url;
      grps[grpName][tabUrl] = {};
      grps[grpName][tabUrl].title = tab.title;
      grps[grpName][tabUrl].favIcon = await getFavicon(tab.favIconUrl);
      grps[grpName][tabUrl][winId] = {};
      grps[grpName][tabUrl][winId].tabId = tab.id;
      localStorage.setItem(Tabs.rootLs, JSON.stringify(grps));
      self.main();
    }
    catch(err) {
      sendError(err);
    };
  };

  /*****************************************************************************
   * Tabs.delTab
   ****************************************************************************/
  async delTab() {
    try {
      self.main();
    }
    catch(err) {
      sendError(err);
    };
  };

  /*****************************************************************************
   * Tabs.renameTab
   ****************************************************************************/
  async renameTab(grpName, tabUrl, oldName, newName) {
    try {
      if(!newName)
        return;
      console.log('Rename tab "'+oldName+'" to "'+newName+'"');
      var grps = JSON.parse(localStorage.getItem(Tabs.rootLs));
      grps[grpName][tabUrl].title = newName;
      localStorage.setItem(Tabs.rootLs, JSON.stringify(grps));
      const bm = await chrome.bookmarks.search({url: tabUrl});
      await chrome.bookmarks.update(bm[0].id, {title: newName});
      self.main();
    }
    catch(err) {
      sendError(err);
    };
  };

  /*****************************************************************************
   * Tabs.openTabs
   ****************************************************************************/
  async openTabs(grpName, winId) {
    try {
      console.log('Open group of tab: '+grpName);
      var grps = JSON.parse(localStorage.getItem(Tabs.rootLs));
      var pinTabs = [];
      var openTabs = [];
      for(var tabUrl in grps[grpName]) {
        if(grps[grpName][tabUrl][winId])
          pinTabs.push(chrome.tabs.update(grps[grpName][tabUrl][winId].tabId, {pinned: true}));
        else
          openTabs.push(chrome.tabs.create({url: tabUrl, pinned: true, active: false}));
      };
      var tabs = await Promise.all(pinTabs);
      for(var idx in tabs) {
        const tabUrl = tabs[idx].url;
        console.log('Pin tab: '+grps[grpName][tabUrl].title);
      };
      tabs = await Promise.all(openTabs);
      for(var idx in tabs) {
        const tabUrl = tabs[idx].url;
        console.log('Open tab: '+grps[grpName][tabUrl].title);
        if(!grps[grpName][tabUrl].favIcon)
          grps[grpName][tabUrl].favIcon = await getFavicon(tabs[idx].favIconUrl);
        grps[grpName][tabUrl][winId] = {};
        grps[grpName][tabUrl][winId].tabId = tabs[idx].id;
      };
      localStorage.setItem(Tabs.rootLs, JSON.stringify(grps));
    }
    catch(err) {
      sendError(err);
    };
  };

  /*****************************************************************************
   * Tabs.closeTabs
   ****************************************************************************/
  async closeTabs(grpName, winId) {
    try {
      console.log('Close group of tab: '+grpName);
      var grps = JSON.parse(localStorage.getItem(Tabs.rootLs));
      var removeIds = [];
      for(var tabUrl in grps[grpName]) {
        if(grps[grpName][tabUrl][winId])
          removeIds.push(grps[grpName][tabUrl][winId].tabId);
      };
      await chrome.tabs.remove(removeIds);
    }
    catch(err) {
      sendError(err);
    };
  };

  /*****************************************************************************
   * Tabs.openTab
   ****************************************************************************/
  async openTab(grpName, winId, tabUrl, title) {
    try {
      console.log('Open tab: '+title);
      var grps = JSON.parse(localStorage.getItem(Tabs.rootLs));
      if(!grps[grpName][tabUrl][winId]) {
        var tab = await chrome.tabs.create({url: tabUrl, active: true});
        if(!grps[grpName][tabUrl].favIcon)
          grps[grpName][tabUrl].favIcon = await getFavicon(tab.favIconUrl);
        grps[grpName][tabUrl][winId] = {};
        grps[grpName][tabUrl][winId].tabId = tab.id;
        localStorage.setItem(Tabs.rootLs, JSON.stringify(grps));
      };
    }
    catch(err) {
      sendError(err);
    };
  };

  /*****************************************************************************
   * Tabs.main
   ****************************************************************************/
  async main() {
    try {
      //var response = await chrome.runtime.sendMessage({type: 'getRoot'});
//console.log(response, response.localStorage, response.bookmarks);
      //root.bm = response.bookmarks;
      //root.ls = response.localStorage;
//console.log(root.bm, root.ls);
      //------------------------------------------------------------------------
      clearElement(window.body);
      var win = await chrome.windows.getCurrent(null);
      var winId = win.id;
      var grps = JSON.parse(localStorage.getItem(Tabs.rootLs));
      //------------------------------------------------------------------------
      var titleElm = document.createElement('div');
      titleElm.className = 'Title';
      titleElm.innerHTML = 'MyTabs';
      window.body.appendChild(titleElm);
      //------------------------------------------------------------------------
      var grpsPnlElm = document.createElement('div');
      grpsPnlElm.className = 'GroupsPanel';
      window.body.appendChild(grpsPnlElm);
      //------------------------------------------------------------------------
      for(var grpName in grps) {
        if(grpName == Tabs.notGrouped)
          continue;
        //------------------------------------------------------------------------
        var grpElm = document.createElement('div');
        grpElm.className = 'GrpRow';
        grpsPnlElm.appendChild(grpElm);
        //------------------------------------------------------------------------
        var tabsSplElm = document.createElement('div');
        tabsSplElm.className = 'TabsSpoiler';
        grpsPnlElm.appendChild(tabsSplElm);
        //------------------------------------------------------------------------
        var spl = new Spoiler(tabsSplElm);
        spl.addSpoiler(grpElm);
        var grpChkBox = new CheckBox(grpName);
        grpElm.appendChild(grpChkBox.getElement());
        //------------------------------------------------------------------------
        var editField = new EditField('GrpName', EditField.EventDblClick+EditField.AddButtons);
        editField.onClick = spl.toogle.bind(spl);
        const tabUrlRenGrp = tabUrl;
        editField.onDblClick = (oldValue, newValue) => {
          this.renameGroup(tabUrlRenGrp, oldValue, newValue);
        };
        editField.addEditField(grpElm, grpName);
        //------------------------------------------------------------------------
        var closeTabsBtn = document.createElement('div');
        closeTabsBtn.className = 'CloseTabsBtn';
        closeTabsBtn.addEventListener( 'click', this.closeTabs.bind(this, grpName, winId), false);
        grpElm.appendChild(closeTabsBtn);
        //------------------------------------------------------------------------
        var openTabsBtn = document.createElement('div');
        openTabsBtn.className = 'OpenTabsBtn';
        openTabsBtn.addEventListener( 'click', this.openTabs.bind(this, grpName, winId), false);
        grpElm.appendChild(openTabsBtn);
        //------------------------------------------------------------------------
        var addTabBtnElm = document.createElement('div');
        addTabBtnElm.className = 'AddTabBtn';
        addTabBtnElm.addEventListener( 'click', this.addTab.bind(this, grpName, winId), false);
        grpElm.appendChild(addTabBtnElm);
        //------------------------------------------------------------------------
        for(var tabUrl in grps[grpName]) {
          var tabElm = document.createElement('div');
          tabElm.className = 'TabRow';
          tabsSplElm.appendChild(tabElm);
          //----------------------------------------------------------------------
          var tabFaviconElm = document.createElement('img');
          tabFaviconElm.className = 'TabFavicon';
          tabFaviconElm.src = grps[grpName][tabUrl].favIcon;
          tabElm.appendChild(tabFaviconElm);
          //----------------------------------------------------------------------
          var tabChkBox = new CheckBox(tabUrl, grpChkBox);
          tabElm.appendChild(tabChkBox.getElement());
          //----------------------------------------------------------------------
          var editField = new EditField('ClosedTabTitle', EditField.EventDblClick+EditField.AddButtons);
          const grpNameRenTab = grpName;
          const tabUrlRenTab = tabUrl;
          editField.onDblClick = (oldValue, newValue) => {
              this.renameTab(grpNameRenTab, tabUrlRenTab, oldValue, newValue);
          };
          //----------------------------------------------------------------------
          var titleElm = editField.addEditField(tabElm, grps[grpName][tabUrl].title);
          if(grps[grpName][tabUrl][winId])
            titleElm.className = 'OpenedTabTitle';
          else {
            titleElm.className = 'ClosedTabTitle';
            editField.onClick = this.openTab.bind(this, grpName, winId, tabUrl, grps[grpName][tabUrl].title);
          };
        };
      };
      //--------------------------------------------------------------------------
      var menuElm = document.createElement('div');
      menuElm.className = 'Menu';
      window.body.appendChild(menuElm);
      //--------------------------------------------------------------------------
      var editField = new EditField('MenuAddGroup', EditField.EventClick+EditField.AddButtons);
      var addGrpInpElm = editField.addEditField(menuElm, 'New group', EditField.IsPlaceholder);
      editField.onClick = (oldValue, newValue) => this.addGroup(newValue);
      //--------------------------------------------------------------------------
      var delBtnElm = document.createElement('div');
      delBtnElm.className = 'MenuDelGroupBtn';
      delBtnElm.addEventListener( 'click', this.delGroup.bind(this), false);
      menuElm.appendChild(delBtnElm);
      //var delBtnElm = new Button(this, 'MenuDelGroupBtn');
      //menuElm.appendChild(delBtnElm);
    }
    catch(err) {
      sendError(err);
    };
  };

};

/*******************************************************************************
 * main
 ******************************************************************************/
var root = {};
var main = function() {
  window.body = document.getElementsByTagName('body')[0];
  window.body.className = 'Body';
  new Tabs().main();
};
