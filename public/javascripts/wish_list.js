window.onload = function(){
	InitPage.start();
	$("#suggest").click(WishListener.listener);
	$("#all-screen").click(WishListener.clearScreen);
	$("#wish-form").submit(WishListener.addWish);
}

var InitPage = {
	start : function(){
		this.initProject();
		this.initWish();
	},
	initProject : function(){
		var url_items = window.location.href.split("/");
		var project_id = url_items[url_items.length-1];
		var cb = function(data){
			$("#project-body").attr("pro_id",data._id);
			$("#project-title").text(data.name);
			$("#project-content").text(data.content);
		};
		sendAjax("/init_project/" + project_id,"get",null,"json",cb);
	},
	initWish : function(){
		WishListener.getOnGoingWish();
		WishListener.getIWishWish();
	}
};

var WishListener = {
	index : 1,
	num : 15,
	//弹出提交单
	listener : function(){
		WishListener.showScreen();
		WishListener.showForm();
	},
	//显示白色背景
	showScreen : function(){
		$("#all-screen").css("display","block");
	},
	//弹出表单
	showForm : function(){
		$("#wish-form").animate({
			top : "100px"
		},300);
	},
	//清理屏幕
	clearScreen : function(){
		$("#all-screen").css("display","none");
		$("#wish-form").css("top","-300px");
		$("#wish-form-content").val("");
	},
	//发送请求添加愿望树
	addWish : function(event){
		event.preventDefault();
		if(wishVertify()){
			var project_id = $("#project-body").attr("pro_id");
			var project_content = $("#wish-form-content").val();
			var cb = function(data){
				if(data.result == "success"){
					WishListener.clearScreen();
				}
				else{
					alert("发送失败");
				}
			};
			sendAjax("/create_wish","post",{project_id:project_id,project_content:project_content},"json",cb);
		}
	},
	getOnGoingWish : function(){
		var url_items = window.location.href.split("/");
		var project_id = url_items[url_items.length-1];
		var cb = function(data){
			var father = $(".status-going");
			for(var i = 0;i < data.length;i++){
				var item = $(Template.wish_list_item);
				WishListener.setItemData(item,data[i]).appendTo(father);
			}
		};
		//初始化ongoing的愿望
		sendAjax("/wish_list_data/"+project_id+"/null/null/ongoing","get",null,"json",cb);
	},
	getIWishWish : function(){
		var url_items = window.location.href.split("/");
		var project_id = url_items[url_items.length-1];
		var cb = function(data){
			for(var i = 0;i < data.length;i++){
				var father = $(".status-iwish");
				var item = $(Template.wish_list_item);
				WishListener.setItemData(item,data[i]).appendTo(father);
			}
			this.index = this.index + this.num;
		};
		//初始化iwish的愿望
		sendAjax("/wish_list_data/"+project_id+"/"+this.index+"/"+this.num+"/iwish","get",null,"json",cb);
	},
	//给元素绑定数据
	setItemData : function(item,data){
		item.find(".wish-status").attr("id","status-"+data.status);
		item.find(".wish-avatar").attr("id","avatar-"+data.user.avatar);
		item.find(".wish-content").text(data.content);
		item.find(".wish-name").text(data.user.avatar);
		item.find(".wish-date").text(data.date);
		item.find(".comment-num").text(data.comment_num);
		item.find(".wish-vote span").text(data.score);
		//item.find(".wish-vote a").attr("href","/add_score/"+data.project_id+"/"+data._id);	
		return item;
	}
};

var CommentListener = {
	listener : function(){

	},
	loading : function(){

	},
	getData : function(){

	}
};

var AddScoreListner = {
	listener : function(){

	}
};

var OperateListener = {
	listener : function(){
		
	}
};

function sendAjax (url, type, data, datatype, cb) {
	$.ajax({
		url: url,
		type: type, 
		data: data,
		datatype: datatype,
		success: cb,
		error: function(XMLHttpRequest, textStatus, errorThrown){
			console.log(XMLHttpRequest + '#' + textStatus + '#' + errorThrown);
		}
	});
}