const jwt = require('jsonwebtoken'); 

module.exports = (req, res, next)=>{
    const authHeader = req.get('Authorization');
    if(!authHeader){
        return res.status(401).json({message:"Not Authorization."})
    }
    const token = req.get('Authorization').split(' ')[1];
    let decodedToken;
    try {
        decodedToken = jwt.verify(token,'secret');
    } catch (error) {
        return res.status(500).json({message: error})
    }
    if(!decodedToken){
        return res.status(401).json({message:"Not Authenticated."})
    }
    req.userId = decodedToken.userId;
    next();
}