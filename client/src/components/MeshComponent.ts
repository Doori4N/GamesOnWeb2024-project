import {IComponent} from "../core/IComponent";
import {Entity} from "../core/Entity";
import {Scene} from "../core/Scene";
import * as B from '@babylonjs/core';

export class MeshComponent implements IComponent {
    public name: string = "Mesh";
    public entity: Entity;
    public scene: Scene;

    // component properties
    public mesh!: B.AbstractMesh;

    constructor(entity: Entity, scene: Scene, props: {mesh: B.AbstractMesh}) {
        this.entity = entity;
        this.scene = scene;
        this.mesh = props.mesh;
    }

    public onStart(): void {}

    public onUpdate(): void {}

    public onDestroy(): void {
        this.mesh.dispose();
    }
}