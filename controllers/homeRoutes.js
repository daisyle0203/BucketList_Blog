const router = require("express").Router()
const sequelize = require("../config/connection")
const { Post, User, Comment } = require("../models")

// GET /, rendering all the bucket lists on the homepage
router.get("/", async (req, res) => {
  try {
    const posts = await Post.findAll({
      attributes: ["id", "title", "created_at", "post_content"],
      include: [
        {
          model: Comment,
          attributes: ["id", "comment", "post_id", "user_id"],
          include: {
            model: User,
            attributes: ["name"],
          },
        },
        {
          model: User,
          attributes: ["name"],
        },
      ],
    })

    res.render("homepage", {
      posts,
      loggedIn: req.session.loggedIn,
    })
  } catch (e) {
    res.status(500).json(e)
  }
})

// rendering the login page
// redirecting users to homepage once they log in
router.get("/login", async (req, res) => {
  if (req.session.loggedIn) {
    res.redirect("/")
    return
  }
  res.render("login")
})

// rendering sign up page 
// redirecting users to the login once they sign up
router.get("/signup", async (req, res) => {
  if (req.session.loggedIn) {
    res.redirect("/login")
    return
  }
  res.render("signup")
})

// rendering one post to the single-post page
router.get("/post/:id", async (req, res) => {
  try {
    const post = await Post.findOne({
      where: {
        id: req.params.id,
      },
      attributes: ["id", "title", "post_content"],
      include: [
        {
          model: Comment,
          attributes: ["id", "comment", "post_id", "user_id", "created_at"],
          include: {
            model: User,
            attributes: ["name"],
          },
        },
      ],
    })
    if (!post) {
      res.status(404).json({ message: "No post with this id found" })
      return
    }

    const singlePost = post.get({ plain: true })

    res.render("single-post", {
      singlePost,
      loggedIn: req.session.loggedIn,
    })
  } catch (e) {
    res.status(500).json({ message: "Server Error" })
  }
})

module.exports = router
