const mongoose = require('mongoose');
const { buffer } = require('stream/consumers');


mongoose.connect("mongodb://127.0.0.1:27017/ExpenseTracking");

const user = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        unique: true,
    },
})



const article = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    text: {
        type: String,
        required: true,
    },
    code: {
        type: String,
        // required: true,
    },
    image: {
        data: buffer,
        contentType: String,
    },
    
})

const Article = mongoose.model("Article", article);
const User = mongoose.model("User", user);
module.exports = {Article, User};
