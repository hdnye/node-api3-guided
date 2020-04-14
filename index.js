const express = require("express")
const cors = require('cors')
// const morgan = require('morgan')
const welcomeRouter = require("./welcome/welcome-router")
const usersRouter = require("./users/users-router")
const logger = require('./middleware/logger')
const server = express()
const port = 4000

//Middleware chain, executed in order
server.use(express.json())
server.use(cors())
// server.use(morgan());
// Custom MW to log user details in place of morgan
server.use(logger())


// this middleware function will only run if no route is found.
// routes never call `next()`, so if a route is found, this never runs.
// Route handler error message
server.use((req, res) => {
	res.status(404).json({
		message: "Route not found"
 })
})

// any time a middleware function calls `next` with a parameter, like `next(error)`,
// this middleware function will run. The stack skips directly down to it, like a
// catch statement.
// Server error message
server.use((err, req, res, next) => {
	res.status(500).json({
		message: "Oops, something went wrong."
	})
})

server.listen(port, () => {
	console.log(`Server running at http://localhost:${port}`)
})
