//document.addEventListener("deviceready", onDeviceReady, false);

//function onDeviceReady() {
    
//}

function CryptoChatApp(layout)
{
    self = this;
    
    this.kendoApp = new kendo.mobile.Application(document.body,
        { transition: "slide", layout: layout });
    this.PASSWORD_COOKIE_NAME = "usr_pwd";
    this.sessionId = null;
    this.heartbeat = null;
    this.loggedInUsers = null;
    this.invitedUsers = new Object();
    this.pendingChatSessions = kendo.data.DataSource.create({ data: [], group: "group" });
    
    this._onGeneralServiceError = function()
    {
         navigator.notification.confirm(
            'An error has occured! Do you want to try again?',
            self._onGeneralServiceErrorMessageClosed,
            'Error',
            'Yes,No'
        );
    };
    
    this._onGeneralServiceErrorMessageClosed = function(buttonIndex)
    {
        if (buttonIndex)
        {
            //TODO: recall the service method with the correct params
        }
    };
    
    this._getAuthCode = function(password)
    {
        return Sha1.hash(device.msisdn + password);
    };
    
    // -- Login Region --
    this.onLoginScreenBeforeShow = function()
    {
        $("#loginPasswordTb").val("");
    }
    
    this.onLoginScreenInitialized = function()
    {
        $("#loginRememberMeSwitch").kendoMobileSwitch({
            checked: true,
            onLabel: "YES",
            offLabel: "NO"
        });
        
        var storedPassword = readCookie(self.PASSWORD_COOKIE_NAME);
        if (storedPassword)
        {
            self.loginUser(storedPassword, false);
        }
    };
    
    this.onLoginButtonClicked = function()
    {
        var passwordTb = $("#loginPasswordTb");
        var enteredPassword = passwordTb.val();
        
        var validator = new Validator();
        if (validator.validatePassword(enteredPassword))
        {
            self.loginUser(enteredPassword, true);
        }
        else
        {
            navigator.notification.alert("Entered password is invalid", null, "Invalid Password");
        }
    };
    
    this.loginUser = function(enteredPassword, savePassword)
    {
        self.kendoApp.pane.showLoading();
        
        var succeededCalback = null;
        if (savePassword)
        {
            succeededCalback = self.onLoginUserSucceededWithPasswordSave;
        }
        else
        {
            succeededCalback = self.onLoginUserSucceeded;
        }
        
        var client = new CryptoChatServiceClient(SERVICE_BASE_URL);
        client.loginUser(device.msisdn, self._getAuthCode(enteredPassword),
            succeededCalback, self.onLoginUserFailed);
    };
    
    this.onLoginUserFailed = function(response)
    {
        eraseCookie(self.PASSWORD_COOKIE_NAME);
        self.kendoApp.pane.hideLoading();
        
        var data = JSON.parse(response.responseText);
        if (data.errorCode == "ERR_INV_LOGIN")
        {
            navigator.notification.alert("Entered password is invalid. Please register first!", null, "Invalid Password");
        }
        else if (data.errorCode == "ERR_AUTH_CODE")
        {
            navigator.notification.alert("Could not log you in. Plaese try again later.", null, "Login Error");
        }
        else
        {
            self._onGeneralServiceError();
        }
    };
    
    this.onLoginUserSucceededWithPasswordSave = function(data)
    {
        var savePassword = $("#loginRememberMeSwitch").data("kendoMobileSwitch").check();
        if (savePassword)
        {
            var passwordTb = $("#loginPasswordTb");
            var enteredPassword = passwordTb.val();
            
            createCookie(self.PASSWORD_COOKIE_NAME, enteredPassword, 30);
        }
        else
        {
            eraseCookie(self.PASSWORD_COOKIE_NAME);
        }
        
        self.onLoginUserSucceeded(data);
    };
    
    this.onLoginUserSucceeded = function(data)
    {
        self.onUserAuthenticated(data.sessionID);
    };
    // - End Login Region --
    
    // -- Register Region --
    this.onRegisterScreenBeforeShow = function()
    {
        $("#registerPasswordTb").val("");
    }
    
    this.onRegisterScreenInitialized = function()
    {
        $("#registerRememberMeSwitch").kendoMobileSwitch({
            checked: true,
            onLabel: "YES",
            offLabel: "NO"
        });
    };
    
    this.onRegisterButtonClicked = function()
    {
        var passwordTb = $("#registerPasswordTb");
        var enteredPassword = passwordTb.val();
        
        var validator = new Validator();
        if (validator.validatePassword(enteredPassword))
        {
            self.registerUser(enteredPassword, true);
        }
        else
        {
            navigator.notification.alert("Entered password is invalid", null, "Invalid Password");
        }
    };
    
    this.registerUser = function(enteredPassword, savePassword)
    {
        self.kendoApp.pane.showLoading();
        
        var succeededCalback = null;
        if (savePassword)
        {
            succeededCalback = self.onRegisterUserSucceededWithPasswordSave;
        }
        else
        {
            succeededCalback = self.onRegisterUserSucceeded;
        }
        
        var client = new CryptoChatServiceClient(SERVICE_BASE_URL);
        client.registerUser(device.msisdn, self._getAuthCode(enteredPassword),
            succeededCalback, self.onRegisterUserFailed);
    };
    
    this.onRegisterUserFailed = function(response)
    {
        eraseCookie(self.PASSWORD_COOKIE_NAME);
        self.kendoApp.pane.hideLoading();
        
        //TODO: extract strings
        var data = JSON.parse(response.responseText);
        if (data.errorCode == "ERR_DUPLICATE")
        {
            navigator.notification.alert("You are already registered!", null, "Registration Faled");
        }
        else if (data.errorCode == "ERR_GENERAL")
        {
            self._onGeneralServiceError();
        }
        else
        {
            navigator.notification.alert("Could not register you. Plaese try again later.", null, "Registration Error");
        }
    };
    
    this.onRegisterUserSucceededWithPasswordSave = function(data)
    {
        var savePassword = $("#registerRememberMeSwitch").data("kendoMobileSwitch").check();
        if (savePassword)
        {
            var passwordTb = $("#registerPasswordTb");
            var enteredPassword = passwordTb.val();
            
            createCookie(self.PASSWORD_COOKIE_NAME, enteredPassword, 30);
        }
        else
        {
            eraseCookie(self.PASSWORD_COOKIE_NAME);
        }
        
        self.onRegisterUserSucceeded(data);
    };
    
    this.onRegisterUserSucceeded = function(data)
    {
        self.onUserAuthenticated(data.sessionID);
    };
    // -- End Register Region --
    
    // -- User Authenticated Region --
    this.onUserAuthenticated = function(sessionId)
    {
        self.sessionId = sessionId;
        self.kendoApp.view().layout.footer.show();
        self.kendoApp.navigate("#peopleView");
        
        var client = new CryptoChatServiceClient(SERVICE_BASE_URL);
        client.getOnlineUsers(self.sessionId, self.onGetOnlineUsersSucceeded, self.onGetOnlineUsersFailed);
    };
    
    this.onGetOnlineUsersFailed = function(response)
    {
        self.kendoApp.pane.hideLoading();
        
        //TODO: extract strings
        var data = JSON.parse(response.responseText);
        if (data.errorCode == "ERR_SESSIONID")
        {
            //TODO: reconnect
        }
        else if (data.errorCode == "ERR_GENERAL")
        {
            self._onGeneralServiceError();
        }
    };
    
    this.onGetOnlineUsersSucceeded = function(numbers)
    {
        var dataProvider = new DataProvider();
        dataProvider.joinNumbersWithPhoneBook(numbers,
            function(people)
            {
                self.loggedInUsers = kendo.data.DataSource.create({data: people, group: "group" });
                
                $("#activePeopleListView").kendoMobileListView({
                    dataSource: self.loggedInUsers,
                    template: $("#activePeopleTemplate").html(),
                    style: "inset",
                    type: "group",
                    click: self.onUserClicked
                });
                self.kendoApp.pane.hideLoading();
                
                self.heartbeat = new MessagesHeartbeat(self.sessionId, self.onMessageRecieved);
                self.heartbeat.start();
            }, device.msisdn
        );
    };
    // -- End User Authenticated Region
    
    // -- Logout Region
    this.onLogoutButtonClicked = function()
    {
        self.kendoApp.pane.showLoading();
        var client = new CryptoChatServiceClient(SERVICE_BASE_URL);
        client.logoutUser(self.sessionId, self.onLogoutUserSucceeded, self.onLogoutUserFailed);
    };
    
    this.onLogoutUserFailed = function(response)
    {
        var data = JSON.parse(response.responseText);
        if (data.errorCode == "ERR_SESSIONID")
        {
            //Session is already closed
            self.onUnauthorizedUser();
        }
        else (data.errorCode == "ERR_GENERAL")
        {
            self._onGeneralServiceError();
        }
    };
    
    this.onLogoutUserSucceeded = function()
    {
        self.onUnauthorizedUser();
    };
    
    this.onUnauthorizedUser = function()
    {
        self.heartbeat.stop();
        self.heartbeat = null;
        self.sessionId = null;
        self.kendoApp.view().layout.footer.hide();
        self.kendoApp.navigate("#loginView");
        eraseCookie(self.PASSWORD_COOKIE_NAME);
        
        //TODO: clear observables???
        self.loggedInUsers.data([]);
        self.loggedInUsers = null;
        
        self.kendoApp.pane.hideLoading();
    };
    // -- End Logout Region
    
    // -- Hearbeat Messages --
    this.onMessageRecieved = function(message)
    {
        if (message.msgType == "MSG_USER_ONLINE")
        {
            var dataProvider = new DataProvider();
            var user = dataProvider.findObjectInObservableArray(message.msisdn, "number", self.loggedInUsers);
            if (user == null)
            {
                dataProvider.joinNumbersWithPhoneBook([message.msisdn],
                    function(people)
                    {
                        self.loggedInUsers.add(people[0]);
                    }, device.msisdn);
            }
        }
        else if (message.msgType == "MSG_USER_OFFLINE")
        {
            self.removeOnlineUser(message.msisdn);
            delete self.invitedUsers[message.msisdn];
            self.removePendingChatSession(message.msisdn);
        }
        else if (message.msgType == "MSG_CHALLENGE")
        {
            debugger;
            self.removePendingChatSession(message.msisdn);
            
            var dataProvider = new DataProvider();
            dataProvider.joinNumbersWithPhoneBook([message.msisdn],
                function(people)
                {
                    var person = people[0];
                    person.challengeData = message.msgText;
                    self.pendingChatSessions.add(person);
                }, device.msisdn);
        }
        else if (message.msgType == "MSG_RESPONSE")
        {
            debugger;
            var initationData = self.invitedUsers[message.msisdn];
            if (initationData)
            {
                var validator = new Validator();
                if (validator.validateResponseData(initialData, message.msgText))
                {
                    alert("start chat!");
                }
                else
                {
                    delete self.invitedUsers[message.msisdn];
                    
                    var client = new CryptoChatServiceClient(SERVICE_BASE_URL);
                    client.cancelChat(self.sessionId, dataItem.number, null, null);
                }
            }
        }
        else if (message.msgType == "MSG_START_CHAT")
        {
            delete self.invitedUsers[message.msisdn];
            self.removePendingChatSession(message.msisdn);
        }
        else if (message.msgType == "MSG_CANCEL_CHAT")
        {
            delete self.invitedUsers[message.msisdn];
            self.removePendingChatSession(message.msisdn);
        }
        else if (message.msgType == "MSG_CANCEL_CHAT")
        {
            
        }
    };
    
    this.removeOnlineUser = function(number)
    {
        var dp = new DataProvider();
        var u = dp.findObjectInObservableArray(number, "number", self.loggedInUsers);
        if (u != null)
        {
            self.loggedInUsers.remove(u);
        }
    };
    
    this.removePendingChatSession = function(number)
    {
        var dp = new DataProvider();
        var chatSession = dp.findObjectInObservableArray(number, "number", self.pendingChatSessions);
        if (chatSession != null)
        {
            self.pendingChatSessions.remove(chatSession);
        }
    };
    // -- End Heartbeat Messages
    
    // -- Chat Sessions --
    this.onUserClicked = function(e)
    {
        if (e.dataItem)
        {
            self.showChallengeWindow(e.dataItem.text, e.dataItem.number);
        }
    };
    
    this.showChallengeWindow = function(displayName, number)
    {
        $("#challengeNameHeader").html(displayName);
        $("#challengeNumberTb").val(number);
        $("#secretKeyTb").val("");
        $("#challengeModalView").data("kendoMobileModalView").open();
    };
    
    this.closeChallengeModalView = function()
    {
        $("#challengeModalView").data("kendoMobileModalView").close();
    };
    
    this.onSendChallengeClicked = function()
    {
        var enteredKey = $("#secretKeyTb").val();
        var validator = new Validator();
        if (validator.validateSecretKey(enteredKey))
        {
            debugger;
            var challengeNumber = $("#challengeNumberTb").val();
            
            var dataProvider = new DataProvider();
            var challengeData = dataProvider.getChallengeData();
            var challenegeKey = dataProvider.getChallengeKey(challengeData, enteredKey);
            
            self.closeChallengeModalView();
            
            var client = new CryptoChatServiceClient(SERVICE_BASE_URL);
            client.inviteUser(self.sessionId, challengeNumber, challenegeKey,
                function(data)
                {
                    self.invitedUsers[challengeNumber] = { challengeData: challengeData, secretKey: enteredKey };
                },
                function(response)
                {
                    var data = JSON.parse(response.responseText);
                    if (data.errorCode == "ERR_SESSIONID")
                    {
                        //TODO: reconnect
                    }
                    else if(data.errorCode == "ERR_BAD_USER" || data.errorCode == "ERR_USER_OFF")
                    {
                        self.removeOnlineUser(challengeNumber);
                        
                        navigator.notification.alert("Selected user is offline or does not exists.", null, "Challenge Error");
                    }
                    else if(data.errorCode == "ERR_AUTO_CHAT")
                    {
                        navigator.notification.alert("You cannot challenge yourself.", null, "Challenge Error");
                    }
                    else
                    {
                        self._onGeneralServiceError();
                    }
                }
            );
        }
        else
        {
            navigator.notification.alert("Entered key is invalid", null, "Invalid Key");
        }
    };
    // -- End Chat Sessions --
    
    // -- Pending Chat Sessions --
    this.onPendingSessionsScreenInitialized = function()
    {
        debugger;
        $("#pendingSessionsListView").kendoMobileListView({
            dataSource: self.pendingChatSessions,
            template: $("#pendingSessionsTemplate").html(),
            style: "inset",
            type: "group"
        });
    };
    
    this.onAcceptPeningSessionClicked = function()
    {
        debugger;
        var itemUid = this.element.parent().data("uid");
        var dataItem = self.pendingChatSessions.getByUid(itemUid);
        self.showResponseWindow(dataItem.text, dataItem.number, dataItem.challengeData);
    };
    
    this.onDeclinePeningSessionClicked = function()
    {
        var itemUid = this.element.parent().data("uid");
        var dataItem = self.pendingChatSessions.getByUid(itemUid);
        self.pendingChatSessions.remove(dataItem);
        
        var client = new CryptoChatServiceClient(SERVICE_BASE_URL);
        client.cancelChat(self.sessionId, dataItem.number, null, null);
    };
    
    this.showResponseWindow = function(displayName, number, challengeData)
    {
        $("#responseNameHeader").html(displayName);
        $("#responseNumberTb").val(number);
        $("#challengeDataTb").val(challengeData);
        $("#secretKeyTb").val("");
        $("#responseModalView").data("kendoMobileModalView").open();
    };
    
    this.closeResponseModalView = function()
    {
        $("#responseModalView").data("kendoMobileModalView").close();
    };
    
    this.onSendResponseClicked = function()
    {
        var enteredKey = $("#secretKeyTb").val();
        var validator = new Validator();
        if (validator.validateSecretKey(enteredKey))
        {
            debugger;
            var responseNumber = $("#responseNumberTb").val();
            
            var challengeData = $("#challengeDataTb").val();
            var challenegeKey = dataProvider.getRespondData(challengeData, enteredKey);
            if (validator.validateRecievedChallengeData(challenegeKey))
            {
                var dataProvider = new DataProvider();
                var respondingData = dataProvider.getRespondingData(challenegeKey, enteredKey);
                self.closeResponseModalView();
                
                var client = new CryptoChatServiceClient(SERVICE_BASE_URL);
                client.responseChatInvitation(self.sessionId, responseNumber, respondingData,
                    function(data)
                    {
                        navigator.notification.alert("Your response was successfully sent. Chat session will start as soon as the other users verify its correctness.", null, "Response Sent");
                    },
                    function(response)
                    {
                        var data = JSON.parse(response.responseText);
                        if (data.errorCode == "ERR_SESSIONID")
                        {
                            //TODO: reconnect
                        }
                        else if(data.errorCode == "ERR_BAD_USER" || data.errorCode == "ERR_USER_OFF")
                        {
                            self.removeOnlineUser(responseNumber);
                            self.removePendingChatSession(responseNumber);
                            navigator.notification.alert("Selected user is offline or does not exists.", null, "Response Error");
                        }
                        else if(data.errorCode == "ERR_INVALID_STATE")
                        {
                            navigator.notification.alert("This session no longer exists.", null, "Resposnse Error");
                        }
                        else
                        {
                            self._onGeneralServiceError();
                        }
                    }
                );
            }
            else
            {
                navigator.notification.alert("Entered key is invalid", null, "Invalid Key");
            }
        }
        else
        {
            navigator.notification.alert("Entered key is invalid", null, "Invalid Key");
        }
    };
    // -- End Pending Chat Sessions --
}