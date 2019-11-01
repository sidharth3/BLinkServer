const Success = (data ,res)=>{
    res.send({
        status: "SUCCESS",
        data
    });
};

const Error = (data ,res)=>{
    res.status(400).send({
        status: "ERROR",
        data
    });
};

module.exports = { Success, Error };