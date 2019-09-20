module.exports = {
    usersOnly: (req, res, next) => {
        if (req.session.user) {
            next()
        } else {
            res.status(401).send({ message: "Please log in"})
        }
    },
    adminsOnly: (req, res, next) => {
        if (req.session.user.isAdmin) {
            next()
        } else {
            res.status(403).send({message: "You are not an admin"})
        }
    }
}