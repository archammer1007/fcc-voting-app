var mongoose = require('mongoose');

var pollSchema = mongoose.Schema({
    title: String,
    options: [{
        name: String,
        votes: [String]
    }],
    creator: String
})

module.exports = mongoose.model('Poll', pollSchema)