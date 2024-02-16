import {Scene} from "../../core/Scene";
import * as B from "@babylonjs/core";
import {Entity} from "../../core/Entity";
import {MeshComponent} from "../../components/MeshComponent";
import {PlayerBehaviour} from "./PlayerBehaviour";
import {CameraComponent} from "../../components/CameraComponent";
import {CameraMovement} from "./camera/CameraMovement";
import {ChickenBehaviour} from "./ChickenBehaviour";
import {GamePresentation} from "./gameController/GamePresentation";
import {CameraAnimation} from "./camera/CameraAnimation";
import {GameMessages} from "./gameController/GameMessages";
import {Leaderboard} from "./gameController/Leaderboard";
import {EventScores} from "./gameController/EventScores";
import {PlayersController} from "./gameController/PlayersController";

export class CatchTheChickenScene extends Scene {
    constructor() {
        super("catchTheChicken");
    }

    public start(): void {
        super.start();

        this.mainCamera.setTarget(B.Vector3.Zero());
        this.mainCamera.attachControl(this.game.canvas, true);
        this.mainCamera.position.y = 15;
        this.mainCamera.position.z = -30;
        this.mainCamera.speed = 0.3;

        // light
        const light = new B.HemisphericLight("light1", new B.Vector3(0, 1, 0), this.scene);
        light.intensity = 0.7;

        // ground
        const ground: B.GroundMesh = B.MeshBuilder.CreateGround("ground", {width: 6, height: 6}, this.scene);
        ground.position.y = 0;

        // camera
        const mainCameraEntity = new Entity("camera");
        mainCameraEntity.addComponent(new CameraComponent(mainCameraEntity, this, {camera: this.mainCamera}));
        mainCameraEntity.addComponent(new CameraMovement(mainCameraEntity, this));
        this.entityManager.addEntity(mainCameraEntity);

        // start animation
        const cameraEntity = new Entity();
        const camera = new B.FreeCamera("camera", new B.Vector3(5, 2, 10), this.scene);
        camera.rotation.y = -Math.PI / 2;
        cameraEntity.addComponent(new CameraComponent(cameraEntity, this, {camera: camera}));
        cameraEntity.addComponent(new CameraAnimation(cameraEntity, this));
        this.entityManager.addEntity(cameraEntity);

        B.SceneLoader.LoadAssetContainer(
            "https://assets.babylonjs.com/meshes/",
            "HVGirl.glb",
            this.scene,
            (container: B.AssetContainer): void => {
                // players
                for (let i: number = 0; i < this.game.playerData.length; i++) {
                    const entries: B.InstantiatedEntries = container.instantiateModelsToScene((sourceName: string): string => sourceName + i, false, {doNotInstantiate: true});
                    const player: B.AbstractMesh = this.scene.getMeshByName("__root__" + i) as B.AbstractMesh;
                    if (!player) throw new Error("Player mesh not found");

                    player.scaling.scaleInPlace(0.1);
                    player.position.z = i * 2;
                    player.rotate(B.Axis.Y, Math.PI / 2, B.Space.WORLD);
                    const playerEntity = new Entity("player");
                    playerEntity.addComponent(new MeshComponent(playerEntity, this, {mesh: player}));
                    playerEntity.addComponent(new PlayerBehaviour(playerEntity, this, {inputIndex: i, animationGroups: entries.animationGroups}));
                    this.entityManager.addEntity(playerEntity);
                }
            }
        );

        // chicken
        const chicken: B.Mesh = B.MeshBuilder.CreateSphere("chicken", {diameter: 1}, this.scene);
        chicken.position.x = 2;
        chicken.position.y = 0.5;
        const chickenEntity = new Entity("chicken");
        chickenEntity.addComponent(new MeshComponent(chickenEntity, this, {mesh: chicken}));
        chickenEntity.addComponent(new ChickenBehaviour(chickenEntity, this));
        this.entityManager.addEntity(chickenEntity);

        // gameController
        const gameController = new Entity();
        gameController.addComponent(new GamePresentation(gameController, this));
        gameController.addComponent(new GameMessages(gameController, this));
        gameController.addComponent(new Leaderboard(gameController, this));
        gameController.addComponent(new EventScores(gameController, this));
        gameController.addComponent(new PlayersController(gameController, this));
        this.entityManager.addEntity(gameController);
    }
}