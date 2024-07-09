import { expect } from "chai";
import sinon from "sinon";

import MasterController from "../../src/controllers/Master.controller.js";

describe("Master.controller tests", async () => {
    let masterController;
    let masterServices;
    let req;
    let res;

    beforeEach(() => {
        masterServices = {
            signUp: sinon.stub(),
            signIn: sinon.stub(),
            join: sinon.stub(),
            leaveRoom: sinon.stub(),
            createRoom: sinon.stub(),
            getRole: sinon.stub(),
            startGame: sinon.stub(),
            endGame: sinon.stub(),
            normaliseID: sinon.stub(),
            getOwnedRoomByID: sinon.stub(),
            getUserExists: sinon.stub(),
        };
        masterController = new MasterController("", "", masterServices);
        req = {
            headers: {},
            body: {},
            params: {},
        };
        res = {
            json: sinon.stub(),
            status: sinon.stub().returnsThis(),
            sendStatus: sinon.stub(),
        };
    });

    describe("signUp Tests", async () => {
        it("should call the service", async () => {
            // Arrange
            const result = "success";
            masterServices.signUp.resolves(result);

            // Act
            await masterController.signUp(req, res);

            // Assert
            expect(masterServices.signUp.calledOnce).to.be.true;
            expect(res.status.calledWith(201)).to.be.true;
            expect(res.json.calledWith(result)).to.be.true;
        });
        it("should throw an error if the service errors", async () => {
            // Arrange
            const error = new Error("Test error");
            error.status = 400;
            masterServices.signUp.rejects(error);

            // Act
            await masterController.signUp(req, res);

            // Assert
            expect(masterServices.signUp.calledOnce).to.be.true;
            expect(res.status.calledWith(400)).to.be.true;
            expect(
                res.json.calledWith({
                    message: "Test error",
                })
            ).to.be.true;
        });
    });

    describe("signIn Tests", async () => {
        it("should call the service", async () => {
            // Arrange
            const result = "success";
            masterServices.signIn.resolves(result);

            // Act
            await masterController.signIn(req, res);

            // Assert
            expect(masterServices.signIn.calledOnce).to.be.true;
            expect(res.status.calledWith(201)).to.be.true;
            expect(res.json.calledWith(result)).to.be.true;
        });
        it("should throw an error if the service errors", async () => {
            // Arrange
            const error = new Error("Test error");
            error.status = 400;
            masterServices.signIn.rejects(error);

            // Act
            await masterController.signIn(req, res);

            // Assert
            expect(masterServices.signIn.calledOnce).to.be.true;
            expect(res.status.calledWith(400)).to.be.true;
            expect(
                res.json.calledWith({
                    message: "Test error",
                })
            ).to.be.true;
        });
    });

    describe("join Tests", async () => {
        it("should call the service", async () => {
            // Arrange
            req.params.roomcode = "000000";
            const result = "success";
            masterServices.join.resolves(result);

            // Act
            await masterController.join(req, res);

            // Assert
            expect(masterServices.join.calledOnce).to.be.true;
            expect(res.status.calledWith(201)).to.be.true;
            expect(res.json.calledWith(result)).to.be.true;
        });
        it("should throw an error if the service errors", async () => {
            // Arrange
            req.params.roomcode = "000000";
            const error = new Error("Test error");
            error.status = 400;
            masterServices.signIn.rejects(error);

            // Act
            await masterController.signIn(req, res);

            // Assert
            expect(masterServices.signIn.calledOnce).to.be.true;
            expect(res.status.calledWith(400)).to.be.true;
            expect(
                res.json.calledWith({
                    message: "Test error",
                })
            ).to.be.true;
        });
        it("should return 404 if there is no room code", async () => {
            // Arrange
            req.params.roomcode = "";
            const result = "success";
            masterServices.join.resolves(result);

            // Act
            await masterController.join(req, res);

            // Assert
            expect(res.status.calledWith(404)).to.be.true;
            expect(
                res.json.calledWith({
                    message: "Room not found",
                })
            ).to.be.true;
        });
    });

    describe("leaveRoom Tests", async () => {
        it("should call normaliseID", async () => {
            // Arrange
            masterServices.normaliseID.resolves("test ID");
            const result = "success";
            masterServices.leaveRoom.resolves(result);

            // Act
            await masterController.leaveRoom(req, res);

            // Assert
            expect(masterServices.normaliseID.calledOnce).to.be.true;
        });
        it("should call the service", async () => {
            // Arrange
            masterServices.normaliseID.resolves("test ID");
            const result = "success";
            masterServices.leaveRoom.resolves(result);

            // Act
            await masterController.leaveRoom(req, res);

            // Assert
            expect(masterServices.leaveRoom.calledOnce).to.be.true;
            expect(res.sendStatus.calledWith(200)).to.be.true;
        });
        it("should throw an error if the service errors", async () => {
            // Arrange
            masterServices.normaliseID.resolves("test ID");
            const error = new Error("Test error");
            error.status = 400;
            masterServices.leaveRoom.rejects(error);

            // Act
            await masterController.leaveRoom(req, res);

            // Assert
            expect(masterServices.leaveRoom.calledOnce).to.be.true;
            expect(res.status.calledWith(400)).to.be.true;
            expect(
                res.json.calledWith({
                    message: "Test error",
                })
            ).to.be.true;
        });
        it("should return 400 if the normaliseID service returns null", async () => {
            // Arrange
            masterServices.normaliseID.resolves(null);
            const result = "success";
            masterServices.leaveRoom.resolves(result);

            // Act
            await masterController.leaveRoom(req, res);

            // Assert
            expect(res.status.calledWith(400)).to.be.true;
            expect(
                res.json.calledWith({
                    message: "User not found",
                })
            ).to.be.true;
        });
    });

    describe("createRoom Tests", async () => {
        it("should call the service", async () => {
            // Arrange
            const result = "success";
            masterServices.createRoom.resolves(result);

            // Act
            await masterController.createRoom(req, res);

            // Assert
            expect(masterServices.createRoom.calledOnce).to.be.true;
            expect(res.status.calledWith(201)).to.be.true;
        });
        it("should throw an error if the service errors", async () => {
            // Arrange
            const error = new Error("Test error");
            error.status = 400;
            masterServices.createRoom.rejects(error);

            // Act
            await masterController.createRoom(req, res);

            // Assert
            expect(masterServices.createRoom.calledOnce).to.be.true;
            expect(res.status.calledWith(400)).to.be.true;
            expect(
                res.json.calledWith({
                    message: "Test error",
                })
            ).to.be.true;
        });
    });

    describe("getRole Tests", async () => {
        it("should call the service", async () => {
            // Arrange
            req.params.id = "Test ID";
            const result = "success";
            masterServices.getRole.resolves(result);

            // Act
            await masterController.getRole(req, res);

            // Assert
            expect(masterServices.getRole.calledOnce).to.be.true;
            expect(res.status.calledWith(201)).to.be.true;
            expect(res.json.calledWith(result)).to.be.true;
        });
        it("should throw an error if the service errors", async () => {
            // Arrange
            req.params.id = "Test ID";
            const error = new Error("Test error");
            error.status = 400;
            masterServices.getRole.rejects(error);

            // Act
            await masterController.getRole(req, res);

            // Assert
            expect(masterServices.getRole.calledOnce).to.be.true;
            expect(res.status.calledWith(400)).to.be.true;
            expect(
                res.json.calledWith({
                    message: "Test error",
                })
            ).to.be.true;
        });
        it("should return 400 if the id is not included", async () => {
            // Arrange
            const result = "success";
            masterServices.getRole.resolves(result);

            // Act
            await masterController.getRole(req, res);

            // Assert
            expect(res.status.calledWith(400)).to.be.true;
            expect(
                res.json.calledWith({
                    message: "User not found",
                })
            ).to.be.true;
        });
    });

    describe("startGame Tests", async () => {
        it("should call normaliseID", async () => {
            // Arrange
            masterServices.normaliseID.resolves("test ID");
            const result = "success";
            masterServices.startGame.resolves(result);

            // Act
            await masterController.startGame(req, res);

            // Assert
            expect(masterServices.normaliseID.calledOnce).to.be.true;
        });
        it("should call the service", async () => {
            // Arrange
            masterServices.normaliseID.resolves("test ID");
            const result = "success";
            masterServices.startGame.resolves(result);

            // Act
            await masterController.startGame(req, res);

            // Assert
            expect(masterServices.startGame.calledOnce).to.be.true;
            expect(res.status.calledWith(201)).to.be.true;
            expect(res.json.calledWith(result)).to.be.true;
        });
        it("should throw an error if the service errors", async () => {
            // Arrange
            masterServices.normaliseID.resolves("test ID");
            const error = new Error("Test error");
            error.status = 400;
            masterServices.startGame.rejects(error);

            // Act
            await masterController.startGame(req, res);

            // Assert
            expect(masterServices.startGame.calledOnce).to.be.true;
            expect(res.status.calledWith(400)).to.be.true;
            expect(
                res.json.calledWith({
                    message: "Test error",
                })
            ).to.be.true;
        });
        it("should return 400 if the normaliseID service returns null", async () => {
            // Arrange
            masterServices.normaliseID.resolves(null);
            const result = "success";
            masterServices.startGame.resolves(result);

            // Act
            await masterController.startGame(req, res);

            // Assert
            expect(res.status.calledWith(400)).to.be.true;
            expect(
                res.json.calledWith({
                    message: "User not found",
                })
            ).to.be.true;
        });
    });

    describe("endGame Tests", async () => {
        it("should call normaliseID", async () => {
            // Arrange
            masterServices.normaliseID.resolves("test ID");
            const result = "success";
            masterServices.endGame.resolves(result);

            // Act
            await masterController.endGame(req, res);

            // Assert
            expect(masterServices.normaliseID.calledOnce).to.be.true;
        });
        it("should call the service", async () => {
            // Arrange
            masterServices.normaliseID.resolves("test ID");
            const result = "success";
            masterServices.endGame.resolves(result);

            // Act
            await masterController.endGame(req, res);

            // Assert
            expect(masterServices.endGame.calledOnce).to.be.true;
            expect(res.status.calledWith(201)).to.be.true;
            expect(res.json.calledWith(result)).to.be.true;
        });
        it("should throw an error if the service errors", async () => {
            // Arrange
            masterServices.normaliseID.resolves("test ID");
            const error = new Error("Test error");
            error.status = 400;
            masterServices.endGame.rejects(error);

            // Act
            await masterController.endGame(req, res);

            // Assert
            expect(masterServices.endGame.calledOnce).to.be.true;
            expect(res.status.calledWith(400)).to.be.true;
            expect(
                res.json.calledWith({
                    message: "Test error",
                })
            ).to.be.true;
        });
        it("should return 400 if the normaliseID service returns null", async () => {
            // Arrange
            masterServices.normaliseID.resolves(null);
            const result = "success";
            masterServices.endGame.resolves(result);

            // Act
            await masterController.endGame(req, res);

            // Assert
            expect(res.status.calledWith(400)).to.be.true;
            expect(
                res.json.calledWith({
                    message: "User not found",
                })
            ).to.be.true;
        });
    });
    describe("getRoom Tests", async () => {
        it("should call normaliseID", async () => {
            // Arrange
            masterServices.normaliseID.resolves("test ID");
            const result = "success";
            masterServices.getOwnedRoomByID.resolves(result);

            // Act
            await masterController.getRoom(req, res);

            // Assert
            expect(masterServices.normaliseID.calledOnce).to.be.true;
        });
        it("should call the service", async () => {
            // Arrange
            masterServices.normaliseID.resolves("test ID");
            const result = "success";
            masterServices.getOwnedRoomByID.resolves(result);

            // Act
            await masterController.getRoom(req, res);

            // Assert
            expect(masterServices.getOwnedRoomByID.calledOnce).to.be.true;
            expect(res.status.calledWith(201)).to.be.true;
            expect(res.json.calledWith(result)).to.be.true;
        });
        it("should throw an error if the service errors", async () => {
            // Arrange
            masterServices.normaliseID.resolves("test ID");
            const error = new Error("Test error");
            error.status = 400;
            masterServices.getOwnedRoomByID.rejects(error);

            // Act
            await masterController.getRoom(req, res);

            // Assert
            expect(masterServices.getOwnedRoomByID.calledOnce).to.be.true;
            expect(res.status.calledWith(400)).to.be.true;
            expect(
                res.json.calledWith({
                    message: "Test error",
                })
            ).to.be.true;
        });
        it("should return 400 if the normaliseID service returns null", async () => {
            // Arrange
            masterServices.normaliseID.resolves(null);
            const result = "success";
            masterServices.getOwnedRoomByID.resolves(result);

            // Act
            await masterController.getRoom(req, res);

            // Assert
            expect(res.status.calledWith(400)).to.be.true;
            expect(
                res.json.calledWith({
                    message: "User not found",
                })
            ).to.be.true;
        });
    });
    describe("getUserExists Tests", async () => {
        it("should call the service", async () => {
            // Arrange
            req.params.id = "Test ID";
            const result = "success";
            masterServices.getUserExists.resolves(result);

            // Act
            await masterController.getUserExists(req, res);

            // Assert
            expect(masterServices.getUserExists.calledOnce).to.be.true;
            expect(res.status.calledWith(201)).to.be.true;
            expect(res.json.calledWith(result)).to.be.true;
        });
        it("should throw an error if the service errors", async () => {
            // Arrange
            req.params.id = "Test ID";
            const error = new Error("Test error");
            error.status = 400;
            masterServices.getUserExists.rejects(error);

            // Act
            await masterController.getUserExists(req, res);

            // Assert
            expect(masterServices.getUserExists.calledOnce).to.be.true;
            expect(res.status.calledWith(400)).to.be.true;
            expect(
                res.json.calledWith({
                    message: "Test error",
                })
            ).to.be.true;
        });
        it("should return 400 if the id is not included", async () => {
            // Arrange
            const result = "success";
            masterServices.getUserExists.resolves(result);

            // Act
            await masterController.getUserExists(req, res);

            // Assert
            expect(res.status.calledWith(400)).to.be.true;
            expect(
                res.json.calledWith({
                    message: "User not found",
                })
            ).to.be.true;
        });
    });
});
