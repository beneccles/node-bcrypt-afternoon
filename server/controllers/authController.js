const bcrypt = require('bcryptjs')

module.exports = {
    register: async (req, res) => {
        // Get the database instance
        const db = req.app.get('db')

        // Destructure the body of the request.
        const { username, password, isAdmin } = req.body

        /*Get the database instance and run the sql file get_user, passing in username. 
        This query will check the database to see if the username is already taken. 
        Since this query is asynchronous, make sure to use the await keyword to ensure
         that the promise resolves before the rest of the code executes. */
        // ! Check to see if username is in use
        // ! Remeber, if the SQL file uses $# shorthand, you need to encapsulate in array brackets [].
        const result = await db.get_user([username])
        const existingUser = result[0];

        if (existingUser) {
            res.status(409).send({ message: 'Username taken' })
        }
        // Generate new hash
        const salt = bcrypt.genSaltSync(10)
        const hash = bcrypt.hashSync(password, salt)

        const registeredUser = await db.register_user([isAdmin, username, hash])
        const user = registeredUser[0]

        req.session.user = {
            isAdmin: user.is_admin,
            id: user.id,
            username: user.username
        }

        res.status(201).send(req.session.user)
    },
    login: async (req, res) => {
        const { username, password } = req.body
        const db = req.app.get('db')

        // Result from DB will always come back as an array. even if there is only one result!
        // Pull the first element off the array in another variable in order to avoid this causing problems later.
        const foundUser = await db.get_user([username])
        const user = foundUser[0]

        if (!user) {
            res.status(401).send({ message: 'User not found. Please register as a new user before logging in.' })
        }

        // Compared the entered password with the salted one in the database
        const isAuthenticated = bcrypt.compareSync(password, user.hash)

        if (!isAuthenticated) {
            res.status(403).send({ message: 'Incorrect password' })
        } else {

            req.session.user = {
                isAdmin: user.is_admin,
                id: user.id,
                username: user.username
            }

            res.status(200).send(req.session.user)

        }
    }
}