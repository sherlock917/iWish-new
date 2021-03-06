var mongoose = require( 'mongoose' );
mongoose.connect( 'mongodb://localhost/wish-tree' );
var Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId;

var Person = new Schema({
	mail : String ,
	password : String ,
	name : String ,
	avatar : String ,
	pro_num : Number ,
	wish_num : Number 
});
var Project = new Schema({
	name : String ,
	content : String ,
	user_id : String ,
	password : String ,
	date : String , 
	wish_num : Number ,
	comment_num : Number
});
var Wish = new Schema({
	content : String ,
	user : {
		name : String,
		avatar : String
	} ,
	project_id : String ,
	status : String,
	score: Number,
	date : String ,
	comment_num : Number,
	new_mark : Boolean
});
var Comment = new Schema({
	user_id : String , 
	user_name : String ,
	project_id : String ,
	wish_id : String ,
	content : String ,
	new_mark : Boolean ,
});

var Persons = mongoose.model( 'Person', Person );
var Projects = mongoose.model( 'Projects', Project );
var Wishs = mongoose.model( 'Wishs', Wish );
var Comments = mongoose.model( 'Comments' , Comment);

exports.selectUser = function(info,cb,err_cb){
	Persons.findOne({mail:info.mail,password:info.psw},function(err,user){
		if(err){
			err_cb(JSON.stringify({result : "db error"}));
			return ;
		}
		if(user){
			cb(user);
		}
		else{
			err_cb(JSON.stringify({result : "fail"}));
		}
	});
};
exports.insertUser = function(info,cb){
	var user = new Persons();
	user.mail = info.mail;
	user.password = info.psw;
	user.name = info.name;
	user.avatar = info.avatar;
	user.pro_num = 0;
	user.wish_num = 0;
	user.save();
	if(user._id){
		cb(user);
	}
};
exports.selectProjectList = function(info,cb,err_cb){
	if(info.user_id != "null"){
		Projects.find({user_id : info.user_id},null,{skip:info.index,limit:info.num}).sort({_id:-1}).exec(function(err,projects){
			if(err){
				err_cb(err);
			}
			if(projects){
				cb(projects);
			}
		});
	}
	else{
		Projects.find({},null,{skip:info.index,limit:info.num}).sort({_id:-1}).exec(function(err,projects){
			if(err){
				err_cb(err);
			}
			if(projects){
				cb(projects);
			}
		});
	}
};
exports.insertProject = function(info,cb){
	var project = new Projects();
	var date = new Date();
	project.name = info.name;
	project.content = info.content;
	project.password = info.password;
	project.user_id = info.user_id;
	project.date = date.getFullYear()+"-"+(parseInt(date.getMonth())+1)+"-"+date.getDate();
	project.wish_num = 0;
	project.comment_num = 0;
	project.save();
	cb(project);
};
exports.selectProject = function(info,cb,err_cb){
	Projects.findOne({_id:info.project_id},function(err,obj){
		if(err){
			err_cb(err);
		}
		if(obj){
			cb(obj);
		}
	});
};
exports.selectProjectWishPsw = function(info,cb,err_cb){
	Projects.findOne({_id:info.project_id},function(err,obj){
		if(err){
			err_cb(err);
		}
		if(obj){
			if(obj.password == info.p_psw){
				cb(JSON.stringify({result:"success"}));
			}
			else{
				cb(JSON.stringify({result:"wrong"}));
			}
		}
	});
};
exports.insertWish = function(info,cb,err_cb){
	Persons.findOne({mail:info.mail,name:info.name},function(err,person){
		if(err){
			err_cb(err);
		}
		if(person){
			var wish = new Wishs();
			var date = new Date();
			wish.content = info.content;
			wish.user.name = info.name;
			wish.user.avatar = person.avatar;
			wish.project_id = info.project_id;
			wish.status = "iwish";
			wish.score = 0;
			wish.date = date.getFullYear()+"-"+(parseInt(date.getMonth())+1)+"-"+date.getDate();
			wish.comment_num = 0;
			wish.new_mark = true;
			wish.save();
			cb(wish);
		}
	});
};
exports.selectWish = function(info,cb,err_cb){
	if(info.status == "iwish"){
		Wishs.find({project_id:info.project_id,status:"iwish"},null,{skip:info.index,limit:info.num}).sort({_id:-1}).exec(function(err,wishs){
			if(err){
				err_cb(err);
			}
			if(wishs){
				cb(wishs);
			}
		});
	}
	else if(info.status == "ongoing"){
		Wishs.find({project_id:info.project_id,status:"ongoing"},function(err,wishs){
			if(err){
				err_cb(err);
			}
			if(wishs){
				cb(wishs);
			}
		});
	}
	else if(info.status == "finish"){
		Wishs.find({project_id:info.project_id,status:"finish"},null,{skip:info.index,limit:info.num}).sort({_id:-1}).exec(function(err,wishs){
			if(err){
				err_cb(err);
			}
			if(wishs){
				cb(wishs);
			}
		});
	}
};
exports.updateScore = function(info,cb,err_cb){
	Wishs.update({_id:info.wish_id},{$inc:{score:1}},function(err,wish){
		if(err){
			err_cb(err);
		}
		else{
			cb();
		}
	});
};
exports.selectComment = function(info, cb, err_cb){
	Comments.find({wish_id:info.wish_id},null,{skip:info.index,limit:info.num}).sort({_id:-1}).exec(function(err,comments){
		if(err){
			err_cb(err);
		}
		if(comments){
			cb(comments);
		}
	});
};
exports.insertComment = function(info, cb, err_cb){
	var comment = new Comments();
	comment.user_id = info.user_id;
	comment.user_name = info.user_name;
	comment.project_id = info.project_id;
	comment.wish_id = info.wish_id;
	comment.content = info.content;
	comment.new_mark = true;
	comment.save();
	console.log(info);
	Projects.update({_id:info.project_id},{$inc:{comment_num:1}},function(err,project){
		if(err){
			err_cb(err);
		}
	});
	Wishs.update({_id:info.wish_id},{$inc:{comment_num:1}},function(err,wish){
		if(err){
			err_cb(err);
		}
	});
	cb();
};
exports.removeWish = function(info, cb, err_cb){
	Wishs.remove({_id:info.wish_id},function(err){
		if(err){
			err_cb(err);
		}
		else{
			cb();
		}
	});
};
exports.updateWishStatus = function(info,cb,err_cb){
	console.log(info);
	Wishs.update({_id:info.wish_id},{$set:{status:info.status}},function(err,obj){
		if(err){
			err_cb(err);
		}
		else{
			cb();
		}
	});
};