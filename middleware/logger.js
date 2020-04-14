
module.exports = (format) => { //HOF allows us to turn our Cust MW into a f()
return  (req, res, next) => { 
   console.log(`${new Date().toISOString()} ${req.ip} ${req.method} ${req.url}`)
   next()
} }