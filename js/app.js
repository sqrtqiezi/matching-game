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
  this.moves = 0;
  this.stars = 3;
  this.matchedCount = 0;
  this.threshold = 20;
  this.checkCards = [];
  this.waiting = false;
  this.timer = new Timer();
};

Game.prototype = {
  /**
   * 游戏开始
   */
  start: function start() {
    this.shuffle();
    this.renderAll();
    this.bindGameEvent();
    window.requestAnimationFrame(this.renderTimer.bind(this))
  },

  /**
   * 游戏重新开始
   */
  restart: function restart() {
    this.moves = 0;
    this.stars = 3;
    this.matchedCount = 0;
    this.checkCards = [];
    this.timer.init();
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
   * 渲染计时器
   */
  renderTimer: function renderTimer() {
    var self = this;
    Array.prototype.forEach.call(document.getElementsByClassName('timer'),function(item) {
      item.innerHTML = self.timer.getInterval();
    });
    window.requestAnimationFrame(this.renderTimer.bind(this));
  },

  /**
   * 渲染计分
   */
  renderStars: function renderStars() {
    var html = [];
    for (var i = 0; i < this.stars; i++) {
      html.push('<li><i class="fa fa-star"></i></li>');
    }
    document.getElementsByClassName('stars')[0].innerHTML = html.join('');
    document.getElementsByClassName('moves')[0].innerHTML = this.stars;
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

        // 翻动两张卡片为一步
        if (self.checkCards.length === 2) {
          self.check();
        } else {
          self.moves++;
        }

        // 从第一步开始计时
        if (self.moves === 1 && self.checkCards.length === 1) {
          self.timer.start();
        }

        // 步数的整数倍，减少星星
        if (self.moves % self.threshold === 0 && self.checkCards.length === 1) {
          self.stars--;
          self.renderStars();

          // 星星数量减少为 0 时，游戏结束
          if (self.stars <= 0 && self.matchedCount !== self.cards.length) {

            self.timer.end();
            $('.ui.failed.modal').modal({
              closable: false,
              onApprove: function () {
                self.restart();
              }
            }).modal('show');
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

        // 游戏获胜
        if (self.matchedCount === self.cards.length) {
          self.timer.end();
          $('.ui.success.modal').modal({
            closable: false,
            onApprove: function () {
              self.restart();
            }
          }).modal('show');
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

/**
 * @description 计时器
 * @constructor
 */
function Timer() {
  this.startTime = null;
  this.endTime = null;
  this.status = 0; // 计时器分三种状态：0 未开始；1 计时中；2 计时结束。
}

Timer.prototype = {
  /**
   * 初始化
   */
  init: function init() {
    this.status = 0;
  },

  /**
   * 开始计时
   */
  start: function start() {
    this.status = 1;
    this.startTime = Date.now();
  },

  /**
   * 结束计时
   */
  end: function end() {
    this.status = 2;
    this.endTime = Date.now();
  },

  /**
   * 显示时间间隔
   */
  getInterval: function getInterval() {
    if (this.status === 0) {
      return '00:00:00';
    } else if (this.status === 1) {
      this.endTime = Date.now();
    }

    var interval = Math.round((this.endTime - this.startTime) / 1000);
    var hours = Math.round(interval / 3600);
    var minutes = Math.round((interval % 3600) / 60);
    var seconds = interval % 60;

    return `${this.prefix(hours)}:${this.prefix(minutes)}:${this.prefix(seconds)}`;
  },

  prefix: function prefix(num) {
    if (num < 10) {
      return `0${num}`;
    }
    else
      return `${num}`;
  }
}

if (DEBUG) {
  var game = new Game();
  game.start();
} else {
  new Game().start();
}
