const jwt = require('jsonwebtoken');


module.exports = (req, res, next) => {
  const token = req.get('authorization').split(' ')[1];
  // const token = req.headers.authorization.split(' ')[1];
  let decodedToken;
  try {
    console.log(token)
    decodedToken = jwt.verify(token, process.env.secretOrKey);
    console.log(decodedToken)
    req.userId = decodedToken.id;
    } catch (err) {
      // const error = new Error(err);
      next(err);
      } 
  next();
}
  