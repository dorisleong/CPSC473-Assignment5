var main = function () {
  'use strict';
  var currentAnswerId;
  var socket = io.connect('http://localhost:3000/');
  var userList = [];

  //Update the current list of players when one connects/disconnects
  socket.on('update', function (users){
    userList = users;
    $('#onlineUsers').empty();
    for(var i=0; i<userList.length; i++) {
      $('#onlineUsers').append('<li>' + userList[i] + '</li>'); 
    }
  });
  
  var postAJAX = function (url, data, successFunction) {
    $.ajax({
      url: url,
      dataType: 'json',
      type: 'POST', 
      data: data,
      contentType: 'application/json',
      success: function (response) {
        successFunction(response);
      }
    });
  };

  //Get question from server (GET /question)
  var getQuestion = function () {
    $.ajax({
      url: '/question',
      dataType: 'json',
      type: 'GET',
      contentType: 'application/json',
      success: function (response) {
        $('#question').text(response.question);
        currentAnswerId = response.answerId;
      }
    });
  }

  //Send guess to server returns if correct (POST /answer)
  var postGuess = function () {
    var guess = $('#guess').val();
    postAJAX('/question',JSON.stringify({answer: guess}), function(response){
      if (response.correct === true) {
        $('#result').text('Correct!');
      }
      else {
        $('#result').text('Wrong!');
      }
    });
  }

  //Send new question and answer from input to server (POST /question)
  var postQuestion = function () {
    postAJAX('/question',JSON.stringify({question:'Test Q', answer: 'Test A'}), function(response){
      $('#addConfirmation').text(response.confirm);
    });
  }

  //Get score - after each answer submitted (GET /score) 
  var getScore = function () {
    $.ajax({
      url: '/score',
      dataType: 'json',
      type: 'GET',
      contentType: 'application/json',
      success: function (response) {
        //scores only for that user
        $('.score').text(response.right+', '+response.wrong);
      }
    });
  }

  //start with game, round hidden
  $('.game').hide();
  $('.round').hide();

  $('#inputUsername').click(function() {
    //check if no socket user with same name
    var username = $('#username').val();
    if ($.inArray(username, userList) == -1) {
      socket.emit('userJoin', username);
      $('.game').show();
      $('.join').hide();
    }
    else {
      $('#usernameError').text('Username taken');
    }
  });

  $('#start').click(function() {
    $('.round').show();
    $('#start').hide();
  });

  $('#addQuestion').click(function() {
    postQuestion();
  });

};

$(document).ready(main);