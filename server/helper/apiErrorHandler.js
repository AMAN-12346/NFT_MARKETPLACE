const apiErrorhandler = (err, req, res, next) => {
    console.log(err, "Error From Middleware.");
    // console.log(Object.entries(err))
    // console.log('4 ==>',err.response.data)

    if (err.isApiError) {
        res.status(err.responseCode).json({
            code: err.responseCode,
            message: err.responseMessage,
        });
        return;
    }
    if (err.message == 'Validation error') {
        res.status(502).json({
            code: 502,
            message: err.original.message,
        });
        return;
    }
    // if (err.name == "ValidationError") {
    //     res.status(400).json({
    //         code: 400,
    //         message: err.details[0].message
    //     });
    //     return;
    // }
    res.status(err.code || 500).json({
        code: err.code || 500,
        message: err.message,
    });
    return;
};
module.exports = apiErrorhandler;