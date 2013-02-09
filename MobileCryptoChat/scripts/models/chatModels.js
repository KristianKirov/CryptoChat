function ChatMessage(text, isMine)
{
    this.text = text;
    this.isMine = isMine;
    this.recieveTime = new Date();
};

ChatMessage.prototype.getFormatedTime = function()
{
    return kendo.format("d MMM, hh:mm", this.recieveTime);
};

ChatMessage.prototype.getCssClass = function()
{
    return this.isMine ? "bubbledRight" : "bubbledLeft";
};