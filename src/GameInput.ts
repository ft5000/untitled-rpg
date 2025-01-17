import { GameRunner } from "./GameRunner.js";
import { GameUI } from "./GameUI.js";
import { AppInfo } from "./enums/AppInfo.js";
import { Attribute } from "./enums/Attribute.js";
import { Color } from "./enums/Color.js";
import { Command } from "./enums/Command.js";
import { Hero } from "./models/Hero.js";
import { Item } from "./models/Item.js";

export class ListItem<T> {
    public id: number;
    public value: T;
    constructor(id: number, value: T) {
        this.id = id;
        this.value = value;
    }
}

export class GameInput {
    private static _instance: GameInput;
    public input: string = "";
    private inputField: HTMLElement;
    private onKeydownHandler: Function;
    private infoText: HTMLElement;
    private confirmMode: boolean = false;
    private selectHero: boolean = false;
    private onSelect: Function;
    private onConfirm: Function;
    private helpText: string;

    private list: ListItem<any>[] = [];
    private select: boolean = false;
    private previous: any;

    public init() {
        this.input = "";

        if (/Mobi|Android/i.test(navigator.userAgent)) {
            window.location.href = "mobile.html";
        }

        const readInput = this.readInputCommand.bind(this);
        document.addEventListener('keyup', function(event: KeyboardEvent) { 
            if (event.key == "Enter" && !GameUI.get().isPrinting()) {
                readInput();
            }
        })
    }

    public appendInputField(text?: string) {
        const inputField = document.createElement('span');
        inputField.id = 'input-field';
        const textbox: HTMLElement = document.getElementById('console');

        // Check if event listener is added.
        if (!this.onKeydownHandler) {
            const getkey = this.getKey.bind(this);
            const func = function onKeydown(e: KeyboardEvent) {
                if (!GameUI.get().isPrinting()) {
                    getkey(e) 
                }
            }
            document.addEventListener('keydown', func)
            this.onKeydownHandler = func;
        }

        this.inputField = inputField;
        textbox.append(inputField);

        const infoText = document.createElement('span');
        if (text != null) {
            infoText.innerHTML = text;
        }
        else {
            infoText.innerHTML = "Type 'help' for commands";
        }
        infoText.style.color = Color.gray;
        infoText.style.userSelect = 'none';
        this.infoText = infoText;
        textbox.append(infoText);

        GameUI.get().scrollToBottom();
    }

    public removeInputField() {
        this.inputField.remove();
        this.inputField = null;
        this.input = "";

        this.infoText.remove();
        this.infoText = null;
    }

    private updateInput() {
        if (this.inputField){
            this.inputField.innerHTML = this.input;
        }
    }

    private getKey(event: KeyboardEvent) {
        if (event.keyCode <=  90 && event.keyCode >=  48) {
            this.input += event.key.toLowerCase();
        }
        if (event.key == " ") {
            this.input += event.key;
        }
        if (event.key == "Backspace") {
            this.input = this.input.slice(0, -1);
        }
        this.updateInput();
    }

    private readInputCommand() {
        var valid = false;

        if (this.confirmMode) {
            if ((this.input == "yes" || this.input == "y") && this.onConfirm != null) {
                GameUI.get().log(this.input)
                this.onConfirm();
                this.onConfirm = null;
                this.helpText = null;
                this.confirmMode = false;
                valid = true;
            }
            if ((this.input == "no" || this.input == "n")&& this.onConfirm != null) {
                GameUI.get().log(this.input)
                GameUI.get().printLog();
                this.onConfirm = null;
                this.helpText = null;
                this.confirmMode = false;
                valid = true;
            }
        }
        else if (this.select) {
            var selected = this.list.find(l => l.id == Number(this.input) - 1);
            if (selected == null) {
                GameUI.get().log('Invalid selection.', null, 0);
                GameUI.get().printLog();
                this.setSelectMode(false);
            }
            else {
                this.onSelect(selected.value);
            }
            valid = true;
        }
        else {
            if (this.input == Command.newGame && GameRunner.get().newInstance) {
                GameRunner.get().newGame()
                if (Number(AppInfo.skipIntro) != 1) {
                    GameUI.get().intro();
                    GameUI.get().title();
                }
                GameRunner.get().play()
                valid = true;
            }
            else if (this.input == Command.newGame && !GameRunner.get().newInstance) {
                this.helpText = "Please confirm: y/n"
                GameUI.get().log("Are you sure?");
                GameUI.get().printLog(this.helpText);
                var onConfirm = function onConfirm() {
                    GameRunner.get().newGame()
                    if (Number(AppInfo.skipIntro) != 1) {
                        GameUI.get().intro();
                        GameUI.get().title();
                    }
                    GameRunner.get().play()
                }
                this.onConfirm = onConfirm.bind(this)
                this.confirmMode = true;
                valid = true;
            }
            if (this.input == Command.play) {
                if (!GameRunner.get().isGameOver()) {
                    GameRunner.get().play()
                    valid = true;
                }
                else {
                    GameUI.get().log("Please input 'new game' to start a new game.", null, 0.1);
                }
            }
            if (this.input == Command.enemyStats) {
                GameUI.get().stats(false);
                valid = true;
            }
            if (this.input == Command.partyStats) {
                GameUI.get().stats(true);
                valid = true;
            }
            if (this.input == Command.theme) {
                GameUI.get().log('Select theme:');

                const themes: string[] = [
                    Command.dosTheme, 
                    Command.darkTheme, 
                    Command.matrixTheme, 
                    Command.bloodTheme
                ]
                this.list = this.createList(themes);
                this.logList(this.list);

                this.onSelect = this.onSelectTheme.bind(this);
                GameUI.get().printLog(this.setSelectMode());
                valid = true;
            }
            if (this.input == Command.clear) {
                GameUI.get().clearLog();
                valid = true;
            }
            if (this.input == Command.about) {
                GameUI.get().about();
                valid = true;
            }
            if (this.input == Command.help) {
                GameUI.get().listCommands();
                valid = true;
            }
            if (this.input == Command.gameStats) {
                GameUI.get().printGameStats();
                valid = true;
            }
            if (this.input == Command.inventory) {
                GameUI.get().logInventory(true);
                GameUI.get().printLog();
                valid = true;
            }
            if (this.input == Command.use) {
                if (GameRunner.get().inventory.length == 0) { 
                    GameUI.get().log("You have no items in your inventory.");
                    GameUI.get().log("&nbsp;");
                    GameUI.get().printLog();
                    valid = true;
                }
                else {
                    GameUI.get().log('Please specify an item.', null, 0);
                    this.list = this.createList(GameRunner.get().uniqueItems);
                    this.logList(this.list, GameUI.get().logInventory.bind(GameUI.get()));

                    this.onSelect = this.onUseItem.bind(this);
                    GameUI.get().printLog(this.setSelectMode());

                    valid = true;
                }
            }
        }

        if (valid) {
            this.removeInputField();
        }
        else {
            GameUI.get().log(this.input, null, 0);
            GameUI.get().log('Invalid command.', null, 0);
            this.removeInputField();
            GameUI.get().printLog(this.helpText);
        }
    }

