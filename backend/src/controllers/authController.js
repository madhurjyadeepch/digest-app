const { auth, db } = require('../config/firebase');
const axios = require('axios');

const signup = async (req, res) => {
    try {
        const { email, password, name } = req.body;

        const userRecord = await auth.createUser({
            email,
            password,
            displayName: name
        });

        await db.collection('users').doc(userRecord.uid).set({
            email: userRecord.email,
            fullName: fullName,
            preference: [],
            createdAt: new Date()
        });

        res.status(201).json({
            message: "User created successfully",
            uid: userRecord.uid
        });
    } catch(error) {
        res.status(500).json({ error: error.message });
    }
};

