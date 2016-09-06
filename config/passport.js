var LocalStrategy = require('passport-local').Strategy;

var User = require('./models/user.js');

module.exports = function(passport){
    
    //requirements for persistent sessions with passport
    passport.serializeUser(function(user, done){
        done(null, user.id);
    });  
    
    passport.deserializeUser(function(id, done){
        User.findById(id, function(err, user){
            done(err, user);
        });
    });
    
    //signup functions
    passport.use('local-signup', new LocalStrategy({
        passReqToCallback: true
    },
        function(req, username, password, done){
            console.log('authenticating signup request')
            if (username.length < 3){
                console.log('user name ' + username + ' too short');
                return done(null, false, req.flash('signupMessage', 'Username should be at least 3 characters long.'));
            }
            if (password.length < 3){
                console.log('password too short');
                return done(null, false, req.flash('signupMessage', 'Password should be at least 3 characters long.'));
            }
            process.nextTick(function(){
                User.findOne({'username': username}, function(err, user){
                    //error with database
                    if (err){
                        console.log('db error')
                        return done(err);
                    }
                    //user already exists
                    if (user){
                        console.log('user already exists')
                        return done(null, false, req.flash('signupMessage', 'User name is already in use.'))
                    }
                    //user does not exist, add them
                    else {
                        console.log('adding new user');
                        var newUser = new User();
                        //set the username and password for the db entry
                        newUser.username = username;
                        newUser.password = newUser.generateHash(password);
                        //save the user and return them
                        newUser.save(function(err){
                            if (err)
                                throw err;
                            return done(null, newUser);
                        });
                    }
                });
            });
    }));
    
    passport.use('local-login', new LocalStrategy({
        passReqToCallback: true
    },
        function(req, username, password, done){
            console.log('checking user info');
            process.nextTick(function(){
               User.findOne({ 'username': username}, function(err, user){
                   if (err){
                       console.log('db error');
                       return done(err);
                   }
                   if (!user){
                       console.log('user not found');
                       return done(null, false, req.flash('loginMessage', 'Username not found.'));
                   }
                   if (!user.validPassword(password)){
                       console.log('bad password');
                       return done(null, false, req.flash('loginMessage', 'Incorrect password.'));
                   }
                   console.log('user found');
                   return done(null, user);
               })
            });
        }));
}