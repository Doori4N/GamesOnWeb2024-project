import {IComponent} from "../IComponent";
import {Entity} from "../Entity";
import {Scene} from "../Scene";
import {PlayerData} from "../../network/types";

export class Leaderboard implements IComponent {
    public name: string = "Leaderboard";
    public entity: Entity;
    public scene: Scene;

    // component properties
    private timer: number = 10;

    constructor(entity: Entity, scene: Scene) {
        this.entity = entity;
        this.scene = scene;
    }

    public onStart(): void {
        this.scene.eventManager.subscribe("onDisplayLeaderboard", this.displayLeaderboard.bind(this));
    }

    public onUpdate(): void {}

    public onFixedUpdate(): void {}

    public onDestroy(): void {}

    public displayLeaderboard(): void {
        // sort players by score
        const sortedPlayers: PlayerData[] = this.scene.game.networkInstance.players.slice();
        sortedPlayers.sort(this.compareMedals.bind(this));

        let playerScores: string = "";
        for (let i: number = 0; i < sortedPlayers.length; i++) {
            playerScores += `<li>${sortedPlayers[i].name}: 
                                ${sortedPlayers[i].goldMedals}g
                                ${sortedPlayers[i].silverMedals}s
                                ${sortedPlayers[i].bronzeMedals}b
                                [${this.getScore(sortedPlayers[i])}]
                            </li>`;
        }

        const uiContainer: Element | null = document.querySelector("#ui");
        if (!uiContainer) throw new Error("UI element not found");

        uiContainer.innerHTML = `
            <div id="presentation-ui">
                <h1>Leaderboard</h1>
                <ol>
                    ${playerScores}
                </ol>
                <p id="timer">Next game in ${this.timer} seconds</p>
            </div>
        `;

        // countdown interval
        const interval: number = setInterval((): void => {
            this.timer--;
            if (this.timer < 0) {
                clearInterval(interval);
                this.scene.sceneManager.changeScene("gameSelection");
            }
            else {
                this.updateTimerUI();
            }
        }, 1000);
    }

    private updateTimerUI(): void {
        const timerUI: Element | null = document.querySelector("#timer");
        if (!timerUI) throw new Error("Timer element not found");

        timerUI.textContent = `Next game in ${this.timer} seconds`;
    }

    private compareMedals(a: PlayerData, b: PlayerData): number {
        return this.getScore(b) - this.getScore(a);
    }

    private getScore(player: PlayerData): number {
        return player.goldMedals * 3 + player.silverMedals * 2 + player.bronzeMedals;
    }
}