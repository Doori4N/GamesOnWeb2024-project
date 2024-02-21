import * as B from '@babylonjs/core';
import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import {Game} from "./Game";
import {EventManager} from "./EventManager";
import {EntityManager} from "./EntityManager";
import {SceneManager} from "./SceneManager";

export class Scene {
    public name: string;
    public scene: B.Scene;
    public mainCamera: B.FreeCamera;
    public game: Game = Game.getInstance();
    public eventManager = new EventManager();
    public entityManager = new EntityManager();
    public sceneManager = SceneManager.getInstance();
    public loadedAssets: { [name: string]: B.AssetContainer } = {};

    constructor(name: string) {
        this.name = name;

        // initialize the scene with a main camera
        this.scene = new B.Scene(this.game.engine);
        this.mainCamera = new B.FreeCamera("mainCamera", new B.Vector3(0, 5, -10), this.scene);
    }

    /**
     * Function to override
     * Initialize all entities
     */
    public start(): void {}

    /**
     * Render the scene and update entities
     */
    public update(): void {
        this.scene.render();
        this.entityManager.update();
    }

    /**
     * Destroy the scene and all entities
     */
    public destroy(): void {
        this.mainCamera.dispose();
        this.scene.dispose();
        this.entityManager.destroyAllEntities();
    }
}