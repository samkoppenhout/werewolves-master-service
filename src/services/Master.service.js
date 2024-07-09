import axios from "axios";
import token from "./decodeToken.service.js";

export default class MasterService {
    #roomsServerURL;
    #userServerURL;

    constructor(USERS_SERVER_URL, ROOMS_SERVER_URL) {
        this.#roomsServerURL = ROOMS_SERVER_URL;
        this.#userServerURL = USERS_SERVER_URL;
    }

    #passErrorThrough = (error) => {
        if (error.response) {
            if (error.response.status === 404 && !error.response.data.message) {
                console.log(
                    `404 Error: Could not make '${error.config.method}' request to '${error.config.url}'`
                );
            }
            const status = error.response.status;
            const message = error.response.data.message || "An error occurred";
            throw { status, message };
        } else {
            throw {
                status: 500,
                message: "Internal Server Error",
            };
        }
    };

    signUp = async (userDetails) => {
        try {
            const response = await axios.post(
                `${this.#userServerURL}/signup`,
                userDetails
            );
            return response.data;
        } catch (error) {
            this.#passErrorThrough(error);
        }
    };

    signIn = async (userDetails) => {
        try {
            const response = await axios.post(
                `${this.#userServerURL}/signin`,
                userDetails
            );
            return response.data;
        } catch (error) {
            this.#passErrorThrough(error);
        }
    };

    join = async (headers, body, roomCode) => {
        let response;
        if (headers.accesstoken) {
            response = await this.#joinSignedIn(headers.accesstoken, roomCode);
        } else if (body.username) {
            response = await this.#joinTemp(body.username, roomCode);
        }
        if (!response) {
            throw new Error(
                "Request does not contain the necessary information"
            );
        }
        return {
            message: response.message,
            details: response.userDetails,
        };
    };

    leaveRoom = async (id) => {
        try {
            const ownedRoom = await this.getOwnedRoomByID(id);
            if (ownedRoom.room_code) {
                try {
                    await this.#deleteRoom(ownedRoom.room_code);
                    await this.#deleteTempUsersFromRoom(ownedRoom);
                } catch (error) {
                    throw error;
                }
            } else {
                await this.#leaveRoomNotOwned(id);
            }
        } catch (error) {
            throw error;
        }
    };

    createRoom = async (accessToken) => {
        return await this.#createRoomCall(
            await this.#signedInGetDetails(accessToken)
        );
    };

    getRole = async (id) => {
        const user = await this.#getUserByID(id);
        return {
            role: await this.#getRoleCall(id),
            username: user.username,
        };
    };

    startGame = async (id, settings) => {
        try {
            const response = await axios.post(
                `${this.#roomsServerURL}/startgame`,
                {
                    _id: id,
                    settings: settings,
                }
            );
            return response.data;
        } catch (error) {
            this.#passErrorThrough(error);
        }
    };

    endGame = async (id) => {
        try {
            const response = await axios.post(
                `${this.#roomsServerURL}/endgame`,
                {
                    _id: id,
                }
            );
            return response.data;
        } catch (error) {
            this.#passErrorThrough(error);
        }
    };

    getUserExists = async (id) => {
        try {
            return (await this.#getUserByID(id)) ? true : false;
        } catch {
            return false;
        }
    };

    getOwnedRoomByID = async (id) => {
        try {
            const response = await axios.get(
                `${this.#roomsServerURL}/${id}/getownedroom`
            );
            return response.data;
        } catch (error) {
            if (error.response.status === 404) {
                return error.response.data;
            } else {
                this.#passErrorThrough(error);
            }
        }
    };

    normaliseID = async (body, headers) => {
        let id = body._id;
        if (!id && headers.accesstoken) {
            id = (await this.#signedInGetDetails(headers.accesstoken))._id;
        }
        if (!id) {
            throw new Error("No ID present");
        }
        return id;
    };

    #createRoomCall = async (user) => {
        try {
            const response = await axios.put(
                `${this.#roomsServerURL}/create`,
                user
            );
            return response.data;
        } catch (error) {
            this.#passErrorThrough(error);
        }
    };

    #signedInGetDetails = async (accessToken) => {
        try {
            const id = token.decode(accessToken);
            console.log(id);
            const user = await this.#getUserByID(id);
            return { _id: id, username: user.username };
        } catch (e) {
            throw { status: 500, message: e.message };
        }
    };

    #getUserByID = async (id) => {
        try {
            const response = await axios.get(
                `${this.#userServerURL}/getuser/${id}`
            );
            return response.data;
        } catch (error) {
            this.#passErrorThrough(error);
        }
    };

    #tempAccountJoin = async (username) => {
        const user = await this.#createTempAccount(username);
        return { _id: user.id, username: user.username };
    };

    #createTempAccount = async (username) => {
        try {
            const response = await axios.post(
                `${this.#userServerURL}/createtemp`,
                { username: username }
            );
            return response.data;
        } catch (error) {
            this.#passErrorThrough(error);
        }
    };

    #joinRoom = async (userDetails, roomCode) => {
        try {
            const response = await axios.post(
                `${this.#roomsServerURL}/${roomCode}/join`,
                {
                    _id: userDetails._id,
                    username: userDetails.username,
                },
                { new: true }
            );
            return response.data;
        } catch (error) {
            this.#passErrorThrough(error);
        }
    };

    #deleteRoom = async (roomCode) => {
        try {
            const response = await axios.delete(
                `${this.#roomsServerURL}/${roomCode}/delete`
            );
            return response.data;
        } catch (error) {
            this.#passErrorThrough(error);
        }
    };

    #leaveRoomByID = async (id) => {
        try {
            const response = await axios.post(
                `${this.#roomsServerURL}/leave`,
                { _id: id },
                { new: true }
            );
            return response.data;
        } catch (error) {
            this.#passErrorThrough(error);
        }
    };

    #findUserByID = async (id) => {
        try {
            const response = await axios.get(
                `${this.#userServerURL}/getuser/${id}`
            );
            return response.data;
        } catch (error) {
            this.#passErrorThrough(error);
        }
    };

    #deleteTemp = async (id) => {
        try {
            const response = await axios.delete(
                `${this.#userServerURL}/deletetemp/${id}`
            );
            return response.data;
        } catch (error) {
            this.#passErrorThrough(error);
        }
    };

    #getRoleCall = async (id) => {
        try {
            const response = await axios.get(
                `${this.#roomsServerURL}/${id}/getrole`
            );
            return response.data;
        } catch (error) {
            this.#passErrorThrough(error);
        }
    };

    #deleteTempUsersFromRoom = async (room) => {
        const tempUsers = await this.#getOnlyTempUsers(room);
        for (const user of tempUsers) {
            await this.#deleteTemp(user.id);
        }
    };

    #getOnlyTempUsers = async (room) => {
        const users = await Promise.all(
            room.players.map((player) => this.#findUserByID(player.user_id))
        );
        const tempUsers = users.filter((user) => !user.logged_in);
        return tempUsers;
    };

    #leaveRoomNotOwned = async (id) => {
        try {
            await this.#leaveRoomByID(id);
        } catch (error) {
            throw error;
        }
        await this.#deleteUserIfTemp(id);
    };

    #deleteUserIfTemp = async (id) => {
        const user = await this.#getUserByID(id);
        if (!user.loggedIn) {
            try {
                await this.#deleteTemp(id);
            } catch (error) {
                throw error;
            }
        }
    };

    #joinSignedIn = async (accessToken, roomCode) => {
        const userDetails = await this.#signedInGetDetails(accessToken);
        const message = await this.#joinRoom(userDetails, roomCode);
        return {
            userDetails: userDetails,
            message: message,
        };
    };

    #joinTemp = async (username, roomCode) => {
        const userDetails = await this.#tempAccountJoin(username);
        let message;
        try {
            message = await this.#joinRoom(userDetails, roomCode);
        } catch (e) {
            if (userDetails) {
                await this.#deleteTemp(userDetails._id);
            }
            throw e;
        }
        return {
            message: message,
            userDetails: userDetails,
        };
    };
}
