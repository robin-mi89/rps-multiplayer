  var config = {
    apiKey: "AIzaSyAMj4vMvKzjXiGcbVDTeiNoAqIbpPMKN2Q",
    authDomain: "rockpaperscissorsmulti.firebaseapp.com",
    databaseURL: "https://rockpaperscissorsmulti.firebaseio.com",
    storageBucket: "rockpaperscissorsmulti.appspot.com",
    messagingSenderId: "238411918666"
  };
  firebase.initializeApp(config);

  var database  = firebase.database();
  var chatlog = [""];
  var defaultUser = "Dweeb";
  var userPlayer;

  class Player 
{
    constructor(name, throws, wins, losses)
    {
        this.name = name;
        this.throws = throws;
        this.wins = wins;
        this.losses = losses;
    }
}

  var player1 = null;
  var player2 = null;


  //players: need to track name, throw, wins, losses. 
  //--players
        //--1. name, throw, wins, losses...
        //--2. name, throw, wins, losses...

        //one ref base on the messages, alters chat log when the messages changes. 
  database.ref("/messages").on("value",
   function(snapshot) 
   {
       $("#chat").empty();
        if (snapshot.child("messages").exists())
        {
            chatlog = snapshot.val().messages; 
            for (i = 0; i < chatlog.length; i++)
            {
                addRow = $("<tr>");
                addText = $("<td>")
                addText.text(chatlog[i]);
                addRow.append(addText);
                $("#chat").append(addRow);
            }
        }
        else
        {
             database.ref().update(
            {
                messages: []
            })
        } 
   });

    //one ref base on the player informations. changes the player info/throws when it changes. 
database.ref("player/player1").on("value", 
    function(snapshot)
    {
        if(snapshot.child("player1").exists())
        {
            player1 = new Player(snapshot.val().player1.name, snapshot.val().player1.throws, snapshot.val().player1.wins, snapshot.val().player1.losses);
            $("#player1name").text(player1.name);
            $("#player1wins").text("Wins: " + player1.wins);
            $("#player1losses").text("Losses: " + player1.losses);
            //$("#player2choices").slideUp();
            if (player1.throws !== "")
            {
                $("#player1status").text("Player 1 has chosen their move!");
            }
        }
        else
        {
            player1Disconnect();
        }
        
        checkIfBothPlayed();
    })

database.ref("player/player2").on("value",
    function(snapshot)
    {
        if(snapshot.child("player2").exists())
        {
            player2 = new Player(snapshot.val().player2.name, snapshot.val().player2.throws, snapshot.val().player2.wins, snapshot.val().player2.losses);
            $("#player2name").text(player2.name);
            $("#player2wins").text("Wins: " + player2.wins);
            $("#player2losses").text("Losses: " + player2.losses);
            //$("#player1choices").slideUp();
            if (player2.throws !== "")
            {
                $("#player2status").text("Player 2 has chosen their move!");
            }
        }
        else
        {
            player2Disconnect();
        }

         checkIfBothPlayed();
    })

    function checkIfBothPlayed()
    {
        if (player1 !== null && player2 !== null)
        {
            if (player1.throws !== "" && player2.throws !== "")
            {
                didYouWin(player1.throws, player2.throws);
            }
        }
    }


    $("#join-game").on("click", function(event){
        event.preventDefault();
        if (player1 === null) //if player1 is not set, make player now player1
        {
            player1 = new Player($("#user-name").val().trim(), "", 0, 0);
            database.ref("player/player1").set
            (
                {
                    "player1": player1
                }
            )
            userPlayer = database.ref("player/player1");
            userPlayer.onDisconnect().set(null);
            $("#player2choices").slideUp();
        }
        else if (player2 === null) //if player2 is not set, make player now player2
        {
            player2 = new Player($("#user-name").val().trim(), "", 0, 0);
            database.ref("player/player2").set
            (
                {
                    "player2": player2
                }
            )
            userPlayer = database.ref("player/player2");
            userPlayer.onDisconnect().set(null);
            $("#player1choices").slideUp();
        }

        $(this).hide();
    });

  $("#submit-message").on("click", function(event)
  {
    event.preventDefault();
   
    var message = $("#user-name").val().trim() + ": " + $("#chat-msg").val().trim();
        chatlog.push(message);

    if (chatlog.length > 25)
    {
        chatlog.splice(0,1);
    }
    
        database.ref("/messages").set(
    {
            messages: chatlog
    })
  });

  $(".selector").on("click", function(){
      if($(this).attr("side") === "player1")
      {
        player1.throws = $(this).attr("value");
        console.log("Player1 chose " + player1.throws);
        database.ref("player/player1").set({"player1":player1});
      }
      else
      {
        player2.throws = $(this).attr("value");
        console.log("Player2 chose " + player2.throws);
        database.ref("player/player2").set({"player2":player2});
      }
  })

  

   function didYouWin(player1throw, player2throw)
   {
       if (player1throw === player2throw)
       {
           $("#results").text("Tied!");
       }
       else if (player1throw === "rock")
        {
            if (player2throw === "paper")
            {
                 $("#results").text("Player2 Wins!");
                 winner("player2");
            }
            else if (player2throw === "scissor")
            {
                $("#results").text("Player1 Wins!");
                winner("player1");
            }
        }
        else if (player1throw === "scissor")
        {
            if (player2throw === "paper")
            {
                $("#results").text("Player1 Wins!");
                winner("player1");
            }
            else if (player2throw === "rock")
            {
                $("#results").text("Player2 Wins!");
                winner("player2");
            }
        }
        else if (player1throw === "paper")
        {
            if (player2throw === "scissor")
            {
                $("#results").text("Player2 Wins!");
                winner("player2");
            }
            else if (player2throw === "rock")
            {
                $("#results").text("Player1 Wins!");
                winner("player1");
            }
        }

        player1.throws = "";
        player2.throws = "";
        $("#player1status").html("");
        $("#player2status").html("");
        database.ref("player/player1").set({"player1":player1});
        database.ref("player/player2").set({"player2":player2});
       //add code to choose whether you won or not.
   }

   function winner(winningPlayer)
   {
       if (winningPlayer === "player1")
       {
           player1.wins++;
           player2.losses++;
       }
       else 
       {
           player2.wins++;
           player1.losses++;
       }
   }

   function player1Disconnect()
   {
        $("#player1name").text("Waiting For New Challenger");
        $("#player1wins").text("");
        $("#player1losses").text("");
        $("#join-game").show();
   }

   function player2Disconnect()
   {
        $("#player2name").text("Waiting For New Challenger");
        $("#player2wins").text("");
        $("#player2losses").text("");
        $("#join-game").show();
   }

   
  //how to do rock paper scissors? Player objects. player1, {name: "blah", throw: "blah"}. same for a player2.
  //when get the information make sure that both player1 and player2 have throws. I guess. then do computation for who won.
  //
  //if player1throw child.exists() put player into player2.
  //else put player into player1
  