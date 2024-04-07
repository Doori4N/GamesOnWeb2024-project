import {IComponent} from "../IComponent";
import {Entity} from "../Entity";
import {Scene} from "../Scene";


export class GameMessages implements IComponent {
    public name: string = "GameMessages";
    public entity: Entity;
    public scene: Scene;

    // component properties
    private _uiContainer!: Element;
    private _msgDiv!: HTMLDivElement;

    constructor(entity: Entity, scene: Scene) {
        this.entity = entity;
        this.scene = scene;
    }

    public onStart(): void {
        this._uiContainer = document.querySelector("#ui")!;

        this.scene.eventManager.subscribe("onCameraAnimationFinished", this.startCountDown.bind(this, 3));
        this.scene.eventManager.subscribe("onGameFinished", this.displayGameOver.bind(this));
    }

    public onUpdate(): void {}

    public onFixedUpdate(): void {}

    public onDestroy(): void {}

    private startCountDown(duration: number): void {
        this._msgDiv = document.createElement("div");
        this._msgDiv.id = "msg";
        this._msgDiv.innerHTML = `<h1>${duration}</h1>`;
        this._uiContainer.appendChild(this._msgDiv);

        let timer: number = duration;
        const interval: number = setInterval((): void => {
            timer--;
            if (timer <= 0) {
                this.updateTimerUI("GO!");

                clearInterval(interval);
                this.scene.eventManager.notify("onGameStarted");

                setTimeout((): void => {
                    this._uiContainer.removeChild(this._msgDiv);
                }, 1000);
            }
            else {
                this.updateTimerUI(timer.toString());
            }
        }, 1000);
    }

    private updateTimerUI(msg: string): void {
        this._msgDiv.innerHTML = `<h1>${msg}</h1>`;
    }

    private displayGameOver(): void {
        this._msgDiv = document.createElement("div");
        this._msgDiv.id = "msg";
        this._msgDiv.innerHTML = "<h1>Finished!</h1>";
        this._uiContainer.appendChild(this._msgDiv);
        setTimeout((): void => {
            this._uiContainer.removeChild(this._msgDiv);
            this.scene.eventManager.notify("onMessageFinished");
        }, 2000);
    }
}