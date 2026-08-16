import User from "../models/user.model.js";

const createUser = async ({ firstName, lastName, email, password }) => {
    try {
        if (!firstName || !email || !password) {
            throw new Error("All fields are required");
        }
        const user = await User.create({
            fullName: {
                firstName,
                lastName
            },
            email,
            password
        });
        return user;
    } catch (error) {
        throw error;
    }
};

export { createUser };