var main = function () {
  'use strict';
  var currentAnswerId;
  var correctAnswer;
  var socket = io.connect('http://localhost:3000/');
  var userList = [];

  //Update the current list of players when one connects/disconnects
  socket.on('update', function (users){
    userList = users;
    $('#onlineUsers').empty();
    for(var i=0; i<userList.length; i++) {
      if (userList[i].username != null) {
        $('#onlineUsers').append('<li>' + userList[i].username + '</li>'); 
      }
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
    postAJAX('/question',JSON.stringify({answerId: currentAnswerId, answer: guess}), function(response){
      if (response.correct === true) {
        $('#result').text('Correct!');
      }
      else {
        $('#result').text('Wrong!');
      }
      correctAnswer = response.answer;
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

  //start with game, round, create sections hidden
  $('.game').hide();
  $('.round').hide();
  $('.create').hide();

  $('#createShow').click(function() {
    $('.create').toggle();
  });

  $('#inputUsername').click(function() {
    //check if no socket user with same name
    var username = $('#username').val();
    var taken = false;

    for (var i=0; i< userList.length; i++) {
      if (userList[i].username == username) {
        $('#usernameError').text('Username taken');
        taken = true;
      }
    }

    if (!taken) {
      socket.emit('userJoin', username);
      socket.emit('anotherUserJoins', username);
      $('.game').show();
      $('.join').hide();
    }
  });

  $('#start').click(function() {
    $('.round').show();
    $('#start').hide();
  });

  $('#addQuestion').click(function() {
    postQuestion();
  });

  var count = 15;
  var counter = setInterval(timer, 1000);

  function timer() {
    $('.roundTime').text(count);
    count -= 1;
    if (count < 0)
    {
      getQuestion();
      count = 15;
      return;
    }
  }

};

$(document).ready(main);