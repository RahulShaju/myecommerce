const isLogin = async(req,res,next)=>{
    try {
        if(req.session.adminId){
          
        }
        else{
            res.redirect('/admin')
        }
        next()
    } catch (error) {
        console.log(error.message)
    }
}

const isLogout = async(req,res,next)=>{
    try {
        if(req.session.adminId){
            res.redirect('/admin')
        }
        next()
        
        
    } catch (error) {
        console.log('yyy:',error.message)
    }
}

module.exports={
    isLogin,
    isLogout
}