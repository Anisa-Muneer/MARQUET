const isLogin = async (req, res, next) => {
    try {
      if (req.session.auser_id) {
        // User is logged in, continue to next middleware or route handler
        next();
      } else {
        // User is not logged in, redirect to login page
        res.redirect("/admin");
      }
    } catch (err) {
      console.log(err.message);
      
    }
  };

  const isLogout = async (req, res, next) => {
    try {
      if (req.session.auser_id) {
        // User is logged in, redirect to home page
        res.redirect("/admin/dashboard");
      } else {
        // User is not logged in, continue to next middleware or route handler
        next();
      }
    } catch (err) {
      console.log(err.message);
     
    }
  };

  module.exports = {
    isLogin,
    isLogout
}