    static get() {
        if (this._instance) {
            return this._instance;
        }
        this._instance = new GameInput();
        return this._instance;
    }

    private createList<T>(array: T[]): ListItem<T>[] {
        var list: ListItem<T>[] = [];
        for (let i = 0; i < array.length; i++) {
            list.push(new ListItem(i, array[i]));
        }
        return list;
    }

    private logList<T>(list: ListItem<T>[], logFn?: Function) {
        if (logFn) {
            logFn();
            return;
        }
        for (let i = 0; i < list.length; i++) {
            GameUI.get().log(`${list[i].id + 1}. ${list[i].value}`);
        }
        GameUI.get().log('&nbsp;');
    }
    
    private onUseItem(item: Item) {
        if (item) {
            if (item.attribute == Attribute.HealAll || item.attribute == Attribute.CureAll) {
                switch (item.attribute) {
                    case Attribute.HealAll:
                        item.healAll();
                        break;
                    case Attribute.CureAll:
                        item.cureAll();
                        break;
                }

                GameUI.get().log('&nbsp;');
                GameUI.get().log(`Used ${item.name}.`);
                GameUI.get().log('Item has been removed from inventory.');
                GameUI.get().log('&nbsp;');

                var index = GameRunner.get().inventory.findIndex(i => i.name == item.name)
                GameRunner.get().inventory.splice(index, 1);

                this.setSelectMode(false);
                GameUI.get().printLog();
            }
            else if (item.attribute == Attribute.Heal || item.attribute == Attribute.Cure) {
                GameUI.get().log(`Using ${item.name} - ${item.description}`);
                GameUI.get().log(`Select target:`, null, 0);

                this.list = this.createList(GameRunner.get().party.map(h => h.name));
                this.logList(this.list);

                this.previous = item;
                this.onSelect = this.onUseItemHeroSelect.bind(this);
                GameUI.get().printLog(this.setSelectMode());
            }
        }
    }

    private onUseItemHeroSelect(name: string) {
        var item = this.previous;

        var hero = GameRunner.get().party.find(h => h.name == name);
        if (item.attribute == Attribute.Heal) {
            item.heal(hero);
        }
        if (item.attribute == Attribute.Cure) {
            item.cure(hero);
        }

        GameUI.get().log('&nbsp;');
        GameUI.get().log(`Used ${item.name}.`);
        GameUI.get().log('Item has been removed from inventory.');
        GameUI.get().log('&nbsp;');

        var index = GameRunner.get().inventory.findIndex(i => i.name.toLocaleLowerCase() == item.name)
        GameRunner.get().inventory.splice(index, 1);

        this.setSelectMode(false)
        GameUI.get().printLog();
    }

    private onSelectTheme(theme: string) {
        switch (theme) {
            case Command.dosTheme:
                GameUI.get().setMSDosTheme();
                break;
            case Command.darkTheme:
                GameUI.get().setDarkTheme();
                break;
            case Command.matrixTheme:
                GameUI.get().setMatrixTheme();
                break;
            case Command.bloodTheme:
                GameUI.get().setBloodTheme();
                break;
        }
        this.setSelectMode(false);
        GameUI.get().printLog();
    }

    private setSelectMode(value: boolean = true): string {
        this.select = value;
        return value == true ? `Please select an option [1-${this.list?.length}]` : 'Select mode disabled.';
    }
}