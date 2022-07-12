const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');



function initialize(passport, getUserByEmail, getUserById) {

    const authenticateUser = async (email, password, done) => {
        const user = getUserByEmail(email);
        console.log(user);
        
        if(user == null) {
            return done(null, false, { message: 'user tidak ditemukan' });
        }

        const bcryptCompare = await bcrypt.compare(password, user.password);

        try {
            if (bcryptCompare) {
                return done(null, user);
            } else {
                return done(null, false, { message: 'password salah'})
            }
        } catch (e){
            return done(e);
        }
    }

   passport.use(new LocalStrategy( { usernameField: 'email' }, authenticateUser));
   passport.serializeUser((user, done) => {
        return done(null, user.id);
   });
   passport.deserializeUser((id, done) => {
        return done(null, getUserById(id));
   });
}

module.exports = {initialize}