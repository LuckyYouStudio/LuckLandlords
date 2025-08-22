import { _decorator, Component, Node, Prefab, instantiate, Vec3, Label, Button, director } from 'cc';
import { Card, CardSuit, CardValue } from './Card';
import { CardTypeChecker, CardTypeInfo, CardPattern } from './CardType';
import { Player } from './Player';
const { ccclass, property } = _decorator;

export enum GameState {
    WAITING = 0,
    DEALING = 1,
    BIDDING = 2,
    PLAYING = 3,
    GAME_OVER = 4
}

@ccclass('GameManager')
export class GameManager extends Component {
    @property(Prefab)
    cardPrefab: Prefab = null;
    
    @property(Node)
    playerHandNode: Node = null;
    
    @property(Node)
    leftPlayerNode: Node = null;
    
    @property(Node)
    rightPlayerNode: Node = null;
    
    @property(Node)
    landlordCardsNode: Node = null;
    
    @property(Node)
    playAreaNode: Node = null;
    
    @property(Label)
    gameStateLabel: Label = null;
    
    @property(Label)
    turnLabel: Label = null;
    
    @property(Button)
    startButton: Button = null;
    
    @property(Button)
    passButton: Button = null;
    
    @property(Button)
    playButton: Button = null;
    
    @property([Button])
    bidButtons: Button[] = [];
    
    private gameState: GameState = GameState.WAITING;
    private allCards: Card[] = [];
    private players: Player[] = [];
    private currentPlayerIndex: number = 0;
    private landlordIndex: number = -1;
    private landlordCards: Card[] = [];
    private lastPlayedCards: Card[] = [];
    private lastCardType: CardTypeInfo = null;
    private lastPlayerIndex: number = -1;
    private bidCount: number = 0;
    private highestBid: number = 0;
    
    onLoad() {
        this.initGame();
        this.setupButtons();
    }
    
    private initGame() {
        this.players = [];
        for (let i = 0; i < 3; i++) {
            const player = new Player();
            player.index = i;
            player.isAI = (i !== 0);
            this.players.push(player);
        }
        
        this.updateGameState("等待开始游戏");
    }
    
    private setupButtons() {
        if (this.startButton) {
            this.startButton.node.on('click', this.onStartGame, this);
        }
        
        if (this.passButton) {
            this.passButton.node.on('click', this.onPass, this);
            this.passButton.node.active = false;
        }
        
        if (this.playButton) {
            this.playButton.node.on('click', this.onPlayCards, this);
            this.playButton.node.active = false;
        }
        
        for (let i = 0; i < this.bidButtons.length; i++) {
            const button = this.bidButtons[i];
            if (button) {
                button.node.on('click', () => this.onBid(i), this);
                button.node.active = false;
            }
        }
    }
    
    private onStartGame() {
        this.gameState = GameState.DEALING;
        this.startButton.node.active = false;
        this.resetGame();
        this.createCards();
        this.shuffleCards();
        this.dealCards();
        this.startBidding();
    }
    
    private resetGame() {
        this.clearAllCards();
        this.allCards = [];
        this.landlordCards = [];
        this.lastPlayedCards = [];
        this.lastCardType = null;
        this.lastPlayerIndex = -1;
        this.landlordIndex = -1;
        this.currentPlayerIndex = Math.floor(Math.random() * 3);
        this.bidCount = 0;
        this.highestBid = 0;
        
        for (const player of this.players) {
            player.reset();
        }
    }
    
    private clearAllCards() {
        if (this.playerHandNode) {
            this.playerHandNode.removeAllChildren();
        }
        if (this.leftPlayerNode) {
            this.leftPlayerNode.removeAllChildren();
        }
        if (this.rightPlayerNode) {
            this.rightPlayerNode.removeAllChildren();
        }
        if (this.landlordCardsNode) {
            this.landlordCardsNode.removeAllChildren();
        }
        if (this.playAreaNode) {
            this.playAreaNode.removeAllChildren();
        }
    }
    
