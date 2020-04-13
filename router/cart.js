const express = require('express');
const pool = require('../pool.js');
let router = express.Router();
module.exports = router
// 添加购物车
router.post('/add',(req,res,next)=>{
	let uid = req.uid;
	let cid = req.body.cid;
	let count = req.body.count;
	if(!cid){
		let output = {
			code:400,
			msg:'cid required'
		};
		res.send(output);
		return;
	};
	if(!count){
		count = 1
	};
	let sql = 'INSERT INTO cart (userId,courseId,count) VALUES (?,?,?)';
	pool.query(sql,[uid,cid,count],(err,result)=>{
		if(err){
			next(err);
			return;
		};
		let output = {
			code:200,
			msg:'success'
		};
		res.send(output);
	});
})
// 查询购物车
router.post('/list',(req,res,next)=>{
	let uid = req.uid;
	let sql = 'SELECT ctid,courseId,count,title,pic,price FROM cart AS c,course AS o WHERE c.userId = ? AND c.courseId = o.cid';
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
});
// 更新购物车
router.post('/update',(req,res,next)=>{
	let cid = req.body.cid;
	let count = req.body.count;
	let uid = req.uid;
	if(!cid){
		let output = {
			code:401,
			msg:'cid required'
		};
		res.send(output);
		return;
	};
	if(!count){
		let output = {
			code:402,
			msg:'count required'
		};
		res.send(output);
		return;
	};
	let sql = 'UPDATE cart SET courseId = ?,count = ? WHERE userId = ?';
	pool.query(sql,[cid,count,uid],(err,result)=>{
		if(err){
			next(err);
			return;
		};
		if(result.affectedRows > 0){
			let output = {
				code:200,
				msg:'success'
			};
			res.send(output);
		}else{
			let output = {
				code:400,
				msg:'failed'
			};
			res.send(output);
		}
	})
})
// 清空购物车
router.post('/clear',(req,res,next)=>{
	let uid=req.uid;
	let sql = 'DELETE FROM cart WHERE userId = ?';
	pool.query(sql,uid,(err,result)=>{
		if(err){
			next(err);
			return;
		};
		let output = {
			code:200,
			msg:'success'
		};
		res.send(output);
	})
})
//删除购物车商品
router.post('/delete',(req,res,next)=>{
	let uid = req.uid;
	let ctid = req.body.ctid;
	let cid = req.body.cid;
	if(!ctid){
		let output = {
			code:401,
			msg:'ctid required'
		};
		res.send(output);
		return;
	};
	if(!cid){
		let output = {
			code:402,
			msg:'cid required'
		};
		res.send(output);
		return;
	};
	let sql = 'DELETE FROM cart WHERE ctid = ? AND userId = ? AND courseId = ?';
	pool.query(sql,[ctid,uid,cid],(err,result)=>{
		if(err){
			next(err);
			return;
		};
		if(result.affectedRows > 0){
			let output = {
				code:200,
				msg:'success'
			};
			res.send(output)
		}else{
			let output = {
				code:400,
				msg:'failed'
			};
			res.send(output);
		}
	})
})


