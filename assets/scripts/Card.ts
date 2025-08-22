import { _decorator, Component, Node, Sprite, SpriteFrame, resources, Label, UITransform, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

export enum CardSuit {
    SPADE = 0,
    HEART = 1,
    CLUB = 2,
    DIAMOND = 3,
    JOKER = 4
}

export enum CardValue {
    THREE = 3,
    FOUR = 4,
    FIVE = 5,
    SIX = 6,
    SEVEN = 7,
    EIGHT = 8,
    NINE = 9,
    TEN = 10,
    JACK = 11,
    QUEEN = 12,
    KING = 13,
    ACE = 14,
    TWO = 15,
    SMALL_JOKER = 16,
    BIG_JOKER = 17
}

@ccclass('Card')
export class Card extends Component {
    @property
    public suit: CardSuit = CardSuit.SPADE;
    
    @property
    public value: CardValue = CardValue.THREE;
    
    @property
    public isSelected: boolean = false;
    
    private _originalY: number = 0;
    private _sprite: Sprite = null;
    
    onLoad() {
        this._sprite = this.getComponent(Sprite);
        this._originalY = this.node.position.y;
        
        this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
    }
    
    public init(suit: CardSuit, value: CardValue) {
        this.suit = suit;
        this.value = value;
        this.updateDisplay();
    }
    
    private updateDisplay() {
        const label = this.node.getComponentInChildren(Label);
        if (label) {
            label.string = this.getCardDisplayName();
        }
    }
    
    private getCardDisplayName(): string {
        if (this.value === CardValue.SMALL_JOKER) return '小王';
        if (this.value === CardValue.BIG_JOKER) return '大王';
        
        const suitNames = ['♠', '♥', '♣', '♦'];
        const valueNames = {
            [CardValue.THREE]: '3',
            [CardValue.FOUR]: '4',
            [CardValue.FIVE]: '5',
            [CardValue.SIX]: '6',
            [CardValue.SEVEN]: '7',
            [CardValue.EIGHT]: '8',
            [CardValue.NINE]: '9',
            [CardValue.TEN]: '10',
            [CardValue.JACK]: 'J',
            [CardValue.QUEEN]: 'Q',
            [CardValue.KING]: 'K',
            [CardValue.ACE]: 'A',
            [CardValue.TWO]: '2'
        };
        
        return suitNames[this.suit] + valueNames[this.value];
    }
    
    private onTouchStart() {
        this.toggleSelect();
    }
    
    public toggleSelect() {
        this.isSelected = !this.isSelected;
        const newY = this.isSelected ? this._originalY + 30 : this._originalY;
        this.node.setPosition(this.node.position.x, newY, 0);
    }
    
    public setSelected(selected: boolean) {
        this.isSelected = selected;
        const newY = selected ? this._originalY + 30 : this._originalY;
        this.node.setPosition(this.node.position.x, newY, 0);
    }
    
    public getWeight(): number {
        return this.value;
    }
    
    public compareTo(other: Card): number {
        if (this.value !== other.value) {
            return this.value - other.value;
        }
        return this.suit - other.suit;
    }
}