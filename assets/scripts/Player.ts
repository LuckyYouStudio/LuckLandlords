import { Card } from './Card';

export class Player {
    public index: number = 0;
    public cards: Card[] = [];
    public isLandlord: boolean = false;
    public isAI: boolean = true;
    public score: number = 0;
    
    public reset() {
        this.cards = [];
        this.isLandlord = false;
        this.score = 0;
    }
    
    public addCard(card: Card) {
        this.cards.push(card);
    }
    
    public removeCard(card: Card) {
        const index = this.cards.indexOf(card);
        if (index !== -1) {
            this.cards.splice(index, 1);
        }
    }
    
    public sortCards() {
        this.cards.sort((a, b) => b.compareTo(a));
    }
    
    public getCardCount(): number {
        return this.cards.length;
    }
    
    public hasCard(value: number): boolean {
        return this.cards.some(card => card.value === value);
    }
    
    public getCardsByValue(value: number): Card[] {
        return this.cards.filter(card => card.value === value);
    }
}