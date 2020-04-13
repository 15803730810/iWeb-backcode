const express = require('express');
const pool = require('../pool.js');
let router = express.Router();
module.exports = router
// 获取讲师列表
router.get('/teacher/list',(req,res,next)=>{
  let sql = 'SELECT * FROM teacher';
  pool.query(sql,(err,result)=>{
    if(err){
			next(err);
			return;
		};
		res.send(result);
  });
});
// 获取课程分类
router.get('/type',(req,res,next)=>{
	let sql = "SELECT tpid,tpname FROM type ORDER BY tpid";
	pool.query(sql,(err,result)=>{
		if(err){
			next(err);
			return;
		};
		res.send(result);
	})
})
// 获取课程列表
router.get('/course/list',(req,res,next)=>{
	let pageNum = req.query.pageNum;
	let typeId = req.query.typeId;
	if (!pageNum) {//客户端未提交默认显示第一页
		pageNum = 1;
	}else{//客户端提交了数据，转为数字
		pageNum = parseInt(pageNum);
	};
	if(!typeId){//客户端未提交课程类别，默认全部显示
		typeId = 0;
	}else{//客户端提交了类别
		typeId = parseInt(typeId);
	};
	let output = {
		pageNum:pageNum,//第几页
		pageSize:3,//每页展示数量
		pageCount:0,//符合条件的总页数
		totalCount:0,//符合条件的总记录数
		list:[]//符合条件的数据
	};
	let condition = '';
	let placeholder = [];
	if(typeId != 0){
		condition += '  AND typeId = ?';
		placeholder.push(typeId);
	}
	// 查询出满足条件的总记录数，并计算出总页数
	let sql = 'SELECT COUNT(*) AS c FROM course WHERE 1 '+condition;
	pool.query(sql,placeholder,(err,result)=>{
		if(err){
			next(err);
			return;
		};
		output.totalCount = result[0].c;//总记录数
		output.pageCount = Math.ceil(output.totalCount/output.pageSize);//总页数
		let sql = 'SELECT cid,typeId,title,teacherId,cLength,startTime,address,pic,price,tpid,tpname,tid,tname,maincourse,tpic FROM course AS c,type AS t,teacher AS h WHERE c.typeId = t.tpid AND c.teacherId = h.tid '+condition+' ORDER BY cid DESC LIMIT ?,?';
		placeholder.push( (output.pageNum-1)*output.pageSize );//从哪条记录开始读取
		placeholder.push( output.pageSize );//一次最多读取的记录数量
		pool.query(sql,placeholder,(err,result)=>{
			if(err){
				next(err);
				return;
			};
			output.list = result;
			res.send(output);
		})
	})
});
// 获取课程详情
router.get('/course/detail',(req,res,next)=>{
	let cid = req.query.cid;
	if(!cid){
		let output = {
			code:400,
			msg:'cid required'
		};
		res.send(output);
		return;
	};
	let sql = 'SELECT cid,typeId,title,teacherId,cLength,startTime,address,pic,price,details,tid,tname,maincourse,tpic,experience,style FROM course AS c,teacher AS t WHERE cid = ? AND c.teacherId = t.tid';
	pool.query(sql,cid,(err,result)=>{
		if(err){
			next(err);
			return;
		};
		if(result.length > 0){
			res.send(result);
		}else{
			res.send({});
		}
	})
})
// 获取最新课程
router.get('/course/newest',(req,res,next)=>{
	let count = req.query.count;
	if(!count){
		count = 4
	}else{
		count = parseInt(count);
	};
	let sql = 'SELECT cid,title,pic,price,tname FROM course AS c,teacher AS t WHERE c.teacherId = t.tid ORDER BY cid DESC LIMIT 0,?';
	pool.query(sql,count,(err,result)=>{
		if(err){
			next(err);
			return;
		};
		res.send(result);
	})
})
// 获取热门课程
router.get('/course/hottest',(req,res,next)=>{
	let count = req.query.count;
	if(!count){
		count = 4
	}else{
		count = parseInt(count);
	};
	let sql = 'SELECT cid,title,pic,price,tname FROM course AS c,teacher AS t WHERE c.teacherId = t.tid ORDER BY c.buyCount DESC LIMIT 0,?';
	pool.query(sql,count,(err,result)=>{
		if(err){
			next(err);
			return;
		};
		res.send(result);
	})
})



