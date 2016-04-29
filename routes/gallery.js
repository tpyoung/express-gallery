'use strict';

const express = require('express');
const router = express.Router();
const isAuthenticated = require('../middleware/authentication').isAuthenticated;
const yourPhoto = require('../middleware/authentication').yourPhoto;
const Photo = require('../models').Photo;


router.get('/:id/edit', (req, res) => {
  Photo.findById(req.params.id)
  .then((photo) => {
    res.render('edit', {
          photo: photo
       });
  })
  .catch((err) => {
    res.json({success : false, err: err});
  });
});

router.get('/new', isAuthenticated, (req, res) => {
  res.render('new');
});

router.route('/:id')
  .get((req, res) => {
    // Photo.findById(req.params.id)
    // .then((photo) => {
    Photo.findAll()
    .then((photos) => {
      let photo;

      for(var i = 0; i < photos.length; i++) {
        if(photos[i].id.toString() === req.params.id) {
          photo = photos.splice(i, 1)[0];
          console.log("PHOTO", photo);
          break;
        }
      }

      if(!photo) {
        return res.json({success: false, err: new Error("ID DOES NOT EXIST")});
      }

      res.render('single', {
          photo: photo,
          photos: photos.slice(0,3)
       });
    })
    .catch((err) => {
      res.json({success : false, err: err});
    });

  })
  .put(isAuthenticated, yourPhoto, (req, res) => {
    Photo.update({
      author: req.body.author,
      link: req.body.link,
      description: req.body.description
    }, {
      where: {
        id : req.params.id
      }
    }).then(() => {
     res.redirect('/gallery/' + req.params.id);
    }).catch((err) => {
      res.json({success : false, err: err});
    });
  })
  .delete(isAuthenticated, yourPhoto, (req, res) => {
    Photo.destroy({
      where: {
        id: req.params.id
      }
    }).then(() => {
      res.json({success: true, redirect: '/gallery'});
    });
  });


router.route('/')
  .get((req, res) => {
    Photo.findAll({
      limit: 6
    })
    .then((photos) => {
      res.render('gallery', {
        staticPhoto: photos.shift(),
        photos: photos
      });
    }).catch((err) => {
      res.json({success: false, err: err});
    });
  })
  .post(isAuthenticated, (req, res) => {
    Photo.create({
      author: req.body.author,
      link: req.body.link,
      description: req.body.description
    })
    .then(() => {
      res.redirect('/gallery');
    }).catch((err) => {
      res.json({success: false});
    });
  });

module.exports = router;