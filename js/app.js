// 访问链接末尾处加上 ?debug 打开 DEBUG 开关，会有如下功能：
// 1、花色直接显示在牌面上；
// 2、声明全局变量 game ，暴露运行状态。
var DEBUG = new URL(window.location.href).searchParams.has('debug');

/**
 * @description 游戏
 * @constructor
 */
var Game = function () {
  this.cards = ['diamond', 'paper-plane-o', 'anchor', 'bolt', 'cube', 'leaf', 'bicycle', 'bomb',
    'diamond', 'paper-plane-o', 'anchor', 'bolt', 'cube', 'leaf', 'bicycle', 'bomb'
  ];
  this.moves = 3;
  this.matchedCount = 0;
  this.steps = 0;
  this.threshold = 20;
  this.checkCards = [];
  this.waiting = false;
};

Game.prototype = {
  /**
   * 游戏开始
   */
  start: function start() {
    this.shuffle();
    this.renderAll();
    this.bindGameEvent();
  },

  /**
   * 游戏重新开始
   */
  restart: function restart() {
    this.moves = 3;
    this.matchedCount = 0;
    this.steps = 0;
    this.threshold = 20;
    this.checkCards = [];
    this.shuffle();
    this.renderAll();
  },

  /**
   * 渲染游戏
   */
  renderAll: function renderAll() {
    this.renderStars();
    this.renderCards();
  },

  /**
   * 渲染计分
   */
  renderStars: function renderStars() {
    var html = [];
    for (var i = 0; i < this.moves; i++) {
      html.push('<li><i class="fa fa-star"></i></li>');
    }
    document.getElementsByClassName('stars')[0].innerHTML = html.join('');
    document.getElementsByClassName('moves')[0].innerHTML = this.moves;
  },

  /**
   * 渲染游戏内容
   */
  renderCards: function renderCards() {
    var html = [];
    this.cards.forEach(function (item) {
      if (DEBUG) {
        var $card = `<li class="card show" data-card="${item}">
                <i class="fa fa-${item}"></i>
            </li>`;
      } else {
        var $card = `<li class="card" data-card="${item}">
                <i class="fa fa-${item}"></i>
            </li>`;
      }
      html.push($card);
    });
    document.getElementsByClassName('deck')[0].innerHTML = html.join('');
    this.$cards = document.getElementsByClassName('card');
    this.bindCardsEvent();
  },

  /**
   * 绑定游戏操作
   */
  bindCardsEvent: function bindCardsEvent() {
    var self = this;

    [].forEach.call(this.$cards, function (item, index) {
      //TODO: 添加翻牌动效
      item.addEventListener('click', function () {
        if (self.waiting ||
          self.checkCards.length === 2 ||
          this.classList.contains('open')
        ) {
          return;
        }

        this.classList.add('open');
        this.classList.add('show');
        self.checkCards.push(self.$cards[index]);
        if (self.checkCards.length === 2) {
          self.check();
        }

        self.steps++;
        if (self.steps >= self.threshold) {
          self.moves--;
          self.steps = 0;
          self.renderStars();
          if (self.moves <= 0 && self.count !== self.cards.length) {
            $('.ui.failed.modal').modal({
              closable: false,
              onApprove: function () {
                self.restart();
              }
            })
              .modal('show');
          }
        }
      });
    });
  },

  /**
   * 检查游戏状态，判定游戏是否结束。
   */
  check: function check() {
    var self = this;
    self.waiting = true;

    setTimeout(function () {
      if (self.checkCards[0].dataset.card === self.checkCards[1].dataset.card) {
        self.checkCards.forEach(function (item) {
          item.classList.add('match');
        });
        self.matchedCount += 2;
        if (self.matchedCount === self.cards.length) {
          $('.ui.success.modal').modal({
            closable: false,
            onApprove: function () {
              self.restart();
            }
          })
            .modal('show');
        }
      } else {
        //TODO: 添加猜测错误时的样式
        self.checkCards.forEach(function (item) {
          item.classList.remove('open');
          item.classList.remove('show');
        });
      }
      self.checkCards = [];
      self.waiting = false;
    }, 800);
  },

  /**
   * 绑定游戏重新开始事件
   */
  bindGameEvent: function bindGameEvent() {
    document.getElementsByClassName('restart')[0].addEventListener('click', this.restart.bind(this));
  },

  /**
   * 洗牌
   */
  shuffle: function shuffle() {
    var currentIndex = this.cards.length,
      temporaryValue, randomIndex;

    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
      temporaryValue = this.cards[currentIndex];
      this.cards[currentIndex] = this.cards[randomIndex];
      this.cards[randomIndex] = temporaryValue;
    }
  }
};

if (DEBUG) {
  var game = new Game();
  game.start();
} else {
  new Game().start();
}
