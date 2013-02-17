function CryptoChatServiceClient(serviceBaseUrl)
{
    this.serviceBaseUrl = serviceBaseUrl;
}

CryptoChatServiceClient.prototype._performRequest = function(methodName, requestType,
    data, successCallback, errorCallback)
{
    var request = $.ajax({
        url: this.serviceBaseUrl + methodName,
        type: requestType,
        data: JSON.stringify(data),
        contentType: "application/json; charset=utf-8",
        dataType: "json"
    });
    
    request.done(successCallback);
    request.fail(errorCallback);
};

CryptoChatServiceClient.prototype.loginUser = function(msisdn, authCode, loginSucceededCallback, loginFailedCallback)
{
    this._performRequest("login", "POST", { msisdn: msisdn, authCode: authCode },
        loginSucceededCallback, loginFailedCallback);
};

CryptoChatServiceClient.prototype.registerUser = function(msisdn, authCode, registerSucceededCallback, registerFailedCallback)
{
    this._performRequest("register", "POST", { msisdn: msisdn, authCode: authCode },
        registerSucceededCallback, registerFailedCallback);
};

CryptoChatServiceClient.prototype.logoutUser = function(sessionId, logoutSucceededCallback, logoutFailedCallback)
{
    this._performRequest("logout/" + sessionId, "GET", "",
        logoutSucceededCallback, logoutFailedCallback);
};

CryptoChatServiceClient.prototype.getOnlineUsers = function(sessionId, getOnlineUsersSucceededCallback, getOnlineUsersFailedCallback)
{
    this._performRequest("list-users/" + sessionId, "GET", "",
        getOnlineUsersSucceededCallback, getOnlineUsersFailedCallback);
};

CryptoChatServiceClient.prototype.getNextMessage = function(sessionId, getNextMessageSucceededCallback, getNextMessageFailedCallback)
{
    this._performRequest("get-next-message/" + sessionId, "GET", "",
        getNextMessageSucceededCallback, getNextMessageFailedCallback);
};

CryptoChatServiceClient.prototype.inviteUser = function(sessionId, recipientMSISDN, challenge,
    inviteUserSucceededCallback, inviteUserFailedCallback)
{
    this._performRequest("invite-user", "POST",
        { sessionID: sessionId, recipientMSISDN: recipientMSISDN, challenge: challenge},
        inviteUserSucceededCallback, inviteUserFailedCallback);
};

CryptoChatServiceClient.prototype.responseChatInvitation = function(sessionId, recipientMSISDN, response,
    responseChatInvitationSucceededCallback, responseChatInvitationFailedCallback)
{
    this._performRequest("response-chat-invitation", "POST",
        { sessionID: sessionId, recipientMSISDN: recipientMSISDN, response: response},
        responseChatInvitationSucceededCallback, responseChatInvitationFailedCallback);
};

CryptoChatServiceClient.prototype.cancelChat = function(sessionId, recipientMSISDN,
    cancelChatSucceededCallback, cancelChatFailedCallback)
{
    this._performRequest("response-chat-invitation", "POST",
        { sessionID: sessionId, recipientMSISDN: recipientMSISDN},
        cancelChatSucceededCallback, cancelChatFailedCallback);
};

CryptoChatServiceClient.prototype.startChat = function(sessionId, recipientMSISDN,
    startChatSucceededCallback, startChatFailedCallback)
{
    this._performRequest("start-chat", "POST",
        { sessionID: sessionId, recipientMSISDN: recipientMSISDN},
        startChatSucceededCallback, startChatFailedCallback);
};

CryptoChatServiceClient.prototype.sendChatMessage = function(sessionId, recipientMSISDN, encryptedMsg,
    sendChatMessageSucceededCallback, sendChatMessageFailedCallback)
{
    this._performRequest("send-chat-message", "POST",
        { sessionID: sessionId, recipientMSISDN: recipientMSISDN, encryptedMsg: encryptedMsg },
        sendChatMessageSucceededCallback, sendChatMessageFailedCallback);
};
