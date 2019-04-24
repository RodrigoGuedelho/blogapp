//Carregando módulos    
const express = require("express");

const handlebars = require("express-handlebars");
const bodyParser = require("body-parser");
const app = express();
const admin = require("./routes/admin");
const usuario = require("./routes/usuario");
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");
const flash = require("connect-flash");
require("./models/Postagem")
const Postagem = mongoose.model("postagens");
require("./models/Categoria")
const Categoria = mongoose.model("categorias");
const passport = require("passport")
require("./config/auth")(passport)
//Configurações
    //Sessão
        app.use(session({
            secret: "QuantoMaisDificilMelhor",
            resave: true,
            saveUninitialized: true
        }));
        app.use(passport.initialize())
        app.use(passport.session())
        app.use(flash());

    //middleware
        app.use((req, res, next)=>{
            res.locals.success_msg = req.flash("success_msg");
            res.locals.error_msg = req.flash("error_msg");
            res.locals.error = req.flash("error")
            res.locals.user = req.user || null;
            next();
        })
    // bory parsers
        app.use(bodyParser.urlencoded({extended: true}));
        app.use(bodyParser.json());
    // handlebars template engine
		app.engine('handlebars', handlebars({defaultLayout: 'main'}))
        app.set('view engine', 'handlebars');
    // Mongoose
        mongoose.Promise = global.Promise;
        mongoose.connect("mongodb://localhost/blogapp").then(()=>{
            console.log("conectado ao mongoDB.");
        }).catch((err)=>{
            console.log("Erro ao tenta se conectar ao mongoDB. " + err);
        })
    //public - arquivos static
        app.use(express.static(path.join(__dirname, "public")));
//Rotas
    app.use('/admin', admin)
    app.use('/usuarios', usuario)

    app.get('/', (( req, res)=>{
        Postagem.find().populate("categoria").sort({data: "desc"}).then((postagens)=>{
            res.render("index", {postagens: postagens})
        }).catch((err)=>{
            req.flash("error_msg", "Erro ao carregar postagens. " + err);
            res.redirect("/404")
        })
         
    }));
    app.get('/postagem/:slug', (( req, res)=>{
        Postagem.findOne({slug : req.params.slug}).populate("categoria").then((postagem)=>{
            if(postagem)
                res.render("postagem/index", {postagem: postagem})
            else{
                req.flash("error_msg", "Essa postagem não existe.");
                res.redirect("/");
            }   

        }).catch((err)=>{
            req.flash("error_msg", "Erro ao carregar postagem. " + err);
            res.redirect("/404")
        })
         
    }));

    app.get('/categorias', (( req, res)=>{
        Categoria.find().sort({data : "desc"}).then((categorias)=>{
            res.render("categorias/index", {categorias: categorias})
        }).catch((err)=>{
            req.flash("error_msg", "Erro ao carregar categorias. " + err);
            res.redirect("/")
        })
    }));

    app.get('/categorias/:slug', (( req, res)=>{
        Categoria.findOne({slug : req.params.slug}).then((categoria)=>{
            if(categoria){
                Postagem.find({categoria: categoria._id}).then((postagens)=>{
                    res.render("categorias/postagens", {postagens: postagens, categoria: categoria})
                }).catch((err)=>{
                    req.flash("error_msg", "Houve um erro ao lista os postes.");
                    res.redirect("/")
                });
            }
            else{
                req.flash("error_msg", "Categoria não existe.");
                res.redirect("/")  
            }
           
        }).catch((err)=>{
            req.flash("error_msg", "Erro ao carregar categorias.");
            res.redirect("/")
        })
    }));


    app.get('/404', (( req, res)=>{
        res.send("Erro 404!")
    }));

//Outros

const PORT = process.env.PORT || 8081;
app.listen(PORT, function () {
	console.log("Servidor rodando na url http://localhost:8081");
});
