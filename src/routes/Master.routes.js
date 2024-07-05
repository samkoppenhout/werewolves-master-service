import { Router } from "express";
import { body, header } from "express-validator";
import MasterController from "../controllers/Master.controller.js";

export default class MasterRoutes {
    #controller;
    #router;
    #routeStartPoint;

    constructor(
        USERS_SERVER_URL,
        ROOMS_SERVER_URL,
        controller = new MasterController(USERS_SERVER_URL, ROOMS_SERVER_URL),
        routeStartPoint = "/"
    ) {
        this.#controller = controller;
        this.#routeStartPoint = routeStartPoint;
        this.#router = Router();
        this.#initialiseRoutes();
    }

    #initialiseRoutes = () => {
        this.#router.post(
            `/signup`,
            [
                body("username")
                    .exists()
                    .withMessage("Username is required.")
                    .trim()
                    .escape(),
                body("password")
                    .exists()
                    .withMessage("Password is required.")
                    .trim()
                    .escape(),
            ],
            this.#controller.signUp
        );
        this.#router.post(
            `/signin`,
            [
                body(`username`)
                    .exists()
                    .withMessage("Username is required.")
                    .escape(),
                body(`password`)
                    .exists()
                    .withMessage("Password is required.")
                    .escape(),
            ],
            this.#controller.signIn
        );
        this.#router.post(`/join/:roomcode`, this.#controller.join);
        this.#router.post(`/leave`, this.#controller.leaveRoom);
        this.#router.get(`/getrole/:id`, this.#controller.getRole);
        this.#router.post(
            `/createroom`,
            [
                header("accesstoken")
                    .exists()
                    .withMessage("Token required.")
                    .escape(),
            ],
            this.#controller.createRoom
        );
        this.#router.post(
            `/startgame`,
            [
                header("accesstoken")
                    .exists()
                    .withMessage("Token required.")
                    .escape(),
                body("settings")
                    .exists()
                    .withMessage("Settings object is required."),
            ],
            this.#controller.startGame
        );
        this.#router.post(
            `/endgame`,
            [
                header("accesstoken")
                    .exists()
                    .withMessage("Token required.")
                    .escape(),
            ],
            this.#controller.endGame
        );
        this.#router.get(
            `/room`,
            [
                header("accesstoken")
                    .exists()
                    .withMessage("Token required.")
                    .escape(),
            ],
            this.#controller.getRoom
        );
        this.#router.get(`/user/:id`, [], this.#controller.getUserExists);
    };

    getRouter = () => {
        return this.#router;
    };

    getRouteStartPoint = () => {
        return this.#routeStartPoint;
    };
}
