import MasterService from "../services/Master.service.js";

export default class MasterController {
    #service;

    constructor(
        USERS_SERVER_URL,
        ROOMS_SERVER_URL,
        service = new MasterService(USERS_SERVER_URL, ROOMS_SERVER_URL)
    ) {
        this.#service = service;
    }

    signUp = async (req, res) => {
        try {
            const data = await this.#service.signUp(req.body);
            return res.status(201).json(data);
        } catch (error) {
            return res.status(error.status || 500).json({
                message: error.message || "An error occurred",
            });
        }
    };

    signIn = async (req, res) => {
        try {
            const data = await this.#service.signIn(req.body);
            return res.status(201).json(data);
        } catch (error) {
            return res.status(error.status || 500).json({
                message: error.message || "An error occurred",
            });
        }
    };

    join = async (req, res) => {
        try {
            const roomCode = req.params.roomcode;
            if (!roomCode) {
                return res.status(404).json({ message: "Room not found" });
            }

            const data = await this.#service.join(
                req.headers,
                req.body,
                roomCode
            );

            return res.status(201).json(data);
        } catch (error) {
            return res.status(error.status || 500).json({
                message: error.message || "An error occurred",
            });
        }
    };

    leaveRoom = async (req, res) => {
        try {
            const id = await this.#service.normaliseID(req.body, req.headers);

            if (!id) {
                return res.status(400).json({ message: "User not found" });
            }

            await this.#service.leaveRoom(id);

            return res.sendStatus(200);
        } catch (error) {
            return res.status(error.status || 500).json({
                message: error.message || "An error occurred",
            });
        }
    };

    createRoom = async (req, res) => {
        try {
            const data = await this.#service.createRoom(
                req.headers.accesstoken
            );
            return res.status(201).json(data);
        } catch (error) {
            return res.status(error.status || 500).json({
                message: error.message || "An error occurred",
            });
        }
    };

    getRole = async (req, res) => {
        try {
            const id = req.params.id;

            if (!id) {
                return res.status(400).json({ message: "User not found" });
            }

            const data = await this.#service.getRole(id);

            return res.status(201).json(data);
        } catch (error) {
            return res.status(error.status || 500).json({
                message: error.message || "An error occurred",
            });
        }
    };

    startGame = async (req, res) => {
        try {
            const id = await this.#service.normaliseID(req.body, req.headers);

            if (!id) {
                return res.status(400).json({ message: "User not found" });
            }

            const data = await this.#service.startGame(id, req.body.settings);
            return res.status(201).json(data);
        } catch (error) {
            return res.status(error.status || 500).json({
                message: error.message || "An error occurred",
            });
        }
    };

    endGame = async (req, res) => {
        try {
            const id = await this.#service.normaliseID(req.body, req.headers);

            if (!id) {
                return res.status(400).json({ message: "User not found" });
            }

            const data = await this.#service.endGame(id);
            return res.status(201).json(data);
        } catch (error) {
            return res.status(error.status || 500).json({
                message: error.message || "An error occurred",
            });
        }
    };

    getRoom = async (req, res) => {
        try {
            const id = await this.#service.normaliseID(req.body, req.headers);

            if (!id) {
                return res.status(400).json({ message: "User not found" });
            }

            const data = await this.#service.getOwnedRoomByID(id);
            return res.status(201).json(data);
        } catch (error) {
            return res.status(error.status || 500).json({
                message: error.message || "An error occurred",
            });
        }
    };

    getUserExists = async (req, res) => {
        try {
            const id = req.params.id;

            if (!id) {
                return res.status(400).json({ message: "User not found" });
            }

            const data = await this.#service.getUserExists(id);
            return res.status(201).json(data);
        } catch (error) {
            return res.status(error.status || 500).json({
                message: error.message || "An error occurred",
            });
        }
    };
}
