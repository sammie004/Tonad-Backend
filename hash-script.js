// ======================================================
// ONE-TIME SCRIPT: UPDATE ADMIN PASSWORD
// ======================================================

const bcrypt = require("bcrypt");
const connection = require("./Config/db-config");

async function updateAdminPassword() {

    try {

        // ==============================================
        // STEP 1: DEFINE NEW PASSWORD
        // ==============================================

        const password = "admin123";


        // ==============================================
        // STEP 2: HASH PASSWORD
        // ==============================================

        const password_hash = await bcrypt.hash(password, 10);

        console.log("🔐 Generated Hash:");
        console.log(password_hash);


        // ==============================================
        // STEP 3: UPDATE DATABASE
        // ==============================================

        const query = `
            UPDATE admins 
            SET password_hash = ? 
            WHERE email = ?
        `;

        connection.query(
            query,
            [password_hash, "admin@tonad.com"],
            (err, results) => {

                if (err) {
                    console.log("❌ Database Error");
                    console.log(err);
                    process.exit(1);
                }

                if (results.affectedRows === 0) {
                    console.log("⚠️ No admin found with that email");
                    process.exit(1);
                }

                console.log("✅ Admin password updated successfully");

                process.exit(0);
            }
        );

    } catch (error) {

        console.log("❌ Script Error");
        console.log(error);

        process.exit(1);
    }
}


// ======================================================
// RUN SCRIPT IMMEDIATELY
// ======================================================

updateAdminPassword();