import { Card, CardValue } from './Card';

export enum CardPattern {
    NONE = 0,
    SINGLE = 1,
    PAIR = 2,
    THREE = 3,
    THREE_WITH_ONE = 4,
    THREE_WITH_PAIR = 5,
    STRAIGHT = 6,
    PAIR_STRAIGHT = 7,
    THREE_STRAIGHT = 8,
    THREE_STRAIGHT_WITH_SINGLE = 9,
    THREE_STRAIGHT_WITH_PAIR = 10,
    FOUR_WITH_TWO = 11,
    FOUR_WITH_TWO_PAIRS = 12,
    BOMB = 13,
    ROCKET = 14
}

export interface CardTypeInfo {
    pattern: CardPattern;
    mainValue: number;
    length: number;
}

export class CardTypeChecker {
    
    public static getCardType(cards: Card[]): CardTypeInfo {
        if (!cards || cards.length === 0) {
            return { pattern: CardPattern.NONE, mainValue: 0, length: 0 };
        }
        
        const sortedCards = [...cards].sort((a, b) => a.compareTo(b));
        const count = cards.length;
        
        if (count === 1) {
            return {
                pattern: CardPattern.SINGLE,
                mainValue: sortedCards[0].value,
                length: 1
            };
        }
        
        if (count === 2) {
            if (this.isRocket(sortedCards)) {
                return {
                    pattern: CardPattern.ROCKET,
                    mainValue: CardValue.BIG_JOKER,
                    length: 2
                };
            }
            if (this.isPair(sortedCards)) {
                return {
                    pattern: CardPattern.PAIR,
                    mainValue: sortedCards[0].value,
                    length: 2
                };
            }
        }
        
        if (count === 3 && this.isThree(sortedCards)) {
            return {
                pattern: CardPattern.THREE,
                mainValue: sortedCards[0].value,
                length: 3
            };
        }
        
        if (count === 4) {
            if (this.isBomb(sortedCards)) {
                return {
                    pattern: CardPattern.BOMB,
                    mainValue: sortedCards[0].value,
                    length: 4
                };
            }
            const threeWithOne = this.isThreeWithOne(sortedCards);
            if (threeWithOne) {
                return threeWithOne;
            }
        }
        
        if (count === 5) {
            const threeWithPair = this.isThreeWithPair(sortedCards);
            if (threeWithPair) return threeWithPair;
            
            const straight = this.isStraight(sortedCards);
            if (straight) return straight;
        }
        
        if (count >= 5) {
            const straight = this.isStraight(sortedCards);
            if (straight) return straight;
            
            const pairStraight = this.isPairStraight(sortedCards);
            if (pairStraight) return pairStraight;
            
            const threeStraight = this.isThreeStraight(sortedCards);
            if (threeStraight) return threeStraight;
        }
        
        if (count === 6) {
            const fourWithTwo = this.isFourWithTwo(sortedCards);
            if (fourWithTwo) return fourWithTwo;
        }
        
        if (count === 8) {
            const fourWithTwoPairs = this.isFourWithTwoPairs(sortedCards);
            if (fourWithTwoPairs) return fourWithTwoPairs;
        }
        
        const threeStraightWithSingle = this.isThreeStraightWithSingle(sortedCards);
        if (threeStraightWithSingle) return threeStraightWithSingle;
        
        const threeStraightWithPair = this.isThreeStraightWithPair(sortedCards);
        if (threeStraightWithPair) return threeStraightWithPair;
        
        return { pattern: CardPattern.NONE, mainValue: 0, length: 0 };
    }
    
    private static isRocket(cards: Card[]): boolean {
        return cards.length === 2 &&
               cards[0].value === CardValue.SMALL_JOKER &&
               cards[1].value === CardValue.BIG_JOKER;
    }
    
    private static isPair(cards: Card[]): boolean {
        return cards.length === 2 && cards[0].value === cards[1].value;
    }
    
    private static isThree(cards: Card[]): boolean {
        return cards.length === 3 &&
               cards[0].value === cards[1].value &&
               cards[1].value === cards[2].value;
    }
    
    private static isBomb(cards: Card[]): boolean {
        return cards.length === 4 &&
               cards[0].value === cards[1].value &&
               cards[1].value === cards[2].value &&
               cards[2].value === cards[3].value;
    }
    
    private static isThreeWithOne(cards: Card[]): CardTypeInfo | null {
        const valueCount = this.getValueCount(cards);
        let threeValue = 0;
        
        for (const [value, count] of valueCount) {
            if (count === 3) {
                threeValue = value;
                break;
            }
        }
        
        if (threeValue > 0) {
            return {
                pattern: CardPattern.THREE_WITH_ONE,
                mainValue: threeValue,
                length: 4
            };
        }
        
        return null;
    }
    
    private static isThreeWithPair(cards: Card[]): CardTypeInfo | null {
        if (cards.length !== 5) return null;
        
        const valueCount = this.getValueCount(cards);
        let threeValue = 0;
        let pairValue = 0;
        
        for (const [value, count] of valueCount) {
            if (count === 3) threeValue = value;
            if (count === 2) pairValue = value;
        }
        
        if (threeValue > 0 && pairValue > 0) {
            return {
                pattern: CardPattern.THREE_WITH_PAIR,
                mainValue: threeValue,
                length: 5
            };
        }
        
        return null;
    }
    
    private static isStraight(cards: Card[]): CardTypeInfo | null {
        if (cards.length < 5 || cards.length > 12) return null;
        
        for (let i = 0; i < cards.length - 1; i++) {
            if (cards[i].value >= CardValue.TWO) return null;
            if (cards[i + 1].value - cards[i].value !== 1) return null;
        }
        
        return {
            pattern: CardPattern.STRAIGHT,
            mainValue: cards[0].value,
            length: cards.length
        };
    }
    
