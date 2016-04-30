'use strict';

const passport = require('passport');
const bcrypt = require('bcrypt');
const LocalStrategy = require('passport-local').Strategy;

const User = require('../models').User;

let setUpPassport = () => {

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    User.findById(id)
    .then((user) => {
      done(null, user);
    });
  });

  passport.use('login', new LocalStrategy(
    (username, password, done) => {
    User.findOne({where: {username: username}})
    .then((user) => {
      if(!user) {
        return done(null, false, {message: "No user has that username."});
      }
      bcrypt.compare(password, user.password, (err, res) => {
        if(res === true) {
          return done(null, user);
        } else {
          return done(null, false, {message: "Invalid password."});
        }
      });
    })
    .catch((err) => {
      return done(err);
    });
  }));
};

module.exports = setUpPassport;
