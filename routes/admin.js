const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
require("../models/Categoria")
const Categorias = mongoose.model("categorias");
require("../models/Postagem")
const Postagem = mongoose.model("postagens")
const {eAdmin} = require("../helpers/eAdmin")


function validaFormularioCategoria(req){
    var erros = [];
    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({texto: "Nome inválido."});
    }

    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        erros.push({texto: "Slug inválido."});
    }

    if(req.body.nome.length < 2){
        erros.push({texto: "Nome da categoria muito pequeno."});
    }
    return erros;
}
function validaFormularioPostagem(req){
    var erros = [];
    if(!req.body.titulo || typeof req.body.titulo == undefined || req.body.titulo == null){
        erros.push({texto: "Título inválido."});
    }

    if(!req.body.descricao || typeof req.body.descricao == undefined || req.body.descricao == null){
        erros.push({texto: "Descrição inválido."});
    }
    if(!req.body.conteudo || typeof req.body.conteudo == undefined || req.body.conteudo == null){
        erros.push({texto: "Conteúdo inválido."});
    }

    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        erros.push({texto: "slug inválido."});
    }
    if(req.body.categoria == "0"){
        erros.push({texto: "Categoria inválida, registre uma categoria"})
    } 
    return erros;
}



router.get('/',  eAdmin, (req, res)=>{
    res.render("admin/index")
});

router.get('/post',  eAdmin, (req, res)=>{
    res.send("Pagina de posts")
});


router.get('/categorias',  eAdmin, (req, res)=>{
    Categorias.find().sort({date: "desc"}).then((categorias)=>{
        res.render("admin/categorias", {categorias: categorias});
    }).catch((err)=>{
        req.flash("error_msg", "Erro ao tentar carregar categorias" + err);
        res.redirect("/admin")
    })
    
});


router.get('/categorias/add',  eAdmin, (req, res)=>{
    res.render("admin/addcategoria");
});
router.post('/categorias/nova',  eAdmin, (req, res)=>{
    var erros =  validaFormularioCategoria(req);

    
    if(erros.length > 0){
        res.render("admin/addcategoria", {erros: erros});
    }else{
        const novaCategoria = {
            nome: req.body.nome,
            slug: req.body.slug
        }
        new Categorias(novaCategoria).save().then(()=>{
            req.flash("success_msg", "Categoria salva com sucesso.");
            res.redirect("/admin/categorias");
        }).catch((err)=>{
            req.flash("error_msg", "Erro ao salvar categoria. "+ err);
            res.redirect("/admin");
        })
    }
    
   
});

router.get("/categorias/edit/:id",  eAdmin, (req, res)=>{
    Categorias.findOne({_id: req.params.id }).then((categoria)=>{
        res.render('admin/editcategoria', {categoria: categoria})
    }).catch((err)=>{
        req.flash("error_msg", "categoria não existe. "+ err);
        res.redirect("/admin/categorias")
    }) 
});
router.post("/categorias/edit", eAdmin, (req, res)=>{
    var erros =  validaFormularioCategoria(req);
    
    if(erros.length > 0){
        res.render("admin/addcategoria", {erros: erros});
    }else{
        Categorias.findOne({_id: req.body.id}).then((categoria)=>{
            categoria.nome = req.body.nome;
            categoria.slug = req.body.slug;
            categoria.save().then(()=>{
                req.flash("success_msg", "Categoria editada com sucesso.")
                res.redirect("/admin/categorias")
            }).catch((err)=>{
                req.flash("error_msg", "Erro ao editar a categoria. " + err)
                res.redirect("/admin/categorias")
            })
        }).catch((err)=>{
            req.flash("error_msg", "Erro ao editar a categoria. " + err)
            res.redirect("/admin/categorias")
        })
    }
});

router.post("/categorias/deletar", eAdmin, (req, res)=>{
    Categorias.remove({_id: req.body.id}).then((categoria)=>{      
        req.flash("success_msg", "Categoria deletada com sucesso.")
        res.redirect("/admin/categorias")  
    }).catch((err)=>{
        req.flash("error_msg", "Erro ao deleta categoria. " + err)
        res.redirect("/admin/categorias")
    })
});

router.get("/postagens", eAdmin, (req, res)=>{
    Postagem.find().populate("categoria").sort({data: "desc"}).then((postagens)=>{
        res.render("admin/postagens", {postagens: postagens});
    }).catch((err)=>{
        req.flash("error_msg", "Erro ao carregar postagens. " + err);
        res.redirect("/admin/postagens")
    })
   
});

router.get("/postagens/add",  eAdmin, (req, res)=>{
    Categorias.find().then((categorias)=>{
        res.render("admin/addpostagem", {categorias: categorias})
    }).catch((err)=>{
        req.flash("error_msg", "Erro ao carregar formulário. " + err)
        res.redirect("/admin/postagem")
    })
    
 });

 router.post("/postagens/nova",  eAdmin, (req, res)=>{
   var erros = validaFormularioPostagem(req);

   if(erros.length > 0){
    res.render("admin/addpostagem", {erros: erros});
   }else{
      novaPostagem = {
          titulo:  req.body.titulo,
          descricao: req.body.descricao,
          conteudo: req.body.conteudo,
          categoria: req.body.categoria,
          slug: req.body.slug
      }

      new Postagem(novaPostagem).save().then(()=>{
        req.flash("success_msg", "Postagem criada com sucesso.");
        res.redirect("/admin/postagens");
      }).catch((err)=>{
          req.flash("error_msg", "Erro ao tenta inserir uma postagem. " + err);
          res.redirect("/admin/postagens");
      })
   }
});

router.get("/postagens/edit/:id",  eAdmin, (req, res)=>{
    Postagem.findOne({_id: req.params.id }).then((postagem)=>{
        Categorias.find().then((categorias)=>{    
            res.render('admin/editpostagem', {postagem: postagem, categorias: categorias})
        }).catch((err)=>{
            req.flash("error_msg", "Erro ao tentar carrega postagens. " + err);
            res.redirect("/admin/postagens")
        })
        
    }).catch((err)=>{
        req.flash("error_msg", "postagem não existe. "+ err);
        res.redirect("/admin/postagens")
    }) 
});

router.post("/postagens/edit",  eAdmin, (req, res)=>{
    var erros =  validaFormularioPostagem(req);
    
    if(erros.length > 0){
        res.render("admin/editpostagem", {erros: erros});
    }else{
        Postagem.findOne({_id: req.body.id}).then((postagem)=>{
            postagem.titulo = req.body.titulo;
            postagem.slug = req.body.slug;
            postagem.descricao = req.body.descricao;
            postagem.categoria = req.body.categoria;
            postagem.conteudo = req.body.conteudo;
            postagem.save().then(()=>{
                req.flash("success_msg", "Postagem editada com sucesso.")
                res.redirect("/admin/postagens")
            }).catch((err)=>{
                req.flash("error_msg", "Erro ao editar a postagem. " + err)
                res.redirect("/admin/postagens")
            })
        }).catch((err)=>{
            req.flash("error_msg", "Erro ao editar  postagem. " + err)
            res.redirect("/admin/postagens")
        })
    }
});
router.post("/postagens/deletar", eAdmin, (req, res)=>{
    Postagem.remove({_id: req.body.id}).then((categoria)=>{      
        req.flash("success_msg", "Postagem deletada com sucesso.")
        res.redirect("/admin/postagens")  
    }).catch((err)=>{
        req.flash("error_msg", "Erro ao deleta postagem. " + err)
        res.redirect("/admin/postagens")
    })
});



module.exports = router;