var Poll = require('../../config/models/poll.js');
var React = require('react');
var ReactDOM = require('react-dom/server');
var components = require('../../public/components.js');

var HelloMessage = React.createFactory(components.HelloMessage)
var PollCreationForm = React.createFactory(components.PollCreationForm)

module.exports = function(app, passport){
    
    app.get('/', function(req, res){
        res.render('index', {
            logged: req.isAuthenticated()
        })
    })
    
    app.get('/polls', function(req, res){
        Poll.find({}, function(err, polls){
            if (err){
                throw err;
            }
            res.render('polls', {
                    loggedin: req.isAuthenticated(),
                    polls: polls
            });
        });
    });

    app.get('/mypolls', isLoggedIn, function(req, res){
        var myname = req.user.username;
        Poll.find({
            creator: myname
        }, function(err, polls){
            if(err)(console.log(err))
            res.render('polls', {
                loggedin: req.isAuthenticated(),
                polls: polls,
                mypolls: true
            })
        })
    })
    
    app.get('/login', function(req, res){
        res.render('login', {
            loggedin: req.isAuthenticated(),
            message: req.flash('loginMessage')
        });
    })
    
    app.get('/signup', function(req, res){
        res.render('signup', {
            loggedin: req.isAuthenticated(),
            message: req.flash('signupMessage')
        });
    })
    
    app.get('/logout', function(req, res){
        req.logout();
        req.session.destroy();
        res.redirect('/');
    })
    
    app.get('/create', isLoggedIn, function(req, res){
        res.render('create', {
            react: ReactDOM.renderToString(PollCreationForm()),
            loggedin: req.isAuthenticated()
        });
    })
    
    //check if poll with id :id exists
    //if so, send page
    //if not, send error page
    app.get('/poll/:id', function(req, res){
        var id = req.params.id
        console.log('finding poll with id ' + id)
        Poll.findById( id, function(err, poll){
            if (err){
                console.log(err);
                res.render('error', {
                    error: 'Poll with id ' + id + ' not found',
                    loggedin: req.isAuthenticated()
                });
            }
            else if (!poll){
                console.log('poll not found');
                res.render('error',{
                    error: 'Poll with id ' + id + ' not found',
                    loggedin: req.isAuthenticated()
                });
            }
            else {
                console.log('poll ' + poll.id + ' found with name ' + poll.title)
                var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
                res.render('poll', {
                    poll: poll,
                    loggedin: req.isAuthenticated(),
                    fullUrl: fullUrl
                });
            }
        })
    })
    
   app.post('/signup', passport.authenticate('local-signup', {
        successRedirect: '/polls',
        failureRedirect: '/signup',
        failureFlash: true
    }));
    
    app.post('/login', passport.authenticate('local-login', {
        successRedirect: '/polls', 
        failureRedirect: '/login',
        failureFlash: true
    }));
    
    app.post('/create', isLoggedIn, function(req, res){
        console.log('creating new poll:' + req.body.name);
        var options = req.body.options;
        console.log('with options:')
        options.forEach(function(option){
            console.log(option);
        })
        var newPoll = new Poll();
        newPoll.title = req.body.name;
        options.forEach(function(option){
            newPoll.options.push({
                name: option,
                votes: []
            })
        })
        newPoll.creator = req.user.username;
        newPoll.save(function(err, poll){
            if (err){throw err}
            res.send({"success" : "Updated Successfully", "status" : 200, redirect: '/poll/' + poll._id})
        })
        
    })
    
    //updates a poll with a vote from a user
    //users can vote any number of times for any option on the poll, though there is commented out code that prevents authenticated users from voting multiple times
    app.post('/vote/:id', function(req, res){
        console.log('received vote request')
        var pollid = req.params.id;
        var optionid = req.body.option;
        var username = '';
        if (req.isAuthenticated()){
            username = req.user.username;
        }
        console.log('username is ' + username)
        //search for a poll with same poll id and option id
        Poll.findOne(
            {
                _id: pollid,
                'options._id': optionid
            },
            function(err, poll){
                if (err)(console.log(err));
                console.log("found matching poll and option")
                //check if user has already voted in this poll
            /* var hasVoted = false;
                if (username != ''){
                    poll.options.forEach(function(option){
                        option.votes.forEach(function(vote){
                            if (vote == username)(hasVoted = true);
                        });
                    });
                }
                    //if user has voted, send them an error page
                if(hasVoted){
                    console.log('user has already voted')
                    res.render('error', {error: "You have already voted in this poll."});
                }*/
                //if user has not voted, add their vote to the proper option and resend the voting page (redirect?)
                //else {
                    poll.options.forEach(function(option){
                        console.log(option.name + option.id)
                        if(optionid == option.id){
                            console.log("adding user's vote")
                            option.votes.push(username);
                        }
                    })
                    poll.save(function(err){
                        if(err)(console.log(err))
                        res.redirect('/poll/' + pollid)
                    })
                //}
            });
    })
    
    app.post('/poll/edit/:id', function(req, res){
        var pollid = req.params.id;
        Poll.findOne(
            {
                _id: pollid,
            },
            function(err, poll){
                if(err)(console.log(err))
                var newOption = {
                    name: req.body.newoption,
                    votes: []
                }
                poll.options.push(newOption)
                poll.save(function(err){
                    if(err)(console.log(err))
                    res.redirect('/poll/' + pollid)
                })
            }
        )
    })
    
    //check if poll exists
    //check if poll creator matches user name
    //if all ok, delete the poll, redirect to mypolls
    app.post('/poll/delete/:id', isLoggedIn, function(req, res){
        console.log("trying to delete poll" + req.params.id)
        var pollid = req.params.id
        var username = req.user.username
        Poll.findOneAndRemove({
            _id: pollid,
            creator: username
        },
        function(err, poll){
            if(err)(console.log(err))
            res.redirect('/mypolls')
        })
    })
    
}

function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/login');
}