import {IComponent} from "../../../core/IComponent";
import {Entity} from "../../../core/Entity";
import {Scene} from "../../../core/Scene";
import * as B from '@babylonjs/core';
import {CameraComponent} from "../../../core/components/CameraComponent";

export class CameraAnimation implements IComponent {
    public name: string = "CameraAnimation";
    public entity: Entity;
    public scene: Scene;

    // component properties
    private camera!: B.FreeCamera;
    private frameRate: number = 30;

    constructor(entity: Entity, scene: Scene) {
        this.entity = entity;
        this.scene = scene;
    }

    public onStart(): void {
        const cameraComponent = this.entity.getComponent("Camera") as CameraComponent;
        this.camera = cameraComponent.camera;

        this.scene.babylonScene.switchActiveCamera(this.camera);

        this.initCameraAnimation();

        this.scene.eventManager.subscribe("onPresentationFinished", this.onBeginAnimation.bind(this));
    }

    public onUpdate(): void {}

    public onFixedUpdate(): void {}

    public onDestroy(): void {}

    private initCameraAnimation(): void {
        const positionXAnim = new B.Animation(
            "cameraPositionAnimation",
            "position.x",
            this.frameRate,
            B.Animation.ANIMATIONTYPE_FLOAT,
            B.Animation.ANIMATIONLOOPMODE_CONSTANT
        );
        const positionAnimKeys: {frame: number, value: number}[] = [];
        positionAnimKeys.push({
            frame: 0,
            value: this.camera.position.x
        });
        positionAnimKeys.push({
            frame: 10 * this.frameRate,
            value: this.camera.position.x + 20
        });
        positionXAnim.setKeys(positionAnimKeys);
        this.camera.animations.push(positionXAnim);
    }

    private onBeginAnimation(): void {
        this.scene.babylonScene.beginAnimation(
            this.camera,
            0,
            10 * this.frameRate,
            false,
            1
        );
        setTimeout((): void => {
            this.scene.game.fadeIn(this.onEndAnimation.bind(this));
        }, 9000);
    }

    private onEndAnimation(): void {
        this.scene.eventManager.notify("onCameraAnimationFinished");
        this.scene.entityManager.removeEntity(this.entity);
    }
}