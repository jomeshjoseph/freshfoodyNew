const getUserDetail  = require('../helpers/user-helpers')

module.exports = {
    sessionCheck: (req, res, next) => {

        if (req.session.user) {
            getUserDetail.getuserdetails(req.session.user._id).then((user) => {
                if (user.isBlocked) {
                    req.session.loggedIn = false
                    req.session.user = null
                    res.redirect('/login');

                } else {
                    next()
                }

            })

        } else {
console.log('pleseeeeeeeeeeeeeee');
res.render("user/user_login");
            
        }
    },

  

    nocache: (req, res, next) => {
        res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
        res.header('Expires', '-3');
        res.header('Pragma', 'no-cache');
        next();
    }

}