const validateParams = function (requiredParams) {
    return function (req, res, next) {
        for (const requiredParam of requiredParams) {
            if (checkParamPresent(Object.keys(req.body), requiredParam)) {
                const requestParam = req.body[requiredParam.param_key];
                if (!checkParamType(requestParam, requiredParam)) {
                    return res.send(400, {
                        status: 400,
                        result: `${requiredParam.param_key} is of type ` +
                            `${typeof requestParam} but should be ${requiredParam.type}`
                    });
                } else {
                    if (!runValidators(requestParam, requiredParam)) {
                        return res.send(400, {
                            status: 400,
                            result: `Validation failed for ${requiredParam.param_key}`
                        });
                    }
                }
            } else if (requiredParam.required) {
                return res.send(400, {
                    status: 400,
                    result: `Missing Parameter ${requiredParam.param_key}`
                });
            }
        }
        next();
    }
};

const checkParamPresent = function (reqParams, paramObj) {
    return (reqParams.includes(paramObj.param_key));
};

const checkParamType = function (reqParam, paramObj) {
    const reqParamType = typeof reqParam;
    return reqParamType === paramObj.type;
};

const runValidators = function (reqParam, paramObj) {
    for (let validator of paramObj.validator_functions) {
        if (!validator(reqParam)) {
            return false
        }
    }
    return true;
};

module.exports = {
    validateParams
};