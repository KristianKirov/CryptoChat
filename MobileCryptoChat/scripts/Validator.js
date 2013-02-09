function Validator()
{
}

Validator.prototype.notEmpty = function(value)
{
    if (value && value.trim && value.trim() != "")
    {
        return true;
    }
    
    return false;
};

Validator.prototype.validatePassword = function(value)
{
    return this.notEmpty(value);
};

Validator.prototype.validateSecretKey = function(value)
{
    return this.notEmpty(value);
};

Validator.prototype.validateResponseData = function(initialData, respondData)
{
    var dataProvider = new DataProvider();
    var respondData = dataProvider.getRespondData(respondData, initialData.secretKey);
    var respondNumber = parseInt(respondData);
    if (respondNumber && respondNumber + initialData.challengeData == 999999999)
    {
        return true;
    }
    
    return false;
};

Validator.prototype.validateRecievedChallengeData = function(challengeKey)
{
    var respondNumber = parseInt(challengeKey);
    if (respondNumber && respondNumber <= 999999999)
    {
        return true;
    }
    
    return false;
};