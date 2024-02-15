import { GameRunner } from "./GameRunner.js";
import { GameUI } from "./GameUI.js";
import { Color } from "./enums/Color.js";
import { Command } from "./enums/Command.js";

export class GameInput {
    private static _instance: GameInput;
    public input: string = "";
    private inputField: HTMLElement;
    private onKeydownHandler: Function;
    private infoText: HTMLElement;

    public init() {
        this.input = "";

        const readInput = this.readInputCommand.bind(this);
        document.addEventListener('keyup', function(event: KeyboardEvent) { 
            if (event.key == "Enter" && !GameUI.get().isPrinting()) {
                readInput();
            }
        })
    }

    public appendInputField() {
        const inputField = document.createElement('b');
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

        const infoText = document.createElement('b');
        infoText.innerHTML = "Type 'help' for commands";
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
        if (this.input == Command.play) {
            GameRunner.get().play()
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

        if (valid) {
            this.removeInputField();
        }
        else {
            GameUI.get().log('Invalid command.', null, 0.1);
            this.removeInputField();
            GameUI.get().printLog();
        }
    }

    static get() {
        if (this._instance) {
            return this._instance;
        }

        this._instance = new GameInput();
        return this._instance;
    }
}