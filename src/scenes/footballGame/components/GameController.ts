import {IComponent} from "../../../core/IComponent";
import {Entity} from "../../../core/Entity";
import {Scene} from "../../../core/Scene";
import * as B from "@babylonjs/core";
import {GameMessages} from "../../../core/components/GameMessages";
import {NetworkHost} from "../../../network/NetworkHost";
import {NetworkAudioComponent} from "../../../network/components/NetworkAudioComponent";

export class GameController implements IComponent {
    public name: string = "GameController";
    public entity: Entity;
    public scene: Scene;

    // component properties
    private _goalTriggerObserver!: B.Observer<B.IBasePhysicsCollisionEvent>;
    private _scoreDiv!: HTMLDivElement;
    private _uiContainer!: Element;
    private _gameMessagesComponent!: GameMessages;
    private _score: {left: number, right: number} = {left: 0, right: 0};
    private _networkAudioComponent!: NetworkAudioComponent;

    // event listeners
    private _onGoalScoredEvent = this._onGoalScoredClientRpc.bind(this);

    constructor(entity: Entity, scene: Scene) {
        this.entity = entity;
        this.scene = scene;
    }

    public onStart(): void {
        // HOST
        if (this.scene.game.networkInstance.isHost) {
            const observable: B.Observable<B.IBasePhysicsCollisionEvent> = this.scene.game.physicsPlugin.onTriggerCollisionObservable;
            this._goalTriggerObserver = observable.add(this._onTriggerCollision.bind(this));

            this.scene.eventManager.subscribe("onGameStarted", this._onGameStarted.bind(this));
            this.scene.eventManager.subscribe("onGameFinished", this._onGameFinished.bind(this));
        }
        // CLIENT
        else {
            this.scene.game.networkInstance.addEventListener("onGoalScored", this._onGoalScoredEvent);
        }

        this._networkAudioComponent = this.entity.getComponent("NetworkAudio") as NetworkAudioComponent;
        this._gameMessagesComponent = this.entity.getComponent("GameMessages") as GameMessages;

        this._uiContainer = document.querySelector("#ui")!;
        this._scoreDiv = document.createElement("div");
        this._scoreDiv.id = "score";
        this._scoreDiv.innerHTML = "0 - 0";
        this._uiContainer.appendChild(this._scoreDiv);
    }

    public onUpdate(): void {}

    public onFixedUpdate(): void {}

    public onDestroy(): void {
        // HOST
        if (this.scene.game.networkInstance.isHost) this._goalTriggerObserver.remove()
        // CLIENT
        else this.scene.game.networkInstance.removeEventListener("onGoalScored", this._onGoalScoredEvent);

        this._scoreDiv.remove();
    }

    private _updateScoreUI(): void {
        this._scoreDiv.innerHTML = `${this._score.left} - ${this._score.right}`;
    }

    private _onTriggerCollision(collisionEvent: B.IBasePhysicsCollisionEvent): void {
        if (collisionEvent.type !== B.PhysicsEventType.TRIGGER_ENTERED) return;

        const collider: B.TransformNode = collisionEvent.collider.transformNode;
        const collidedAgainst: B.TransformNode = collisionEvent.collidedAgainst.transformNode;

        const networkHost = this.scene.game.networkInstance as NetworkHost;

        // check if the ball collided with a goal (left scores if the ball collided with the rightGoal)
        const isLeftScore: boolean = collidedAgainst?.metadata?.tag === "rightGoal";
        const isRightScore: boolean = collidedAgainst?.metadata?.tag === "leftGoal";

        if (collider?.metadata?.tag === "ball" && (isRightScore || isLeftScore)) {
            if (isLeftScore) {
                networkHost.sendToAllClients("onGoalScored", true);
                this._score.left++;
            }
            else {
                networkHost.sendToAllClients("onGoalScored", false);
                this._score.right++;
            }

            this._updateScoreUI();
            this._gameMessagesComponent.displayMessage("GOAL!", 1500);
            this.scene.eventManager.notify("onGoalScored");

            // audio
            this._networkAudioComponent.playSound("Crowd", {
                volume: 0.4,
                offset: 4,
                duration: 5,
                fadeOut: {fadeOutDelay: 3, fadeOutDuration: 2}
            });
            this._networkAudioComponent.playSound("Whistle", {volume: 0.5, offset: 9, duration: 1});

            setTimeout((): void => {
                this._networkAudioComponent.playSound("Whistle", {volume: 0.5, offset: 9, duration: 1});
            }, 3500);
        }
    }

    private _onGoalScoredClientRpc(isLeftScore: boolean): void {
        // update score
        if (isLeftScore) this._score.left++;
        else this._score.right++;
        this._updateScoreUI();
        this._gameMessagesComponent.displayMessage("GOAL!", 1500);
    }

    private _onGameStarted(): void {
        this._networkAudioComponent.playSound("Whistle", {volume: 0.5, offset: 9, duration: 1});
    }

    private _onGameFinished(): void {
        this._networkAudioComponent.playSound("Whistle", {volume: 0.5, offset: 3, duration: 1.5});
    }
}