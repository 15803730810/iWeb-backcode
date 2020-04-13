const express = require('express');
const pool = require('../pool.js');
const svgCaptcha = require('svg-captcha');
const multer  = require('multer');
const fs = require('fs');
let router = express.Router();
module.exports = router
// 用户注册
router.post('/register',(req,res,next)=>{
  let obj = req.body;
	if(!obj.uname){
		let output = {
			code:401,
			msg:'uname required'
		};
		res.send(output);
		return;
	};
	if(!obj.upwd){
		let output = {
			code:402,
			msg:'upwd required'
		};
		res.send(output);
		return;
	};
	if(!obj.phone){
		let output = {
			code:403,
			msg:'phone required'
		};
		res.send(output);
		return;
	};
	if(!obj.captcha){
		let output = {
			code:404,
			msg:'captcha required'
		};
		res.send(output);
		return;
	}
	if(obj.captcha.toLowerCase() != req.session.registerCaptcha){
		let output = {
			code:405,
			msg:'captcha error'
		};
		res.send(output);
		return;
	}
	delete req.session.registerCaptcha;
	delete obj.captcha;
	// 查询用户名是否被注册
	let sql = 'SELECT uid FROM user WHERE uname = ? OR phone = ?';
	pool.query(sql,[obj.uname,obj.phone],(err,result)=>{
		if(err){
			next(err);
			return;
		};
		// 如果被注册,返回错误
		if(result.length > 0){
			let output = {
				code:400,
				msg:'uname or phone is already taken'
			};
			res.send(output);
			return
		}else{
		// 如果没有被注册,就插入
			let sql = 'INSERT INTO user SET ?';
			pool.query(sql,[obj],(err,result)=>{
			  if (err) {
			  	next(err);
					return;
			  };
			  let output = {
			  	code:200,
			  	msg:'register success',
			  	uid:result.insertId
			  };
			  res.send(output)
			})
		}
	})
})
// 用户登录
router.post("/login", (req, res, next) => {
	// console.log(req)
  let obj = req.body;
	if(!obj.uname){
		let output = {
			code:'401',
			msg:'uname required'
		};
		res.send(output);
		return;
	};
	if(!obj.upwd){
		let output = {
			code:'402',
			msg:'upwd required'
		};
		res.send(output);
		return;
	}
  let sql = "SELECT uid,uname,nickname FROM user WHERE uname=? AND upwd=?";
  pool.query(sql, [obj.uname, obj.upwd], (err, result) => {
    if (err) {
			next(err);
			return;
		};
    if (result.length > 0) {
			let output = {
        code: 200,
        msg: "login success",
        userInfo: result[0]
      };
      res.send(output);
			// 在当前客户端保存在服务器上的session空间内存储自己的数据
			req.session.userInfo = result[0]
			req.session.save();
    }else{
			let output = {
				code:400,
				msg:'Wrong username or password'
			};
			res.send(output)
		};
  });
});
// 检测用户名是否存在
router.get("/check_uname", (req, res, next) => {
  let uname = req.query.uname;
	if(!uname){
		let output = {
			code:'400',
			msg:'uname required'
		};
		res.send(output);
		return;
	};
  sql = "SELECT uid FROM user WHERE uname=?";
  pool.query(sql,uname,(err, result) => {
    if (err) {
    	next(err);
			return;
    };
    if (result.length > 0) {
      let output = {
    		code:200,
    		msg:'exists'
    	}
    	res.send(output)
    } else {
      let output = {
    		code:401,
    		msg:"non-exists"
    	};
    	res.send(output)
    };
  });
});
// 检测手机号是否存在
router.get("/check_phone", (req, res, next) => {
  let phone = req.query.phone;
	if(!phone){
		let output = {
			code:'400',
			msg:'phone required'
		};
		res.send(output);
		return;
	}
  // console.log(phone);
  sql = "SELECT uid FROM user WHERE phone=?";
  pool.query(sql, phone, (err, result) => {
    if (err) {
    	next(err);
			return;
    };
    if (result.length > 0) {
      let output = {
				code:200,
				msg:'exists'
			}
			res.send(output)
    } else {
      let output = {
				code:402,
				msg:"non-exists"
			};
			res.send(output)
    };
  });
});
// 注册用验证码
router.get('/register/captcha',(req,res,next)=>{
	// 使用第三方模块生成验证码{text:"文本",data:"图片内容"}
	let options = {
		size:5,//随机验证码中的字数
		ignoreChars:'0oOl1',//忽略的字母
		// charPreset:'123456789'//预设的字符库
		width:120,//图片宽度默认150
		height:30,//高度默认50
		fontSize:30,//字体大小
		noise:4,//干扰线
		color:true,//字体颜色彩色
		background:'#c1eebd'//背景色
	}
	let captcha = svgCaptcha.create(options);
	// 1.在服务器端会话中存储此时生成的验证码
	req.session.registerCaptcha = captcha.text.toLowerCase();
	// 2.向客户端输出此验证码的内容
	res.type('svg');//修改Content-Type:image/svg+xml
	res.send(captcha.data);
})
// 上传头像
let upload = multer({ dest: 'uploads/' })
router.post('/upload/avatar', upload.single('avatar'),(req, res, next)=>{
  // req.file is the `avatar` file
  // req.body will hold the text fields, if there were any
	let oldName = req.file.path;//客户端上传到服务器端的临时文件名
	let newName = generateNewFilePath(req.file.originalname);
	fs.rename(oldName,newName,(err)=>{//将旧路径替换为新路径
		if(err){
			next(err);
			return;
		};
		let output = {
			code:200,
			msg:'upload success',
			fileName:newName
		};
		res.send(output);
	})
})
//生成新文件名的API
function generateNewFilePath(originalFileName){
	let path = './images/avatar/';
	path += Date.now();
	path += Math.floor(Math.random()*90000+10000);
	
	let lastDotIndex = originalFileName.lastIndexOf('.');
	let extName = originalFileName.substring(lastDotIndex);
	path += extName;
	return path;
}