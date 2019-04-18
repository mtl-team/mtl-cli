//summerready = function(){
//	alert(1111);
//	summer.window.setRefreshFooterInfo({
//        visible: true,
//        bgColor: '#F5F5F5',
//        textColor: '#4d4d4d',
//        textDown: '上拉刷新...',
//        textUp: '松开刷新...',
//        showTime: true
//	}, function (ret, err) {
//	         //从服务器加载数据，加载完成后调用api.refreshFooterLoadDone()方法恢复组件到默认状态
//	         alert("上拉刷新成功");
//	        summer.window.refreshHeaderLoadDone();
//	});
//	summer.window.setRefreshHeaderInfo({
//        visible: true,
//        bgColor: '#F5F5F5',
//        textColor: '#4d4d4d',
//        textDown: '下拉刷新...',
//        textUp: '松开刷新...',
//        showTime: true
//	}, function (ret, err) {
//	        //从服务器加载数据，加载完成后调用api.refreshHeaderLoadDone()方法恢复组件到默认状态
//	       alert("下拉刷新成功");
//	       summer.window.refreshHeaderLoadDone();
//	})
//};

function closeWin(){
	summer.closeWin();
}

function openWin(type,obj){
	summer.openWin({
		id : type,
		url : "html/"+type+".html",
		pageParam :{
			count : type,
			
		}
	});
}
