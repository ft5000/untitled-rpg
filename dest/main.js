import { Hero } from "./models/hero.js";
import { Trait } from "./models/trait.js";
import { Skill } from "./models/Skill.js";
import skillsJson from '../data/skills.json' assert { type: 'json' };
import traitsJson from '../data/traits.json' assert { type: 'json' };
import heroesJson from '../data/heroes.json' assert { type: 'json' };
import enemiesJson from '../data/enemies.json' assert { type: 'json' };
import { Enemy } from "./models/Enemy.js";
import { GameRunner } from "./GameRunner.js";
export class DataService {
    constructor() {
        this.skills = [];
        this.traits = [];
        this.heroes = [];
        this.enemies = [];
    }
    loadJson() {
        skillsJson.forEach((data) => {
            this.skills.push(new Skill(data));
            console.log("loading skills...");
        });
        traitsJson.forEach((data) => {
            this.traits.push(new Trait(data, this.skills));
            console.log("loading traits...");
        });
        heroesJson.forEach((data) => {
            this.heroes.push(new Hero(data, this.traits));
            console.log("loading heroes...");
        });
        enemiesJson.forEach((data) => {
            this.enemies.push(new Enemy(data, this.traits));
            console.log("loading enemies...");
        });
        return false;
    }
    getHeroes() {
        return this.heroes;
    }
    getEnemies() {
        return this.enemies;
    }
    getTrait(name) {
        return this.traits.find(x => x.name == name);
    }
    static get() {
        if (this._instance) {
            return this._instance;
        }
        this._instance = new DataService();
        return this._instance;
    }
}
export class App {
    constructor() {
        this.app = this;
        this.loading = false;
    }
    init() {
        this.loading = true;
        this.loading = DataService.get().loadJson();
        GameRunner.get().init();
        GameRunner.get().newEncounter();
    }
}
const app = new App();
app.init();
