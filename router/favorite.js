const express = require('express');
const pool = require('../pool.js');
let router = express.Router();
module.exports = router
// 添加收藏
router.post('/add',(req,res,next)=>{
	let uid = req.uid;//从登录信息中心提取uid
	let cid = req.body.cid;//客户端提交的课程编号
	if(!cid){
		let output = {
			code:401,
			msg:'cid required'
		};
		res.send(output);
		return;
	}
	let fTime = Date.now();
	// 2.执行数据库插入操作
	let sql = 'SELECT fid FROM favorite WHERE userId = ? AND courseId = ?';
	pool.query(sql,[uid,cid],(err,result)=>{
		if(err){
			next(err);
			return;
		};
		if(result.length > 0){
			let sql = 'UPDATE favorite SET fTime = ? WHERE fid = ?';
			pool.query(sql,[fTime,result[0].fid],(err,result)=>{
				if(err){
					next(err);
					return;
				};
				let output = {
					code:201,
					msg:'favorite update success'
				};
				res.send(output);
			})
		}else{
			let sql = 'INSERT INTO favorite VALUES(NULL,?,?,?)';
			pool.query(sql,[uid,cid,fTime],(err,result)=>{
				if(err){
					next(err);
					return;
				};
				let output = {
					code:200,
					msg:'favotite add success',
					fid:result.insertId
				};
				res.send(output);
			});
		}
	})
})
// 获取收藏列表
router.get('/list',(req,res,next)=>{
	let uid = req.uid;
	let sql = 'SELECT title,pic,price,courseId,fid,fTime FROM favorite AS f,course AS c WHERE c.  cid=f.courseId AND f.userId = ?';
	pool.query(sql,uid,(err,result)=>{
		if(err){
			next(err);
			return;
		};
		if(result.length > 0){
			res.send(result);
		}else{
			let output = {
				code:400,
				msg:'nothing'
			};
			res.send(output);
		}
	})
})




