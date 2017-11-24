// 访问链接末尾处加上 ?debug 打开 DEBUG 开关，会有如下功能：
// 1、花色直接显示在牌面上；
// 2、声明全局变量 game ，暴露运行状态。
var DEBUG = new URL(window.location.href).searchParams.has('debug')

/**
 * @description 游戏
 * @constructor
 */
var Game = function () {
  this.cards = ['diamond', 'paper-plane-o', 'anchor', 'bolt', 'cube', 'leaf', 'bicycle', 'bomb',
    'diamond', 'paper-plane-o', 'anchor', 'bolt', 'cube', 'leaf', 'bicycle', 'bomb'
  ]
  this.moves = 0
  this.stars = 3
  this.matchedCount = 0
  this.threshold = 20
  this.checkCards = []
  this.waiting = false
  this.timer = new Timer()
}

Game.prototype = {
  /**
   * 游戏开始
   */
  start: function start () {
    this.shuffle()
    this.renderAll()
    this.bindGameEvent()
    window.requestAnimationFrame(this.renderTimer.bind(this))
  },

  /**
   * 游戏重新开始
   */
  restart: function restart () {
    this.moves = 0
    this.stars = 3
    this.matchedCount = 0
    this.checkCards = []
    this.timer.init()
    this.shuffle()
    this.renderAll()
  },

  /**
   * 渲染游戏
   */
  renderAll: function renderAll () {
    this.renderStars()
    this.renderMoves()
    this.renderCards()
  },

  /**
   * 渲染计时器
   */
  renderTimer: function renderTimer () {
    var self = this
    $('.timer').each(function () {
      $(this).text(self.timer.getInterval())
    })
    window.requestAnimationFrame(this.renderTimer.bind(this))
  },

  /**
   * 渲染计分
   */
  renderStars: function renderStars () {
    var htmlStars = []
    for (var i = 0; i < this.stars; i++) {
      htmlStars.push('<li><i class="fa fa-star"></i></li>')
    }
    $('.stars').html(htmlStars.join(''))
  },

  /**
   * 渲染已走步骤
   */
  renderMoves: function renderMoves () {
    $('.moves').html(this.moves)
  },

  /**
   * 渲染游戏内容
   */
  renderCards: function renderCards () {
    var htmlCards = []
    this.cards.forEach(function (item) {
      if (DEBUG) {
        var $card = `<li class="card show" data-card="${item}">
                <i class="fa fa-${item}"></i>
            </li>`
      } else {
        var $card = `<li class="card" data-card="${item}">
                <i class="fa fa-${item}"></i>
            </li>`
      }
      htmlCards.push($card)
    })
    $('.deck').html(htmlCards.join(''))
    this.$cards = $('.card')
    this.bindCardsEvent()
  },

  /**
   * 绑定游戏操作
   */
  bindCardsEvent: function bindCardsEvent () {
    var self = this

    Array.from(this.$cards).forEach(function (item, index) {
      $(item).click(function () {
        if (self.waiting
          || self.checkCards.length === 2
          || $(this).hasClass('open')) {
          return
        }
        self.checkCards.push(self.$cards[index])
        self.open(this)

        // 翻动两张卡片为一步
        if (self.checkCards.length === 2) {
          setTimeout(self.checkGame.bind(self), 1200)
          self.moves++
          self.renderMoves()
        }

        // 从第一步开始计时
        if (!self.timer.isStarting) {
          self.timer.start()
        }

        // 步数的整数倍，减少星星
        if (self.moves > 0
          && self.moves % self.threshold === 0
          && self.checkCards.length === 1
          && self.stars > 1) {
          self.stars--
          self.renderStars()
        }
      })
    })
  },

  /**
   * 检查翻牌是否匹配；判定游戏是否结束。
   */
  checkGame: function checkGame () {
    var self = this
    self.waiting = true

    if (self.checkCards[0].dataset.card === self.checkCards[1].dataset.card) {
      self.matched()

      // 游戏获胜
      if (self.matchedCount === self.cards.length) {
        self.timer.end()
        $('.ui.success.modal').modal({
          closable: false,
          onApprove: function () {
            self.restart()
          }
        }).modal('show')
      }
    } else {
      self.notMatch()
    }
    self.waiting = false
  },

  /**
   * 绑定游戏重新开始事件
   */
  bindGameEvent: function bindGameEvent () {
    $('.restart').click(this.restart.bind(this))
  },

  /**
   * 洗牌
   */
  shuffle: function shuffle () {
    var currentIndex = this.cards.length,
      temporaryValue, randomIndex

    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex)
      currentIndex -= 1
      temporaryValue = this.cards[currentIndex]
      this.cards[currentIndex] = this.cards[randomIndex]
      this.cards[randomIndex] = temporaryValue
    }
  },

  /**
   * Card 匹配动效
   */
  matched: function matched () {
    this.checkCards.forEach(function (card) {
      card.classList.add('rubberBand')
      card.classList.add('animated')
      console.log(card)

      card.addEventListener('animationend', function (e) {
        // 只调用一次
        e.target.removeEventListener(e.type, arguments.callee)

        card.classList.remove('rubberBand')
        card.classList.remove('animated')
      })
      card.classList.add('match')
    })

    this.matchedCount += 2
    this.checkCards = []
  },

  /**
   * Card 未匹配动效
   */
  notMatch: function notMatched () {
    var self = this

    this.checkCards.forEach(function (card) {
      card.classList.add('swing')
      card.classList.add('animated')

      card.addEventListener('animationend', function (e) {
        // 只调用一次
        e.target.removeEventListener(e.type, arguments.callee)

        card.classList.remove('swing')
        card.classList.remove('animated')
        self.close(card)
      })
      card.classList.add('not-match')
    })
    this.checkCards = []
  },

  /**
   * 掀开 Card
   */
  open: function open (card) {
    $(card).addClass('animated flipInY')

    card.addEventListener('animationend', function (e) {
      // 只调用一次
      e.target.removeEventListener(e.type, arguments.callee)

      card.classList.remove('flipInY')
      card.classList.remove('animated')
    })
    card.classList.add('open')
    card.classList.add('show')
  },

  /**
   * 盖上 Card
   */
  close: function close (card) {
    card.classList.add('flipOutY')
    card.classList.add('animated')
    card.addEventListener('animationend', function (e) {
      // 只调用一次
      e.target.removeEventListener(e.type, arguments.callee)

      card.classList.remove('flipOutY')
      card.classList.remove('animated')

      card.classList.remove('open')
      card.classList.remove('show')
      card.classList.remove('not-match')
    })
  }
}

