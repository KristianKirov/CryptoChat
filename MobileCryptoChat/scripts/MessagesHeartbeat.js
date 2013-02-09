function MessagesHeartbeat(sessionId, messagesHandler)
{
    this.sessionId = sessionId;
    this.messagesHandler = messagesHandler;
    
    this.isStarted = false;
    //TODO: settings
    this.heartbeatFrequency = 500;
    this.timeoutRef = null;
    this.client = new CryptoChatServiceClient(SERVICE_BASE_URL);
};

MessagesHeartbeat.prototype.start = function()
{
    if (this.isStarted)
    {
        return;
    }
    this.isStarted = true;
    this.getNextMessage();
};

MessagesHeartbeat.prototype.getNextMessage = function()
{
    var self = this;
    this.timeoutRef = setTimeout(
        function()
        {
            self.getMessage();
        },
        this.heartbeatFrequency);
};

MessagesHeartbeat.prototype.getMessage = function()
{
    if (!this.isStarted)
    {
        return;
    }
    
    var self = this;
    this.client.getNextMessage(this.sessionId,
        function(data) { self.onGetMessageSucceeded(data);},
        function(response) { self.onGetMessageFailed(response); });
};

MessagesHeartbeat.prototype.onGetMessageFailed = function(response)
{
    if (!this.isStarted)
    {
        return;
    }
    
    var data = JSON.parse(response.responseText);
    if (data.errorCode == "ERR_SESSIONID")
    {
        //TODO: reconnect
    }
    else if (data.errorCode == "ERR_GENERAL")
    {
        //Do nothing just try again
    }
    
    this.getNextMessage();
};

MessagesHeartbeat.prototype.onGetMessageSucceeded = function(data)
{
    this.messagesHandler(data);
    
    this.getNextMessage();
};

MessagesHeartbeat.prototype.stop = function()
{
    if (!this.isStarted)
    {
        return;
    }
    this.isStarted = false;
    window.clearTimeout(this.timeoutRef)
};