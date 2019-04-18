//previous page id, current page id
var prevPid = '', curPid = '';
//save opened frame name
var frameArr = [];

//frame whether open
function isOpened(frmName){
  var i = 0, len = frameArr.length;
  var mark = false;
  for(i; i<len; i++){
      if(frameArr[i] === frmName){
          mark = true;
          return mark;
      }
  }
  return mark;
}

function openTab(type,tid,titles){
  var header = $summer.byId('header');
  var headerPos = $summer.offset(header);
  var footer = $summer.byId('footer');
  var footerPos = $summer.offset(footer);
  var title = $summer.byId("h-title");
  $summer.html(title,titles);
   // var width = api.winWidth;
  var width = $summer.winWidth();//==320
  // var height = api.winHeight - navPos.h - headerPos.h;
  var height = $summer.winHeight() - footerPos.h - headerPos.h;//gct:计算frame的高
//  type = type || 'main';
  var actTab = $summer.dom('#nav .active');
  $summer.removeCls(actTab,'active');
  var thisTab = $summer.dom('#nav .'+ type);
  $summer.addCls(thisTab,'active');

  if(type == 'me'){
  	summer.openWin({
  		 name: type,
         url: 'html/'+ type +'.html',
  	});
  	return false;
  }
  //record page id
  prevPid = curPid;
  curPid = type;
  
  if(prevPid !== curPid){
      if(isOpened(type)){
          summer.window.setFrameAttr({
              id:type,
              hidden: false
          },null,null);
      }else{
          summer.openFrame({
              name: type,
              url: 'html/'+ type +'.html',
              rect: {
                  x: 0,
                  y: headerPos.h,
                  w: width,
                  h: height
              }
          });
          frameArr.push(type);
      }
      if(prevPid){
      	summer.window.setFrameAttr({
              id:prevPid,
              hidden: true
          },null,null);
      }
  }
}

summerready = function(){
	openTab("main","main","首页");
}