    private static isPairStraight(cards: Card[]): CardTypeInfo | null {
        if (cards.length < 6 || cards.length % 2 !== 0) return null;
        
        const pairs: number[] = [];
        for (let i = 0; i < cards.length; i += 2) {
            if (cards[i].value !== cards[i + 1].value) return null;
            if (cards[i].value >= CardValue.TWO) return null;
            pairs.push(cards[i].value);
        }
        
        for (let i = 0; i < pairs.length - 1; i++) {
            if (pairs[i + 1] - pairs[i] !== 1) return null;
        }
        
        return {
            pattern: CardPattern.PAIR_STRAIGHT,
            mainValue: pairs[0],
            length: cards.length
        };
    }
    
    private static isThreeStraight(cards: Card[]): CardTypeInfo | null {
        if (cards.length < 6 || cards.length % 3 !== 0) return null;
        
        const threes: number[] = [];
        for (let i = 0; i < cards.length; i += 3) {
            if (cards[i].value !== cards[i + 1].value ||
                cards[i + 1].value !== cards[i + 2].value) return null;
            if (cards[i].value >= CardValue.TWO) return null;
            threes.push(cards[i].value);
        }
        
        for (let i = 0; i < threes.length - 1; i++) {
            if (threes[i + 1] - threes[i] !== 1) return null;
        }
        
        return {
            pattern: CardPattern.THREE_STRAIGHT,
            mainValue: threes[0],
            length: cards.length
        };
    }
    
    private static isThreeStraightWithSingle(cards: Card[]): CardTypeInfo | null {
        const valueCount = this.getValueCount(cards);
        const threes: number[] = [];
        const singles: number[] = [];
        
        for (const [value, count] of valueCount) {
            if (count === 3 && value < CardValue.TWO) {
                threes.push(value);
            } else if (count === 1) {
                singles.push(value);
            } else {
                return null;
            }
        }
        
        threes.sort((a, b) => a - b);
        
        if (threes.length < 2 || singles.length !== threes.length) return null;
        
        for (let i = 0; i < threes.length - 1; i++) {
            if (threes[i + 1] - threes[i] !== 1) return null;
        }
        
        return {
            pattern: CardPattern.THREE_STRAIGHT_WITH_SINGLE,
            mainValue: threes[0],
            length: cards.length
        };
    }
    
    private static isThreeStraightWithPair(cards: Card[]): CardTypeInfo | null {
        const valueCount = this.getValueCount(cards);
        const threes: number[] = [];
        const pairs: number[] = [];
        
        for (const [value, count] of valueCount) {
            if (count === 3 && value < CardValue.TWO) {
                threes.push(value);
            } else if (count === 2) {
                pairs.push(value);
            } else {
                return null;
            }
        }
        
        threes.sort((a, b) => a - b);
        
        if (threes.length < 2 || pairs.length !== threes.length) return null;
        
        for (let i = 0; i < threes.length - 1; i++) {
            if (threes[i + 1] - threes[i] !== 1) return null;
        }
        
        return {
            pattern: CardPattern.THREE_STRAIGHT_WITH_PAIR,
            mainValue: threes[0],
            length: cards.length
        };
    }
    
    private static isFourWithTwo(cards: Card[]): CardTypeInfo | null {
        if (cards.length !== 6) return null;
        
        const valueCount = this.getValueCount(cards);
        let fourValue = 0;
        let singleCount = 0;
        
        for (const [value, count] of valueCount) {
            if (count === 4) fourValue = value;
            else if (count === 1) singleCount++;
            else if (count === 2) singleCount += 2;
        }
        
        if (fourValue > 0 && singleCount === 2) {
            return {
                pattern: CardPattern.FOUR_WITH_TWO,
                mainValue: fourValue,
                length: 6
            };
        }
        
        return null;
    }
    
    private static isFourWithTwoPairs(cards: Card[]): CardTypeInfo | null {
        if (cards.length !== 8) return null;
        
        const valueCount = this.getValueCount(cards);
        let fourValue = 0;
        let pairCount = 0;
        
        for (const [value, count] of valueCount) {
            if (count === 4) fourValue = value;
            else if (count === 2) pairCount++;
            else return null;
        }
        
        if (fourValue > 0 && pairCount === 2) {
            return {
                pattern: CardPattern.FOUR_WITH_TWO_PAIRS,
                mainValue: fourValue,
                length: 8
            };
        }
        
        return null;
    }
    
    private static getValueCount(cards: Card[]): Map<number, number> {
        const valueCount = new Map<number, number>();
        
        for (const card of cards) {
            const count = valueCount.get(card.value) || 0;
            valueCount.set(card.value, count + 1);
        }
        
        return valueCount;
    }
    
    public static canBeat(currentCards: Card[], lastCards: Card[], lastType: CardTypeInfo): boolean {
        const currentType = this.getCardType(currentCards);
        
        if (currentType.pattern === CardPattern.NONE) {
            return false;
        }
        
        if (currentType.pattern === CardPattern.ROCKET) {
            return true;
        }
        
        if (lastType.pattern === CardPattern.ROCKET) {
            return false;
        }
        
        if (currentType.pattern === CardPattern.BOMB) {
            if (lastType.pattern === CardPattern.BOMB) {
                return currentType.mainValue > lastType.mainValue;
            }
            return true;
        }
        
        if (lastType.pattern === CardPattern.BOMB) {
            return false;
        }
        
        if (currentType.pattern !== lastType.pattern) {
            return false;
        }
        
        if (currentType.length !== lastType.length) {
            return false;
        }
        
        return currentType.mainValue > lastType.mainValue;
    }
}