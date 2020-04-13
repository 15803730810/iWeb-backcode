module.exports = (req,res,next) => {
	if(!req.session){
		let output = {
			code:599,
			msg:'server err: session middleware required'
		};
		res.send(output);
		return;
	};
	if(!req.session.userInfo){
		let output = {
			code:499,
			msg:'login required'
		};
		res.send(output);
		return;
	};
	req.uid = req.session.userInfo.uid;
	next();
}