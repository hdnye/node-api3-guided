const express = require("express")
const users = require("./users-model")

const router = express.Router()

// This handles the route `GET /users`
router.get("/", /*can add MW directly into our route handler*/(req, res) => {
	// these options are supported by the `users.find` method,
	// so we get them from the query string and pass them through.
	const options = {
		// query string names are CASE SENSITIVE,
		// so req.query.sortBy is NOT the same as req.query.sortby
		sortBy: req.query.sortBy,
		limit: req.query.limit,
	}

	users.find(options)
		.then((users) => {
			res.status(200).json(users)
		})
		.catch((error) => {
			next(error)
		})
})

// This handles the route `GET /users/:id`
router.get("/:id", validateUserId(), (req, res) => {
	res.status(200).json(req.user)
//	validateUserId() replace this code:
// 	users.findById(req.params.id)
// 		.then((user) => {
// 			if (user) {
// 				res.status(200).json(user)
// 			} else {
// 				res.status(404).json({
// 					message: "User not found",
// 				})
// 			}
// 		})
// 		.catch((error) => {
// 			console.log(error)
// 			res.status(500).json({
// 				message: "Error retrieving the user",
// 			})
// 		})
})

// This handles the route `POST /users`
router.post("/", bodyReqs(), (req, res) => {
	// if (!req.body.name || !req.body.email) {
	// 	return res.status(400).json({
	// 		message: "Missing user name or email",
	// 	})
	// }

	users.add(req.body)
		.then((user) => {
			res.status(201).json(user)
		})
		.catch((error) => {
			next(error)
		})
})

// This handles the route `PUT /users/:id`
router.put("/:id", bodyReqs(), validateUserId(), (req, res) => {
	
	// if (!req.body.name || !req.body.email) {
	// 	return res.status(400).json({
	// 		message: "Missing user name or email",
	// 	})
	// }

	users.update(req.params.id, req.body)
		.then((user) => {
		//	if (user) {
				res.status(200).json(user)
		//	} else {
		//		res.status(404).json({
		//			message: "The user could not be found",
		//		})
			})
		// .catch((error) => {
		// 	console.log(error)
		// 	res.status(500).json({
		// 		message: "Error updating the user",
		// 	})
		// })
})

// This handles the route `DELETE /users/:id`
router.delete("/:id", validateUserId(), (req, res) => {
	users.remove(req.params.id)
		.then((count) => {
		//	if (count > 0) {
				res.status(200).json({
		//			message: "The user has been nuked",
				})
		//	} else {
		//		res.status(404).json({
    	//				message: "The user could not be found",
    	//			})
    	//		}
		})
		.catch((error) => {
			next(error)
		})
})

// Since posts in this case is a sub-resource of the user resource,
// include it as a sub-route. If you list all of a users posts, you
// don't want to see posts from another user.
router.get("/:id/posts", (req, res) => {
	users.findUserPosts(req.params.id)
		.then((posts) => {
			res.status(200).json(posts)
		})
		.catch((error) => {
			console.log(error)
			res.status(500).json({
				message: "Could not get user posts",
			})
		})
})

// Since we're now dealing with two IDs, a user ID and a post ID,
// we have to switch up the URL parameter names.
// id === user ID and postId === post ID
router.get("/:id/posts/:postId", (req, res) => {
	users.findUserPostById(req.params.id, req.params.postId)
		.then((post) => {
			if (post) {
				res.json(post)
			} else {
				res.status(404).json({
					message: "Post was not found",
				})
			}
		})
		.catch((error) => {
			next(error)
		})
})

router.post("/:id/posts", (req, res) => {
	if (!req.body.text) {
		// Make sure you have a return statement, otherwise the
		// function will continue running and you'll see ERR_HTTP_HEADERS_SENT
		return res.status(400).json({
			message: "Need a value for text",
		})
	}

	users.addUserPost(req.params.id, req.body)
		.then((post) => {
			res.status(201).json(post)
		})
		.catch((error) => {
			next(error)
		})
})

// MW hof() to extract repeating code from route handlers as a cb
function validateUserId() {
	return (req, res, next) => {
		users.findById(req.params.id)
			.then((user) => {
				if(user) {
					// make the user obj available to later MW f()s
					req.user = user
					next() //call success, next() to move on to the next piece of MW
				} else {
					res.status(404).json({
						message: "User not found."
					})
				}
			})
			.catch((error) => {
				next(error) // replaces the below code
			// 	console.log(error)
			// 	res.status(500).json({
			// 		message: "Could not find user",
			// })
		})	
	}
}

function bodyReqs() {
	return (req, res, next) => {
		if(!req.body.name || !req.body.email) {
			 return res.status(400).json({
				message: "Missing name or email."
			})
		} 
		  next()
	}
 }



module.exports = router
