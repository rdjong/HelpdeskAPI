module.exports = {
    ErrorSaving: function(res, err) {
        res.json({status : "ERROR", message: err});
        res.send(err);
    },

    SuccessSaving: function(res, data) {
        res.status(201);
        res.json({status : "OK", message: "Object successvol aangemaakt", data: data});
    },

    ErrorFind: function(res, err) {
        res.json({status : "ERROR", message: "Fout bij het ophalen", errorMessage: err});
    },

    SuccessFind: function(res, data) {
        res.status(200);
        res.json({status : "OK", message: "Ophalen succesvol", data: data});
    },

    ErrorUpdate: function(res, err) {
        res.json({status : "ERROR", message: "Fout bij updaten"});
        res.send(err);
    },

    SuccessUpdate: function(res, data) {
        res.status(200);
        res.json({status : "OK", message: "Updaten succesvol", data: data});
    },

    ErrorDelete: function(res, err) {
        res.json({status : "ERROR", message: "Verwijderen niet gelukt"});
        res.send(err);
    },

    SuccessDelete: function(res) {
        res.status(200);
        res.json({status : "OK", message: "Verwijderen gelukt"});
    },

    CustomMessage: function(res, message) {
        res.status(200);
        res.json({status: "OK", data: message});
    },

    CustomErrorMessage: function(res, message) {
        res.json({status : "ERROR", message: message});
    },

    Unauthorized: function(res) {
        res.status(401);
        res.json({status : "Unauthorized", message: "Geen toegang"});
    }

};
