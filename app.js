const express = require('express');
const app = express();

const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const session = require('express-session');
const multer = require('multer');
const { buffer } = require('stream/consumers');
const {Article, User} = require('./mongo');




app.use(session({
    secret: 'mysecretkey',
    resave: false,
    saveUninitialized: true,
    cookie: {maxAge: 600000}
}))


// multer
const storage = multer.memoryStorage();
const upload = multer({storage: storage});




/*************************************************************************************************************************/

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));



/*************************************************************************************************************************/


app.get('/register', (req,res)=>{
    res.render('register');
})

app.post('/register', async (req,res)=>{   
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    // const {name, email, password} = req.body;
    // const user = await User.create({ name, email, password});
    // req.session.user = { id: user._id, email: user.email, name: user.name };

    const newUser = new User({
        name : req.body.name,
        email : req.body.email,
        password : hashedPassword
    })

    const result = await newUser.save();

    req.session.user = { id: result._id, name: result.name };
    res.redirect('/');

    
    
})


/*************************************************************************************************************************/


app.get('/login', (req,res)=>{
    res.render('login');
})

app.post('/login', async (req,res)=>{
    const existingUser = await User.findOne({name : req.body.name});
    if(existingUser) {
        const validatePasword = await bcrypt.compare(req.body.password, existingUser.password);

        if(validatePasword){

            req.session.user = { id: existingUser._id, name: existingUser.name };

            res.redirect('/');
        }
        else{
            res.send("<h1> Incorrect Password </h1>");
        }
    }
    else{
        res.send("<h1> User Not registered </h1>");
    }
})


/*************************************************************************************************************************/

app.get('/account', (req,res)=>{
    if(req.session.user){
        res.render('account', { user: req.session.user.name });
    }
    else{
        const givenName = "Guest Name"
        res.render('account', { user:  givenName});
    }
})

app.get('/logout', (req,res)=>{
    req.session.destroy((err)=>{
        if(err){
            console.log(err);
        }
        else{
            res.redirect('/');
        }
    })
})



















/*************************************************************************************************************************/
app.get('/', (req,res)=>{
    // if (req.session.user) {
    //     res.render('index');
    // }
    // else{
    //     res.redirect('login');
    // }
    res.render('index');
})

app.post('/', upload.single('Article'), async (req, res)=>{
    
    // const title  = req.body.title;
    // const text = req.body.text;
    // const code = req.session.user.name;
    // const newDoc = new Article({title, text, code});

    const newDoc = new Article({
        title: req.body.title,
        text: req.body.text,
        code: req.session.user.name,
        // image: {
        //     data: req.file.buffer,
        //     contentType: req.file.mimetype,
        // }
    })
    await newDoc.save();
    res.redirect('/account');
})


app.get('/thanks', async (req, res) => {

    if(req.session.user){
    const articles = await Article.find();
    const code = req.session.user.name;
    
    res.render('thanks', { articles: articles, code: code});
    }
    else{
        res.redirect('login');
    }
    
});


/*************************************************************************************************************************/
app.get('/delete/:id', async (req,res)=>{
    const item = await Article.findById(req.params.id);
    res.render('/thanks');
})

app.post('/delete/:id', async (req,res)=>{
    await Article.findByIdAndDelete(req.params.id);
    res.redirect('/thanks');
})



/*************************************************************************************************************************/
app.get('/update/:id', async (req,res)=>{
    const item = await Article.findById(req.params.id);
    res.render('update', {item});
})

app.post('/update/:id', async (req,res)=>{
    try{
    await Article.findByIdAndUpdate(req.params.id, {
        title: req.body.title,
        text: req.body.text,
    });
    res.redirect('/thanks');
    }
    catch(err){
        console.log(err);
    }
})


/*************************************************************************************************************************/

app.get('/read/:id', async (req,res)=>{
    const person = await Article.findById(req.params.id);
    res.render('read', {person});
})









app.listen(4500, ()=>{
    console.log("Server running on port: 4500");
})


