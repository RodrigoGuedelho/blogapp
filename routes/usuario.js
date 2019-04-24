const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
require("../models/Usuario")
const Usuario = mongoose.model("usuarios")
const bcrypt = require("bcryptjs");
const passport = require("passport")

function validaFormularioRegistro(req){
  erros = []

  if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null)
    erros.push({texto: "Texto nome inválido."});
  
  if(!req.body.email || typeof req.body.email == undefined || req.body.email == null)
    erros.push({texto: "Email inválida."});
  
  if(!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null)
    erros.push({texto: "Senha inválida."});
  
  if(req.body.senha.length < 6)
    erros.push({texto: "Senha muito curta, use no minimo 6 caracteres."});
  
  if(req.body.senha != req.body.senha2)
    erros.push({texto: "As senhas são diferente, tente novamente."});
  return erros;
}

router.get("/registro",(req, res)=>{
  res.render("usuarios/registro")  
});

router.post("/registro",(req, res)=>{
  erros = []
  erros = validaFormularioRegistro(req);

  if(erros.length > 0){
    res.render("usuarios/registro", {erros: erros});  
  }
  else{
    Usuario.findOne({email: req.body.email}).then((usuario)=>{
      if(usuario){
        req.flash("error_msg", "Email já cadastrado");
        res.redirect("/usuarios/registro");
      }
      else{
        var novoUsuario = new Usuario({
          nome: req.body.nome,
          email: req.body.email,
          senha: req.body.senha
        })

        bcrypt.genSalt(10, (erro, salt)=>{
          bcrypt.hash(novoUsuario.senha, salt, (erro, hash)=>{
            if(erro){
              req.flash("error_msg", "Houve um erro ao tenta salvar usuário");
              res.redirect("/usuarios/registro");
            }
            novoUsuario.senha =  hash
            novoUsuario.save().then(()=>{
              req.flash("success_msg", "Conta de usuário criada com sucesso.");
              res.redirect("/");
            }).catch((err)=>{
              req.flash("error_msg", "Houve um erro ao tenta salvar usuário");
              res.redirect("/usuarios/registro");
            })
            
          })
        })
      }
    }).catch((err)=>{
      req.flash("error_msg", "Houve um erro interno.");
      res.redirect("/");
    })
  }  
});

router.get("/login",(req, res)=>{
  res.render("usuarios/login")  
});

router.post("/login",(req, res, next)=>{
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/usuarios/login",
    failureFlash: true
  })(req, res, next)
});

router.get("/logout",(req, res)=>{
 req.logout();
 req.flash("success_msg", "Deslogado com sucesso.");
 res.redirect("/")
});



module.exports = router;