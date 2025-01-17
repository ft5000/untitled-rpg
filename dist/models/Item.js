import { Color } from "../enums/Color.js";
import { GameRunner } from "../GameRunner.js";
import { GameUI } from "../GameUI.js";
export class Item {
    name;
    amount;
    description;
    attribute;
    rate;
    data;
    constructor(data) {
        this.name = data.name;
        this.amount = data.amount;
        this.description = data.description;
        this.attribute = data.attribute;
        this.rate = data.rate;
        this.data = data;
    }
    heal(hero) {
        hero.heal(this.amount);
    }
    healAll() {
        GameRunner.get().party.forEach((hero) => {
            this.heal(hero);
        });
    }
    cure(hero) {
        for (let effect of hero.statusEffects) {
            if (!effect.isBuff) {
                hero.statusEffects.splice(hero.statusEffects.indexOf(effect), 1);
            }
        }
        GameUI.get().log(`☻ ${hero.name} has been cured!`, Color.green);
    }
    cureAll() {
        GameRunner.get().party.forEach((hero) => {
            this.cure(hero);
        });
    }
}
