import { GameRunner } from "../GameRunner.js";
import { DamageType } from "../enums/DamageType.js";
import { ICharacter } from "./ICharacter.js";
import { Skill } from "./Skill.js";
import { GameUI } from "../GameUI.js";
import { Trait } from "./Trait.js";
import { DataService } from "../main.js";

export class Character implements ICharacter {
    name: string;
    hp: number;
    hpMax: number;
    ap: number;
    apMax: number;
    physDmg: number;
    magDmg: number;
    isDead: boolean;
    trait: Trait;
    isEnemy: boolean = false;
    number: number = null;
    data: any;
    race: string = "Undefined";

    constructor(data: any) {
        this.data = data;

        this.name = data.name;
        this.hp = data.hp;
        this.hpMax = data.hp;
        this.ap = data.ap;
        this.apMax = data.ap;
        this.physDmg = data.physDmg;
        this.magDmg = data.magDmg
        this.isDead = false;
        this.trait = DataService.get().getTraits().find(x => x.name == data.trait) as Trait;
    }

    public setNumber(num: number) {
        this.number = num;
    }

    public getNameAndNumber() {
        let name = this.name;
        if (this.number) {
            name += ` ${this.number}`
        }
        return name;
    }

    getName(): string {
        return this.name;
    }

    public setAllegiance(isEnemy: boolean) {
        this.isEnemy = isEnemy;
    }

    public heal(hp: number) {
        if (this.isDead) {
            return;
        }
        var prevHp = this.hp;
        var healAmt = 0;
        if (this.hp < this.hpMax) {
            var canHealAmt = this.hpMax - this.hp;
            var healAmt = 0;
            for (var i = 0; i < canHealAmt && i < hp; i++) {
                healAmt++;
            }
            this.hp += healAmt;
        }
        GameUI.get().log(`${this.getNameAndNumber()} healed for ${healAmt}hp.`, 'skyblue')
    }

    public takeDamage(dmg: number) {
        this.hp -= dmg;
        this.isDead = this.hp > 0 ? false : true;
        GameUI.get().log(`${this.getNameAndNumber()} took ${dmg} damage. Current hp: ${this.hp}`)
        if(this.isDead) {
            GameUI.get().log(`${this.getNameAndNumber()} has perished.`, 'red')
        }
    }

    public performAction() {
        const skill = this.getRandomSkill();
        var targets;
        
        if (skill == null) {
            GameUI.get().log(`${this.getNameAndNumber()} has insufficient action points.`)
            return;
        }

        if (skill.damageType == DamageType.none) {
            targets = GameRunner.get().party.filter(x => !x.isDead)
            GameUI.get().log(`${this.getNameAndNumber()} performed ${skill.name} healing for ${skill.heal}hp.`, 'limegreen')
            targets.forEach(target => {
                target.heal(skill.heal)
            })
        }

        if (skill.damageType == DamageType.physical) {
            targets = this.getTarget(skill).filter(x => !x.isDead)
            GameUI.get().log(`<b style="color: orange">${this.getNameAndNumber()} performed ${skill.name} causing ${skill.damage} damage.`)
            for (let target of targets) {
                target.takeDamage(skill.damage)
            }
        }

        if (skill.damageType == DamageType.magic) {
            targets = this.getTarget(skill).filter(x => !x.isDead)
            GameUI.get().log(`<b style="color: orange">${this.getNameAndNumber()} performed ${skill.name} causing ${skill.damage} damage.`)
            for (let target of targets) {
                target.takeDamage(skill.damage)
            }
        }
        GameUI.get().log('&nbsp;', null, 1)
    }

    public getTarget(skill: Skill) {
        let targets = [];
        if (skill.aoe) {
            targets = GameRunner.get().getTargets(this.isEnemy);
        }
        else {
            targets.push(GameRunner.get().getRandomTarget(this.isEnemy))
        }
        return targets;
    }

    private getRandomSkill() {
        const skills = this.trait.getSkills().filter(x => x.cost <= this.ap)
        if (skills.length == 0) {
            return null;
        }
        const i = Math.floor(Math.random() * skills.length);
        return skills[i];
    }
}