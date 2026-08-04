/* Rongkhem Rice Group V6.0
   Central Database
*/

const DB_KEY = "RONGKHEM_RICE_GROUP_V6";

const DEFAULT_DB = {
    version: "6.0",
    createdAt: new Date().toISOString(),

    members: [],
    funerals: [],
    receives: [],

    stock: {
        balance: 0,
        history: []
    },

    settings: {
        village: "บ้านร่องเข็ม",
        updatedAt: null
    }
};

function loadDB() {

    try {

        const raw = localStorage.getItem(DB_KEY);

        if (!raw) {
            saveDB(DEFAULT_DB);
            return structuredClone(DEFAULT_DB);
        }

        return JSON.parse(raw);

    } catch (e) {

        console.error(e);

        saveDB(DEFAULT_DB);

        return structuredClone(DEFAULT_DB);

    }

}

function saveDB(db) {

    db.settings.updatedAt = new Date().toISOString();

    localStorage.setItem(
        DB_KEY,
        JSON.stringify(db)
    );

}

function resetDB() {

    saveDB(structuredClone(DEFAULT_DB));

}

function backupDB() {

    return JSON.stringify(loadDB(), null, 2);

}

function restoreDB(json) {

    saveDB(JSON.parse(json));

}

function uid(prefix = "ID") {

    return prefix + "_" +
        Date.now() +
        "_" +
        Math.random().toString(36).substring(2,8);

}