    private createCards() {
        for (let suit = CardSuit.SPADE; suit <= CardSuit.DIAMOND; suit++) {
            for (let value = CardValue.THREE; value <= CardValue.TWO; value++) {
                const cardNode = instantiate(this.cardPrefab);
                const card = cardNode.getComponent(Card);
                card.init(suit, value);
                this.allCards.push(card);
            }
        }
        
        const smallJokerNode = instantiate(this.cardPrefab);
        const smallJoker = smallJokerNode.getComponent(Card);
        smallJoker.init(CardSuit.JOKER, CardValue.SMALL_JOKER);
        this.allCards.push(smallJoker);
        
        const bigJokerNode = instantiate(this.cardPrefab);
        const bigJoker = bigJokerNode.getComponent(Card);
        bigJoker.init(CardSuit.JOKER, CardValue.BIG_JOKER);
        this.allCards.push(bigJoker);
    }
    
    private shuffleCards() {
        for (let i = this.allCards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.allCards[i], this.allCards[j]] = [this.allCards[j], this.allCards[i]];
        }
    }
    
    private dealCards() {
        for (let i = 0; i < 51; i++) {
            const playerIndex = i % 3;
            this.players[playerIndex].addCard(this.allCards[i]);
        }
        
        for (let i = 51; i < 54; i++) {
            this.landlordCards.push(this.allCards[i]);
        }
        
        this.displayPlayerCards(0);
        this.displayLandlordCards(false);
        this.updateGameState("发牌完成");
    }
    
    private displayPlayerCards(playerIndex: number) {
        const player = this.players[playerIndex];
        let parentNode: Node = null;
        
        if (playerIndex === 0) {
            parentNode = this.playerHandNode;
        } else if (playerIndex === 1) {
            parentNode = this.leftPlayerNode;
        } else {
            parentNode = this.rightPlayerNode;
        }
        
        if (!parentNode) return;
        
        parentNode.removeAllChildren();
        player.sortCards();
        
        const cardCount = player.cards.length;
        const spacing = playerIndex === 0 ? 50 : 30;
        const startX = -(cardCount - 1) * spacing / 2;
        
        for (let i = 0; i < cardCount; i++) {
            const card = player.cards[i];
            card.node.setParent(parentNode);
            card.node.setPosition(startX + i * spacing, 0, 0);
            
            if (playerIndex !== 0) {
                card.node.active = false;
            }
        }
        
        if (playerIndex !== 0) {
            const countLabel = parentNode.getComponentInChildren(Label);
            if (countLabel) {
                countLabel.string = `${cardCount}张`;
            }
        }
    }
    
    private displayLandlordCards(show: boolean) {
        if (!this.landlordCardsNode) return;
        
        this.landlordCardsNode.removeAllChildren();
        
        for (let i = 0; i < this.landlordCards.length; i++) {
            const card = this.landlordCards[i];
            card.node.setParent(this.landlordCardsNode);
            card.node.setPosition(i * 60 - 60, 0, 0);
            card.node.active = show;
        }
    }
    
    private startBidding() {
        this.gameState = GameState.BIDDING;
        this.updateGameState("叫地主阶段");
        this.showBiddingUI();
        
        if (this.players[this.currentPlayerIndex].isAI) {
            this.scheduleOnce(() => {
                this.aiAutoBid();
            }, 1);
        }
    }
    
    private showBiddingUI() {
        if (this.currentPlayerIndex === 0) {
            for (const button of this.bidButtons) {
                if (button) {
                    button.node.active = true;
                }
            }
        }
    }
    
    private hideBiddingUI() {
        for (const button of this.bidButtons) {
            if (button) {
                button.node.active = false;
            }
        }
    }
    
    private onBid(score: number) {
        if (this.gameState !== GameState.BIDDING) return;
        if (this.currentPlayerIndex !== 0) return;
        
        this.hideBiddingUI();
        this.processBid(score);
    }
    
    private aiAutoBid() {
        if (this.gameState !== GameState.BIDDING) return;
        
        const player = this.players[this.currentPlayerIndex];
        const goodCards = player.cards.filter(c => 
            c.value >= CardValue.ACE || 
            c.value === CardValue.BIG_JOKER || 
            c.value === CardValue.SMALL_JOKER
        ).length;
        
        let bidScore = 0;
        if (goodCards >= 5) {
            bidScore = 3;
        } else if (goodCards >= 3) {
            bidScore = Math.min(2, this.highestBid + 1);
        } else if (goodCards >= 2 && this.highestBid === 0) {
            bidScore = 1;
        }
        
        if (bidScore <= this.highestBid) {
            bidScore = 0;
        }
        
        this.scheduleOnce(() => {
            this.processBid(bidScore);
        }, 0.5);
    }
    
    private processBid(score: number) {
        this.bidCount++;
        
        if (score > this.highestBid) {
            this.highestBid = score;
            this.landlordIndex = this.currentPlayerIndex;
            this.updateGameState(`玩家${this.currentPlayerIndex + 1} 叫 ${score} 分`);
        } else {
            this.updateGameState(`玩家${this.currentPlayerIndex + 1} 不叫`);
        }
        
        if (this.highestBid === 3 || this.bidCount === 3) {
            if (this.landlordIndex === -1) {
                this.landlordIndex = Math.floor(Math.random() * 3);
            }
            this.setLandlord();
        } else {
            this.currentPlayerIndex = (this.currentPlayerIndex + 1) % 3;
            this.showBiddingUI();
            
            if (this.players[this.currentPlayerIndex].isAI) {
                this.scheduleOnce(() => {
                    this.aiAutoBid();
                }, 1);
            }
        }
    }
    
    private setLandlord() {
        this.hideBiddingUI();
        this.players[this.landlordIndex].isLandlord = true;
        
        for (const card of this.landlordCards) {
            this.players[this.landlordIndex].addCard(card);
        }
        
        this.displayPlayerCards(this.landlordIndex);
        this.displayLandlordCards(true);
        
        this.updateGameState(`玩家${this.landlordIndex + 1} 成为地主`);
        this.currentPlayerIndex = this.landlordIndex;
        
        this.scheduleOnce(() => {
            this.startPlaying();
        }, 2);
    }
    
    private startPlaying() {
        this.gameState = GameState.PLAYING;
        this.updateTurn();
        
        if (this.currentPlayerIndex === 0) {
            this.showPlayButtons();
        } else {
            this.scheduleOnce(() => {
                this.aiAutoPlay();
            }, 1);
        }
    }
    
    private showPlayButtons() {
        this.playButton.node.active = true;
        if (this.lastPlayerIndex !== -1 && this.lastPlayerIndex !== this.currentPlayerIndex) {
            this.passButton.node.active = true;
        }
    }
    
    private hidePlayButtons() {
        this.playButton.node.active = false;
        this.passButton.node.active = false;
    }
    
    private onPlayCards() {
        if (this.gameState !== GameState.PLAYING) return;
        if (this.currentPlayerIndex !== 0) return;
        
        const player = this.players[0];
        const selectedCards = player.cards.filter(c => c.isSelected);
        
        if (selectedCards.length === 0) {
            this.updateGameState("请选择要出的牌");
            return;
        }
        
        const cardType = CardTypeChecker.getCardType(selectedCards);
        
        if (cardType.pattern === CardPattern.NONE) {
            this.updateGameState("无效的牌型");
            return;
        }
        
        if (this.lastPlayerIndex !== -1 && this.lastPlayerIndex !== this.currentPlayerIndex) {
            if (!CardTypeChecker.canBeat(selectedCards, this.lastPlayedCards, this.lastCardType)) {
                this.updateGameState("出牌无效，必须大于上家的牌");
                return;
            }
        }
        
        this.hidePlayButtons();
        this.playCards(selectedCards, cardType);
    }
    
    private onPass() {
        if (this.gameState !== GameState.PLAYING) return;
        if (this.currentPlayerIndex !== 0) return;
        if (this.lastPlayerIndex === -1 || this.lastPlayerIndex === this.currentPlayerIndex) return;
        
        this.hidePlayButtons();
        this.updateGameState(`玩家${this.currentPlayerIndex + 1} 过牌`);
        this.nextTurn();
    }
    
    private aiAutoPlay() {
        if (this.gameState !== GameState.PLAYING) return;
        
        const player = this.players[this.currentPlayerIndex];
        let cardsToPlay: Card[] = [];
        
        if (this.lastPlayerIndex === -1 || this.lastPlayerIndex === this.currentPlayerIndex) {
            cardsToPlay = this.aiSelectFirstPlay(player);
        } else {
            cardsToPlay = this.aiSelectFollowPlay(player);
        }
        
        if (cardsToPlay.length > 0) {
            const cardType = CardTypeChecker.getCardType(cardsToPlay);
            this.playCards(cardsToPlay, cardType);
        } else {
            this.updateGameState(`玩家${this.currentPlayerIndex + 1} 过牌`);
            this.nextTurn();
        }
    }
    
    private aiSelectFirstPlay(player: Player): Card[] {
        player.sortCards();
        const cards = player.cards;
        
        for (let i = 0; i < cards.length - 1; i++) {
            if (cards[i].value === cards[i + 1].value) {
                return [cards[i], cards[i + 1]];
            }
        }
        
        return [cards[0]];
    }
    
    private aiSelectFollowPlay(player: Player): Card[] {
        if (!this.lastCardType || this.lastCardType.pattern === CardPattern.NONE) {
            return [];
        }
        
        player.sortCards();
        const cards = player.cards;
        
        if (this.lastCardType.pattern === CardPattern.SINGLE) {
            for (const card of cards) {
                if (card.value > this.lastCardType.mainValue) {
                    return [card];
                }
            }
        } else if (this.lastCardType.pattern === CardPattern.PAIR) {
            for (let i = 0; i < cards.length - 1; i++) {
                if (cards[i].value === cards[i + 1].value && 
                    cards[i].value > this.lastCardType.mainValue) {
                    return [cards[i], cards[i + 1]];
                }
            }
        }
        
        for (let i = 0; i < cards.length - 3; i++) {
            if (cards[i].value === cards[i + 1].value &&
                cards[i + 1].value === cards[i + 2].value &&
                cards[i + 2].value === cards[i + 3].value) {
                return [cards[i], cards[i + 1], cards[i + 2], cards[i + 3]];
            }
        }
        
        return [];
    }
    
    private playCards(cards: Card[], cardType: CardTypeInfo) {
        const player = this.players[this.currentPlayerIndex];
        
        for (const card of cards) {
            player.removeCard(card);
        }
        
        this.displayPlayerCards(this.currentPlayerIndex);
        
        if (this.playAreaNode) {
            this.playAreaNode.removeAllChildren();
            for (let i = 0; i < cards.length; i++) {
                const card = cards[i];
                card.node.setParent(this.playAreaNode);
                card.node.setPosition(i * 40 - (cards.length - 1) * 20, 0, 0);
                card.setSelected(false);
            }
        }
        
        this.lastPlayedCards = cards;
        this.lastCardType = cardType;
        this.lastPlayerIndex = this.currentPlayerIndex;
        
        this.updateGameState(`玩家${this.currentPlayerIndex + 1} 出牌`);
        
        if (player.cards.length === 0) {
            this.gameOver();
        } else {
            this.nextTurn();
        }
    }
    
    private nextTurn() {
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % 3;
        
        if (this.lastPlayerIndex === this.currentPlayerIndex) {
            if (this.playAreaNode) {
                this.playAreaNode.removeAllChildren();
            }
            this.lastPlayedCards = [];
            this.lastCardType = null;
            this.lastPlayerIndex = -1;
        }
        
        this.updateTurn();
        
        if (this.currentPlayerIndex === 0) {
            this.showPlayButtons();
        } else {
            this.scheduleOnce(() => {
                this.aiAutoPlay();
            }, 1);
        }
    }
    
    private gameOver() {
        this.gameState = GameState.GAME_OVER;
        this.hidePlayButtons();
        
        const winner = this.players[this.currentPlayerIndex];
        let message = '';
        
        if (winner.isLandlord) {
            message = `地主获胜！`;
        } else {
            message = `农民获胜！`;
        }
        
        if (this.currentPlayerIndex === 0) {
            message += ' 恭喜你！';
        }
        
        this.updateGameState(message);
        this.startButton.node.active = true;
    }
    
    private updateGameState(message: string) {
        if (this.gameStateLabel) {
            this.gameStateLabel.string = message;
        }
    }
    
    private updateTurn() {
        if (this.turnLabel) {
            const player = this.players[this.currentPlayerIndex];
            const role = player.isLandlord ? '地主' : '农民';
            this.turnLabel.string = `轮到: 玩家${this.currentPlayerIndex + 1}(${role})`;
        }
    }
}