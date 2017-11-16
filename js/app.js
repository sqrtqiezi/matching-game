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
    start: function start() {
        this.shuffle();
        this.renderAll();
        this.bindGameEvent();
    },

    restart: function restart() {
        this.moves = 3;
        this.matchedCount = 0;
        this.steps = 0;
        this.threshold = 20;
        this.checkCards = [];
        this.shuffle();
        this.renderAll();
    },

    renderAll: function renderAll() {
        this.renderStars();
        this.renderCards();
    },

    renderStars: function renderStars() {
        var html = [];
        for (var i = 0; i < this.moves; i++) {
            html.push('<li><i class="fa fa-star"></i></li>');
        }
        document.getElementsByClassName('stars')[0].innerHTML = html.join('');
        document.getElementsByClassName('moves')[0].innerHTML = this.moves;
    },

    renderCards: function renderCards() {
        html = [];
        this.cards.forEach(function (item) {
            html.push(`<li class="card" data-card="${item}">
                <i class="fa fa-${item}"></i>
            </li>`);
        });
        document.getElementsByClassName('deck')[0].innerHTML = html.join('');
        this.$cards = document.getElementsByClassName('card');
        this.bindCardsEvent();
    },

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
                    if(self.moves <= 0 && self.count !== self.cards.length) {
                        $('.ui.failed.modal').modal({
                            closable: false,
                            onApprove : function() {
                                self.restart();
                            }
                        })
                        .modal('show');
                    }
                }
            });
        });
    },

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
                        onApprove : function() {
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

    bindGameEvent: function bindGameEvent() {
        document.getElementsByClassName('restart')[0].addEventListener('click', this.restart.bind(this));
    },

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

var game = new Game();
game.start();