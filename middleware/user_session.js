const { getUserDetails } = require('../helpers/user-helpers')

module.exports = {
    sessionCheck: (req, res, next) => {

        if (req.session.users) {
            getUserDetails(req.session.users._id).then((user) => {
                if (user.isBlocked) {
                    req.session.loggedIn = false
                    req.session.users = null
                    res.redirect('/login');

                } else {
                    next()
                }

            })

        } else {

            res.redirect('/login');
            
        }
    },

  

    nocache: (req, res, next) => {
        res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
        res.header('Expires', '-3');
        res.header('Pragma', 'no-cache');
        next();
    }

}