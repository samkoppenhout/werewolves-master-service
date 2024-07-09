import { expect } from "chai";
import sinon from "sinon";
import jwt from "jsonwebtoken";

import token from "../../src/services/decodeToken.service.js";

describe("decodeToken.service tests", () => {
    describe("decode Tests", () => {
        let verifyStub;
        let caughtError;

        beforeEach(() => {
            verifyStub = sinon.stub(jwt, "verify");
        });

        afterEach(() => {
            sinon.restore();
            caughtError = undefined;
        });

        it("should throw an error if no token is provided", () => {
            // Arrange
            const testError = new Error("No token provided");

            // Act
            try {
                const response = token.decode();
            } catch (e) {
                caughtError = e;
            }

            // Assert
            expect(caughtError).to.deep.equal(testError);
        });

        it("should throw an error if the token is invalid", () => {
            // Arrange
            const testError = new Error("Unauthorised");

            verifyStub.callsFake((accessToken, secret_key, callback) => {
                callback(new Error("Invalid token"), null);
            });

            // Act
            try {
                const response = token.decode("invalidToken");
            } catch (e) {
                caughtError = e;
            }

            // Assert
            expect(caughtError).to.deep.equal(testError);
        });

        it("should return the decoded id if the token is valid", () => {
            // Arrange
            const decoded = { id: "testID" };
            verifyStub.callsFake((accessToken, secret_key, callback) => {
                callback(null, decoded);
            });

            // Act
            const id = token.decode("validToken");

            // Assert
            expect(id).to.equal(decoded.id);
        });
    });
});
