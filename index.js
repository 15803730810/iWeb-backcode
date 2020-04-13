const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const session = require('express-session');
const loginCheckMiddleWare = require('./middleware/loginCheck.js')

let port = 9090;
let app = express();
app.listen(port, () => {
	console.log("sever listening on port:" + port)
})

// 前置中间件
// 1.body-parser
app.use(bodyParser.json())
// 2.cors
app.use(cors({
	// origin: ["http://localhost:8080", "http://127.0.0.1:8080"],
	// credentials: true
}))
// 3.multer处理客户端上传文件

// 4.服务器端session会话中间件
app.use(session({
	secret:'iwebsecret123',//指定生成sid所用的加密秘钥
	saveUninitialized:true,//是否保存未经初始化session的数据
	resave:true//是否重新保存session数据
}));
// 路由&路由器
// 用户路由user
const userRouter = require('./router/user');
// 收藏夹路由
const favoriteRouter = require('./router/favorite');
// 讲师模块
const indexRouter = require('./router/index');
// 购物车模块
const cartRouter = require('./router/cart.js');
app.use('/', indexRouter);
app.use('/user', userRouter);
app.use('/favorite',loginCheckMiddleWare);
app.use('/favorite', favoriteRouter);
app.use('/cart',loginCheckMiddleWare);
app.use('/cart',cartRouter);

// 后置中间件
// 1.异常处理中间件-处理路由执行过程中出现的所有错误
app.use((err, req, res, next) => {
	res.status(500); //修改响应消息状态码
	let output = {
		code: 500,
		msg: 'Error occoured during server running',
		err: err
	};
	res.send(output)
})
