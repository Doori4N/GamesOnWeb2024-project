import {IComponent} from "../core/IComponent";
import {Entity} from "../core/Entity";
import {Scene} from "../core/Scene";
import * as B from '@babylonjs/core';

export class CameraComponent implements IComponent {
    public name: string = "Camera";
    public entity: Entity;
    public scene: Scene;

    // component properties
    public camera!: B.FreeCamera;

    constructor(entity: Entity, scene: Scene, props: {camera: B.FreeCamera}) {
        this.entity = entity;
        this.scene = scene;
        this.camera = props.camera;
    }

    public onStart(): void {}

    public onUpdate(): void {}

    public onDestroy(): void {
        this.camera.dispose();
    }

    public setAsActiveCamera(): void {
        this.scene.scene.activeCamera = this.camera;
    }
}