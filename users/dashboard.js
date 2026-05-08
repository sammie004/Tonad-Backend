const connection = require("../Config/db-config");

// =========================================================
// PROMISIFY QUERY HELPER
// =========================================================

const query = (sql, params) => {
    return new Promise((resolve, reject) => {
        connection.query(sql, params, (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });
};


// =========================================================
// GET STUDENT DASHBOARD
// =========================================================

const GetStudentDashboard = async (req, res) => {
    try {

        const userId = req.user.id;

        const [
            accuracyResults,
            questionResults,
            averageResults,
            strongestResults,
            examResults,
            xpResults
        ] = await Promise.all([

            // OVERALL ACCURACY
            query(`
                SELECT 
                    COUNT(*) AS total_answers,
                    SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) AS correct_answers
                FROM user_answers ua
                INNER JOIN exam_attempts ea ON ua.attempt_id = ea.id
                WHERE ea.user_id = ?
            `, [userId]),

            // QUESTIONS ATTEMPTED
            query(`
                SELECT COUNT(*) AS questions_attempted
                FROM user_answers ua
                INNER JOIN exam_attempts ea ON ua.attempt_id = ea.id
                WHERE ea.user_id = ?
            `, [userId]),

            // RECENT AVERAGE SCORE
            query(`
                SELECT AVG(score) AS recent_average_score
                FROM (
                    SELECT score
                    FROM exam_attempts
                    WHERE user_id = ?
                    ORDER BY submitted_at DESC
                    LIMIT 5
                ) recent_scores
            `, [userId]),

            // STRONGEST SUBJECT
            query(`
                SELECT 
                    s.name AS subject_name,
                    AVG(CASE WHEN ua.is_correct = 1 THEN 100 ELSE 0 END) AS accuracy
                FROM user_answers ua
                INNER JOIN exam_attempts ea ON ua.attempt_id = ea.id
                INNER JOIN questions q      ON ua.question_id = q.id
                INNER JOIN topics t         ON q.topic_id = t.id
                INNER JOIN subjects s       ON t.subject_id = s.id
                WHERE ea.user_id = ?
                GROUP BY s.id
                ORDER BY accuracy DESC
                LIMIT 1
            `, [userId]),

            // EXAMS COMPLETED
            query(`
                SELECT COUNT(*) AS exams_completed
                FROM exam_attempts
                WHERE user_id = ? AND status = 'SUBMITTED'
            `, [userId]),

            // TOTAL XP
            query(`
                SELECT xp FROM users WHERE id = ?
            `, [userId])

        ]);


        // =====================================================
        // CALCULATE ACCURACY
        // =====================================================

        const totalAnswers   = accuracyResults[0].total_answers   || 0;
        const correctAnswers = accuracyResults[0].correct_answers  || 0;

        const overallAccuracy = totalAnswers === 0
            ? 0
            : ((correctAnswers / totalAnswers) * 100).toFixed(2);


        return res.status(200).json({
            overall_accuracy:      Number(overallAccuracy),
            questions_attempted:   questionResults[0].questions_attempted,
            recent_average_score:  Number(averageResults[0].recent_average_score || 0).toFixed(2),
            strongest_subject:     strongestResults[0]?.subject_name || null,
            exams_completed:       examResults[0].exams_completed,
            total_xp:              xpResults[0]?.xp || 0
        });

    } catch (error) {
        console.log("❌ Dashboard Error", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

module.exports = { GetStudentDashboard };