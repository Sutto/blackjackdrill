var kinds = {
  'S' : 'stood',
  'H' : 'hit',
  'P' : 'split',
  'D' : 'doubled'
}

var upcards = '2 3 4 5 6 7 8 9 10 A'.split(/ /);
    myhands = ('5 6 7 8 9 10 11 12 13 14 15 16 17 ' +
               'A-2 A-3 A-4 A-5 A-6 A-7 A-8 A-9 ' +
               '2-2 3-3 4-4 5-5 6-6 7-7 8-8 9-9 T-T A-A').split(/[\s|\n]/),
    strategy = getStrategy(),
    deck1 = getDeck(),
    deck = shuffle(deck1.concat(deck1.concat(deck1.concat(deck1.concat(deck1.concat(deck1)))))),
    pickedCardIndexes = [],
    cards = {},
    answered = false;

function getDeck() {
    var ranks = '2 3 4 5 6 7 8 9 10 j q k a'.split(/ /),
        suits = 'c s h d'.split(/ /),
        deck = [];
    for (var i in ranks)
        for (var j in suits)
            deck.push(suits[j] + ranks[i]);
    return deck;
}

function shuffle(v) {
    for(var j, x, i = v;
        i;
        j = parseInt(Math.random() * i), x = v[--i], v[i] = v[j], v[j] = x);
    return v;
}

function getStrategy(ruleset) {
    // # decks, dealer on soft 17, double after split, surrender, peek
    ruleset = ruleset || 'burswood';
    var strategyStr = {
        '6d,s17,das,ns,p': 'HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHDDDDHHHHHDDDDDDDDHH' +
                           'DDDDDDDDDHHHSSSHHHHHSSSSSHHHHHSSSSSHHHHHSSSSSHHHHHSSSSSHHHHH' +
                           'SSSSSSSSSSHHHDDHHHHHHHHDDHHHHHHHDDDHHHHHHHDDDHHHHHHDDDDHHHHH' +
                           'SDDDDSSHHHSSSSSSSSSSSSSSSSSSSSPPPPPPHHHHPPPPPPHHHHHHHPPHHHHH' +
                           'DDDDDDDDHHPPPPPHHHHHPPPPPPHHHHPPPPPPPPPPPPPPPSPPSSSSSSSSSSSS' +
                           'PPPPPPPPPP',
        'burswood'       : 'HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHDDDDHHHHHDDDDDDDDHH' +
                           'DDDDDDDDDHHHSSSHHHHHSSSSSHHHHHSSSSSHHHHHSSSSSHHHHHSSSSSHHHHH' +
                           'SSSSSSSSSSHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH' +
                           'SSSSSSSHHHSSSSSSSSSSSSSSSSSSSSPPPPPPHHHHPPPPPPHHHHHHHPPHHHHH' +
                           'DDDDDDDDHHPPPPPHHHHHPPPPPPHHHHPPPPPPPPHHPPPPPSPPSSSSSSSSSSSS' +
                           'PPPPPPPPPH'};
    var strategy = {};
    for (var myhand, i = 0; myhand = myhands[i]; i++) {
        strategy[myhand] = {};
        for (var upcard, j = 0; upcard = upcards[j]; j++)
            strategy[myhand][upcard] = strategyStr[ruleset].charAt(i * upcards.length + j);
    }
    return strategy;
}

function getStrategyTableHtml() {
    var action, upcard, myhand, i, j,
        html = '<table id="strategy">' +
               '<tr class="upcards-label"><td>&nbsp;</td><th colspan="' +
               (upcards.length) + '">Dealer Upcard</th></tr>' +
               '<tr class="upcards-row"><td>Your Hand</td>';
    for (upcard, j = 0; upcard = upcards[j]; j++)
        html += '<th>' + upcard + '</th>';
    html += '</th>';
    for (myhand, i = 0; myhand = myhands[i]; i++) {
        html += '<tr class="myhand-row"><th>' + myhand + '</th>';
        for (upcard, j = 0; upcard = upcards[j]; j++) {
            action = strategy[myhand][upcard];
            html += '<td class="' + action + '" id="cell-' + upcard +
                '-' + myhand + '">' + action + '</td>';
        }
        html += '</tr>';
    }
    html += '</table>';
    return html;
}

function indexOf(arr, needle) {
    for (var i = 0; i < arr.length; i++)
        if (arr[i] === needle)
            return i;
    return -1;
}

function getCardIndex() {
    var index = -1;
    while (index == -1 || indexOf(pickedCardIndexes, index) != -1)
        index = Math.floor(Math.random() * deck.length);
    pickedCardIndexes.push(index);
    return index;
}

function deal() {
    pickedCardIndexes = [];
    answered = false;
    $('#correct').hide();
    $('#response').html('');
    $('#strategy td.highlighted').removeClass('highlighted');
    cards.dealer = deck[getCardIndex()];
    var value;
    while (typeof value == 'undefined' || value == 21) {
        cards.my1 = deck[getCardIndex()];
        cards.my2 = deck[getCardIndex()];
        value = getCardValue(cards.my1, true) + getCardValue(cards.my2, true);
    }
    $('#dealer-cards').html("<img src='images/" + cards.dealer + ".png'><img src='images/back.png'>");
    $('#my-cards').html("<img src='images/" + cards.my1 + ".png'><img src='images/" + cards.my2 + ".png'>");
}

function getCardValue(card, aceEleven) {
    var rank = card.substring(1),
        value = parseInt(rank, 10);
    if (!isNaN(value))
        return value;
    if (rank == 'a')
        return aceEleven ? 11 : 'A';
    return 10;
}

function checkAction(action) {
    if (answered) {
        deal();
        return;
    }
    var upcard, my1, my2, myhand, correctAction;
    upcard = getCardValue(cards.dealer);
    my1 = getCardValue(cards.my1);
    my2 = getCardValue(cards.my2);
    if (my1 == 10 && my2 == 10)
        myhand = 'T-T';
    else if (my1 == my2)
        myhand = my1 + '-' + my2;
    else if (my1 == 'A')
        myhand = my1 + '-' + my2;
    else if (my2 == 'A')
        myhand = my2 + '-' + my1;
    else
        myhand = (my1 + my2) > 17 ? 17 : (my1 + my2);
    correctAction = strategy[myhand][upcard];
    if (action == correctAction)
        $('#response').html("<div class='correct'>Correct</div>");
    else {
        $('#response').html("<div class='wrong'>Wrong</div>");
        var value = $('#cell-' + upcard + '-' + myhand).html();
        $("#correct").show().html("Sorry chap, you should of " + kinds[value] + " just then.");
    }
    $('#cell-' + upcard + '-' + myhand).addClass('highlighted');
    
    answered = true;
}

function initBlackjack() {
  
  
  $('#strategy-shell').html(getStrategyTableHtml());

  $('#action li').click(function() {
      var action;
      switch (this.id) {
          case 'hit': action = 'H'; break;
          case 'stand': action = 'S'; break;
          case 'double': action = 'D'; break;
          case 'split': action = 'P'; break;
      }
      if (!action)
          return;
      checkAction(action);
  });

  $(document).keypress(function(evt) {
      if (answered) {
          $('#correct').hide();
          deal();
          if (evt.which == 32) {
              evt.stopPropagation();
              evt.preventDefault();
          }
          return;
      }
      var action;
      switch (evt.which) {
          case 49: action = 'H'; break;
          case 50: action = 'S'; break;
          case 51: action = 'D'; break;
          case 52: action = 'P'; break;
      }
      if (!action)
          return;
      checkAction(action);
  });

  $('#response').click(function() {
      deal();
  });

  deal();
}