/**
 * @description 计时器
 * @constructor
 */
function Timer () {
  this.startTime = null
  this.endTime = null
  this.status = 0 // 计时器分三种状态：0 未开始；1 计时中；2 计时结束。
}

Timer.prototype = {
  /**
   * 初始化
   */
  init: function init () {
    this.status = 0
  },

  /**
   * 开始计时
   */
  start: function start () {
    this.status = 1
    this.startTime = Date.now()
  },

  /**
   * 结束计时
   */
  end: function end () {
    this.status = 2
    this.endTime = Date.now()
  },

  get isStarting () {
    return this.status === 1
  },

  /**
   * 显示时间间隔
   */
  getInterval: function getInterval () {
    if (this.status === 0) {
      return '00:00:00'
    } else if (this.status === 1) {
      this.endTime = Date.now()
    }

    var interval = moment.duration(this.endTime - this.startTime)
    var hours = interval.get('hours')
    var minutes = interval.get('minutes')
    var seconds = interval.get('seconds')

    return `${this.prefix(hours)}:${this.prefix(minutes)}:${this.prefix(seconds)}`
  },

  prefix: function prefix (num) {
    if (num < 10) {
      return `0${num}`
    }
    else
      return `${num}`
  }
}

if (DEBUG) {
  var game = new Game()
  game.start()
} else {
  new Game().start()
}
