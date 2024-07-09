import { expect } from "chai";
import sinon from "sinon";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";

import MasterService from "../../src/services/Master.service.js";
import token from "../../src/services/decodeToken.service.js";

process.env.JWT_SECRET = "test";
const USERS_SERVER_URL = "users";
const ROOMS_SERVER_URL = "rooms";

describe("Master.service tests", async () => {
    let masterService;
    let mock;
    let caughtError;
    let decodeTokenStub;

    beforeEach(() => {
        masterService = new MasterService(USERS_SERVER_URL, ROOMS_SERVER_URL);
        mock = new MockAdapter(axios);
        decodeTokenStub = sinon.stub(token, "decode");
    });

    afterEach(() => {
        mock.restore();
        sinon.restore();
        caughtError = null;
    });

    describe("signUp Tests", async () => {
        it("should call the user server with the correct URL and user details", async () => {
            // Arrange
            const userDetails = "test";
            const response = { success: true };
            mock.onPost().reply(200, response);

            // Act
            const result = await masterService.signUp(userDetails);

            // Assert
            expect(result).to.deep.equal(response);
        });
        it("should return an error if the request errors", async () => {
            // Arrange
            const userDetails = "test";
            mock.onPost().reply(500, { message: "Test Error" });

            // Act
            try {
                await masterService.signUp(userDetails);
            } catch (e) {
                caughtError = e;
            }

            // Assert
            expect(caughtError).to.be.an("object");
            expect(caughtError).to.have.property("status", 500);
            expect(caughtError).to.have.property("message", "Test Error");
        });
    });

    describe("signIn Tests", async () => {
        it("should call the user server with the correct URL and user details", async () => {
            // Arrange
            const userDetails = "test";
            const response = { success: true };
            mock.onPost().reply(200, response);

            // Act
            const result = await masterService.signIn(userDetails);

            // Assert
            expect(result).to.deep.equal(response);
        });
        it("should return an error if the request errors", async () => {
            // Arrange
            const userDetails = "test";
            mock.onPost().reply(500, { message: "Test Error" });

            // Act
            try {
                await masterService.signIn(userDetails);
            } catch (e) {
                caughtError = e;
            }

            // Assert
            expect(caughtError).to.be.an("object");
            expect(caughtError).to.have.property("status", 500);
            expect(caughtError).to.have.property("message", "Test Error");
        });
    });

    describe("join Tests", async () => {
        it("should call the room server to join room if signed in", async () => {
            // Arrange
            const headers = { accesstoken: "testToken" };
            const body = {};
            const roomCode = "testRoomcode";

            const decodedId = "testID";
            decodeTokenStub.returns(decodedId);

            const user = { _id: "testID", username: "test username" };
            mock.onGet(`${USERS_SERVER_URL}/getuser/${decodedId}`).reply(
                200,
                user
            );

            mock.onPost(`${ROOMS_SERVER_URL}/${roomCode}/join`).reply(
                200,
                "success"
            );

            // Act
            const response = await masterService.join(headers, body, roomCode);

            // Assert
            expect(response.message).to.deep.equal("success");
        });
        it("should throw an error if the room server join room request errors", async () => {
            // Arrange
            const headers = { accesstoken: "testToken" };
            const body = {};
            const roomCode = "testRoomcode";

            const decodedId = "testID";
            decodeTokenStub.returns(decodedId);

            const signedInUser = { _id: "testID", username: "test username" };
            mock.onGet(`${USERS_SERVER_URL}/getuser/${decodedId}`).reply(
                200,
                signedInUser
            );

            mock.onPost(`${ROOMS_SERVER_URL}/${roomCode}/join`).reply(500, {
                message: "Test Error",
            });

            // Act
            try {
                await masterService.join(headers, body, roomCode);
            } catch (e) {
                caughtError = e;
            }

            // Assert
            expect(caughtError).to.be.an("object");
            expect(caughtError).to.have.property("status", 500);
            expect(caughtError).to.have.property("message", "Test Error");
        });
        it("should call the room server to join room after creating account if not signed in", async () => {
            // Arrange
            const headers = {};
            const body = { username: "testUsername" };
            const roomCode = "testRoomcode";

            const tempUser = { id: "testID", username: "test username" };
            mock.onPost(`${USERS_SERVER_URL}/createtemp`).reply(200, tempUser);

            mock.onPost(`${ROOMS_SERVER_URL}/${roomCode}/join`).reply(
                200,
                "success"
            );

            // Act
            const response = await masterService.join(headers, body, roomCode);

            // Assert
            expect(response.message).to.deep.equal("success");
        });
        it("should throw an error if the user server create account request errors", async () => {
            // Arrange
            const headers = {};
            const body = { username: "testUsername" };
            const roomCode = "testRoomcode";

            mock.onPost(`${USERS_SERVER_URL}/createtemp`).reply(500, {
                message: "Test Error",
            });

            mock.onPost(`${ROOMS_SERVER_URL}/${roomCode}/join`).reply(
                200,
                "success"
            );

            // Act
            try {
                await masterService.join(headers, body, roomCode);
            } catch (e) {
                caughtError = e;
            }

            // Assert
            expect(caughtError).to.be.an("object");
            expect(caughtError).to.have.property("status", 500);
            expect(caughtError).to.have.property("message", "Test Error");
        });
        it("should throw an error if the join room after creating account request errors", async () => {
            // Arrange
            const headers = {};
            const body = { username: "testUsername" };
            const roomCode = "testRoomcode";

            const tempUser = { id: "testID", username: "test username" };
            mock.onPost(`${USERS_SERVER_URL}/createtemp`).reply(200, tempUser);

            mock.onPost(`${ROOMS_SERVER_URL}/${roomCode}/join`).reply(500, {
                message: "Test Error",
            });
            mock.onDelete(
                `${USERS_SERVER_URL}/deletetemp/${tempUser.id}`
            ).reply(200, {
                message: "Deleted",
            });

            // Act
            try {
                await masterService.join(headers, body, roomCode);
            } catch (e) {
                caughtError = e;
            }

            // Assert
            expect(caughtError).to.be.an("object");
            expect(caughtError).to.have.property("status", 500);
            expect(caughtError).to.have.property("message", "Test Error");
        });
        it("should delete account if temp and the join room request errors", async () => {
            // Arrange
            const headers = {};
            const body = { username: "testUsername" };
            const roomCode = "testRoomcode";

            const tempUser = { id: "testID", username: "test username" };
            mock.onPost(`${USERS_SERVER_URL}/createtemp`).reply(200, tempUser);

            mock.onPost(`${ROOMS_SERVER_URL}/${roomCode}/join`).reply(500, {
                message: "Test Error",
            });
            mock.onDelete(
                `${USERS_SERVER_URL}/deletetemp/${tempUser.id}`
            ).reply(200, {
                message: "Deleted",
            });

            // Act
            try {
                await masterService.join(headers, body, roomCode);
            } catch (e) {
                caughtError = e;
            }

            // Assert
            expect(mock.history.delete.length).to.be.greaterThan(0);
        });
    });

    describe("leaveRoom Tests", async () => {
        it("should delete room if owned without error", async () => {
            // Arrange
            const id = "testID";
            const roomCode = "testRoomcode";
            const ownedRoom = { room_code: roomCode, players: [] };
            mock.onGet(`${ROOMS_SERVER_URL}/${id}/getownedroom`).reply(
                200,
                ownedRoom
            );

            mock.onDelete(`${ROOMS_SERVER_URL}/${roomCode}/delete`).reply(
                200,
                "success"
            );

            // Act
            try {
                await masterService.leaveRoom(id);
            } catch (e) {
                caughtError = e;
            }

            // Assert
            expect(caughtError).to.be.null;
            expect(mock.history.delete.length).to.equal(1);
        });
        it("should throw an error if the delete room request errors if owned", async () => {
            // Arrange
            const id = "testID";
            const roomCode = "testRoomcode";
            const ownedRoom = { room_code: roomCode, players: [] };
            mock.onGet(`${ROOMS_SERVER_URL}/${id}/getownedroom`).reply(
                200,
                ownedRoom
            );

            mock.onDelete(`${ROOMS_SERVER_URL}/${roomCode}/delete`).reply(
                500,
                "Test Error"
            );

            // Act
            try {
                await masterService.leaveRoom(id);
            } catch (e) {
                caughtError = e;
            }

            // Assert
            expect(caughtError).to.be.an("object");
            expect(caughtError).to.have.property("status", 500);
            expect(caughtError).to.have.property(
                "message",
                "An error occurred"
            );
        });
        it("should call the user server to delete all temp users if room is deleted", async () => {
            // Arrange
            const id = "testID";

            const tempID = "testTempID";
            const roomCode = "testRoomcode";
            const ownedRoom = {
                room_code: roomCode,
                players: [{ user_id: tempID }],
            };
            mock.onGet(`${ROOMS_SERVER_URL}/${id}/getownedroom`).reply(
                200,
                ownedRoom
            );

            mock.onDelete(`${ROOMS_SERVER_URL}/${roomCode}/delete`).reply(
                200,
                "success"
            );

            const tempUser = { id: tempID, logged_in: false };
            mock.onGet(`${USERS_SERVER_URL}/getuser/${tempID}`).reply(
                200,
                tempUser
            );

            mock.onDelete(`${USERS_SERVER_URL}/deletetemp/${tempID}`).reply(
                200,
                "success"
            );
            // Act
            try {
                await masterService.leaveRoom(id);
            } catch (e) {
                caughtError = e;
            }

            // Assert
            expect(caughtError).to.be.null;
            expect(mock.history.delete.length).to.equal(2);
        });
        it("should throw an error if the delete temp user request errors", async () => {
            // Arrange
            const id = "testID";

            const tempID = "testTempID";
            const roomCode = "testRoomcode";
            const ownedRoom = {
                room_code: roomCode,
                players: [{ user_id: tempID }],
            };
            mock.onGet(`${ROOMS_SERVER_URL}/${id}/getownedroom`).reply(
                200,
                ownedRoom
            );

            mock.onDelete(`${ROOMS_SERVER_URL}/${roomCode}/delete`).reply(
                200,
                "success"
            );

            const tempUser = { id: tempID, logged_in: false };
            mock.onGet(`${USERS_SERVER_URL}/getuser/${tempID}`).reply(
                200,
                tempUser
            );

            mock.onDelete(`${USERS_SERVER_URL}/deletetemp/${tempID}`).reply(
                500,
                "Test Error"
            );
            // Act
            try {
                await masterService.leaveRoom(id);
            } catch (e) {
                caughtError = e;
            }

            // Assert
            expect(caughtError).to.be.an("object");
            expect(caughtError).to.have.property("status", 500);
            expect(caughtError).to.have.property(
                "message",
                "An error occurred"
            );
        });
        it("should call the room server to leave room if not owned", async () => {
            // Arrange
            const id = "testID";
            mock.onGet(`${ROOMS_SERVER_URL}/${id}/getownedroom`).reply(404, {
                message: "Room not found",
            });

            mock.onPost(`${ROOMS_SERVER_URL}/leave`).reply(200, "success");

            const user = { loggedIn: true };
            mock.onGet(`${USERS_SERVER_URL}/getuser/${id}`).reply(200, user);

            // Act
            try {
                await masterService.leaveRoom(id);
            } catch (e) {
                caughtError = e;
            }

            // Assert
            expect(caughtError).to.be.null;
            expect(mock.history.post.length).to.equal(1);
        });
        it("should throw an error if the leave room request errors", async () => {
            // Arrange
            const id = "testID";
            mock.onGet(`${ROOMS_SERVER_URL}/${id}/getownedroom`).reply(404, {
                message: "Room not found",
            });

            mock.onPost(`${ROOMS_SERVER_URL}/leave`).reply(500, "Test Error");

            const user = { loggedIn: true };
            mock.onGet(`${USERS_SERVER_URL}/getuser/${id}`).reply(200, user);

            // Act
            try {
                await masterService.leaveRoom(id);
            } catch (e) {
                caughtError = e;
            }

            // Assert
            expect(caughtError).to.be.an("object");
            expect(caughtError).to.have.property("status", 500);
            expect(caughtError).to.have.property(
                "message",
                "An error occurred"
            );
        });
        it("should call the user server to delete the user account if room is left", async () => {
            // Arrange
            const id = "testID";
            mock.onGet(`${ROOMS_SERVER_URL}/${id}/getownedroom`).reply(404, {
                message: "Room not found",
            });

            mock.onPost(`${ROOMS_SERVER_URL}/leave`).reply(200, "success");

            const user = { loggedIn: false };
            mock.onGet(`${USERS_SERVER_URL}/getuser/${id}`).reply(200, user);

            mock.onDelete(`${USERS_SERVER_URL}/deletetemp/${id}`).reply(
                200,
                "success"
            );

            // Act
            try {
                await masterService.leaveRoom(id);
            } catch (e) {
                caughtError = e;
            }

            // Assert
            expect(caughtError).to.be.null;
            expect(mock.history.delete.length).to.equal(1);
        });
    });

    describe("createRoom Tests", async () => {
        it("should call the room server with the correct URL and details", async () => {
            // Arrange
            const accessToken = "testToken";
            const id = "testID";
            const user = { _id: "testID", username: "test username" };
            mock.onGet(`${USERS_SERVER_URL}/getuser/${id}`).reply(200, user);

            const decodedId = "testID";
            decodeTokenStub.returns(decodedId);

            const response = { success: true };
            mock.onPut().reply(200, response);

            // Act
            const result = await masterService.createRoom(accessToken);

            // Assert
            expect(result).to.deep.equal(response);
        });
        it("should return an error if the request errors", async () => {
            // Arrange
            const accessToken = "testToken";
            const id = "testID";
            const user = { _id: "testID", username: "test username" };
            mock.onGet(`${USERS_SERVER_URL}/getuser/${id}`).reply(200, user);

            const decodedId = "testID";
            decodeTokenStub.returns(decodedId);

            mock.onPut().reply(500, { message: "Test Error" });

            // Act
            try {
                await masterService.createRoom(accessToken);
            } catch (e) {
                caughtError = e;
            }

            // Assert
            expect(caughtError).to.be.an("object");
            expect(caughtError).to.have.property("status", 500);
            expect(caughtError).to.have.property("message", "Test Error");
        });
        it("should not create a room if unauthorised", async () => {
            // Arrange
            const accessToken = "testToken";
            const id = "testID";
            const user = { _id: "testID", username: "test username" };
            mock.onGet(`${USERS_SERVER_URL}/getuser/${id}`).reply(200, user);

            const error = new Error("Test Error");
            decodeTokenStub.throws(error);

            const response = { success: true };
            mock.onPut().reply(200, response);

            // Act
            try {
                await masterService.createRoom(accessToken);
            } catch (e) {
                caughtError = e;
            }

            // Assert
            expect(caughtError).to.be.an("object");
            expect(caughtError).to.have.property("status", 500);
            expect(caughtError).to.have.property("message", "Test Error");
        });
    });

    describe("getRole Tests", async () => {
        it("should call the users server", async () => {
            // Arrange
            const id = "testID";
            const user = { _id: "testID", username: "test username" };
            mock.onGet(`${USERS_SERVER_URL}/getuser/${id}`).reply(200, user);

            const role = "Test Role";
            mock.onGet(`${ROOMS_SERVER_URL}/${id}/getrole`).reply(200, role);

            const expectedResponse = { role: role, username: user.username };

            // Act
            const result = await masterService.getRole(id);

            // Assert
            expect(result).to.deep.equal(expectedResponse);
        });
        it("should throw an error if the request errors", async () => {
            // Arrange
            const id = "testID";
            const user = { _id: "testID", username: "test username" };
            mock.onGet(`${USERS_SERVER_URL}/getuser/${id}`).reply(200, user);

            const role = "Test Role";
            mock.onGet(`${ROOMS_SERVER_URL}/${id}/getrole`).reply(500, {
                message: "Test Error",
            });

            // Act
            try {
                await masterService.getRole(id);
            } catch (e) {
                caughtError = e;
            }

            // Assert
            expect(caughtError).to.be.an("object");
            expect(caughtError).to.have.property("status", 500);
            expect(caughtError).to.have.property("message", "Test Error");
        });
    });

    describe("startGame Tests", async () => {
        it("should call the room server", async () => {
            // Arrange
            const id = "testID";
            const settings = {};
            mock.onPost(`${ROOMS_SERVER_URL}/startgame`).reply(200, "success");

            const expectedResponse = "success";

            // Act
            const result = await masterService.startGame(id, settings);

            // Assert
            expect(result).to.deep.equal(expectedResponse);
        });
        it("should throw an error if the request errors", async () => {
            // Arrange
            const id = "testID";
            const settings = {};
            mock.onPost(`${ROOMS_SERVER_URL}/startgame`).reply(500, {
                message: "Test Error",
            });

            // Act
            try {
                await masterService.startGame(id, settings);
            } catch (e) {
                caughtError = e;
            }

            // Assert
            expect(caughtError).to.be.an("object");
            expect(caughtError).to.have.property("status", 500);
            expect(caughtError).to.have.property("message", "Test Error");
        });
    });

    describe("endGame Tests", async () => {
        it("should call the room server", async () => {
            // Arrange
            const id = "testID";
            mock.onPost(`${ROOMS_SERVER_URL}/endgame`).reply(200, "success");

            const expectedResponse = "success";

            // Act
            const result = await masterService.endGame(id);

            // Assert
            expect(result).to.deep.equal(expectedResponse);
        });
        it("should throw an error if the request errors", async () => {
            // Arrange
            const id = "testID";
            mock.onPost(`${ROOMS_SERVER_URL}/endgame`).reply(500, {
                message: "Test Error",
            });

            // Act
            try {
                await masterService.endGame(id);
            } catch (e) {
                caughtError = e;
            }

            // Assert
            expect(caughtError).to.be.an("object");
            expect(caughtError).to.have.property("status", 500);
            expect(caughtError).to.have.property("message", "Test Error");
        });
    });

    describe("normaliseID Tests", async () => {
        it("should pass an id through from the body if present", async () => {
            // Arrange
            const body = { _id: "testID" };
            const headers = {};

            // Act
            const result = await masterService.normaliseID(body, headers);

            // Assert
            expect(result).to.equal(body._id);
        });
        it("should pass an id through from the header if present", async () => {
            // Arrange
            const body = {};
            const headers = { accesstoken: "testToken" };

            const decodedId = "testID";
            decodeTokenStub.returns(decodedId);

            const user = { _id: "testID" };
            mock.onGet(`${USERS_SERVER_URL}/getuser/${decodedId}`).reply(
                200,
                user
            );

            // Act
            const result = await masterService.normaliseID(body, headers);

            // Assert
            expect(result).to.equal(user._id);
        });
        it("should throw an error if no id is present", async () => {
            // Arrange
            const body = {};
            const headers = {};
            const testError = new Error("No ID present");

            // Act
            try {
                await masterService.normaliseID(body, headers);
            } catch (e) {
                caughtError = e;
            }

            // Assert
            expect(caughtError).to.deep.equal(testError);
        });
    });

    describe("getUserExists Tests", async () => {
        it("should return true if user service returns a user", async () => {
            // Arrange
            const testID = "testID";

            const user = {};
            mock.onGet(`${USERS_SERVER_URL}/getuser/${testID}`).reply(
                200,
                user
            );

            // Act
            const response = await masterService.getUserExists(testID);

            // Assess
            expect(response).to.be.true;
        });

        it("should return false if user service does not return a user", async () => {
            // Arrange
            const testID = "testID";

            const user = {};
            mock.onGet(`${USERS_SERVER_URL}/getuser/${testID}`).reply(
                404,
                null
            );

            // Act
            const response = await masterService.getUserExists(testID);

            // Assess
            expect(response).to.be.false;
        });
    });
});
