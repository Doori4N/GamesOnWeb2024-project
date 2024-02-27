export type InputStates = {
    type: InputType;
    direction: {
        x: number;
        y: number;
    };
    buttons: {[key: string]: boolean};
}

export enum InputType {
    KEYBOARD,
    GAMEPAD
}

export type PlayerData = {
    name: string;
    goldMedals: number;
    silverMedals: number;
    bronzeMedals: number;
}