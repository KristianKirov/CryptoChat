function getObservableSessions(onMessageSendClicked, onLeaveClicked)
{
    return kendo.observable({
        selectedSession: kendo.observable({
            model: null
        }),
        activeSessions: [],
        addSession: function(text, number, secretKey)
        {
            this.get("activeSessions").push(
                getObservableSession(text, number, secretKey, onMessageSendClicked, onLeaveClicked));
        },
        removeSession: function(e)
        {
            onLeaveClicked(e.data);
        },
        removeSessionObject: function(session)
        {
            var sessions = this.get("activeSessions");
            var index = sessions.indexOf(session);
    
            sessions.splice(index, 1);
        },
        removeSessionByNumber: function(number)
        {
            var session = this.getSession(number);
            if (session)
            {
                this.removeSessionObject(session);
            }
        },
        openSession: function(e)
        {
            var session = e.dataItem;
            this.showSession(session);
        },
        getSession: function(number)
        {
            var sessions = this.activeSessions;
            var sessionsCount = sessions.length;
            for (i = 0; i < sessionsCount; ++i)
            {
                var session = sessions[i];
                if (session.number == number)
                {
                    return session;
                }
            }
            
            return null;
        },
        showSession: function(session)
        {
            this.get("selectedSession").set("model", session);
            cryptoChatApp.kendoApp.navigate("#chatRoom");
        }
    });
}

function getObservableSession(text, number, secretKey, onMessageSendClicked, onLeaveClicked)
{
    return kendo.observable({
        hasNewMessages: false,
        newMessageText: null,
        secretKey: secretKey,
        text: text,
        number: number,
        messages: [],
        addMessage: function(text, isMine)
        {
            var msgs = this.get("messages");
            var msg = new ChatMessage(text, isMine);
            msgs.push(msg);
            
            return msg;
        },
        sendNewMessage: function()
        {
            //TODO:check if can replace this.model with e.dataItem or e.data
            if (this.model.newMessageText)
            {
                var msg = this.model.addMessage(this.model.newMessageText, true);
                this.model.set("newMessageText", "");
                this.model.scrollToBottom();
                
                onMessageSendClicked(this.model, msg);
            }
        },
        leaveSession: function()
        {
            //TODO:check if can replace this.model with e.dataItem or e.data
            onLeaveClicked(this.model);  
        },
        removeMessage: function(message)
        {
            var messages = this.get("messages");
            var index = messages.indexOf(message);
    
            messages.splice(index, 1);
        },
        scrollToBottom: function()
        {
            var sc = $("#chatRoom").data("kendoMobileView").scroller;
            sc.dimensions.refresh();
            var newY = sc.dimensions.y.size - sc.dimensions.y.total;
            if (newY < 0)
            {
                sc.scrollTo(0, newY);
            }
        }
    });
}

function ChatMessage(text, isMine)
{
    this.text = text;
    this.isMine = isMine;
    this.recieveTime = new Date();
};

ChatMessage.prototype.getFormatedTime = function()
{
    return kendo.toString(this.recieveTime, "dd MMM, hh:mm");
};

ChatMessage.prototype.getCssClass = function()
{
    return this.isMine ? "bubbledRight" : "bubbledLeft";
};