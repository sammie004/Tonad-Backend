// in-app dependencies
const connection = require("../Config/db-config")
const generatePublicId = require("../generate-public-id")

// function to fetch random questions from the database

// create subject
const createSubject = (req, res) => {

    const { name, description } = req.body;

    const public_id = ulid();

    const query = `
        INSERT INTO subjects (public_id, name, description)
        VALUES (?, ?, ?)
    `;

    connection.query(query, [public_id, name, description], (err) => {

        if (err) {
            return res.status(500).json({ error: "DB error" });
        }

        return res.status(201).json({
            message: "Subject created",
            public_id
        });

    });

};

// get all subjects
const getSubjects = (req, res) => {

    const query = "SELECT * FROM subjects";

    connection.query(query, (err, results) => {

        if (err) {
            return res.status(500).json({ error: "DB error" });
        }

        return res.json(results);

    });

};

// create topic
const createTopic = (req, res) => {

    const { subject_id, name, description } = req.body;

    const public_id = ulid();

    const query = `
        INSERT INTO topics (public_id, subject_id, name, description)
        VALUES (?, ?, ?, ?)
    `;

    connection.query(
        query,
        [public_id, subject_id, name, description],
        (err) => {

            if (err) {
                return res.status(500).json({ error: "DB error" });
            }

            return res.status(201).json({
                message: "Topic created",
                public_id
            });

        }
    );

};

// get topics by subject
const getTopicsBySubject = (req, res) => {

    const { subject_id } = req.params;

    const query = `
        SELECT * FROM topics
        WHERE subject_id = ?
    `;

    connection.query(query, [subject_id], (err, results) => {

        if (err) {
            return res.status(500).json({ error: "DB error" });
        }

        return res.json(results);

    });

};


// create question by topic
const createQuestion = (req, res) => {

    const {
        topic_id,
        question_text,
        difficulty,
        question_type,
        explanation
    } = req.body;

    const public_id = ulid();

    const query = `
        INSERT INTO questions (
            public_id,
            topic_id,
            question_text,
            difficulty,
            question_type,
            explanation
        )
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    connection.query(
        query,
        [
            public_id,
            topic_id,
            question_text,
            difficulty,
            question_type,
            explanation
        ],
        (err) => {

            if (err) {
                return res.status(500).json({ error: "DB error" });
            }

            return res.status(201).json({
                message: "Question created",
                public_id
            });

        }
    );

};


// get questions by topic
const getQuestionsByTopic = (req, res) => {

    const { topic_id } = req.params;

    const query = `
        SELECT * FROM questions
        WHERE topic_id = ?
    `;

    connection.query(query, [topic_id], (err, results) => {

        if (err) {
            return res.status(500).json({ error: "DB error" });
        }

        return res.json(results);

    });

};

// add options to question
const addOptions = (req, res) => {

    const { question_id, options } = req.body;

    // options = [{text, is_correct}, ...]

    const values = options.map(opt => [
        question_id,
        opt.text,
        opt.is_correct
    ]);

    const query = `
        INSERT INTO question_options 
        (question_id, option_text, is_correct)
        VALUES ?
    `;

    connection.query(query, [values], (err) => {

        if (err) {
            return res.status(500).json({ error: "DB error" });
        }

        return res.status(201).json({
            message: "Options added"
        });

    });

};


// export as module
module.exports = {
    createSubject,
    getSubjects,
    createTopic,
    getTopicsBySubject,
    createQuestion,
    getQuestionsByTopic,
    addOptions
}

