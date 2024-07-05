import jwt from "jsonwebtoken";

const token = {
    decode(accessToken) {
        if (!accessToken) {
            throw new Error("No token provided");
        }
        let id;

        jwt.verify(accessToken, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                throw new Error("Unauthorised");
            }

            id = decoded.id;
        });

        return id;
    },
};

export default token;
